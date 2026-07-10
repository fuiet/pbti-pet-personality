"use client";

export const runtime = "edge";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultPersonalityCode, personalities, PersonalityCode } from "@/data/personalities";
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
      try { setPet(JSON.parse(stored)); } catch { setPet({}); }
    }
    setIdentity(createPetIdentity());
  }, []);

  const code = id in personalities ? (id as PersonalityCode) : defaultPersonalityCode;
  const personality = personalities[code];
  const reportInput: ReportInput = { petName: pet.name || "Your Pet", pbtiType: personality.name, personalityName: personality.name, traits: personality.traits, advice: personality.advice };
  const report = generatePetReport(reportInput);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center"><div className="inline-flex rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] ring-1 ring-[#ffd8bd]">🪪 {identity}</div></div>
      <ShareCard petName={pet.name || "Your Pet"} pbtiId={identity} type={personality.name} personality={`${personality.emoji} ${personality.title}`} />
      <section className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm"><h3 className="mb-3 text-lg font-bold">📋 Summary</h3><p className="text-sm leading-7 text-[#655a51]">{report.summary}</p></section>
      <section className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm"><h3 className="mb-3 text-lg font-bold">👁️ Appearance Analysis</h3><p className="text-sm leading-7 text-[#655a51]">{report.appearance}</p></section>
      <section className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm"><h3 className="mb-3 text-lg font-bold">❤️ Love Language</h3><p className="text-sm leading-7 text-[#655a51]">{report.loveLanguage}</p></section>
      <section className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm"><h3 className="mb-3 text-lg font-bold">🤝 Relationship</h3><p className="text-sm leading-7 text-[#655a51]">{report.relationship}</p></section>
      <section className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm"><h3 className="mb-4 text-lg font-bold">💡 Recommendations</h3><ul className="space-y-3">{report.recommendations.map((rec, index) => <li key={rec} className="flex gap-3 text-sm leading-6 text-[#655a51]"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#fff0e4] text-xs text-[#ff7a1a]">{index + 1}</span>{rec}</li>)}</ul></section>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={() => router.push("/result")} className="flex-1 rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 font-bold">← Back to Results</button><button onClick={() => router.push("/dashboard")} className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white">My Dashboard →</button></div>
    </div>
  );
}
