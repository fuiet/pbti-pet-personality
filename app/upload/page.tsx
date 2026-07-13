"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { getLatestPetRecord, getPetRecord, updatePetPhoto, type PetRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

type AnalysisState = "idle" | "analyzing" | "complete";

const analysisSteps = ["Reading image clarity", "Mapping visual profile", "Preparing quiz context"];

function getPetIdFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("petId");
}

function CameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 7.2 10 5h4l1.5 2.2H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.2a2 2 0 0 1 2-2h3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z" stroke="currentColor" strokeWidth="1.8" />
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

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { loading: authLoading } = useRequireAuth();
  const [preview, setPreview] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [pet, setPet] = useState<PetRecord | null>(null);
  const [loadingPet, setLoadingPet] = useState(true);
  const [error, setError] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [analysisProgress, setAnalysisProgress] = useState(0);

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
        setPreview(record.photo_url || "");
        setAnalysisState(record.photo_url ? "complete" : "idle");
        setAnalysisProgress(record.photo_url ? 100 : 0);
      } catch {
        if (active) {
          setError("Unable to load your pet profile.");
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

  useEffect(() => {
    if (analysisState !== "analyzing") return;

    setAnalysisProgress(8);
    const startedAt = Date.now();
    const duration = 3200;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setAnalysisProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(interval);
        setAnalysisState("complete");
      }
    }, 120);

    return () => window.clearInterval(interval);
  }, [analysisState]);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/") || !pet) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = typeof e.target?.result === "string" ? e.target.result : "";
      if (!dataUrl) return;

      setError("");
      setPreview(dataUrl);
      setAnalysisState("analyzing");

      try {
        await updatePetPhoto(pet.id, dataUrl);
      } catch {
        setError("Unable to save photo right now. You can continue and try again later.");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function removePhoto() {
    setPreview("");
    setAnalysisState("idle");
    setAnalysisProgress(0);
    if (inputRef.current) inputRef.current.value = "";

    if (pet) {
      try {
        await updatePetPhoto(pet.id, null);
      } catch {
        setError("Unable to remove photo right now.");
      }
    }
  }

  const activeStepIndex = analysisState === "complete" ? 2 : Math.min(2, Math.floor(analysisProgress / 34));
  const canStartQuiz = analysisState !== "analyzing";

  if (authLoading || loadingPet) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:py-14">
      <div className="mb-10 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition ${
                s === 2
                  ? "bg-[#ff7a1a] text-white shadow-[0_10px_24px_rgba(255,122,26,.24)]"
                  : s < 2
                  ? "bg-[#8b5e3c] text-white"
                  : "border-2 border-[#eaded2] bg-white text-[#a3968a]"
              }`}
            >
              {s < 2 ? "OK" : s}
            </div>
            {s < 4 && <div className={`h-0.5 w-10 transition ${s < 2 ? "bg-[#8b5e3c]" : "bg-[#eaded2]"}`} />}
          </div>
        ))}
      </div>

      <div className="mb-8 text-center lg:text-left">
        <p className="text-sm font-black uppercase tracking-[.18em] text-[#d96612]">Step 2 of 4</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-[#171514] sm:text-5xl">Upload a pet photo</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#6f6258] lg:text-lg">
          Choose a clear photo so PBTI can personalize the saved report, visual memory, and portrait poster pack for {pet?.name || "your pet"}.
        </p>
      </div>

      {error ? <p className="mb-5 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-semibold text-[#d96612]">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)] lg:items-stretch">
        <section
          className={`group relative overflow-hidden rounded-[2rem] border bg-white p-4 shadow-[0_24px_70px_rgba(52,34,20,.08)] transition ${
            dragOver ? "border-[#ff7a1a]" : preview ? "border-[#eaded2]" : "border-[#eaded2] hover:border-[#ff7a1a]/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="block w-full text-left"
            aria-label="Choose a pet photo"
          >
            <div className="relative grid min-h-[430px] place-items-center overflow-hidden rounded-[1.5rem] border border-[#f0dfcf] bg-[#fffaf5]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,122,26,.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,122,26,.05)_1px,transparent_1px)] bg-[size:34px_34px] opacity-80" />

              {preview ? (
                <div className="relative h-full w-full">
                  <img src={preview} alt="Pet preview" className="h-full min-h-[430px] w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,21,20,.08),rgba(23,21,20,.36))]" />

                  {analysisState === "analyzing" ? (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="pbti-scan-line absolute left-0 right-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(255,122,26,.2),rgba(255,255,255,.78),rgba(255,122,26,.2),transparent)]" />
                      <div className="absolute inset-x-8 top-8 h-px bg-[#ffb878]/90 shadow-[0_0_20px_rgba(255,122,26,.75)]" />
                      <div className="absolute inset-x-8 bottom-8 h-px bg-[#ffb878]/90 shadow-[0_0_20px_rgba(255,122,26,.75)]" />
                      <div className="absolute inset-y-8 left-8 w-px bg-[#ffb878]/90 shadow-[0_0_20px_rgba(255,122,26,.75)]" />
                      <div className="absolute inset-y-8 right-8 w-px bg-[#ffb878]/90 shadow-[0_0_20px_rgba(255,122,26,.75)]" />
                      <div className="absolute left-8 top-8 h-8 w-8 border-l-2 border-t-2 border-white" />
                      <div className="absolute right-8 top-8 h-8 w-8 border-r-2 border-t-2 border-white" />
                      <div className="absolute bottom-8 left-8 h-8 w-8 border-b-2 border-l-2 border-white" />
                      <div className="absolute bottom-8 right-8 h-8 w-8 border-b-2 border-r-2 border-white" />
                    </div>
                  ) : null}

                  <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-[#171514] shadow-sm backdrop-blur">
                    {analysisState === "complete" ? "Visual analysis complete" : analysisState === "analyzing" ? "Analyzing visual profile" : "Photo selected"}
                  </div>
                </div>
              ) : (
                <div className="relative mx-auto max-w-md px-8 py-16 text-center">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-[#fff0e4] text-[#ff7a1a] shadow-[0_18px_44px_rgba(255,122,26,.14)]">
                    <CameraIcon className="h-9 w-9" />
                  </div>
                  <h2 className="mt-7 text-3xl font-black tracking-[-.04em] text-[#171514]">Drop your pet photo here</h2>
                  <p className="mt-3 text-sm leading-6 text-[#756960]">or click to browse from your device</p>
                  <div className="mt-7 inline-flex rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,122,26,.26)]">
                    Choose photo
                  </div>
                  <p className="mt-4 text-xs font-semibold text-[#a3968a]">JPG, PNG or WebP up to 10MB</p>
                </div>
              )}
            </div>
          </button>

          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />

          {preview ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <p className="text-sm font-black text-[#171514]">{pet?.name ? `${pet.name}'s profile photo` : "Profile photo"}</p>
                <p className="text-xs font-semibold text-[#8c7b6d]">Used in the saved report and poster pack.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full border border-[#eaded2] bg-white px-5 py-2.5 text-xs font-black text-[#4f463f] transition hover:border-[#ff7a1a]/50 hover:bg-[#fff7ed]"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-full border border-[#eaded2] bg-white px-5 py-2.5 text-xs font-black text-[#7a6d63] transition hover:border-[#ff7a1a]/50 hover:text-[#ff7a1a]"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="rounded-[2rem] border border-[#eaded2] bg-[#171514] p-6 text-white shadow-[0_24px_70px_rgba(52,34,20,.12)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">Visual model</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Photo analysis</h2>
            </div>
            <div className={`grid h-11 w-11 place-items-center rounded-2xl ${analysisState === "complete" ? "bg-[#2fd07f] text-[#07140d]" : "bg-white/10 text-[#ffb878]"}`}>
              {analysisState === "complete" ? <CheckIcon className="h-6 w-6" /> : <CameraIcon className="h-6 w-6" />}
            </div>
          </div>

          <div className="mt-7 rounded-[1.25rem] border border-white/10 bg-white/[.06] p-4">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[.12em] text-white/58">
              <span>{analysisState === "idle" ? "Waiting for photo" : analysisState === "analyzing" ? "Scanning" : "Ready"}</span>
              <span>{analysisProgress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#ff7a1a] shadow-[0_0_18px_rgba(255,122,26,.72)] transition-all duration-200"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {analysisSteps.map((step, index) => {
              const isDone = analysisState === "complete" || (analysisState === "analyzing" && index < activeStepIndex);
              const isActive = analysisState === "analyzing" && index === activeStepIndex;

              return (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3">
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${
                      isDone ? "bg-[#2fd07f] text-[#07140d]" : isActive ? "bg-[#ff7a1a] text-white pbti-data-pulse" : "bg-white/10 text-white/48"
                    }`}
                  >
                    {isDone ? "OK" : index + 1}
                  </div>
                  <span className={`text-sm font-bold ${isActive ? "text-white" : isDone ? "text-white/88" : "text-white/48"}`}>{step}</span>
                </div>
              );
            })}
          </div>

          <div className={`mt-6 rounded-[1.25rem] p-4 ${analysisState === "complete" ? "bg-[#10351f] text-[#c9f8db]" : "bg-white/[.06] text-white/68"}`}>
            <p className="text-sm font-black text-white">{analysisState === "complete" ? "Visual model analysis complete." : "Upload a clear photo to start the visual scan."}</p>
            <p className="mt-2 text-sm leading-6 opacity-80">
              {analysisState === "complete"
                ? "Your pet photo is ready. Please start the personality test."
                : "The scan checks photo clarity and prepares the visual profile used in the report experience."}
            </p>
          </div>

          <div className="mt-7 border-t border-white/10 pt-5">
            <h3 className="text-sm font-black text-white">Best photo tips</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/68">
              <li>Face clearly visible</li>
              <li>Good lighting, not too dark</li>
              <li>One pet centered in the frame</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push("/create")}
          className="rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 text-sm font-bold text-[#4f463f] transition hover:bg-white/80"
        >
          Back to profile
        </button>
        <button
          onClick={() => router.push(`/quiz?petId=${pet?.id || ""}`)}
          disabled={!canStartQuiz}
          className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10] disabled:cursor-not-allowed disabled:bg-[#ffc397] disabled:shadow-none disabled:hover:translate-y-0"
        >
          {analysisState === "analyzing" ? "Analyzing photo..." : analysisState === "complete" ? "Start personality test" : "Skip photo and continue"}
        </button>
      </div>
    </div>
  );
}