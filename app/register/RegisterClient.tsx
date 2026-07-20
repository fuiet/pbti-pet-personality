"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGoogle, signUpWithEmail } from "@/lib/auth";
import { normalizeNextPath } from "@/lib/nextPath";
import { useLanguage } from "@/components/LanguageProvider";

export default function RegisterClient() {
  const router = useRouter();
  const { language } = useLanguage(); const zh = language === "zh-CN";
  const searchParams = useSearchParams();
  const nextPath = normalizeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(
    searchParams.get("error") === "google_auth_failed"
      ? (zh ? "Google 登录失败，请重试。" : "Google sign-in failed. Please try again.")
      : ""
  );
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  async function handleGoogleRegister() {
    if (isGoogleSubmitting || isEmailSubmitting) {
      return;
    }

    setIsGoogleSubmitting(true);
    setMessage("");

    try {
      await signInWithGoogle(nextPath);
    } catch (authError) {
      setIsGoogleSubmitting(false);
      setMessage(zh ? "暂时无法连接 Google 登录，请稍后重试。" : authError instanceof Error ? authError.message : "Unable to start Google sign-in.");
    }
  }

  async function handleEmailRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isGoogleSubmitting || isEmailSubmitting) {
      return;
    }

    setIsEmailSubmitting(true);
    setMessage("");

    try {
      const result = await signUpWithEmail(email.trim(), password, nextPath);

      if (result.sessionActive) {
        router.replace(nextPath);
        return;
      }

      setMessage(zh ? "账户已创建。请前往邮箱完成验证，然后登录。" : "Account created. Please check your email to confirm your account, then sign in.");
      setIsEmailSubmitting(false);
    } catch (authError) {
      setIsEmailSubmitting(false);
      setMessage(zh ? "暂时无法创建账户，请检查填写内容后重试。" : authError instanceof Error ? authError.message : "Unable to create your account.");
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-[#eaded2] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="text-4xl font-black text-[#ff7a1a]">PBTI</div>
            <h1 className="mt-3 text-2xl font-black tracking-[-.03em] text-[#171514]">{zh ? "创建账户" : "Create Account"}</h1>
            <p className="mt-1 text-sm text-[#7a6d63]">{zh ? "使用 Google，或通过邮箱注册 PBTI" : "Use Google or create a PBTI account with email"}</p>
          </div>

          {message ? (
            <p className="mb-4 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-semibold text-[#d96612]">{message}</p>
          ) : null}

          <div className="space-y-3">
            <button
              onClick={handleGoogleRegister}
              disabled={isGoogleSubmitting || isEmailSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#171514] px-8 py-4 font-black text-white shadow-[0_12px_28px_rgba(23,21,20,.18)] transition hover:-translate-y-0.5 hover:bg-[#2b2724] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-black text-[#171514]">G</span>
              {isGoogleSubmitting ? (zh ? "正在连接…" : "Connecting...") : (zh ? "使用 Google 继续" : "Continue with Google")}
            </button>

            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ab9f95]">
              <span className="h-px flex-1 bg-[#eaded2]" />
              {zh ? "或" : "or"}
              <span className="h-px flex-1 bg-[#eaded2]" />
            </div>

            <form onSubmit={handleEmailRegister} className="space-y-3">
              <div>
                <label htmlFor="register-email" className="mb-1 block text-sm font-bold text-[#4f463f]">
                  {zh ? "邮箱" : "Email"}
                </label>
                <input
                  id="register-email"
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
                <label htmlFor="register-password" className="mb-1 block text-sm font-bold text-[#4f463f]">
                  {zh ? "密码" : "Password"}
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[#eaded2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ffb273] focus:ring-2 focus:ring-[#ffe2cb]"
                  placeholder={zh ? "设置登录密码" : "Create a password"}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isGoogleSubmitting || isEmailSubmitting}
                className="w-full rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white shadow-[0_12px_28px_rgba(255,122,26,.28)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEmailSubmitting ? (zh ? "正在创建…" : "Creating account...") : (zh ? "使用邮箱注册" : "Create with Email")}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-[#7a6d63]">
            {zh ? "已有账户？" : "Already have an account? "}<a href="/login" className="font-bold text-[#ff7a1a] hover:underline">{zh ? "直接登录" : "Sign in"}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
