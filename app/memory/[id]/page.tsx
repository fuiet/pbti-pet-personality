"use client";

export const runtime = "edge";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MemoryTimeline from "@/components/MemoryTimeline";
import { getResultByRecordId, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useLanguage } from "@/components/LanguageProvider";

export default function MemoryBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { language } = useLanguage(); const zh = language === "zh-CN";
  const { id } = use(params);
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [record, setRecord] = useState<ResultRecord | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    async function loadRecord() {
      try {
        const saved = await getResultByRecordId(id);
        if (!active) return;

        if (!saved) {
          router.replace("/dashboard");
          return;
        }

        setRecord(saved);
      } catch {
        if (active) {
          router.replace("/dashboard");
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
  }, [authLoading, id, router]);

  if (authLoading || loadingRecord || !record || !record.pet) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">{zh ? "正在加载…" : "Loading..."}</div>;
  }

  const sampleMemories = zh ? [
    { date: "2026 年 1 月", title: "来到家的第一天", description: "有些害羞，却藏不住对新家的好奇。" },
    { date: "2026 年 3 月", title: "完成性格测试", description: `发现了 ${record.personality_type} 性格类型。` },
    { date: "2026 年 6 月", title: "一起慢慢长大", description: "熟悉了彼此的日常节奏，也读懂了那些独特的小习惯。" },
  ] : [
    { date: "Jan 2026", title: "First Day Home", description: "A shy but curious beginning." },
    { date: "Mar 2026", title: "Personality Test", description: `Discovered the ${record.personality_type} personality type.` },
    { date: "Jun 2026", title: "Growing Together", description: "Daily routines and unique quirks became clear." },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="text-5xl">{zh ? "回忆" : "Memory"}</div>
        <h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-[#171514]">{zh ? `${record.pet.name} 的回忆册` : `${record.pet.name} Memory Book`}</h1>
        <p className="mt-2 text-sm text-[#7a6d63]">{zh ? "性格类型" : "Personality"}: {record.personality_type}</p>
      </div>

      <div className="mt-8 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#171514]">{zh ? "成长故事" : "AI Story"}</h2>
        <p className="mt-3 text-sm leading-7 text-[#655a51]">
          {zh ? `${record.pet.name} 的成长，是一段关于信任、探索与陪伴的温暖故事。` : <>{record.pet.name}&#39;s journey is a beautiful story of trust, discovery and companionship.</>}
        </p>
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-[#171514]">{zh ? "成长时间线" : "Timeline"}</h2>
        <MemoryTimeline items={sampleMemories} />
      </div>

      <div className="mt-8 rounded-3xl border-2 border-dashed border-[#eaded2] p-8 text-center">
        <div className="text-3xl">{zh ? "照片" : "Photos"}</div>
        <h3 className="mt-3 text-lg font-bold text-[#171514]">{zh ? "记录更多回忆" : "Add More Memories"}</h3>
        <p className="mt-1 text-sm text-[#7a6d63]">{zh ? "上传照片，慢慢丰富属于它的成长时间线。" : "Upload photos and create a rich timeline of your pet's life"}</p>
        <button
          onClick={() => router.push("/create")}
          className="mt-4 rounded-full bg-[#ff7a1a] px-8 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5"
        >
          {zh ? "创建新的回忆" : "Create another memory"}
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-bold text-[#7a6d63] hover:text-[#ff7a1a]"
        >
          {zh ? "返回用户中心" : "Back to Dashboard"}
        </button>
      </div>
    </div>
  );
}
