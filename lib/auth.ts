import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured yet.");
  }

  if (!browserClient) browserClient = createBrowserClient(url, key);
  return browserClient;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      throw new Error("Email or password is incorrect, or the account has not been confirmed.");
    }
    throw error;
  }
  return data.user;
}

export async function register(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
  });
  if (error) throw error;
  return { user: data.user, session: data.session };
}

export async function signInWithGoogle() {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
  });
  if (error) {
    if (error.message.toLowerCase().includes("provider is not enabled")) {
      throw new Error("Google sign-in is not enabled in Supabase yet.");
    }
    throw error;
  }
}

export async function requestPasswordReset(email: string) {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await getSupabase().auth.updateUser({ password });
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error) return null;
  return data.user;
}

export function onAuthStateChange(callback: (signedIn: boolean) => void) {
  return getSupabase().auth.onAuthStateChange((_event, session) => callback(Boolean(session?.user))).data.subscription;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}
