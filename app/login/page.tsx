"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const next = searchParams.get("next") || "/dashboard";

  async function handleLogin() {
    if (!email || !password || loading) return;
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace(next);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (googleLoading) return;
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in failed.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-[#eaded2] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-4xl">🐾</div>
          <h1 className="mt-3 text-2xl font-black text-[#171514]">Welcome Back</h1>
          <p className="mt-1 text-sm text-[#7a6d63]">Sign in to manage your pets</p>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-[#4f463f]">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" placeholder="you@example.com" className="mt-1.5 w-full rounded-2xl border-2 border-[#eaded2] p-4 text-sm font-semibold outline-none focus:border-[#ff7a1a]/50" />
          </label>
          <label className="block text-xs font-bold text-[#4f463f]">
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" type="password" placeholder="Enter your password" onKeyDown={(event) => event.key === "Enter" && handleLogin()} className="mt-1.5 w-full rounded-2xl border-2 border-[#eaded2] p-4 text-sm font-semibold outline-none focus:border-[#ff7a1a]/50" />
          </label>
        </div>

        <div className="mt-2 text-right"><Link href="/forgot-password" className="text-xs font-bold text-[#ff7a1a] hover:underline">Forgot password?</Link></div>

        <button onClick={handleLogin} disabled={!email || !password || loading} className="mt-5 w-full rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white disabled:opacity-40">
          {loading ? "Signing in…" : "Sign In"}
        </button>

        {error ? <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600">{error}</p> : null}

        <div className="my-5 flex items-center gap-3 text-xs text-[#a3968a]"><span className="h-px flex-1 bg-[#eaded2]" />OR<span className="h-px flex-1 bg-[#eaded2]" /></div>
        <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} className="w-full rounded-full border-2 border-[#eaded2] bg-white px-8 py-3.5 text-sm font-black text-[#4f463f] disabled:opacity-50">
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

        <p className="mt-5 text-center text-sm text-[#7a6d63]">Don't have an account? <Link href="/register" className="font-bold text-[#ff7a1a] hover:underline">Create one</Link></p>
      </div>
    </div>
  );
}
