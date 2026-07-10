import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { normalizeNextPath } from "@/lib/nextPath";

export interface AuthUser {
  id: string;
  email: string;
}

function mapUser(user: { id: string; email?: string | null } | null | undefined): AuthUser | null {
  if (!user?.id || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return mapUser(data.user);
}

export async function signInWithGoogle(nextPath = "/dashboard") {
  const supabase = createSupabaseBrowserClient();
  const safeNextPath = normalizeNextPath(nextPath);
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath)}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.url) {
    throw new Error("Google sign-in did not return a redirect URL.");
  }

  window.location.assign(data.url);
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}