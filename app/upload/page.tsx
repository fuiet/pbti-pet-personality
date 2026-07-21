"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { getLatestPetRecord, getPetRecord, updatePetPhotos, updatePetPhoto, type PetRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { PetVisualProfile } from "@/lib/visualProfile";
import { useLanguage } from "@/components/LanguageProvider";

type AnalysisState = "idle" | "background" | "complete";

const REQUIRED_PHOTO_COUNT = 3;
const analysisSteps = ["Reading image clarity", "Mapping visual profile", "Assigning PBTI visual tags"];


const MAX_UPLOAD_IMAGE_EDGE = 1280;
const MAX_UPLOAD_DATA_URL_BYTES = 800_000;
const IMAGE_QUALITY_STEPS = [0.78, 0.68, 0.58, 0.5];
const ANALYSIS_PROMPT_DELAY_MS = 3000;

function estimateDataUrlBytes(dataUrl: string) {
  const commaIndex = dataUrl.indexOf(",");
  const payload = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  return Math.ceil((payload.length * 3) / 4);
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.onload = () => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to load image file."));
      image.src = typeof reader.result === "string" ? reader.result : "";
    };
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file: File) {
  const image = await loadImageFromFile(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.min(1, MAX_UPLOAD_IMAGE_EDGE / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to prepare image compression.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let bestDataUrl = canvas.toDataURL("image/jpeg", IMAGE_QUALITY_STEPS[0]);
  for (const quality of IMAGE_QUALITY_STEPS.slice(1)) {
    if (estimateDataUrlBytes(bestDataUrl) <= MAX_UPLOAD_DATA_URL_BYTES) break;
    bestDataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  return bestDataUrl;
}
const photoRequirements = [
  { label: "Front face", detail: "Clear front-facing face photo" },
  { label: "Left side", detail: "Left profile / body angle" },
  { label: "Right side", detail: "Right profile / body angle" },
] as const;

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
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const localizedPhotoRequirements = zh ? [
    { label: "正面照", detail: "脸部清晰、正对镜头" },
    { label: "左侧照", detail: "左侧脸或身体轮廓" },
    { label: "右侧照", detail: "右侧脸或身体轮廓" },
  ] : photoRequirements;
  const localizedAnalysisSteps = zh ? ["检查照片清晰度", "提取外观特征", "整理爱宠鉴定标签"] : analysisSteps;
  const inputRef = useRef<HTMLInputElement>(null);
  const analysisAttemptedKeyRef = useRef("");
  const analysisPromptTimerRef = useRef<number | null>(null);
  const { loading: authLoading } = useRequireAuth();
  const [preview, setPreview] = useState<string>("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pet, setPet] = useState<PetRecord | null>(null);
  const [loadingPet, setLoadingPet] = useState(true);
  const [error, setError] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [visualProfile, setVisualProfile] = useState<PetVisualProfile | null>(null);
  const [visualFallback, setVisualFallback] = useState(false);
  const [analysisPromptVisible, setAnalysisPromptVisible] = useState(false);
  const [savedPhotoSetKey, setSavedPhotoSetKey] = useState("");

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
        const savedPhotos = record.photo_urls?.length ? record.photo_urls : record.photo_url ? [record.photo_url] : [];
        setPreview(savedPhotos[0] || "");
        setPhotoPreviews(savedPhotos);
        setAnalysisState("idle");
        setAnalysisProgress(0);
      } catch {
        if (active) {
          setError("Unable to load your test setup.");
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
    return () => {
      if (analysisPromptTimerRef.current !== null) {
        window.clearTimeout(analysisPromptTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (analysisState !== "background") return;

    setAnalysisProgress(8);
    const startedAt = Date.now();
    const duration = 2600;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(74, Math.round((elapsed / duration) * 74));
      setAnalysisProgress(nextProgress);

      if (nextProgress >= 92) {
        window.clearInterval(interval);
      }
    }, 120);

    return () => window.clearInterval(interval);
  }, [analysisState]);

  function startBackgroundAnalysis(currentPet: PetRecord, photoSetKey: string) {
    if (!photoSetKey || analysisAttemptedKeyRef.current === photoSetKey) return;

    analysisAttemptedKeyRef.current = photoSetKey;
    setAnalysisState("background");
    setAnalysisPromptVisible(false);
    setAnalysisProgress(8);
    setVisualProfile(null);
    setVisualFallback(false);
    if (analysisPromptTimerRef.current !== null) {
      window.clearTimeout(analysisPromptTimerRef.current);
    }
    analysisPromptTimerRef.current = window.setTimeout(() => {
      setAnalysisPromptVisible(true);
      analysisPromptTimerRef.current = null;
    }, ANALYSIS_PROMPT_DELAY_MS);

    void fetch("/api/visual-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId: currentPet.id }),
      keepalive: true,
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Unable to analyze photo.");
        }

        setVisualProfile(data.profile || null);
        setVisualFallback(Boolean(data.fallback));
        if (data.saveError) {
          setError(`Visual analysis was generated, but database save needs setup: ${data.saveError}`);
        }
        setAnalysisProgress(100);
        setAnalysisState("complete");
      })
      .catch((analysisError) => {
        if (analysisPromptTimerRef.current !== null) {
          window.clearTimeout(analysisPromptTimerRef.current);
          analysisPromptTimerRef.current = null;
        }
        setAnalysisPromptVisible(false);
        setAnalysisState("idle");
        setAnalysisProgress(0);
        setError(analysisError instanceof Error ? analysisError.message : "Unable to analyze photo in the background right now.");
      });
  }

  async function handleFiles(fileList: FileList | File[]) {
    if (!pet) return;

    const remainingSlots = Math.max(REQUIRED_PHOTO_COUNT - photoPreviews.length, 0);
    const files = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots || REQUIRED_PHOTO_COUNT);

    if (!files.length) return;

    let dataUrls: string[];

    try {
      dataUrls = await Promise.all(files.map((file) => compressImageFile(file)));
    } catch {
      setError("Unable to compress one of the photos. Please try a clearer JPG or PNG image.");
      return;
    }

    const newPhotoUrls = dataUrls.filter(Boolean);
    const usableUrls = photoPreviews.length >= REQUIRED_PHOTO_COUNT
      ? newPhotoUrls.slice(0, REQUIRED_PHOTO_COUNT)
      : [...photoPreviews, ...newPhotoUrls].slice(0, REQUIRED_PHOTO_COUNT);
    const primaryPhoto = usableUrls[0];
    if (!primaryPhoto) return;

    const hasFullPhotoSet = usableUrls.length >= REQUIRED_PHOTO_COUNT;
    const nextPhotoSetKey = usableUrls.join("|");

    setError("");
    setPreview(primaryPhoto);
    setPhotoPreviews(usableUrls);
    setVisualProfile(null);
    setVisualFallback(false);

    if (!hasFullPhotoSet) {
      setAnalysisState("idle");
      setAnalysisPromptVisible(false);
      setAnalysisProgress(0);
      setSavedPhotoSetKey("");
    }

    try {
      await updatePetPhotos(pet.id, usableUrls);
    } catch {
      setError("Unable to save the front photo right now. You can continue and try again later.");
      analysisAttemptedKeyRef.current = nextPhotoSetKey;
      return;
    }

    if (hasFullPhotoSet) {
      setSavedPhotoSetKey(nextPhotoSetKey);
    }

    if (inputRef.current) inputRef.current.value = "";
  }
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files?.length) handleFiles(files);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.length) handleFiles(files);
  }

  async function removePhoto() {
    if (analysisPromptTimerRef.current !== null) {
      window.clearTimeout(analysisPromptTimerRef.current);
      analysisPromptTimerRef.current = null;
    }
    setPreview("");
    setPhotoPreviews([]);
    setAnalysisState("idle");
    setAnalysisPromptVisible(false);
    setAnalysisProgress(0);
    setSavedPhotoSetKey("");
    analysisAttemptedKeyRef.current = "";
    setVisualProfile(null);
    setVisualFallback(false);
    if (inputRef.current) inputRef.current.value = "";

    if (pet) {
      try {
        await updatePetPhoto(pet.id, null);
      } catch {
        setError("Unable to remove photo right now.");
      }
    }
  }

  const uploadedPhotoCount = photoPreviews.filter(Boolean).length;
  const missingPhotoCount = Math.max(REQUIRED_PHOTO_COUNT - uploadedPhotoCount, 0);
  const hasFullPhotoSet = uploadedPhotoCount >= REQUIRED_PHOTO_COUNT;
  const photoSetKey = photoPreviews.filter(Boolean).join("|");
  const uploadStatusText = hasFullPhotoSet
    ? "3/3 photos uploaded. Background analysis starts automatically."
    : `${uploadedPhotoCount}/3 photos uploaded. Add ${missingPhotoCount} more for the best identification.`;
  const activeStepIndex = analysisState === "complete" ? 2 : analysisState === "background" ? Math.min(2, Math.floor(analysisProgress / 28)) : 0;
  const canStartQuiz = Boolean(pet);

  useEffect(() => {
    if (!pet || analysisState !== "idle" || !hasFullPhotoSet || !photoSetKey || savedPhotoSetKey !== photoSetKey) {
      return;
    }

    startBackgroundAnalysis(pet, photoSetKey);
  }, [analysisState, hasFullPhotoSet, pet, photoSetKey, savedPhotoSetKey]);

  if (authLoading || loadingPet) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">{zh ? "正在加载…" : "Loading..."}</div>;
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
        <p className="text-sm font-black uppercase tracking-[.18em] text-[#d96612]">{zh ? "第 2 步，共 4 步" : "Step 2 of 4"}</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-[#171514] sm:text-5xl">{zh ? "上传 3 张爱宠照片" : "Upload 3 pet photos"}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#6f6258] lg:text-lg">
          {zh ? `请上传 ${pet?.name || "爱宠"} 的正面、左侧和右侧清晰照片。正面照将作为主要展示图，并用于爱宠鉴定。` : `Please upload three clear photos of ${pet?.name || "your pet"}: front face, left side, and right side. The front photo will be used as the main display image for visual analysis.`}
        </p>
      </div>

      {error ? <p className="mb-5 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-semibold text-[#d96612]">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)] lg:items-start">
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
            aria-label={zh ? "选择最多 3 张爱宠照片" : "Choose up to 3 pet photos"}
          >
            <div className="relative grid h-[340px] place-items-center overflow-hidden rounded-[1.5rem] border border-[#f0dfcf] bg-[#fffaf5] sm:h-[420px]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,122,26,.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,122,26,.05)_1px,transparent_1px)] bg-[size:34px_34px] opacity-80" />

              {preview ? (
                <div className="relative h-full w-full">
                  <img src={preview} alt={zh ? "爱宠照片预览" : "Pet preview"} className="h-full w-full object-contain" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,21,20,.08),rgba(23,21,20,.36))]" />

                  {analysisState === "background" ? (
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
                    {analysisState === "complete" ? (zh ? "爱宠鉴定已保存" : "Visual identification saved") : analysisState === "background" ? (zh ? "正在扫描分析" : "Background analysis running") : (zh ? `已上传 ${uploadedPhotoCount}/3 张` : `${uploadedPhotoCount}/3 photos uploaded`)}
                  </div>
                </div>
              ) : (
                <div className="relative mx-auto max-w-md px-8 py-16 text-center">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-[#fff0e4] text-[#ff7a1a] shadow-[0_18px_44px_rgba(255,122,26,.14)]">
                    <CameraIcon className="h-9 w-9" />
                  </div>
                  <h2 className="mt-7 text-3xl font-black tracking-[-.04em] text-[#171514]">{zh ? "上传正面、左侧和右侧照片" : "Upload front, left, and right photos"}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#756960]">{zh ? "从手机或电脑中选择三张清晰照片" : "Add front, left, and right images from your device"}</p>
                  <div className="mt-7 inline-flex rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,122,26,.26)]">
                    {zh ? "选择照片" : "Choose photos"}
                  </div>
                  <div className="mt-7 grid gap-2 sm:grid-cols-3">
                    {localizedPhotoRequirements.map((item, index) => (
                      <div key={item.label} className="rounded-2xl border border-[#f0dfcf] bg-white/78 px-3 py-3 text-left shadow-sm">
                        <div className="text-xs font-black uppercase tracking-[.12em] text-[#ff7a1a]">0{index + 1}</div>
                        <div className="mt-1 text-sm font-black text-[#171514]">{item.label}</div>
                        <div className="mt-1 text-xs leading-5 text-[#8c7b6d]">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-semibold text-[#a3968a]">{zh ? "支持 JPG、PNG、WebP，每张不超过 10MB。大图会自动压缩；照片不完整或不清晰可能影响鉴定结果。" : "JPG, PNG or WebP up to 10MB each. Large photos are compressed automatically before analysis. Incomplete or unclear photos may affect identification and test results."}</p>
                </div>
              )}
            </div>
          </button>

          <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleChange} className="hidden" />

          {preview ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <p className="text-sm font-black text-[#171514]">{zh ? `${pet?.name || "爱宠"}的照片` : pet?.name ? `${pet.name}'s photo set` : "Photo set"}</p>
                <p className="text-xs font-semibold text-[#8c7b6d]">{uploadStatusText}</p>
              </div>
              <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:min-w-[260px]">
                {localizedPhotoRequirements.map((item, index) => (
                  <div key={item.label} className="overflow-hidden rounded-xl border border-[#eaded2] bg-[#fff7ed]">
                    {photoPreviews[index] ? (
                      <img src={photoPreviews[index]} alt={`${item.label} preview`} className="h-16 w-full object-cover" />
                    ) : (
                      <div className="grid h-16 place-items-center px-2 text-center text-[10px] font-black uppercase tracking-[.08em] text-[#b59b85]">
                        {item.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full border border-[#eaded2] bg-white px-5 py-2.5 text-xs font-black text-[#4f463f] transition hover:border-[#ff7a1a]/50 hover:bg-[#fff7ed]"
                >
                  {hasFullPhotoSet ? (zh ? "重新选择" : "Replace set") : (zh ? "继续添加" : "Add photos")}
                </button>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-full border border-[#eaded2] bg-white px-5 py-2.5 text-xs font-black text-[#7a6d63] transition hover:border-[#ff7a1a]/50 hover:text-[#ff7a1a]"
                >
                  {zh ? "移除" : "Remove"}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="rounded-[2rem] border border-[#eaded2] bg-[#171514] p-6 text-white shadow-[0_24px_70px_rgba(52,34,20,.12)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">{zh ? "视觉识别" : "Visual model"}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">{zh ? "爱宠鉴定" : "Photo analysis"}</h2>
            </div>
            <div className={`grid h-11 w-11 place-items-center rounded-2xl ${analysisState === "complete" ? "bg-[#2fd07f] text-[#07140d]" : "bg-white/10 text-[#ffb878]"}`}>
              {analysisState === "complete" ? <CheckIcon className="h-6 w-6" /> : <CameraIcon className="h-6 w-6" />}
            </div>
          </div>

          <div className="mt-7 rounded-[1.25rem] border border-white/10 bg-white/[.06] p-4">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[.12em] text-white/58">
              <span>{analysisState === "idle" ? (hasFullPhotoSet ? (zh ? "可以开始扫描" : "Ready to scan") : (zh ? "等待 3 张照片" : "Waiting for 3 photos")) : analysisState === "background" ? (zh ? "正在扫描" : "Background scan") : (zh ? "已完成" : "Ready")}</span>
              <span>{analysisState === "idle" ? `${uploadedPhotoCount}/3` : `${analysisProgress}%`}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#ff7a1a] shadow-[0_0_18px_rgba(255,122,26,.72)] transition-all duration-200"
                style={{ width: `${analysisState === "idle" ? Math.round((uploadedPhotoCount / REQUIRED_PHOTO_COUNT) * 100) : analysisProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {localizedAnalysisSteps.map((step, index) => {
              const isWaiting = analysisState === "idle" && !hasFullPhotoSet;
              const isDone = analysisState === "complete" || (analysisState === "background" && index < activeStepIndex);
              const isActive = analysisState === "background" && index === activeStepIndex;

              return (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3">
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${
                      isDone ? "bg-[#2fd07f] text-[#07140d]" : isActive ? "bg-[#ff7a1a] text-white pbti-data-pulse" : isWaiting ? "bg-white/10 text-white/32" : "bg-white/10 text-white/48"
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
            <p className="text-sm font-black text-white">{analysisState === "complete" ? (zh ? "爱宠鉴定已保存。" : "Visual identification saved.") : analysisState === "background" ? (zh ? "正在扫描分析照片。" : "Background analysis is running.") : hasFullPhotoSet ? (zh ? "照片已齐，可以开始分析。" : "Photo set ready for analysis.") : (zh ? "上传 3 张照片后将自动开始鉴定。" : "Upload 3 photos before visual analysis starts.")}</p>
            <p className="mt-2 text-sm leading-6 opacity-80">
              {analysisState === "complete"
                ? (zh ? "爱宠鉴定已完成，可以开始性格测试了。" : "Your pet photo is ready. Please start the personality test.")
                : analysisState === "background"
                ? (zh ? "系统正在后台识别品种线索、毛发、面部和体态特征。你可以继续答题，鉴定结果会随完整报告一起呈现。" : "We are identifying breed cues, coat details, facial features, and body structure in the background. You can continue answering now; the result will appear with the final report.")
                : hasFullPhotoSet
                ? (zh ? "正面、左侧和右侧照片已齐，系统会自动开始分析。" : "Your front, left, and right photos are ready. Analysis starts automatically when the full set is uploaded.")
                : (zh ? `还需上传 ${missingPhotoCount} 张照片。你也可以先跳过，但完整照片有助于更准确地判断品种、毛色和混血特征。` : `Add ${missingPhotoCount} more photo${missingPhotoCount === 1 ? "" : "s"}. You can still skip ahead, but complete photos improve breed, coat, and mixed-trait identification.`)}
            </p>
          </div>

          {visualProfile ? (
            <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-white/[.06] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-white">{zh ? "PBTI 外观标签" : "PBTI visual tags"}</h3>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#ffb878]">
                  {visualFallback ? (zh ? "服务暂不可用" : "API key not active") : visualProfile.providerModel}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {visualProfile.visualTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#ff7a1a] px-3 py-1.5 text-xs font-black text-white shadow-[0_10px_22px_rgba(255,122,26,.18)]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid gap-3 text-sm text-white/72">
                <div>
                  <span className="text-white/42">{zh ? "品种判断：" : "Breed guess: "}</span>
                  <span className="font-bold text-white">
                    {visualProfile.breedCandidates[0]?.breed || (zh ? "混血或暂不明确" : "Mixed / unclear")}
                  </span>
                </div>
                <div>
                  <span className="text-white/42">{zh ? "毛发：" : "Coat: "}</span>
                  <span>{[visualProfile.coat.color, visualProfile.coat.length, visualProfile.coat.pattern].filter(Boolean).join(", ")}</span>
                </div>
                <div>
                  <span className="text-white/42">{zh ? "神态：" : "Expression: "}</span>
                  <span>{visualProfile.face.eyeExpression}</span>
                </div>
                <div>
                  <span className="text-white/42">{zh ? "照片质量：" : "Photo quality: "}</span>
                  <span>{visualProfile.photoQuality.score}/100</span>
                </div>
              </div>
              {visualFallback ? (
                <p className="mt-4 rounded-2xl bg-[#ff7a1a]/15 px-3 py-2 text-xs font-bold leading-5 text-[#ffcfaa]">
                  {zh ? "实时图像分析暂未运行，请检查 Cloudflare Production 中的 DASHSCOPE_API_KEY 配置后重新部署。" : "Live Qwen-VL analysis did not run. Check DASHSCOPE_API_KEY in Cloudflare Production variables, then retry deployment."}
                </p>
              ) : null}
              <p className="mt-4 text-xs leading-5 text-white/42">{visualProfile.disclaimer}</p>
            </div>
          ) : null}
          <div className="mt-7 border-t border-white/10 pt-5">
            <h3 className="text-sm font-black text-white">{zh ? "需要的照片" : "Required photo set"}</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/68">
              <li>{zh ? "正面脸部照片" : "Front-facing face photo"}</li>
              <li>{zh ? "左侧身体或侧脸照片" : "Left-side body / profile photo"}</li>
              <li>{zh ? "右侧身体或侧脸照片" : "Right-side body / profile photo"}</li>
              <li className="text-[#ffcfaa]">{zh ? "照片缺失或不清晰可能影响鉴定结果。" : "Incomplete or unclear photos may affect identification and test results."}</li>
            </ul>
          </div>
        </aside>
      </div>

      {analysisPromptVisible && (analysisState === "background" || analysisState === "complete") ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#171514]/45 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#24211f] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,.28)]">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#ff7a1a] text-white shadow-[0_16px_35px_rgba(255,122,26,.28)]">
                <CameraIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-[-.035em]">{analysisState === "complete" ? (zh ? "照片分析已完成" : "Photo analysis is ready.") : (zh ? "正在扫描分析照片" : "Background analysis is running.")}</h2>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  {analysisState === "complete"
                    ? (zh ? "系统已完成品种特征、毛发、脸部与体态分析，鉴定内容会显示在完整报告中。" : "We finished reviewing breed cues, coat details, facial features, and body structure. Your visual findings will appear in the final report.")
                    : (zh ? "系统正在识别品种特征、毛发、脸部与体态。你可以先进入行为测试，鉴定结果会自动写入完整报告。" : "We are identifying breed cues, coat details, facial features, and body structure from your photos. You can continue to the behavior test now; visual findings will appear in the final report.")}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setAnalysisPromptVisible(false)}
                className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-black text-white transition hover:bg-white/12"
              >
                {zh ? "继续查看" : "Stay here"}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/quiz?petId=${pet?.id || ""}`)}
                className="flex-1 rounded-full bg-[#ff7a1a] px-5 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.24)] transition hover:bg-[#ee6b10]"
              >
                {zh ? "进入行为测试" : "Continue to behavior test"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push("/create")}
          className="rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 text-sm font-bold text-[#4f463f] transition hover:bg-white/80"
        >
          {zh ? "返回上一步" : "Back to setup"}
        </button>
        <button
          onClick={() => router.push(`/quiz?petId=${pet?.id || ""}`)}
          disabled={!canStartQuiz}
          className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10] disabled:cursor-not-allowed disabled:bg-[#ffc397] disabled:shadow-none disabled:hover:translate-y-0"
        >
          {analysisState === "idle" && !hasFullPhotoSet ? (zh ? "跳过并继续" : "Skip and continue") : analysisState === "background" ? (zh ? "分析中，继续测试" : "Continue while analysis runs") : (zh ? "进入性格测试" : "Continue to personality test")}
        </button>
      </div>
    </div>
  );
}
