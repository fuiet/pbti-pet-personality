"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { catQuestions } from "@/data/catQuestions";
import { getPersonalityAsset } from "@/data/personalityAssets";
import { dogQuestions } from "@/data/dogQuestions";
import { calculatePBTI, type Trait } from "@/lib/pbtiEngine";
import { getLatestPetRecord, getPetRecord, savePersonalityResult, type PetRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeQuestions } from "@/data/zhQuestions";

const dimensionLabels: Record<string, string> = {
  "A/I": "Social connection",
  "E/S": "Adaptability",
  "V/C": "Emotional expression",
  "P/G": "Play and guardianship",
};

const signalDescriptions: Record<string, string> = {
  "A/I": "How your pet seeks closeness, space, and daily companionship.",
  "E/S": "How your pet handles novelty, routine, and environmental changes.",
  "V/C": "How clearly your pet shows excitement, needs, and emotional energy.",
  "P/G": "How your pet balances playful interaction with watchful structure.",
};

const stageAssets = [
  { code: "IEVP", name: "Explorer" },
  { code: "ASVG", name: "Guardian" },
  { code: "ISCP", name: "Dreamer" },
  { code: "IECG", name: "Scholar" },
  { code: "AEVP", name: "Sunny" },
  { code: "ISVG", name: "Noble" },
] as const;

function getPetIdFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("petId");
}

