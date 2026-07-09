"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    if (!email || !password) return;
    const user = await register(email, password);
    if (user) {
      localStorage.setItem("pbti_user", JSON.stringify(user));
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-[#eaded2] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="text-4xl">??</div>
            <h1 className="mt-3 text-2xl font-black tracking-[-.03em] text-[#171514]">Create Account</h1>
            <p className="mt-1 text-sm text-[#7a6d63]">Start your pet personality journey</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#4f463f]">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#eaded2] bg-white p-4 text-sm font-semibold text-[#171514] outline-none transition placeholder:text-[#a3968a] focus:border-[#ff7a1a]/50"
                placeholder="you@example.com"
                type="email"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#4f463f]">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#eaded2] bg-white p-4 text-sm font-semibold text-[#171514] outline-none transition placeholder:text-[#a3968a] focus:border-[#ff7a1a]/50"
                placeholder="Create a password"
                type="password"
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={!email || !password}
            className="mt-6 w-full rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white shadow-[0_12px_28px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create Account
          </button>

          <p className="mt-5 text-center text-sm text-[#7a6d63]">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-[#ff7a1a] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
