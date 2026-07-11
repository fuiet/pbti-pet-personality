"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import QuizCard from "@/components/QuizCard";
import { catQuestions } from "@/data/catQuestions";
import { dogQuestions } from "@/data/dogQuestions";
import ProgressBar from "@/components/ProgressBar";
import { calculatePBTI, type Trait } from "@/lib/pbtiEngine";
import { getLatestPetRecord, getPetRecord, savePersonalityResult, type PetRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

function getPetIdFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("petId");
}

export default function QuizPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [pet, setPet] = useState<PetRecord | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Trait[]>([]);
  const [loadingPet, setLoadingPet] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    const petId = getPetIdFromLocation();

    async function loadPet() {
      try {
        const record = petId ? await getPetRecord(petId) : await getLatestPetRecord();

        if (!active) return;

        if (!record) {
          router.replace("/create");
          return;
        }

        setPet(record);
      } catch {
        if (active) {
          router.replace("/create");
        }
      } finally {
        if (active) {
          setLoadingPet(false);
        }
      }
    }

    loadPet();

    return () => {
      active = false;
    };
  }, [authLoading, router]);

  const questions = pet?.species === "dog" ? dogQuestions : catQuestions;

  const goBack = useCallback(() => {
    if (current > 0) {
      setCurrent(current - 1);
      setAnswers(answers.slice(0, -1));
    }
  }, [current, answers]);

  const select = useCallback(
    async (value: string) => {
      if (!pet || isSaving) {
        return;
      }

      const next = [...answers, value as Trait];
      setAnswers(next);

      if (current < questions.length - 1) {
        setCurrent(current + 1);
        return;
      }

      setIsSaving(true);

      try {
        const result = calculatePBTI(next);
        const saved = await savePersonalityResult(pet, result, next);
        router.push(`/result?resultId=${saved.pbti_id}`);
      } catch {
        setIsSaving(false);
      }
    },
    [answers, current, isSaving, pet, questions.length, router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "ArrowLeft") {
        goBack();
      } else if (e.key === "Escape") {
        router.push("/create");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goBack, router]);

  if (authLoading || loadingPet || !pet) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={current === 0 || isSaving}
          className="flex items-center gap-1 text-sm font-bold text-[#7a6d63] transition hover:text-[#ff7a1a] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <div className="text-sm font-bold text-[#7a6d63]">
          {pet.name ? `${pet.name} - ` : ""}Question {current + 1} of {questions.length}
        </div>
        <button
          onClick={() => router.push("/create")}
          className="text-sm text-[#7a6d63] hover:text-[#ff7a1a]"
          title="Restart quiz"
        >
          Quit
        </button>
      </div>

      <ProgressBar current={current + 1} total={questions.length} />

      <div className="mt-2 mb-8 flex justify-between text-xs text-[#a3968a]">
        <span>{pet.species === "dog" ? "Dog" : "Cat"} Personality Test</span>
        <span>{Math.round(((current + 1) / questions.length) * 100)}%</span>
      </div>

      <div className="mb-4 text-center">
        <span className="inline-block rounded-full bg-[#fff0e4] px-4 py-1.5 text-xs font-bold text-[#d96612]">
          {questions[current]?.dimension || ""}
        </span>
      </div>

      <div key={current} className="animate-slide-in">
        <QuizCard
          question={questions[current]?.question || ""}
          options={questions[current]?.options || []}
          onSelect={select}
        />
      </div>
    </div>
  );
}