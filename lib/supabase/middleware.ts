import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
    throw new Error("Supabase app config is using a secret key in NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Use the sb_publishable_ key instead.");
  }

  return { url, key };
}

export async function updateSession(request: NextRequest) {
  const { url, key } = getSupabaseConfig();
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: claimsData } = await supabase.auth.getClaims();
  if (claimsData?.claims?.sub) {
    return { response, user: { id: claimsData.claims.sub } };
  }

  // Page navigation is also protected by client auth checks and database RLS.
  // Preserve a locally established session when the Auth server or JWKS lookup
  // is temporarily unavailable instead of bouncing a signed-in user to /login.
  const { data: sessionData } = await supabase.auth.getSession();
  return { response, user: sessionData.session?.user ?? null };
}
