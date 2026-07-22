"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { PORTRAIT_STUDIO_TEMPLATES, type PortraitStudioMode } from "@/lib/portraitStudioTemplates";
import { listCurrentUserPortraits, type PetPortraitRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

const MAX_UPLOAD_IMAGE_EDGE = 1280;
const MAX_UPLOAD_DATA_URL_BYTES = 800_000;
const IMAGE_QUALITY_STEPS = [0.78, 0.68, 0.58, 0.5];

type StudioTab = PortraitStudioMode | "history";
type PetSpecies = "cat" | "dog";

const MODE_TABS: Array<{ id: StudioTab; en: string; zh: string }> = [
  { id: "free", en: "Create", zh: "创作" },
  { id: "free", en: "Free", zh: "自由" },
  { id: "duo", en: "Duo", zh: "合照" },
  { id: "history", en: "History", zh: "历史" },
];

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

  if (!context) throw new Error("Unable to prepare image compression.");

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

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M12 2.5 13.9 8l5.6 1.9-5.6 1.9L12 17.5l-1.9-5.7L4.5 9.9 10.1 8 12 2.5Z" fill="currentColor" />
      <path d="M18.8 14.6 19.7 17l2.3.9-2.3.8-.9 2.5-.8-2.5-2.4-.8 2.4-.9.8-2.4Z" fill="currentColor" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 text-[#9ca4b4]">
      <path d="M12 16V6m0 0-4 4m4-4 4 4M4 17.5v.5A2 2 0 0 0 6 20h12a2 2 0 0 0 2-2v-.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DuoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19a4.5 4.5 0 0 1 9 0v.5h-9V19Zm8 0a4 4 0 0 1 8 0v.5h-8V19Z" fill="currentColor" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M12 4a8 8 0 1 1-7.8 6.2H2.5V8.5h1.7A10 10 0 1 0 12 2v2Zm-.7 3.5h1.5V12l3.2 1.9-.8 1.3-3.9-2.3V7.5Z" fill="currentColor" />
    </svg>
  );
}

function FreeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="m7 15 4-8 2 5 4-1-4 8-2-5-4 1Z" fill="currentColor" />
    </svg>
  );
}

function modeIcon(tab: StudioTab, index: number) {
  if (tab === "duo") return <DuoIcon />;
  if (tab === "history") return <HistoryIcon />;
  return index === 0 ? <SparkIcon /> : <FreeIcon />;
}

function classifyPortrait(portrait: PetPortraitRecord) {
  const baseStyleId = portrait.style_id.split("--")[0];
  if (baseStyleId === "white-sketch-avatar") return "avatar" as const;
  if (baseStyleId === "landscape-campaign") return "landscape" as const;
  return "vertical" as const;
}

function EmptyPreview({ zh }: { zh: boolean }) {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-[#edf0f5] bg-[radial-gradient(circle_at_top,#ffffff_0%,#fbfbfe_56%,#f7f8fc_100%)] px-8 text-center shadow-[inset_0_2px_16px_rgba(38,40,45,.04)]">
      <div className="absolute inset-x-10 top-10 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,95,125,.10),transparent_68%)] blur-2xl" />
      <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white shadow-[0_12px_28px_rgba(255,92,138,.12)]">
        <span className="text-[#ff4c78]"><SparkIcon /></span>
      </div>
      <h2 className="relative mt-6 text-[2rem] font-black tracking-[-.06em] text-[#111111]">{zh ? "准备好创造一点魔法！" : "Ready to create a little magic!"}</h2>
      <p className="relative mt-3 max-w-sm text-sm leading-7 text-[#8e95a3]">{zh ? "左侧上传照片并点击生成，成片会在这里出现。" : "Upload on the left and generate. Your finished image will appear here."}</p>
    </div>
  );
}

