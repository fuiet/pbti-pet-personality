"use client";

export const runtime = "edge";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { generatePetReport } from "@/lib/reportGenerator";
import { getResultByRecordId, type ResultRecord } from "@/lib/pbtiRecords";
import ShareCard from "@/components/ShareCard";
import { useRequireAuth } from "@/lib/useRequireAuth";

function scoreValue(scores: Record<string, number>, key: string, fallback: number) {
  const value = scores[key];
  return typeof value === "number" ? value : fallback;
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
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

  const personality = personalities[record.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];
  const scores = record.scores || {};
  const rawTotal = (scores.A || 0) + (scores.I || 0) + (scores.E || 0) + (scores.S || 0) + (scores.V || 0) + (scores.C || 0) + (scores.P || 0) + (scores.G || 0) || 1;
  const report = record.report || generatePetReport({
    petName: record.pet.name,
    pbtiType: personality.code,
    personalityName: personality.name,
    traits: personality.traits,
    advice: personality.advice,
    dimensionScores: {
      attachment: scoreValue(scores, "attachment", Math.round(((scores.A || 0) / rawTotal) * 100)),
      exploration: scoreValue(scores, "exploration", Math.round(((scores.E || 0) / rawTotal) * 100)),
      vitality: scoreValue(scores, "vitality", Math.round(((scores.V || 0) / rawTotal) * 100)),
      playfulness: scoreValue(scores, "playfulness", Math.round(((scores.P || 0) / rawTotal) * 100)),
    },
    fitScore: scores.fit,
    modelVersion: "PBTI Behavior Model v2.0",
    modelCue: personality.modelCue,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] shadow-sm ring-1 ring-[#ffd8bd]">
          PBTI ID {record.pbti_id}
        </div>
      </div>

      <ShareCard
        petName={record.pet.name}
        pbtiId={record.pbti_id}
        type={personality.code}
        personality={`${personality.emoji} ${personality.name}`}
      />

      <div className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">Summary</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.summary}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">Behavior Dimensions</h3>
        <div className="space-y-3">
          {(report.dimensionNarrative || []).map((item) => (
            <p key={item} className="text-sm leading-7 text-[#655a51]">{item}</p>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">Methodology</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.methodology}</p>
        {report.confidence ? <p className="mt-3 text-sm font-black text-[#d96612]">{report.confidence}</p> : null}
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">Appearance Analysis</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.appearance}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">Love Language</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.loveLanguage}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">Relationship</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.relationship}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#171514]">Recommendations</h3>
        <ul className="space-y-3">
          {report.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3 text-sm leading-6 text-[#655a51]">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#fff0e4] text-xs text-[#ff7a1a]">
                {index + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-3xl border border-[#ff7a1a]/30 bg-gradient-to-br from-[#fff0e4] to-white p-6 text-center shadow-sm">
        <div className="text-3xl font-black text-[#ff7a1a]">PBTI</div>
        <h3 className="mt-3 text-xl font-bold text-[#171514]">Unlock the Full Premium Report</h3>
        <p className="mt-2 text-sm text-[#655a51]">Get AI deep dive, personalized care guide, shareable personality card, and more.</p>
        <button
          onClick={() => router.push("/premium")}
          className="mt-4 rounded-full bg-[#ff7a1a] px-8 py-3 font-black text-white shadow-[0_12px_28px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5"
        >
          Upgrade Now - $9.99
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push("/result")}
          className="flex-1 rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 text-center font-bold text-[#4f463f] transition hover:bg-white/80"
        >
          Back to Results
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          My Dashboard
        </button>
      </div>
    </div>
  );
}
