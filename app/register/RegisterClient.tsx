"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGoogle, signUpWithEmail } from "@/lib/auth";
import { normalizeNextPath } from "@/lib/nextPath";
import { useLanguage } from "@/components/LanguageProvider";

export default function RegisterClient() {
  const router = useRouter();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const searchParams = useSearchParams();
  const nextPath = normalizeNextPath(searchParams.get("next"));
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || googleSubmitting) return;
    const cleanUsername = username.trim();
    if (cleanUsername.length < 2 || cleanUsername.length > 24) {
      setMessage(zh ? "用户名需要为 2–24 个字符。" : "Username must be 2–24 characters.");
      return;
    }
    if (password.length < 8) {
      setMessage(zh ? "密码至少需要 8 位。" : "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage(zh ? "两次输入的密码不一致。" : "The passwords do not match.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const result = await signUpWithEmail(email.trim().toLowerCase(), password, cleanUsername, nextPath);
      if (result.sessionActive) {
        router.replace(nextPath);
        router.refresh();
        return;
      }
      setEmailSent(true);
      setMessage(zh ? "确认邮件已发送。请打开邮箱并点击邮件中的确认链接，然后使用邮箱和密码登录。" : "Confirmation email sent. Open the email and click the confirmation link, then sign in with your email and password.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (zh ? "暂时无法创建账户，请稍后重试。" : "Unable to create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleRegister() {
    if (submitting || googleSubmitting) return;
    setGoogleSubmitting(true);
    setMessage("");
    try {
      await signInWithGoogle(nextPath);
    } catch (error) {
      setGoogleSubmitting(false);
      setMessage(error instanceof Error ? error.message : (zh ? "暂时无法连接 Google。" : "Unable to start Google sign-in."));
    }
  }

  const inputClass = "mt-1 w-full rounded-2xl border border-[#eaded2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ffb273] focus:ring-2 focus:ring-[#ffe2cb]";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#eaded2] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center"><div className="text-4xl font-black text-[#ff7a1a]">PBTI</div><h1 className="mt-3 text-2xl font-black text-[#171514]">{zh ? "创建账户" : "Create account"}</h1><p className="mt-2 text-sm text-[#7a6d63]">{zh ? "注册后必须打开邮箱并点击确认链接" : "You must click the confirmation link sent to your email"}</p></div>
        {message && <p className="mb-4 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-semibold leading-6 text-[#d96612]">{message}</p>}

        {!emailSent ? (
          <>
            <button type="button" onClick={handleGoogleRegister} disabled={submitting || googleSubmitting} className="flex w-full items-center justify-center gap-3 rounded-full bg-[#171514] px-8 py-4 font-black text-white disabled:opacity-50"><span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm text-[#171514]">G</span>{googleSubmitting ? (zh ? "正在连接…" : "Connecting...") : (zh ? "使用 Google 继续" : "Continue with Google")}</button>
            <div className="my-4 flex items-center gap-3 text-xs font-bold text-[#ab9f95]"><span className="h-px flex-1 bg-[#eaded2]" />{zh ? "或" : "OR"}<span className="h-px flex-1 bg-[#eaded2]" /></div>
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="rounded-2xl border border-[#ffd4b5] bg-[#fff7ef] px-4 py-3 text-sm font-bold leading-6 text-[#b95813]">{zh ? "重要：提交注册后，请打开收到的邮件并点击“确认注册”链接。未点击确认链接前，账户无法登录。" : "Important: after registering, open the email and click the confirmation link. You cannot sign in until your email is confirmed."}</div>
              <label className="block text-sm font-bold text-[#4f463f]">{zh ? "用户名" : "Username"}<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" maxLength={24} className={inputClass} placeholder={zh ? "用于站内展示" : "Displayed in PBTI"} required /></label>
              <label className="block text-sm font-bold text-[#4f463f]">{zh ? "邮箱" : "Email"}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={inputClass} placeholder="you@example.com" required /></label>
              <label className="block text-sm font-bold text-[#4f463f]">{zh ? "密码" : "Password"}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} className={inputClass} placeholder={zh ? "至少 8 位" : "At least 8 characters"} required /></label>
              <label className="block text-sm font-bold text-[#4f463f]">{zh ? "再次输入密码" : "Confirm password"}<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} className={inputClass} placeholder={zh ? "再次输入相同密码" : "Enter the same password again"} required /></label>
              <button type="submit" disabled={submitting} className="w-full rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white disabled:opacity-50">{submitting ? (zh ? "正在创建…" : "Creating...") : (zh ? "注册并发送确认邮件" : "Register and send confirmation email")}</button>
            </form>
          </>
        ) : (
          <div><div className="text-center"><div className="text-5xl text-[#ff7a1a]">✓</div><h2 className="mt-4 text-xl font-black">{zh ? "注册邮件已经发送" : "Registration email sent"}</h2><p className="mt-3 break-all text-sm font-bold text-[#d96612]">{email}</p></div><ol className="mt-6 space-y-3 text-sm font-bold leading-6 text-[#4f463f]"><li className="rounded-2xl bg-[#fff7ef] px-4 py-3">1. {zh ? "打开上方邮箱收到的 PBTI 注册邮件。" : "Open the PBTI registration email in the mailbox above."}</li><li className="rounded-2xl border-2 border-[#ff9a50] bg-[#fff0e4] px-4 py-3 text-[#b95813]">2. {zh ? "必须点击邮件里的“确认注册 / Confirm your email”链接。" : "You must click the “Confirm your email” link in the message."}</li><li className="rounded-2xl bg-[#f2f8f5] px-4 py-3">3. {zh ? "确认成功后，返回网站使用邮箱和密码登录。" : "After confirmation, return and sign in with your email and password."}</li></ol><p className="mt-4 text-center text-xs font-bold text-[#a45a27]">{zh ? "未点击邮件确认链接前，账户无法登录。" : "You cannot sign in before clicking the email confirmation link."}</p><div className="text-center"><a href="/login" className="mt-6 inline-flex rounded-full bg-[#171514] px-7 py-3 text-sm font-black text-white">{zh ? "确认后前往登录" : "Sign in after confirming"}</a></div></div>
        )}

        <p className="mt-6 text-center text-sm text-[#7a6d63]">{zh ? "已有账户？" : "Already have an account? "}<a href="/login" className="font-bold text-[#ff7a1a] hover:underline">{zh ? "直接登录" : "Sign in"}</a></p>
      </div>
    </div>
  );
}
