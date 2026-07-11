"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import PersonalityCard from "@/components/PersonalityCard";
import { generatePetReport } from "@/lib/reportGenerator";
import { getLatestResultForCurrentUser, getResultByRecordId, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

function getResultIdFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("resultId");
}

export default function ResultPage() {
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
        <div className="text-4xl animate-pulse">Analyzing...</div>
      </div>
    );
  }

  const personality = personalities[record.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];
  const report = record.report || generatePetReport({
    petName: record.pet.name,
    pbtiType: personality.code,
    personalityName: personality.name,
    traits: personality.traits,
    advice: personality.advice,
  });
  const dnaSource = record.scores || { A: 0, I: 0, E: 0, S: 0, V: 0, C: 0, P: 0, G: 0 };
  const total = Object.values(dnaSource).reduce((a, b) => a + b, 0) || 1;
  const dna = [
    { name: "Attachment", value: Math.round(((dnaSource.A || 0) / total) * 100) },
    { name: "Exploration", value: Math.round(((dnaSource.E || 0) / total) * 100) },
    { name: "Vitality", value: Math.round(((dnaSource.V || 0) / total) * 100) },
    { name: "Playfulness", value: Math.round(((dnaSource.P || 0) / total) * 100) },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] shadow-sm ring-1 ring-[#ffd8bd]">
          Analysis Complete
        </div>
      </div>

      <PersonalityCard
        emoji={personality.emoji}
        code={personality.code}
        name={personality.name}
        title={personality.title}
        description={personality.description}
      />

      <div className="mt-4 text-center text-sm text-[#7a6d63]">
        {record.pet.species === "dog" ? "Dog" : "Cat"} {record.pet.name}
        {record.pet.breed ? ` - ${record.pet.breed}` : ""}
      </div>

      <div className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#171514]">Key Traits</h3>
        <div className="flex flex-wrap gap-2">
          {personality.traits.map((trait) => (
            <span key={trait} className="rounded-full bg-[#fff0e4] px-4 py-1.5 text-sm font-bold text-[#d96612]">
              {trait}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-bold text-[#171514]">Personality DNA</h3>
        <div className="space-y-4">
          {dna.map((item) => (
            <div key={item.name}>
              <div className="mb-1.5 flex justify-between text-sm font-bold text-[#4f463f]">
                <span>{item.name}</span>
                <span className="text-[#ff7a1a]">{item.value}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#eadfd3]">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-[#ffb56f] to-[#ff7a1a] transition-all duration-1000 ease-out" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#171514]">Care Advice</h3>
        <ul className="space-y-2">
          {personality.advice.map((advice, index) => (
            <li key={index} className="flex items-start gap-3 text-sm leading-6 text-[#655a51]">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#fff0e4] text-xs text-[#ff7a1a]">
                {index + 1}
              </span>
              {advice}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push(`/report/${record.pbti_id}`)}
          className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          View Full Report
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex-1 rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 text-center font-bold text-[#4f463f] transition hover:bg-white/80"
        >
          My Dashboard
        </button>
      </div>

      <div className="mt-4 text-center">
        <button onClick={() => router.push("/premium")} className="text-sm font-bold text-[#ff7a1a] hover:underline">
          Unlock Premium Report - $9.99
        </button>
      </div>

      <div className="mt-6 text-center">
        <button onClick={() => router.push("/create")} className="text-sm text-[#a3968a] hover:text-[#7a6d63]">
          Retake Test
        </button>
      </div>
    </div>
  );
}