import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SITE_URL: "https://pbti-pet-personality.pages.dev",
    NEXT_PUBLIC_SUPABASE_URL: "https://ppxgnlnfsgpqyftnbwnx.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_Jghjb7g6DckTBLbYJ2FApQ_OKivl7UQ",
  },
};

export default nextConfig;