function speciesLabel(species?: string) {
  return species === "dog" ? "Dog" : "Cat";
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4.2 4.2L19 6.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function QuizPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const localizedDimensionLabels = zh ? {
    "A/I": "亲近方式", "E/S": "适应变化", "V/C": "情绪表达", "P/G": "玩心与守护",
  } : dimensionLabels;
  const localizedSignalDescriptions = zh ? {
    "A/I": "观察爱宠如何寻求陪伴、保持距离，以及表达亲近。",
    "E/S": "观察爱宠面对新鲜事物、固定规律和环境变化时的反应。",
    "V/C": "观察爱宠表达兴奋、需求和情绪能量的方式。",
    "P/G": "观察爱宠如何在玩耍互动与警觉守护之间取得平衡。",
  } : signalDescriptions;
  const { loading: authLoading } = useRequireAuth();
  const [pet, setPet] = useState<PetRecord | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Trait[]>([]);
  const [loadingPet, setLoadingPet] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizError, setQuizError] = useState("");

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

  const questions = useMemo(
    () => localizeQuestions(pet?.species === "dog" ? dogQuestions : catQuestions, zh),
    [pet?.species, zh],
  );
  const currentQuestion = questions[current];
  const questionNumber = current + 1;
  const progress = Math.round((questionNumber / questions.length) * 100);
  const stage = stageAssets[Math.min(stageAssets.length - 1, Math.floor(current / 6))];
  const helperStage = stageAssets[(Math.floor(current / 6) + 2) % stageAssets.length];
  const species = pet?.species || "cat";

  const dimensionStats = useMemo(() => {
    return ["A/I", "E/S", "V/C", "P/G"].map((dimension) => {
      const total = questions.filter((question) => question.dimension === dimension).length || 1;
      const answered = answers.filter((_, index) => questions[index]?.dimension === dimension).length;
      return { dimension, total, answered, percent: Math.round((answered / total) * 100) };
    });
  }, [answers, questions]);

  const goBack = useCallback(() => {
    if (current > 0 && !isSaving && selectedOptionIndex === null) {
      setSelectedOptionIndex(null);
      setCurrent(current - 1);
    }
  }, [current, isSaving, selectedOptionIndex]);

  const select = useCallback(
    (value: string, optionIndex: number) => {
      if (!pet || isSaving || selectedOptionIndex !== null) {
        return;
      }

      setQuizError("");
      setSelectedOptionIndex(optionIndex);

      window.setTimeout(async () => {
        const next = [...answers];
        next[current] = value as Trait;
        setAnswers(next);

        if (current < questions.length - 1) {
          setCurrent(current + 1);
          setSelectedOptionIndex(null);
          return;
        }

        setIsSaving(true);

        try {
          const result = calculatePBTI(next);
          const saved = await savePersonalityResult(pet, result, next);
          router.push(`/report/${saved.pbti_id}/preparing`);
        } catch (error) {
          setIsSaving(false);
          setSelectedOptionIndex(null);
          setQuizError(error instanceof Error ? error.message : zh ? "暂时无法保存测试结果，请重试。" : "Unable to save your result. Please try again.");
        }
      }, 240);
    },
    [answers, current, isSaving, pet, questions.length, router, selectedOptionIndex, zh]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "ArrowLeft") {
        goBack();
      } else if (e.key === "Escape") {
        router.push("/create");
      } else if ((e.key === "1" || e.key === "2" || e.key === "3") && currentQuestion?.options) {
        const option = currentQuestion.options[Number(e.key) - 1];
        if (option) select(option.value, Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentQuestion?.options, goBack, router, select]);

  if (authLoading || loadingPet || !pet) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">{zh ? "正在加载…" : "Loading..."}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">
      <section className="mb-7 rounded-[2rem] border border-[#eaded2] bg-white/82 p-5 shadow-[0_18px_55px_rgba(52,34,20,.06)] lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[.18em] text-[#d96612]">{zh ? "第 3 步，共 4 步" : "Step 3 of 4"}</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-.055em] text-[#171514]">{zh ? "行为性格测试" : "Behavior Assessment"}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6258]">
              {zh ? "请根据爱宠平时最常见的表现作答，不要只参考某一次特殊情况。你的长期观察最有价值。" : "Answer based on your pet's usual behavior, not one rare moment. Each choice helps map a clearer personality pattern."}
            </p>
          </div>
          <div key={`quiz-progress-${questionNumber}`} className="min-w-[240px] rounded-2xl bg-[#fff7ed] p-4">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[.12em] text-[#8c7b6d]">
              <span>{zh ? `第 ${questionNumber}/${questions.length} 题` : `Question ${questionNumber}/${questions.length}`}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#eaded2]">
              <div className="h-full rounded-full bg-[#ff7a1a] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      {quizError ? (
        <div className="mb-5 rounded-2xl border border-[#ffd8bd] bg-[#fff0e4] px-5 py-4 text-sm font-bold text-[#d96612]">
          {zh ? "结果保存失败：" : "Result saving failed: "}{quizError}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:items-start">
        <aside className="rounded-[2rem] border border-[#eaded2] bg-white p-5 shadow-[0_18px_55px_rgba(52,34,20,.06)]">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-[#fff7ed]">
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={`${pet.name}'s profile`} className="h-56 w-full object-cover" />
            ) : (
              <div className="grid h-56 place-items-center">
                <img
                  src={getPersonalityAsset("IEVP", species)}
                  alt={zh ? "性格测试引导形象" : "Personality guide"}
                  className="h-44 w-44 object-contain drop-shadow-[0_18px_30px_rgba(52,34,20,.16)]"
                />
              </div>
            )}
            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#171514] shadow-sm backdrop-blur">
              {zh ? "测试信息已就绪" : "Visual profile ready"}
            </div>
          </div>

          <div className="mt-5">
            <h2 className="truncate text-2xl font-black tracking-[-.04em] text-[#171514]">{pet.name}</h2>
            <p className="mt-1 text-sm font-bold text-[#7a6d63]">
              {zh ? (pet.species === "dog" ? "狗狗" : "猫咪") : speciesLabel(pet.species)}{pet.breed ? ` - ${pet.breed}` : ""}{pet.age ? ` - ${pet.age}` : ""}
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-[#171514] p-4 text-white">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#ffb878]">{zh ? "当前观察维度" : "Current signal"}</p>
            <p className="mt-2 text-lg font-black">{localizedDimensionLabels[currentQuestion?.dimension || "A/I"]}</p>
            <p className="mt-2 text-xs leading-5 text-white/62">{localizedSignalDescriptions[currentQuestion?.dimension || "A/I"]}</p>
          </div>
        </aside>

        <main className="relative overflow-hidden rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-[0_24px_70px_rgba(52,34,20,.08)] sm:p-8 lg:min-h-[560px]">
          <div className="pointer-events-none absolute -right-10 bottom-0 hidden h-56 w-56 sm:block">
            <img
              src={getPersonalityAsset(stage.code, species)}
              alt=""
              className="h-full w-full object-contain drop-shadow-[0_22px_36px_rgba(52,34,20,.18)]"
            />
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-full bg-[#fff0e4] px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-[#d96612]">
                {localizedDimensionLabels[currentQuestion?.dimension || "A/I"]}
              </div>
              <div className="flex items-center gap-3">
                {current > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={isSaving || selectedOptionIndex !== null}
                    className="inline-flex items-center gap-2 rounded-full border border-[#eaded2] bg-white px-4 py-2 text-xs font-black text-[#4f463f] transition hover:border-[#ff7a1a]/40 hover:bg-[#fff7ed] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span aria-hidden="true">←</span>
                    {zh ? "上一题" : "Previous"}
                  </button>
                ) : null}
                <div className="text-xs font-black uppercase tracking-[.14em] text-[#a3968a]">{zh ? `${stage.name} 阶段` : `${stage.name} phase`}</div>
              </div>
            </div>

            <div key={current} className="animate-slide-in">
              <p className="mt-10 text-sm font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? `第 ${String(questionNumber).padStart(2, "0")} 题` : `Question ${String(questionNumber).padStart(2, "0")}`}</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-[-.045em] text-[#171514] sm:text-4xl">
                {currentQuestion?.question || ""}
              </h2>

              <div className="mt-8 grid gap-4">
                {(currentQuestion?.options || []).map((option, index) => {
                  const savedOptionIndex = currentQuestion?.options.findIndex((item) => item.value === answers[current]);
                  const selected = (selectedOptionIndex ?? savedOptionIndex) === index;
                  return (
                    <button
                      key={`${current}-${index}`}
                      onClick={() => select(option.value, index)}
                      disabled={isSaving || selectedOptionIndex !== null}
                      className={`group flex min-h-[76px] w-full items-center gap-4 rounded-[1.35rem] border-2 p-4 text-left transition duration-200 sm:p-5 ${
                        selected
                          ? "border-[#ff7a1a] bg-[#fff0e4] shadow-[0_18px_42px_rgba(255,122,26,.18)]"
                          : "border-[#eaded2] bg-white hover:-translate-y-0.5 hover:border-[#ff7a1a]/45 hover:bg-[#fffaf5] hover:shadow-[0_14px_34px_rgba(52,34,20,.08)]"
                      } disabled:cursor-not-allowed`}
                    >
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black ${selected ? "bg-[#ff7a1a] text-white" : "bg-[#fff0e4] text-[#ff7a1a] group-hover:bg-[#ff7a1a] group-hover:text-white"}`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 text-base font-black leading-6 text-[#2b2520] sm:text-lg">{option.text}</span>
                      <span className={`grid h-9 w-9 place-items-center rounded-full ${selected ? "bg-[#ff7a1a] text-white" : "bg-[#f7f0e8] text-[#c8b8a8]"}`}>
                        {selected ? <CheckIcon className="h-5 w-5" /> : <ArrowIcon className="h-4 w-4" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        <aside className="rounded-[2rem] border border-[#eaded2] bg-[#171514] p-5 text-white shadow-[0_24px_70px_rgba(52,34,20,.12)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">{zh ? "维度进度" : "Signal tracker"}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">{zh ? "行为地图" : "Behavior map"}</h2>
            </div>
            <img
              src={getPersonalityAsset(helperStage.code, species)}
              alt=""
              className="h-20 w-20 object-contain drop-shadow-[0_18px_30px_rgba(255,122,26,.2)]"
            />
          </div>

          <div className="mt-6 space-y-4">
            {dimensionStats.map((stat) => (
              <div key={stat.dimension} className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-white">{localizedDimensionLabels[stat.dimension]}</span>
                  <span className="text-xs font-black text-[#ffb878]">{stat.answered}/{stat.total}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#ff7a1a] transition-all duration-300" style={{ width: `${stat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.25rem] bg-white/[.06] p-4">
            <p className="text-sm font-black text-white">{zh ? "答案没有对错。" : "No right or wrong answers."}</p>
            <p className="mt-2 text-sm leading-6 text-white/64">{zh ? "选择最符合爱宠日常表现的一项。完成的维度越多，性格画像就越清晰。" : "Choose the option that best matches your pet's usual pattern. The result becomes more precise as the behavior map fills in."}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={goBack}
              disabled={current === 0 || isSaving || selectedOptionIndex !== null}
              className="flex-1 rounded-full border border-white/15 bg-white/8 px-4 py-3 text-sm font-black text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {zh ? "上一题" : "Previous"}
            </button>
            <button
              onClick={() => router.push("/create")}
              disabled={isSaving}
              className="flex-1 rounded-full border border-white/15 bg-white/8 px-4 py-3 text-sm font-black text-white/74 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {zh ? "退出测试" : "Quit"}
            </button>
          </div>
        </aside>
      </div>

      {isSaving ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#171514]/62 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,.22)]">
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#fff0e4] border-t-[#ff7a1a] animate-spin" />
            <h2 className="mt-6 text-3xl font-black tracking-[-.05em] text-[#171514]">{zh ? "测试完成" : "Assessment complete"}</h2>
            <p className="mt-3 text-sm leading-6 text-[#7a6d63]">{zh ? "正在生成并保存爱宠的 PBTI 报告…" : "Generating your PBTI result and saved report..."}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
