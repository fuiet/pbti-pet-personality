"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";
import { normalizeNextPath } from "@/lib/nextPath";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = normalizeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") === "google_auth_failed" ? "Google sign-in failed. Please try again." : ""
  );
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  async function handleGoogleLogin() {
    if (isGoogleSubmitting || isEmailSubmitting) {
      return;
    }

    setIsGoogleSubmitting(true);
    setError("");

    try {
      await signInWithGoogle(nextPath);
    } catch (authError) {
      setIsGoogleSubmitting(false);
      setError(authError instanceof Error ? authError.message : "Unable to start Google sign-in.");
    }
  }

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isGoogleSubmitting || isEmailSubmitting) {
      return;
    }

    setIsEmailSubmitting(true);
    setError("");

    try {
      await signInWithEmail(email.trim(), password);
      router.replace(nextPath);
      router.refresh();
    } catch (authError) {
      setIsEmailSubmitting(false);
      setError(authError instanceof Error ? authError.message : "Unable to sign in with email.");
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-[#eaded2] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="text-4xl font-black text-[#ff7a1a]">PBTI</div>
            <h1 className="mt-3 text-2xl font-black tracking-[-.03em] text-[#171514]">Welcome Back</h1>
            <p className="mt-1 text-sm text-[#7a6d63]">Use Google or your PBTI account to sign in</p>
          </div>

          {error ? (
            <p className="mb-4 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-semibold text-[#d96612]">{error}</p>
          ) : null}

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleSubmitting || isEmailSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#171514] px-8 py-4 font-black text-white shadow-[0_12px_28px_rgba(23,21,20,.18)] transition hover:-translate-y-0.5 hover:bg-[#2b2724] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-black text-[#171514]">G</span>
              {isGoogleSubmitting ? "Connecting..." : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ab9f95]">
              <span className="h-px flex-1 bg-[#eaded2]" />
              or
              <span className="h-px flex-1 bg-[#eaded2]" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label htmlFor="login-email" className="mb-1 block text-sm font-bold text-[#4f463f]">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[#eaded2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ffb273] focus:ring-2 focus:ring-[#ffe2cb]"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1 block text-sm font-bold text-[#4f463f]">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[#eaded2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ffb273] focus:ring-2 focus:ring-[#ffe2cb]"
                  placeholder="Your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isGoogleSubmitting || isEmailSubmitting}
                className="w-full rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white shadow-[0_12px_28px_rgba(255,122,26,.28)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEmailSubmitting ? "Signing in..." : "Sign in with Email"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-[#7a6d63]">
            Need a new account? <a href="/register" className="font-bold text-[#ff7a1a] hover:underline">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}
