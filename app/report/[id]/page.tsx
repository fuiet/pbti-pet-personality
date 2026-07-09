"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { personalities } from "@/data/personalities";
import { generatePetReport, ReportInput } from "@/lib/reportGenerator";
import { createPetIdentity } from "@/lib/petIdentity";
import ShareCard from "@/components/ShareCard";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pet, setPet] = useState<{ name?: string; species?: string; breed?: string; age?: string }>({});
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("pbti_pet");
    if (stored) {
      try { setPet(JSON.parse(stored)); } catch { /* */ }
    }
    setIdentity(createPetIdentity());
  }, []);

  const personality = personalities[id] || personalities.AECG;

  const reportInput: ReportInput = {
    petName: pet.name || "Your Pet",
    pbtiType: personality.code,
    personalityName: personality.name,
    traits: personality.traits,
    advice: personality.advice,
  };

  const report = generatePetReport(reportInput);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] shadow-sm ring-1 ring-[#ffd8bd]">
          🪪 {identity}
        </div>
      </div>

      <ShareCard
        petName={pet.name || "Your Pet"}
        pbtiId={identity}
        type={personality.code}
        personality={personality.emoji + " " + personality.name}
      />

      <div className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">📋 Summary</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.summary}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">👁️ Appearance Analysis</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.appearance}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">❤️ Love Language</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.loveLanguage}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">🤝 Relationship</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.relationship}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#171514]">💡 Recommendations</h3>
        <ul className="space-y-3">
          {report.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-6 text-[#655a51]">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#fff0e4] text-xs text-[#ff7a1a]">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-3xl border border-[#ff7a1a]/30 bg-gradient-to-br from-[#fff0e4] to-white p-6 text-center shadow-sm">
        <div className="text-3xl">🌟</div>
        <h3 className="mt-3 text-xl font-bold text-[#171514]">Unlock the Full Premium Report</h3>
        <p className="mt-2 text-sm text-[#655a51]">
          Get AI deep dive, personalized care guide, shareable personality card, and more.
        </p>
        <button
          onClick={() => router.push("/premium")}
          className="mt-4 rounded-full bg-[#ff7a1a] px-8 py-3 font-black text-white shadow-[0_12px_28px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5"
        >
          Upgrade Now · $9.99
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push("/result")}
          className="flex-1 rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 text-center font-bold text-[#4f463f] transition hover:bg-white/80"
        >
          ← Back to Results
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          My Dashboard →
        </button>
      </div>
    </div>
  );
}