"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { localizePersonality } from "@/data/personalityLocalization";
import { listCurrentUserResults, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useLanguage } from "@/components/LanguageProvider";

export default function Dashboard() {
  const { language } = useLanguage(); const zh = language === "zh-CN";
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [entries, setEntries] = useState<ResultRecord[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    async function loadResults() {
      try {
        const results = await listCurrentUserResults();
        if (active) {
          setEntries(results);
        }
      } catch {
        if (active) {
          setEntries([]);
        }
      } finally {
        if (active) {
          setLoadingResults(false);
        }
      }
    }

    loadResults();

    return () => {
      active = false;
    };
  }, [authLoading]);

  const speciesLabel = (species: string) => (species === "dog" ? (zh ? "狗狗" : "Dog") : (zh ? "猫咪" : "Cat"));

  if (authLoading || loadingResults) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">{zh ? "正在加载…" : "Loading..."}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-[-.04em] text-[#171514]">{zh ? "我的爱宠" : "My Pets"}</h1>
          <p className="mt-1 text-sm text-[#7a6d63]">
            {entries.length > 0
              ? (zh ? `已完成 ${entries.length} 只爱宠的分析` : `You have ${entries.length} pet${entries.length > 1 ? "s" : ""} analyzed`)
              : (zh ? "还没有完成分析的爱宠" : "No pets analyzed yet")}
          </p>
        </div>
        <button
          onClick={() => router.push("/create")}
          className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          {zh ? "+ 添加爱宠" : "+ New Pet"}
        </button>
      </div>

      <div className="mt-8 space-y-5">
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-[#eaded2] bg-white/60 p-12 text-center">
            <div className="text-6xl font-black text-[#ff7a1a]">PBTI</div>
            <h2 className="mt-4 text-xl font-bold text-[#4f463f]">{zh ? "还没有测试报告" : "No reports yet"}</h2>
            <p className="mt-2 text-sm text-[#7a6d63]">{zh ? "开始第一次测试，发现它独一无二的性格。" : "Start your first test to discover their personality"}</p>
            <button
              onClick={() => router.push("/create")}
              className="mt-6 rounded-full bg-[#ff7a1a] px-8 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5"
            >
              {zh ? "开始创建" : "Get Started"}
            </button>
          </div>
        ) : (
          entries.map((entry) => {
            const personality = personalities[entry.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];
            const displayPersonality = localizePersonality(personality, language);
            const pet = entry.pet;

            return (
              <div
                key={entry.id}
                className="group rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(52,34,20,.08)]"
              >
                <div className="flex items-center gap-5">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#fff0e4] text-base font-black text-[#d96612]">
                    {speciesLabel(pet?.species || "cat")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-[#171514]">{pet?.name || (zh ? "未命名爱宠" : "Unnamed Pet")}</h2>
                    <p className="text-sm text-[#7a6d63]">
                      {speciesLabel(pet?.species || "cat")}
                      {pet?.breed ? ` - ${pet.breed}` : ""}
                      {pet?.age ? ` - ${pet.age}` : ""}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-sm font-bold text-[#ff7a1a]">{personality.code} / {displayPersonality.name}</div>
                    <div className="text-xs text-[#7a6d63]">{displayPersonality.title}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 sm:ml-[5.25rem]">
                  <div className="flex flex-wrap gap-2">
                    {displayPersonality.traits.map((trait) => (
                      <span key={trait} className="rounded-full bg-[#fff0e4] px-3 py-1 text-xs font-bold text-[#d96612]">
                        {trait}
                      </span>
                    ))}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => router.push(`/report/${entry.pbti_id}/preparing`)}
                      className="rounded-full bg-[#ff7a1a] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#ee6b10]"
                    >
                      {zh ? "报告" : "Report"}
                    </button>
                    <button
                      onClick={() => router.push(`/memory/${entry.pbti_id}`)}
                      className="rounded-full border border-[#eaded2] px-5 py-2 text-xs font-bold text-[#4f463f] transition hover:bg-white/80"
                    >
                      {zh ? "回忆" : "Memory"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