function UploadBox({
  title,
  hint,
  photos,
  onPick,
  multiple = true,
}: {
  title: string;
  hint: string;
  photos: string[];
  onPick: (files: FileList | File[]) => void;
  multiple?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 text-sm font-bold text-[#50576a]">{title}</div>
      <label className="block cursor-pointer overflow-hidden rounded-[1.55rem] border border-dashed border-[#dfe4ee] bg-white transition hover:border-[#ff6a74] hover:shadow-[0_10px_24px_rgba(35,39,47,.04)]">
        <div className="flex min-h-[148px] flex-col items-center justify-center px-6 py-7 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-[#fafbfe] shadow-[0_6px_20px_rgba(45,50,63,.04)]">
            <UploadIcon />
          </div>
          <div className="mt-4 text-[1rem] font-black tracking-[-.03em] text-[#111111]">{hint}</div>
          <div className="mt-2 text-[11px] font-bold uppercase tracking-[.06em] text-[#9aa3b2]">JPEG, PNG, WEBP · MAX 10MB</div>
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(event) => {
              const files = event.target.files;
              if (files?.length) onPick(files);
            }}
          />
        </div>
      </label>
      {photos.length ? (
        <div className={`mt-3 grid gap-3 ${photos.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
          {photos.map((photo) => (
            <div key={photo} className="overflow-hidden rounded-[1.1rem] border border-[#eceef3] bg-[#f7f8fb]">
              <img src={photo} alt="Upload preview" className="aspect-[4/5] w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AccountPortraitStudioPage() {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const { loading: authLoading } = useRequireAuth();
  const [portraits, setPortraits] = useState<PetPortraitRecord[]>([]);
  const [loadingPortraits, setLoadingPortraits] = useState(true);
  const [activeTab, setActiveTab] = useState<StudioTab>("free");
  const [promptText, setPromptText] = useState("");
  const [petSpecies, setPetSpecies] = useState<PetSpecies>("cat");
  const [petPhotos, setPetPhotos] = useState<string[]>([]);
  const [ownerPhotos, setOwnerPhotos] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(PORTRAIT_STUDIO_TEMPLATES.find((item) => item.mode === "free")?.id || PORTRAIT_STUDIO_TEMPLATES[0]?.id || "");
  const [stylePickerOpen, setStylePickerOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationNotice, setGenerationNotice] = useState("");
  const [generatedPreview, setGeneratedPreview] = useState("");

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    listCurrentUserPortraits(6)
      .then((items) => {
        if (active) setPortraits(items);
      })
      .catch(() => {
        if (active) setPortraits([]);
      })
      .finally(() => {
        if (active) setLoadingPortraits(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading]);

  const createTemplates = useMemo(() => PORTRAIT_STUDIO_TEMPLATES.filter((item) => item.mode === "free").slice(0, 8), []);
  const duoTemplate = useMemo(() => PORTRAIT_STUDIO_TEMPLATES.find((item) => item.mode === "duo") || PORTRAIT_STUDIO_TEMPLATES[0], []);
  const selectedTemplate = useMemo(() => PORTRAIT_STUDIO_TEMPLATES.find((item) => item.id === selectedTemplateId) || createTemplates[0] || PORTRAIT_STUDIO_TEMPLATES[0], [createTemplates, selectedTemplateId]);

  const activeStudioLabel = useMemo(() => {
    if (activeTab === "duo") return zh ? "合照" : "Duo";
    if (stylePickerOpen) return zh ? "模板创作" : "Template Create";
    return zh ? "自由生成" : "Free Create";
  }, [activeTab, stylePickerOpen, zh]);

  const portraitCounts = useMemo(() => {
    const avatar = portraits.filter((portrait) => classifyPortrait(portrait) === "avatar").length;
    const vertical = portraits.filter((portrait) => classifyPortrait(portrait) === "vertical").length;
    const landscape = portraits.filter((portrait) => classifyPortrait(portrait) === "landscape").length;
    return { avatar, vertical, landscape };
  }, [portraits]);

  async function handlePhotoFiles(fileList: FileList | File[], target: "pet" | "owner") {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/")).slice(0, 3);
    if (!files.length) return;
    try {
      const dataUrls = await Promise.all(files.map((file) => compressImageFile(file)));
      if (target === "pet") setPetPhotos(dataUrls.filter(Boolean).slice(0, 3));
      else setOwnerPhotos(dataUrls.filter(Boolean).slice(0, 3));
      setGenerationError("");
    } catch {
      setGenerationError(zh ? "图片处理失败，请换一张更清晰的 JPG 或 PNG。" : "Unable to process the image. Try a clearer JPG or PNG file.");
    }
  }

  async function generatePortrait() {
    if (!petPhotos.length) {
      setGenerationError(zh ? "请先上传主体照片。" : "Upload a subject photo first.");
      return;
    }
    if (activeTab === "duo" && !ownerPhotos.length) {
      setGenerationError(zh ? "请再上传主人的照片。" : "Upload an owner photo as well.");
      return;
    }

    setGenerating(true);
    setGenerationError("");
    setGenerationNotice("");

    try {
      const response = await fetch("/api/portraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petPhotos,
          petSpecies,
          petName: `${petSpecies === "dog" ? "Dog" : "Cat"} Portrait`,
          ownerPhotos: activeTab === "duo" ? ownerPhotos : [],
          templateId: activeTab === "free" && stylePickerOpen ? selectedTemplate?.id : activeTab === "duo" ? duoTemplate?.id : undefined,
          styleId: activeTab === "free" && !stylePickerOpen ? "vertical-campaign" : undefined,
          customPrompt: promptText.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || (zh ? "写真生成失败，请稍后重试。" : "Portrait generation failed."));

      const created = data?.portrait as PetPortraitRecord | undefined;
      if (created?.image_url) {
        setGeneratedPreview(created.image_url);
        setPortraits((current) => [created, ...current.filter((item) => item.id !== created.id)].slice(0, 6));
      }
      setGenerationNotice(zh ? "写真已生成，并已保存到图片库。" : "Portrait generated and saved to your gallery.");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : (zh ? "写真生成失败，请稍后重试。" : "Portrait generation failed."));
    } finally {
      setGenerating(false);
    }
  }

  if (authLoading || loadingPortraits) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black text-[#171514]">{zh ? "正在加载创作页..." : "Loading portrait page..."}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <section className="rounded-[2.25rem] border border-[#ece6de] bg-white px-6 py-7 shadow-[0_18px_45px_rgba(31,35,44,.06)] sm:px-10 sm:py-8">
        <div className="mx-auto flex justify-center">
          <div className="inline-flex rounded-full bg-[#f2f3f7] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.92)]">
            {MODE_TABS.map((tab, index) => {
              const active = activeTab === tab.id && (tab.id !== "free" || (index === 0 ? stylePickerOpen : !stylePickerOpen || activeTab !== "free"));
              return (
                <button
                  key={`${tab.id}-${index}`}
                  type="button"
                  onClick={() => {
                    if (tab.id === "free" && index === 0) {
                      setActiveTab("free");
                      setStylePickerOpen(true);
                      return;
                    }
                    if (tab.id === "free" && index === 1) {
                      setActiveTab("free");
                      setStylePickerOpen(false);
                      return;
                    }
                    setActiveTab(tab.id);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-black transition ${active ? "bg-white text-[#ff4c78] shadow-[0_10px_24px_rgba(255,76,120,.14)]" : "text-[#5e6674] hover:text-[#111111]"}`}
                >
                  {modeIcon(tab.id, index)}
                  <span>{zh ? tab.zh : tab.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {generationNotice ? <p className="mt-6 rounded-[1.2rem] bg-[#edf9f1] px-4 py-3 text-sm font-bold text-[#247347]">{generationNotice}</p> : null}
        {generationError ? <p className="mt-6 rounded-[1.2rem] bg-[#fff2e8] px-4 py-3 text-sm font-bold text-[#b5482e]">{generationError}</p> : null}

        {activeTab === "history" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.96fr]">
            <div>
              <h1 className="text-4xl font-black tracking-[-.06em] text-[#111111]">{zh ? "最近生成的作品" : "Your recent portraits"}</h1>
              <p className="mt-3 text-sm leading-7 text-[#7f8794]">{zh ? "这里展示最近生成的 6 张作品。完整内容请进入图片库查看。" : "This shelf shows your latest six portraits. Open the full gallery for the complete library."}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {portraits.length ? portraits.map((portrait) => (
                  <a key={portrait.id} href={portrait.image_url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-[1.4rem] border border-[#eceff4] bg-white shadow-sm transition hover:-translate-y-1">
                    <img src={portrait.image_url} alt={portrait.style_name} className="aspect-[4/5] w-full object-cover" />
                    <div className="p-3">
                      <div className="text-sm font-black text-[#111111]">{zh ? "新作品" : "New portrait work"}</div>
                      <div className="mt-1 text-xs text-[#8d96a6]">{portrait.style_name}</div>
                    </div>
                  </a>
                )) : (
                  <div className="rounded-[1.4rem] border border-dashed border-[#dfe4ee] bg-[#fafbfe] px-5 py-10 text-sm font-bold text-[#8d96a6] sm:col-span-2 xl:col-span-3">
                    {zh ? "你还没有生成作品。" : "You do not have portraits yet."}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-[2rem] border border-[#eef0f4] bg-[#fcfcfe] p-6">
              <div className="text-sm font-black text-[#111111]">{zh ? "图片概览" : "Gallery overview"}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.3rem] bg-white p-4 shadow-sm">
                  <div className="text-2xl font-black text-[#111111]">{portraitCounts.avatar}</div>
                  <div className="mt-1 text-sm text-[#8d96a6]">{zh ? "头像" : "Avatar"}</div>
                </div>
                <div className="rounded-[1.3rem] bg-white p-4 shadow-sm">
                  <div className="text-2xl font-black text-[#111111]">{portraitCounts.vertical}</div>
                  <div className="mt-1 text-sm text-[#8d96a6]">{zh ? "竖屏" : "Vertical"}</div>
                </div>
                <div className="rounded-[1.3rem] bg-white p-4 shadow-sm">
                  <div className="text-2xl font-black text-[#111111]">{portraitCounts.landscape}</div>
                  <div className="mt-1 text-sm text-[#8d96a6]">{zh ? "横屏" : "Landscape"}</div>
                </div>
              </div>
              <Link href="/account/portraits/library" className="mt-6 inline-flex rounded-full bg-[#111111] px-6 py-3 text-sm font-black text-white">
                {zh ? "进入全部图片库" : "Open full gallery"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.98fr]">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-sm font-black text-[#50576a]">{zh ? "当前模式" : "Current mode"}</div>
                <div className="text-[1.85rem] font-black tracking-[-.05em] text-[#111111]">{activeStudioLabel}</div>
                <p className="text-sm leading-6 text-[#8d96a6]">
                  {activeTab === "duo"
                    ? (zh ? "上传主体和主人的照片，一次生成一张合照。" : "Upload both the subject and owner photos to create one duo image.")
                    : stylePickerOpen
                      ? (zh ? "上传主体照片，选一个模板，然后生成成片。" : "Upload a subject photo, choose a template, and generate one finished shot.")
                      : (zh ? "上传主体照片，写一句想法，直接开始自由生成。" : "Upload a subject photo, add one prompt, and start a free generation run.")}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-[1.35rem] border border-[#ebeff4] bg-[#fafbfd] px-4 py-3">
                <div className="text-sm font-black text-[#50576a]">{zh ? "创作对象" : "Subject type"}</div>
                <div className="inline-flex rounded-full bg-[#f2f3f7] p-1">
                  {(["cat", "dog"] as PetSpecies[]).map((species) => (
                    <button
                      key={species}
                      type="button"
                      onClick={() => setPetSpecies(species)}
                      className={`rounded-full px-4 py-2 text-sm font-black transition ${petSpecies === species ? "bg-white text-[#ff4c78] shadow-sm" : "text-[#6c7483]"}`}
                    >
                      {zh ? (species === "cat" ? "猫" : "狗") : species === "cat" ? "Cat" : "Dog"}
                    </button>
                  ))}
                </div>
              </div>

              <UploadBox
                title={zh ? "上传主体照片" : "Upload subject photo"}
                hint={zh ? "点击或拖拽你的主体照片到这里" : "Click or drop your subject photo here"}
                photos={petPhotos}
                onPick={(files) => void handlePhotoFiles(files, "pet")}
              />

              {activeTab === "duo" ? (
                <UploadBox
                  title={zh ? "上传主人的照片" : "Upload owner photo"}
                  hint={zh ? "点击或拖拽主人的照片到这里" : "Click or drop the owner photo here"}
                  photos={ownerPhotos}
                  onPick={(files) => void handlePhotoFiles(files, "owner")}
                  multiple={false}
                />
              ) : null}

              {stylePickerOpen ? (
                <div>
                  <div className="mb-3 text-sm font-bold text-[#50576a]">{zh ? "选择模板风格" : "Choose a style"}</div>
                  <button
                    type="button"
                    onClick={() => setStylePickerOpen((current) => !current)}
                    className="flex w-full items-center justify-between rounded-[1.35rem] border border-[#dfe4ee] bg-white px-4 py-4 text-left shadow-sm transition hover:border-[#ff6a74]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#f3f5f8] text-[#a2aab8]">
                        <SparkIcon />
                      </div>
                      <div>
                        <div className="text-base font-black text-[#111111]">{zh ? selectedTemplate.title.zh : selectedTemplate.title.en}</div>
                        <div className="mt-1 text-sm text-[#8d96a6]">{zh ? selectedTemplate.subtitle.zh : selectedTemplate.subtitle.en}</div>
                      </div>
                    </div>
                    <span className="text-sm font-black text-[#ff4c78]">{zh ? "更换" : "Change"}</span>
                  </button>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {createTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={`overflow-hidden rounded-[1.4rem] border bg-white text-left transition ${selectedTemplateId === template.id ? "border-[#ff7a8f] shadow-[0_10px_28px_rgba(255,76,120,.12)]" : "border-[#e8ecf2]"}`}
                      >
                        <img src={template.previewImage} alt={zh ? template.title.zh : template.title.en} className="aspect-[4/5] w-full object-cover" />
                        <div className="p-3">
                          <div className="text-sm font-black text-[#111111]">{zh ? template.title.zh : template.title.en}</div>
                          <div className="mt-1 text-xs text-[#8d96a6]">{zh ? template.subtitle.zh : template.subtitle.en}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <div className="mb-3 text-sm font-bold text-[#50576a]">{zh ? (stylePickerOpen ? "还有补充细节吗？（可选）" : "自定义指令") : (stylePickerOpen ? "Any extra detail? (Optional)" : "Custom prompt")}</div>
                <textarea
                  value={promptText}
                  onChange={(event) => setPromptText(event.target.value)}
                  placeholder={zh ? "例如：穿着宇航服，漂浮在太空中..." : "For example: wearing a spacesuit, floating in space..."}
                  className="min-h-[110px] w-full rounded-[1.35rem] border border-[#dfe4ee] bg-white px-5 py-4 text-sm text-[#111111] outline-none transition placeholder:text-[#a2aab8] focus:border-[#ff6a74]"
                />
              </div>

              <button
                type="button"
                onClick={generatePortrait}
                disabled={generating || !petPhotos.length || (activeTab === "duo" && !ownerPhotos.length)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[#111111] px-6 py-5 text-lg font-black text-white transition disabled:bg-[#d9dde5] disabled:text-white"
              >
                <SparkIcon />
                <span>{generating ? (zh ? "生成中..." : "Generating...") : activeTab === "duo" ? (zh ? "生成合照" : "Generate duo") : (zh ? "生成写真" : "Generate portrait")}</span>
              </button>

              <p className="text-center text-sm text-[#666f7d]">
                {zh ? (
                  <>
                    想保存这张作品？
                    <Link href="/login" className="ml-2 font-black text-[#3159ff]">
                      先登录！
                    </Link>
                  </>
                ) : (
                  <>
                    Want to save this creation?
                    <Link href="/login" className="ml-2 font-black text-[#3159ff]">
                      Sign in first!
                    </Link>
                  </>
                )}
              </p>
            </div>

            <div>
              {generatedPreview ? (
                <div className="overflow-hidden rounded-[2rem] border border-[#eef0f4] bg-white shadow-[0_16px_36px_rgba(32,36,42,.06)]">
                  <img src={generatedPreview} alt="Generated portrait preview" className="aspect-[4/5] w-full object-cover" />
                </div>
              ) : (
                <EmptyPreview zh={zh} />
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
