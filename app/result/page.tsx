"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { localizePersonality } from "@/data/personalityLocalization";
import { getPersonalityAsset } from "@/data/personalityAssets";
import { dimensionScoresFromTraitScores, generatePetReport } from "@/lib/reportGenerator";
import { getLatestResultForCurrentUser, getResultByRecordId, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useLanguage } from "@/components/LanguageProvider";

function getResultIdFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("resultId");
}



export default function ResultPage() {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [record, setRecord] = useState<ResultRecord | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    const resultId = getResultIdFromLocation();

    async function loadRecord() {
      try {
        const saved = resultId ? await getResultByRecordId(resultId) : await getLatestResultForCurrentUser();

        if (!active) return;

        if (!saved) {
          router.push("/create");
          return;
        }

        setRecord(saved);
      } catch {
        if (active) {
          router.push("/create");
        }
      } finally {
        if (active) {
          setLoadingRecord(false);
        }
      }
    }

    loadRecord();

    return () => {
      active = false;
    };
  }, [authLoading, router]);

  if (authLoading || loadingRecord || !record || !record.pet) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-4xl animate-pulse">{zh ? "正在分析…" : "Analyzing..."}</div>
      </div>
    );
  }

  const personality = personalities[record.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];
  const displayPersonality = localizePersonality(personality, language);
  const species = record.pet.species === "dog" ? "dog" : "cat";
  const typeArtwork = getPersonalityAsset(personality.code, species);
  const scores = record.scores || {};
  const dimensionScores = dimensionScoresFromTraitScores(scores);
  const report = record.report || generatePetReport({
    petName: record.pet.name,
    pbtiType: personality.code,
    personalityName: displayPersonality.name,
    traits: displayPersonality.traits,
    advice: personality.advice,
    dimensionScores,
    fitScore: scores.fit,
    modelVersion: "PBTI Behavior Model v2.0",
    modelCue: personality.modelCue,
    language,
  });
  const premiumSections = zh ? [
    "四维行为得分解析", "28 道题行为模式分析", "品种、毛色、脸型与体态鉴定", "混血可能性与外观特征", "情绪与社交风格", "个性化养护指南", "游戏与丰容计划", "主人关系指南", "潜在挑战与支持建议", "写真海报与分享卡片",
  ] : [
    "Four-dimension behavior score breakdown",
    "28-answer behavior pattern analysis",
    "Visual breed, coat, face, and body identification",
    "Mixed-breed likelihood and appearance notes",
    "Emotional and social style report",
    "Personalized care guide",
    "Play and enrichment plan",
    "Owner relationship guide",
    "Potential challenges and support tips",
    "Portrait poster and share card pack",
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] shadow-sm ring-1 ring-[#ffd8bd]">
          {zh ? "分析完成" : "Analysis Complete"}
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-[#eaded2] bg-white shadow-[0_24px_70px_rgba(52,34,20,.08)]">
        {record.pet.photo_url ? (
          <div className="relative h-72 bg-[#fff0e4] sm:h-96">
            <img src={record.pet.photo_url} alt={`${record.pet.name} profile photo`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,21,20,0)_40%,rgba(23,21,20,.56))]" />
              <div className="absolute bottom-5 left-5 rounded-full bg-white/92 px-4 py-2 text-xs font-black text-[#171514] shadow-sm backdrop-blur">
              {record.pet.species === "dog" ? (zh ? "狗狗" : "Dog") : (zh ? "猫咪" : "Cat")} {zh ? "测试结果" : "result"}
            </div>
          </div>
        ) : null}

        <div className="relative p-8 text-center">
                    <div className="pointer-events-none absolute right-3 top-3 hidden h-28 w-28 opacity-90 sm:block">
            <Image src={typeArtwork} alt="" fill unoptimized sizes="112px" className="object-contain drop-shadow-[0_12px_20px_rgba(52,34,20,.16)]" />
          </div><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff0e4] text-2xl font-black text-[#ff7a1a]">{personality.emoji}</div>
          <div className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#a3968a]">{zh ? "结果概览" : "Cover / result summary"}</div>
          <h1 className="mt-3 text-7xl font-black leading-none tracking-[-.08em] text-[#171514]">{personality.code}</h1>
          <div className="mt-3 text-3xl font-black tracking-[-.05em] text-[#d96612]">{displayPersonality.name}</div>
          <h2 className="mt-1 text-lg font-semibold text-[#7a6d63]">{displayPersonality.title}</h2>
          <p className="mt-5 text-xl font-black tracking-[-.03em] text-[#171514]">{record.pet.name}</p>
          <p className="mt-1 text-sm font-semibold text-[#7a6d63]">
            {record.pet.species === "dog" ? (zh ? "狗狗" : "Dog") : (zh ? "猫咪" : "Cat")}
            {record.pet.breed ? ` - ${record.pet.breed}` : ""}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#655a51]">{report.summary}</p>
          {scores.fit ? <div className="mt-5 inline-flex rounded-full bg-[#fff0e4] px-4 py-2 text-sm font-black text-[#d96612]">{zh ? "性格匹配指数" : "Prototype fit index"}: {scores.fit}/100</div> : null}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-[#ff7a1a]/25 bg-[#171514] p-6 text-white shadow-[0_24px_70px_rgba(52,34,20,.12)] sm:p-8">
        <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">{zh ? "完整版报告" : "Complete report included"}</div>
        <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">{zh ? "你的 10 章深度报告已生成" : "Your 10-chapter visual report is ready"}</h2>
        <p className="mt-3 text-sm leading-7 text-white/72">
          {zh ? "完整报告包含行为模式、爱宠鉴定、养护建议、关系洞察和专属写真素材。" : "Your complete report includes behavior patterns, photo-based appearance notes, care guidance, relationship insights, and portrait-ready materials."}
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {premiumSections.map((section, index) => (
            <div key={section} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm font-bold leading-6 text-white/82">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#ff7a1a] text-xs font-black text-white">{index + 1}</span>
              {section}
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push(`/report/${record.pbti_id}/preparing`)}
          className="mt-7 w-full rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10] sm:w-auto"
        >
          {zh ? "打开完整报告" : "Open full report"}
        </button>
      </section>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push(`/report/${record.pbti_id}/preparing`)}
          className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          {zh ? "查看完整报告" : "View complete report"}
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex-1 rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 text-center font-bold text-[#4f463f] transition hover:bg-white/80"
        >
          {zh ? "我的用户中心" : "My Dashboard"}
        </button>
      </div>

      <div className="mt-6 text-center">
        <button onClick={() => router.push("/create")} className="text-sm text-[#a3968a] hover:text-[#7a6d63]">
          {zh ? "重新测试" : "Retake Test"}
        </button>
      </div>
    </div>
  );
}
