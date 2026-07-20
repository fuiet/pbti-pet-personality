"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeRegistrationWithOtp, sendRegistrationOtp, signInWithGoogle } from "@/lib/auth";
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
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"details" | "verify">("details");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function validateDetails() {
    const cleanUsername = username.trim();
    if (cleanUsername.length < 2 || cleanUsername.length > 24) return zh ? "用户名需要为 2–24 个字符。" : "Username must be 2–24 characters.";
    if (password.length < 8) return zh ? "密码至少需要 8 位。" : "Password must be at least 8 characters.";
    if (password !== confirmPassword) return zh ? "两次输入的密码不一致。" : "The passwords do not match.";
    return "";
  }

  async function sendCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (submitting || cooldown > 0) return;
    const validation = validateDetails();
    if (validation) {
      setMessage(validation);
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      await sendRegistrationOtp(email.trim().toLowerCase(), username.trim());
      setStage("verify");
      setCooldown(60);
      setMessage(zh ? "6 位验证码已发送，请检查邮箱。" : "A 6-digit code has been sent to your email.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (zh ? "验证码发送失败，请稍后重试。" : "Unable to send the code."));
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!/^\d{6}$/.test(otp)) {
      setMessage(zh ? "请输入邮件中的 6 位验证码。" : "Enter the 6-digit code from your email.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      await completeRegistrationWithOtp({ email: email.trim().toLowerCase(), token: otp, username: username.trim(), password });
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (zh ? "验证码错误或已过期。" : "The code is incorrect or expired."));
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

  const inputClass = "w-full rounded-2xl border border-[#eaded2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ffb273] focus:ring-2 focus:ring-[#ffe2cb]";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#eaded2] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center"><div className="text-4xl font-black text-[#ff7a1a]">PBTI</div><h1 className="mt-3 text-2xl font-black text-[#171514]">{zh ? "创建账户" : "Create account"}</h1><p className="mt-2 text-sm text-[#7a6d63]">{stage === "details" ? (zh ? "设置账户信息，并通过邮箱验证码完成注册" : "Set up your account and verify your email") : (zh ? `验证码已发送至 ${email}` : `Code sent to ${email}`)}</p></div>
        {message && <p className="mb-4 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-semibold text-[#d96612]">{message}</p>}

        {stage === "details" ? (
          <>
            <button type="button" onClick={handleGoogleRegister} disabled={submitting || googleSubmitting} className="flex w-full items-center justify-center gap-3 rounded-full bg-[#171514] px-8 py-4 font-black text-white disabled:opacity-50"><span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm text-[#171514]">G</span>{googleSubmitting ? (zh ? "正在连接…" : "Connecting...") : (zh ? "使用 Google 继续" : "Continue with Google")}</button>
            <div className="my-4 flex items-center gap-3 text-xs font-bold text-[#ab9f95]"><span className="h-px flex-1 bg-[#eaded2]" />{zh ? "或" : "OR"}<span className="h-px flex-1 bg-[#eaded2]" /></div>
            <form onSubmit={sendCode} className="space-y-3">
              <label className="block text-sm font-bold text-[#4f463f]">{zh ? "用户名" : "Username"}<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" maxLength={24} className={`${inputClass} mt-1`} placeholder={zh ? "用于站内展示" : "Displayed in PBTI"} required /></label>
              <label className="block text-sm font-bold text-[#4f463f]">{zh ? "邮箱" : "Email"}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={`${inputClass} mt-1`} placeholder="you@example.com" required /></label>
              <label className="block text-sm font-bold text-[#4f463f]">{zh ? "密码" : "Password"}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} className={`${inputClass} mt-1`} placeholder={zh ? "至少 8 位" : "At least 8 characters"} required /></label>
              <label className="block text-sm font-bold text-[#4f463f]">{zh ? "再次输入密码" : "Confirm password"}<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} className={`${inputClass} mt-1`} placeholder={zh ? "再次输入相同密码" : "Enter the same password again"} required /></label>
              <button type="submit" disabled={submitting} className="w-full rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white disabled:opacity-50">{submitting ? (zh ? "正在发送…" : "Sending...") : (zh ? "发送邮箱验证码" : "Send verification code")}</button>
            </form>
          </>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <label className="block text-sm font-bold text-[#4f463f]">{zh ? "邮箱验证码" : "Email verification code"}<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className={`${inputClass} mt-2 text-center text-2xl font-black tracking-[.35em]`} placeholder="000000" required /></label>
            <button type="submit" disabled={submitting || otp.length !== 6} className="w-full rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white disabled:opacity-50">{submitting ? (zh ? "正在验证…" : "Verifying...") : (zh ? "验证并完成注册" : "Verify and create account")}</button>
            <div className="flex justify-between text-sm"><button type="button" onClick={() => setStage("details")} className="font-bold text-[#7a6d63]">{zh ? "修改账户信息" : "Edit details"}</button><button type="button" onClick={() => void sendCode()} disabled={cooldown > 0 || submitting} className="font-bold text-[#ff7a1a] disabled:text-[#ab9f95]">{cooldown > 0 ? (zh ? `${cooldown} 秒后重发` : `Resend in ${cooldown}s`) : (zh ? "重新发送" : "Resend code")}</button></div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#7a6d63]">{zh ? "已有账户？" : "Already have an account? "}<a href="/login" className="font-bold text-[#ff7a1a] hover:underline">{zh ? "直接登录" : "Sign in"}</a></p>
      </div>
    </div>
  );
}
