"use client";

export const runtime = "edge";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { getPersonalityAsset } from "@/data/personalityAssets";
import { dimensionScoresFromTraitScores, generatePetReport } from "@/lib/reportGenerator";
import { getLatestVisualProfileForPet, getResultByRecordId, type ResultRecord } from "@/lib/pbtiRecords";
import type { PetVisualProfile } from "@/lib/visualProfile";
import ShareCard from "@/components/ShareCard";
import PortraitGenerator from "@/components/PortraitGenerator";
import { useRequireAuth } from "@/lib/useRequireAuth";



export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [record, setRecord] = useState<ResultRecord | null>(null);
  const [visualProfile, setVisualProfile] = useState<PetVisualProfile | null>(null);
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

        let visual: PetVisualProfile | null = null;
        if (saved.pet?.id) {
          try {
            visual = await getLatestVisualProfileForPet(saved.pet.id);
          } catch {
            // A missing visual profile should not block the behavior report.
          }
        }

        setRecord(saved);
        setVisualProfile(visual);
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
  const species = record.pet.species === "dog" ? "dog" : "cat";
  const typeArtwork = getPersonalityAsset(personality.code, species);
  const scores = record.scores || {};
  const dimensionScores = dimensionScoresFromTraitScores(scores);
  const generatedReport = generatePetReport({
    petName: record.pet.name,
    pbtiType: personality.code,
    personalityName: personality.name,
    traits: personality.traits,
    advice: personality.advice,
    dimensionScores,
    fitScore: scores.fit,
    modelVersion: "PBTI Behavior Model v2.0",
    modelCue: personality.modelCue,
    visualProfile,
  });
  const report = { ...generatedReport, answers: record.report?.answers };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] shadow-sm ring-1 ring-[#ffd8bd]">
          PBTI ID {record.pbti_id}
        </div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-3xl border border-[#eaded2] bg-white p-5 shadow-sm">
        <div className="relative z-10 max-w-[72%]">
          <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{species === "dog" ? "Dog profile" : "Cat profile"}</div>
          <div className="mt-2 text-2xl font-black text-[#171514]">{personality.code} / {personality.name}</div>
          <p className="mt-2 text-sm leading-6 text-[#655a51]">The artwork shown here follows this pet's species and PBTI type.</p>
        </div>
        <div className="pointer-events-none absolute -right-2 -bottom-8 h-36 w-36 sm:h-44 sm:w-44">
          <Image src={typeArtwork} alt="" fill unoptimized sizes="176px" className="object-contain drop-shadow-[0_14px_24px_rgba(52,34,20,.16)]" />
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
        <h3 className="mb-3 text-lg font-bold text-[#171514]">Research Basis</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.methodology}</p>
        <ul className="mt-4 space-y-3">
          {(report.researchBasis || []).map((basis) => (
            <li key={basis} className="flex items-start gap-3 text-sm leading-6 text-[#655a51]">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#ff7a1a]" />
              {basis}
            </li>
          ))}
        </ul>
        {report.fitIndex ? <p className="mt-4 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-black leading-6 text-[#d96612]">{report.fitIndex}</p> : null}
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">Custom Model Boundary</h3>
        <ul className="space-y-3">
          {(report.modelBoundary || []).map((boundary) => (
            <li key={boundary} className="flex items-start gap-3 text-sm leading-6 text-[#655a51]">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d8c3b2]" />
              {boundary}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">Appearance Analysis</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.appearance}</p>
        {report.visualAnalysis ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#fff7ed] p-4">
              <div className="text-xs font-black uppercase tracking-[.12em] text-[#a3968a]">Breed estimate</div>
              <div className="mt-2 font-bold text-[#171514]">{report.visualAnalysis.breedAssessment.primaryBreed}</div>
              <div className="mt-1 text-sm text-[#655a51]">{report.visualAnalysis.breedAssessment.variety}</div>
            </div>
            <div className="rounded-2xl bg-[#fff7ed] p-4">
              <div className="text-xs font-black uppercase tracking-[.12em] text-[#a3968a]">Mixed-breed likelihood</div>
              <div className="mt-2 font-bold capitalize text-[#171514]">{report.visualAnalysis.breedAssessment.mixedLikelihood}</div>
            </div>
            <div className="rounded-2xl bg-[#fff7ed] p-4">
              <div className="text-xs font-black uppercase tracking-[.12em] text-[#a3968a]">Visible coat</div>
              <div className="mt-2 text-sm leading-6 text-[#655a51]">{[report.visualAnalysis.coat.color, report.visualAnalysis.coat.length, report.visualAnalysis.coat.pattern, report.visualAnalysis.coat.texture].filter((value) => value !== "unclear").join(", ") || "Unclear"}</div>
            </div>
            <div className="rounded-2xl bg-[#fff7ed] p-4">
              <div className="text-xs font-black uppercase tracking-[.12em] text-[#a3968a]">Photo quality</div>
              <div className="mt-2 font-bold text-[#171514]">{report.visualAnalysis.photoQuality.score}/100</div>
              {report.visualAnalysis.photoQuality.issues.length ? <div className="mt-1 text-sm leading-6 text-[#655a51]">{report.visualAnalysis.photoQuality.issues.join(", ")}</div> : null}
            </div>
          </div>
        ) : null}
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
        <h3 className="mt-3 text-xl font-bold text-[#171514]">Your complete report is included</h3>
        <p className="mt-2 text-sm text-[#655a51]">This report includes the full behavior analysis, visual notes, care guidance, and portrait-ready materials for {record.pet.name}.</p>

      </div>

      <PortraitGenerator
        petId={record.pet.id}
        resultId={record.pbti_id}
        petName={record.pet.name}
        pbtiCode={personality.code}
        personalityName={personality.name}
      />

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
