"use client";

export const runtime = "edge";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { choosePortraitStylesForPet, PORTRAIT_PROMPT_VERSION } from "@/lib/portraitPrompts";
import { getLatestVisualProfileForPet, getResultByRecordId } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

type PortraitAsset = { id: string; style_id: string; image_url: string; storage_path?: string };
type StepStatus = "waiting" | "active" | "done" | "error";
type StepId = "visual" | "behavior" | "portraits" | "report";

const pause = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { error: text }; }
}

export default function PreparingReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const { loading: authLoading } = useRequireAuth();
  const [activeStep, setActiveStep] = useState<StepId>("visual");
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [portraitCount, setPortraitCount] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    let active = true;

    const complete = (step: StepId) => {
      if (!active) return;
      setCompletedSteps((current) => current.includes(step) ? current : [...current, step]);
    };

    async function prepareReport() {
      setError("");
      setCompletedSteps([]);
      setPortraitCount(0);

      try {
        setActiveStep("visual");
        const record = await getResultByRecordId(id);
        if (!record?.pet) throw new Error(zh ? "没有找到这份宠物报告。" : "This pet report could not be found.");
        await getLatestVisualProfileForPet(record.pet.id);
        complete("visual");

        setActiveStep("behavior");
        if (!record.personality_type || !record.scores) throw new Error(zh ? "行为测试结果不完整，请重新完成测试。" : "The behavior assessment is incomplete. Please take the test again.");
        complete("behavior");

        setActiveStep("portraits");
        const styles = choosePortraitStylesForPet(record.pet.id, 3);
        const expectedIds = styles.map((style) => `${style.id}--${PORTRAIT_PROMPT_VERSION}`);
        const savedResponse = await fetch(`/api/portraits?petId=${encodeURIComponent(record.pet.id)}`, { cache: "no-store" });
        const savedData = await readJson(savedResponse);
        if (!savedResponse.ok) throw new Error(savedData?.error || (zh ? "无法读取已保存的写真。" : "Unable to load saved portraits."));

        const saved = ((savedData.portraits || []) as PortraitAsset[]).filter((portrait) => expectedIds.includes(portrait.style_id) && portrait.image_url);
        const completedIds = new Set(saved.map((portrait) => portrait.style_id));
        setPortraitCount(completedIds.size);

        for (const style of styles) {
          const versionedStyleId = `${style.id}--${PORTRAIT_PROMPT_VERSION}`;
          if (completedIds.has(versionedStyleId)) continue;

          let lastError = "";
          for (let retry = 0; retry < 3; retry += 1) {
            if (retry > 0) await pause(1500 * retry);
            const response = await fetch("/api/portraits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ petId: record.pet.id, resultId: record.pbti_id, styleId: versionedStyleId }),
            });
            const data = await readJson(response);
            if (response.ok && data?.portrait?.image_url) {
              completedIds.add(versionedStyleId);
              setPortraitCount(completedIds.size);
              lastError = "";
              break;
            }
            lastError = data?.error || `${response.status} ${response.statusText}`;
          }
          if (lastError) throw new Error(lastError);
        }

        if (completedIds.size !== 3) throw new Error(zh ? "三张写真尚未全部生成，请重试。" : "All three portraits have not been generated yet. Please retry.");
        complete("portraits");

        setActiveStep("report");
        const verifyResponse = await fetch(`/api/portraits?petId=${encodeURIComponent(record.pet.id)}`, { cache: "no-store" });
        const verifyData = await readJson(verifyResponse);
        if (!verifyResponse.ok) throw new Error(verifyData?.error || (zh ? "写真保存校验失败。" : "Portrait persistence verification failed."));
        const verified = ((verifyData.portraits || []) as PortraitAsset[]).filter((portrait) => expectedIds.includes(portrait.style_id) && portrait.image_url);
        if (new Set(verified.map((portrait) => portrait.style_id)).size !== 3) throw new Error(zh ? "写真尚未完整保存到数据库，请重试。" : "The portraits were not fully saved. Please retry.");
        complete("report");
        await pause(350);
        if (active) router.replace(`/report/${record.pbti_id}`);
      } catch (reason) {
        console.error("[PBTI report preparation]", reason);
        if (active) setError(zh
          ? "写真暂时没有生成完成。系统已保留当前进度，请点击下方按钮继续生成。"
          : "Your portraits are not ready yet. Your progress has been saved; use the button below to continue.");
      }
    }

    void prepareReport();
    return () => { active = false; };
  }, [attempt, authLoading, id, router, zh]);

  const labels: Array<{ id: StepId; zh: string; en: string; detailZh: string; detailEn: string }> = [
    { id: "visual", zh: "视觉模型分析", en: "Visual model analysis", detailZh: "核对照片与爱宠外观特征", detailEn: "Checking photos and visible traits" },
    { id: "behavior", zh: "行为模式分析", en: "Behavior pattern analysis", detailZh: "计算四个行为维度与性格类型", detailEn: "Scoring behavior dimensions and personality" },
    { id: "portraits", zh: "写真生成", en: "Portrait generation", detailZh: `正在生成并保存写真（${portraitCount}/3）`, detailEn: `Generating and saving portraits (${portraitCount}/3)` },
    { id: "report", zh: "报告整理", en: "Report preparation", detailZh: "校验图片并整理完整报告", detailEn: "Verifying images and preparing the report" },
  ];
  const currentIndex = labels.findIndex((step) => step.id === activeStep);
  const progress = error ? Math.max(8, (completedSteps.length / labels.length) * 100) : Math.max(8, ((completedSteps.length + 0.25) / labels.length) * 100);

  function statusFor(step: StepId, index: number): StepStatus {
    if (completedSteps.includes(step)) return "done";
    if (step === activeStep) return error ? "error" : "active";
    return index < currentIndex ? "done" : "waiting";
  }

  return (
    <main className="mx-auto flex min-h-[72vh] max-w-3xl items-center px-4 py-12 sm:px-6">
      <section className="w-full overflow-hidden rounded-[2rem] border border-[#eaded2] bg-white shadow-[0_30px_90px_rgba(52,34,20,.14)]">
        <div className="bg-[#171514] px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#ff9a50]">PBTI REPORT LAB</div>
          <h1 className="mt-3 text-3xl font-black tracking-[-.05em] sm:text-4xl">{zh ? "正在生成完整报告" : "Preparing your complete report"}</h1>
          <p className="mt-3 text-sm leading-7 text-white/62">{zh ? "三张写真全部生成并保存后，报告才会自动打开。请不要关闭此页面。" : "The report opens only after all three portraits are generated and saved. Please keep this page open."}</p>
          <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ff7a1a] transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          <div className="mt-2 text-right text-xs font-black text-white/55">{Math.round(progress)}%</div>
        </div>

        <div className="space-y-3 p-5 sm:p-8">
          {labels.map((step, index) => {
            const status = statusFor(step.id, index);
            return (
              <div key={step.id} className={`flex items-center gap-4 rounded-2xl border p-4 transition ${status === "active" ? "border-[#ffb878] bg-[#fff7ed]" : status === "error" ? "border-[#e9a18f] bg-[#fff1ed]" : "border-[#eee4dc] bg-white"}`}>
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black ${status === "done" ? "bg-[#14835f] text-white" : status === "active" ? "bg-[#ff7a1a] text-white" : status === "error" ? "bg-[#9a3524] text-white" : "bg-[#f3ece6] text-[#a3968a]"}`}>
                  {status === "done" ? "✓" : status === "active" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : status === "error" ? "!" : index + 1}
                </div>
                <div>
                  <div className="font-black text-[#171514]">{zh ? step.zh : step.en}</div>
                  <div className="mt-1 text-xs text-[#7a6d63]">{zh ? step.detailZh : step.detailEn}</div>
                </div>
              </div>
            );
          })}

          {error ? (
            <div className="mt-5 rounded-2xl bg-[#8f321f] p-5 text-white">
              <div className="font-black">{zh ? "写真还差一点就完成" : "Your portraits are almost ready"}</div>
              <p className="mt-2 break-words text-sm leading-6 text-white/80">{error}</p>
              <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#8f321f] transition hover:bg-[#fff0e4]">{zh ? "重新生成" : "Try again"}</button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
