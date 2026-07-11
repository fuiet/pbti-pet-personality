import { createBrowserClient } from "@supabase/ssr";

function isForbiddenBrowserKey(key: string) {
  return key.startsWith("sb_secret_") || key.includes("service_role");
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  if (isForbiddenBrowserKey(key)) {
    throw new Error("Supabase browser config is using a secret key. Replace NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY with your sb_publishable_ key.");
  }

  return { url, key };
}

export function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient(url, key);
}