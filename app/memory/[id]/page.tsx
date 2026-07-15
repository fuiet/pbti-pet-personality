"use client";

export const runtime = "edge";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MemoryTimeline from "@/components/MemoryTimeline";
import { getResultByRecordId, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function MemoryBookPage({ params }: { params: Promise<{ id: string }> }) {
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
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">Loading...</div>;
  }

  const sampleMemories = [
    { date: "Jan 2026", title: "First Day Home", description: "A shy but curious beginning." },
    { date: "Mar 2026", title: "Personality Test", description: `Discovered the ${record.personality_type} personality type.` },
    { date: "Jun 2026", title: "Growing Together", description: "Daily routines and unique quirks became clear." },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="text-5xl">Memory</div>
        <h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-[#171514]">{record.pet.name} Memory Book</h1>
        <p className="mt-2 text-sm text-[#7a6d63]">Personality: {record.personality_type}</p>
      </div>

      <div className="mt-8 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#171514]">AI Story</h2>
        <p className="mt-3 text-sm leading-7 text-[#655a51]">
          {record.pet.name}&#39;s journey is a beautiful story of trust, discovery and companionship.
        </p>
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-[#171514]">Timeline</h2>
        <MemoryTimeline items={sampleMemories} />
      </div>

      <div className="mt-8 rounded-3xl border-2 border-dashed border-[#eaded2] p-8 text-center">
        <div className="text-3xl">Photos</div>
        <h3 className="mt-3 text-lg font-bold text-[#171514]">Add More Memories</h3>
        <p className="mt-1 text-sm text-[#7a6d63]">Upload photos and create a rich timeline of your pet's life</p>
        <button
          onClick={() => router.push("/create")}
          className="mt-4 rounded-full bg-[#ff7a1a] px-8 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5"
        >
          Included in Early Access
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-bold text-[#7a6d63] hover:text-[#ff7a1a]"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
