"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, signInWithGoogle } from "@/lib/auth";
import { normalizeNextPath } from "@/lib/nextPath";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = normalizeNextPath(searchParams.get("next"));
  const [error, setError] = useState(
    searchParams.get("error") === "google_auth_failed" ? "Google sign-in failed. Please try again." : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) {
          router.replace(nextPath);
        }
      })
      .catch(() => undefined);
  }, [router, nextPath]);

  async function handleGoogleLogin() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await signInWithGoogle(nextPath);
    } catch (authError) {
      setIsSubmitting(false);
      setError(authError instanceof Error ? authError.message : "Unable to start Google sign-in.");
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-[#eaded2] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="text-4xl font-black text-[#ff7a1a]">PBTI</div>
            <h1 className="mt-3 text-2xl font-black tracking-[-.03em] text-[#171514]">Welcome Back</h1>
            <p className="mt-1 text-sm text-[#7a6d63]">Sign in with Google to manage your pets</p>
          </div>

          {error ? (
            <p className="mb-4 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-semibold text-[#d96612]">{error}</p>
          ) : null}

          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-[#171514] px-8 py-4 font-black text-white shadow-[0_12px_28px_rgba(23,21,20,.18)] transition hover:-translate-y-0.5 hover:bg-[#2b2724] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-black text-[#171514]">G</span>
            {isSubmitting ? "Connecting..." : "Continue with Google"}
          </button>

          <p className="mt-5 text-center text-sm text-[#7a6d63]">
            Google sign-in will create or reuse your Supabase account.
          </p>
        </div>
      </div>
    </div>
  );
}