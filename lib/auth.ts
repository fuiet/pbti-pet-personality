import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { normalizeNextPath } from "@/lib/nextPath";

export interface AuthUser {
  id: string;
  email: string;
}

export interface EmailAuthResult {
  user: AuthUser | null;
  sessionActive: boolean;
}

function clearSupabaseAuthCache() {
  if (typeof window === "undefined") return;

  const storageKeyPrefixes = ["sb-", "supabase.auth.token"];
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key && storageKeyPrefixes.some((prefix) => key.startsWith(prefix))) {
        storage.removeItem(key);
      }
    }
  }

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (name?.startsWith("sb-")) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  });
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
  const { data: sessionData } = await supabase.auth.getSession();

  if (sessionData.session?.user) {
    return mapUser(sessionData.session.user);
  }

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

  // Avoid reusing or linking against a previously signed-in browser session.
  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    // A stale session can fail server sign-out; the local cleanup below is still required.
  }
  clearSupabaseAuthCache();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
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

export async function signInWithEmail(email: string, password: string): Promise<EmailAuthResult> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session) {
    throw new Error("Sign-in did not create an active session. Please confirm your email or try another sign-in method.");
  }

  return {
    user: mapUser(data.user),
    sessionActive: true,
  };
}

export async function signUpWithEmail(email: string, password: string, nextPath = "/dashboard"): Promise<EmailAuthResult> {
  const supabase = createSupabaseBrowserClient();
  const safeNextPath = normalizeNextPath(nextPath);
  const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath)}`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: mapUser(data.user),
    sessionActive: Boolean(data.session),
  };
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });
  clearSupabaseAuthCache();

  if (error) {
    throw new Error(error.message);
  }
}
