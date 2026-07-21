"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TemplatePreviewCard from "@/app/account/portraits/TemplatePreviewCard";
import { useLanguage } from "@/components/LanguageProvider";
import { PORTRAIT_STUDIO_TEMPLATES, type PortraitStudioCategory, type PortraitStudioMode, type PortraitStudioTemplate } from "@/lib/portraitStudioTemplates";
import { getLatestResultForCurrentUser, listCurrentUserPortraits, type PetPortraitRecord, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

const MAX_UPLOAD_IMAGE_EDGE = 1280;
const MAX_UPLOAD_DATA_URL_BYTES = 800_000;
const IMAGE_QUALITY_STEPS = [0.78, 0.68, 0.58, 0.5];

const MODE_TABS: Array<{ id: PortraitStudioMode | "history"; en: string; zh: string }> = [
  { id: "free", en: "Free Create", zh: "自由创作" },
  { id: "duo", en: "Pet + Owner", zh: "宠物合影" },
  { id: "history", en: "My Portraits", zh: "我的写真" },
];

const CATEGORY_FILTERS: Array<{ id: "all" | PortraitStudioCategory; en: string; zh: string }> = [
  { id: "all", en: "All", zh: "全部" },
  { id: "trending", en: "Trending", zh: "热门推荐" },
  { id: "avatars", en: "Avatars", zh: "头像写真" },
  { id: "posters", en: "Posters", zh: "竖屏海报" },
  { id: "landscapes", en: "Landscapes", zh: "横屏场景" },
  { id: "holiday", en: "Holiday", zh: "节日主题" },
  { id: "pet-owner", en: "Pet + Owner", zh: "主宠合影" },
];

type StudioTab = PortraitStudioMode | "history";

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

function classifyPortrait(portrait: PetPortraitRecord) {
  const baseStyleId = portrait.style_id.split("--")[0];
  if (baseStyleId === "white-sketch-avatar") return "avatar" as const;
  if (baseStyleId === "landscape-campaign") return "landscape" as const;
  return "vertical" as const;
}

export default function AccountPortraitStudioPage() {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const { loading: authLoading } = useRequireAuth();
  const [portraits, setPortraits] = useState<PetPortraitRecord[]>([]);
  const [latestRecord, setLatestRecord] = useState<ResultRecord | null>(null);
  const [loadingPortraits, setLoadingPortraits] = useState(true);
  const [activeTab, setActiveTab] = useState<StudioTab>("free");
  const [activeCategory, setActiveCategory] = useState<"all" | PortraitStudioCategory>("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState(PORTRAIT_STUDIO_TEMPLATES[0]?.id || "");
  const [promptText, setPromptText] = useState("");
  const [ownerPhotos, setOwnerPhotos] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationNotice, setGenerationNotice] = useState("");

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    Promise.all([listCurrentUserPortraits(), getLatestResultForCurrentUser()])
      .then(([savedPortraits, result]) => {
        if (!active) return;
        setPortraits(savedPortraits);
        setLatestRecord(result);
      })
      .catch(() => {
        if (!active) return;
        setPortraits([]);
        setLatestRecord(null);
      })
      .finally(() => {
        if (active) setLoadingPortraits(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading]);

  const selectedTemplate = useMemo(
    () => PORTRAIT_STUDIO_TEMPLATES.find((template) => template.id === selectedTemplateId) || PORTRAIT_STUDIO_TEMPLATES[0],
    [selectedTemplateId],
  );

  const filteredTemplates = useMemo(() => {
    return PORTRAIT_STUDIO_TEMPLATES.filter((template) => {
      const modeMatch = activeTab === "history" ? true : template.mode === activeTab;
      const categoryMatch = activeCategory === "all" ? true : template.category === activeCategory;
      return modeMatch && categoryMatch;
    });
  }, [activeCategory, activeTab]);

  const featuredPortraits = useMemo(() => portraits.slice(0, 6), [portraits]);
  const portraitCounts = useMemo(() => {
    const avatar = portraits.filter((portrait) => classifyPortrait(portrait) === "avatar").length;
    const vertical = portraits.filter((portrait) => classifyPortrait(portrait) === "vertical").length;
    const landscape = portraits.filter((portrait) => classifyPortrait(portrait) === "landscape").length;
    return { avatar, vertical, landscape };
  }, [portraits]);

  useEffect(() => {
    if (!filteredTemplates.some((template) => template.id === selectedTemplateId) && filteredTemplates[0]) {
      setSelectedTemplateId(filteredTemplates[0].id);
    }
  }, [filteredTemplates, selectedTemplateId]);

  async function generateFromTemplate() {
    if (!selectedTemplate || !latestRecord?.pet) return;
    if (selectedTemplate.mode === "duo" && ownerPhotos.length === 0) {
      setGenerationError(zh ? "请先上传至少 1 张主人照片，再生成主宠合影。" : "Upload at least one owner photo before generating a pet + owner portrait.");
      setGenerationNotice("");
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
          petId: latestRecord.pet.id,
          resultId: latestRecord.pbti_id,
          templateId: selectedTemplate.id,
          ownerPhotos,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || (zh ? "写真生成失败，请稍后重试。" : "Portrait generation failed."));

      const created = data?.portrait as PetPortraitRecord | undefined;
      if (created?.image_url) {
        setPortraits((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      }
      setGenerationNotice(
        zh
          ? `已按“${selectedTemplate.title.zh}”模板为 ${latestRecord.pet.name} 发起生成。`
          : `Started generation for ${latestRecord.pet.name} using the "${selectedTemplate.title.en}" template.`,
      );
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : (zh ? "写真生成失败，请稍后重试。" : "Portrait generation failed."));
    } finally {
      setGenerating(false);
    }
  }

  async function handleOwnerFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/")).slice(0, 3);
    if (!files.length) return;

    try {
      const dataUrls = await Promise.all(files.map((file) => compressImageFile(file)));
      setOwnerPhotos(dataUrls.filter(Boolean).slice(0, 3));
      setGenerationError("");
    } catch {
      setGenerationError(zh ? "无法处理主人照片，请换一张更清晰的 JPG 或 PNG。" : "Unable to process the owner photo. Try a clearer JPG or PNG image.");
    }
  }

  if (authLoading || loadingPortraits) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">{zh ? "正在加载…" : "Loading..."}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="overflow-hidden rounded-[2.5rem] border border-[#eaded2] bg-[linear-gradient(135deg,#fffdf9_0%,#fff5e8_54%,#fffdf8_100%)] shadow-[0_24px_70px_rgba(52,34,20,.08)]">
        <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
          <div>
            <h1 className="max-w-2xl text-4xl font-black leading-[.92] tracking-[-.06em] text-[#171514] sm:text-5xl">
              {zh ? "选一张模板图，让它变成你家宠物的写真" : "Pick a template image and turn it into your pet's portrait"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6c5f55]">
              {zh
                ? "这里的模板不是灵感图，而是真实生成目标。选中哪张模板，就按那张图的构图、场景、服饰与氛围生成，只把里面的宠物换成你自己的宠物。"
                : "These templates are not just inspiration cards. Whichever template you choose becomes the actual generation target: scene, composition, outfit, and atmosphere stay anchored to that image while the pet is replaced with your own."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => selectedTemplate && generateFromTemplate()} disabled={generating || !selectedTemplate || !latestRecord?.pet} className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,122,26,.26)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {generating ? (zh ? "生成中…" : "Generating...") : (zh ? "按当前模板生成" : "Generate from template")}
              </button>
              <Link href="/account/portraits/library" className="rounded-full border border-[#eaded2] bg-white px-6 py-3 text-sm font-black text-[#3f352e] transition hover:border-[#ff7a1a] hover:text-[#ff7a1a]">
                {zh ? "查看全部写真" : "View all portraits"}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-[#7b6657]">
                {zh ? `${portraitCounts.avatar} 头像 / ${portraitCounts.vertical} 竖屏 / ${portraitCounts.landscape} 横屏` : `${portraitCounts.avatar} avatars / ${portraitCounts.vertical} vertical / ${portraitCounts.landscape} landscape`}
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-[#7b6657]">
                {latestRecord?.pet ? (zh ? `当前使用：${latestRecord.pet.name}` : `Using: ${latestRecord.pet.name}`) : (zh ? "请先完成一份报告" : "Create a report first")}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#eaded2] bg-white p-5 shadow-[0_18px_40px_rgba(52,34,20,.05)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "当前模板" : "Current template"}</div>
            {selectedTemplate ? (
              <>
                <div className={`relative mt-4 overflow-hidden rounded-[1.7rem] bg-gradient-to-br ${selectedTemplate.previewTint}`}>
                  <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.22))]" />
                  <img src={selectedTemplate.previewImage} alt={zh ? selectedTemplate.title.zh : selectedTemplate.title.en} className={`relative z-[1] w-full object-cover ${selectedTemplate.orientation === "avatar" ? "aspect-square" : selectedTemplate.orientation === "vertical" ? "aspect-[4/5]" : "aspect-[16/10]"}`} />
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-[-.04em] text-[#171514]">{zh ? selectedTemplate.title.zh : selectedTemplate.title.en}</h2>
                <p className="mt-2 text-sm leading-7 text-[#706459]">{zh ? selectedTemplate.subtitle.zh : selectedTemplate.subtitle.en}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#fff0e4] px-3 py-1 text-[11px] font-black uppercase tracking-[.12em] text-[#d96612]">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5 rounded-[1.4rem] bg-[#171514] p-4 text-white">
                  <div className="text-xs font-black uppercase tracking-[.15em] text-[#ffb878]">{zh ? "模板生成规则" : "Template generation rule"}</div>
                  <p className="mt-3 text-sm leading-7 text-white/78">
                    {zh
                      ? `系统会尽量复刻这张模板图的场景、道具、构图、服饰与氛围，只把里面的宠物替换成 ${latestRecord?.pet?.name || "你的宠物"}，同时保留真实长相。`
                      : `The system will recreate this template's scene, prop logic, composition, styling, and atmosphere, while replacing the example pet with ${latestRecord?.pet?.name || "your pet"} and keeping the real identity intact.`}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {generationNotice ? <p className="mt-6 rounded-2xl bg-[#edf9f1] px-4 py-3 text-sm font-bold text-[#247347]">{generationNotice}</p> : null}
      {generationError ? <p className="mt-6 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-bold text-[#b5482e]">{generationError}</p> : null}

      <section className="mt-8 rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-[0_18px_50px_rgba(52,34,20,.06)]">
        <div className="flex flex-wrap gap-3">
          {MODE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${activeTab === tab.id ? "bg-[#171514] text-white" : "bg-[#f8efe5] text-[#5d5046] hover:bg-[#f1e4d5]"}`}
            >
              {zh ? tab.zh : tab.en}
            </button>
          ))}
        </div>

        {activeTab === "history" ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredPortraits.length ? (
              featuredPortraits.map((portrait) => (
                <a key={portrait.id} href={portrait.image_url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-[1.5rem] border border-[#eaded2] bg-[#fffdf9] shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(52,34,20,.08)]">
                  <img src={portrait.image_url} alt={`${portrait.style_name} portrait`} className="aspect-[4/5] w-full object-cover" />
                  <div className="p-4">
                    <div className="text-base font-black text-[#171514]">{portrait.pet?.name || (zh ? "已保存爱宠" : "Saved pet")}</div>
                    <div className="mt-1 text-xs font-bold text-[#8c7d72]">{portrait.style_name}</div>
                  </div>
                </a>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[#eaded2] bg-[#fffaf5] px-5 py-10 text-sm font-bold text-[#8f8175] sm:col-span-2 xl:col-span-3">
                {zh ? "还没有已保存写真。选一张模板就可以开始生成。" : "No saved portraits yet. Pick a template to start generating."}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-3">
              {CATEGORY_FILTERS.filter((filter) => activeTab === "free" ? filter.id !== "pet-owner" : filter.id === "all" || filter.id === "pet-owner").map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveCategory(filter.id)}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[.12em] transition ${activeCategory === filter.id ? "bg-[#ff7a1a] text-white" : "bg-[#fff3e8] text-[#8a705f] hover:bg-[#ffe7d1]"}`}
                >
                  {zh ? filter.zh : filter.en}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplatePreviewCard
                  key={template.id}
                  template={template}
                  zh={zh}
                  selected={selectedTemplateId === template.id}
                  onSelect={() => {
                    setSelectedTemplateId(template.id);
                    setActiveTab(template.mode);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-[2rem] border border-[#eaded2] bg-[linear-gradient(180deg,#fffdf9_0%,#fff7ee_100%)] p-6 shadow-[0_18px_50px_rgba(52,34,20,.06)]">
          <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "创作面板" : "Creation panel"}</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#171514]">{zh ? "模板驱动生成" : "Template-driven generation"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7a6d63]">
            {zh ? "模板会先决定成片目标，你的补充描述只做微调，不再从零开始猜风格。" : "The template sets the final image target first, and your custom notes only refine it instead of forcing the model to guess the style from scratch."}
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[#eaded2] bg-white p-4">
              <div className="text-xs font-black uppercase tracking-[.14em] text-[#d96612]">{zh ? "模板背景" : "Template background"}</div>
              <div className="mt-3 text-sm font-bold text-[#4f4238]">{selectedTemplate?.background}</div>
            </div>
            <div className="rounded-[1.5rem] border border-[#eaded2] bg-white p-4">
              <div className="text-xs font-black uppercase tracking-[.14em] text-[#d96612]">{zh ? "模板服饰" : "Template styling"}</div>
              <div className="mt-3 text-sm font-bold text-[#4f4238]">{selectedTemplate?.outfit}</div>
            </div>
            <div className="rounded-[1.5rem] border border-[#eaded2] bg-white p-4">
              <div className="text-xs font-black uppercase tracking-[.14em] text-[#d96612]">{zh ? "模板动作" : "Template pose"}</div>
              <div className="mt-3 text-sm font-bold text-[#4f4238]">{selectedTemplate?.pose}</div>
            </div>
            <div className="rounded-[1.5rem] border border-[#eaded2] bg-white p-4">
              <div className="text-xs font-black uppercase tracking-[.14em] text-[#d96612]">{zh ? "模板神态" : "Template expression"}</div>
              <div className="mt-3 text-sm font-bold text-[#4f4238]">{selectedTemplate?.expression}</div>
            </div>
          </div>

          {selectedTemplate?.mode === "duo" ? (
            <div className="mt-5 rounded-[1.5rem] border border-[#eaded2] bg-white p-4">
              <div className="text-sm font-black text-[#171514]">{zh ? "上传主人照片" : "Upload owner photos"}</div>
              <p className="mt-2 text-sm leading-6 text-[#7a6d63]">
                {zh ? "上传 1-3 张主人半身或全身照片，系统会和宠物一起代入当前模板场景。" : "Upload 1-3 half-body or full-body owner photos so the system can place both the pet and owner inside the selected template."}
              </p>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-[#e8d7c7] bg-[#fffaf5] px-4 py-8 text-center">
                <span className="text-sm font-black text-[#171514]">{zh ? "点击上传主人照片" : "Click to upload owner photos"}</span>
                <span className="mt-2 text-xs text-[#8f8175]">JPG / PNG / WEBP · 1-3 {zh ? "张" : "images"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = event.target.files;
                    if (files?.length) void handleOwnerFiles(files);
                  }}
                />
              </label>
              {ownerPhotos.length ? (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {ownerPhotos.map((photo, index) => (
                    <div key={photo} className="overflow-hidden rounded-[1rem] border border-[#eaded2] bg-[#f7efe8]">
                      <img src={photo} alt={`Owner upload ${index + 1}`} className="aspect-[4/5] w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 rounded-[1.5rem] border border-[#eaded2] bg-white p-4">
            <label htmlFor="portrait-prompt" className="text-sm font-black text-[#171514]">
              {zh ? "补充微调要求" : "Add prompt refinements"}
            </label>
            <textarea
              id="portrait-prompt"
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
              placeholder={zh ? "例如：围巾换成奶油白、眼神更自信、背景更干净一些" : "For example: cream scarf instead of red, more confident eyes, cleaner background"}
              className="mt-3 min-h-[120px] w-full rounded-[1.25rem] border border-[#eaded2] bg-[#fffaf5] px-4 py-3 text-sm text-[#33251d] outline-none transition placeholder:text-[#a39489] focus:border-[#ff7a1a]"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] bg-[#171514] p-6 text-white shadow-[0_22px_56px_rgba(52,34,20,.14)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#ffb878]">{zh ? "生成说明" : "Generation note"}</div>
            <p className="mt-3 text-sm leading-7 text-white/78">
              {zh
                ? `当前流程会优先锁定“${selectedTemplate?.title.zh || "当前模板"}”的构图、场景与道具逻辑，再基于 ${latestRecord?.pet?.name || "你的宠物"} 的真实照片做替换生成。`
                : `The current flow first locks the composition, scene grammar, and prop logic from "${selectedTemplate?.title.en || "the selected template"}", then rebuilds the image around ${latestRecord?.pet?.name || "your pet"} using the real reference photos.`}
            </p>
            <button type="button" onClick={generateFromTemplate} disabled={generating || !selectedTemplate || !latestRecord?.pet} className="mt-5 rounded-full bg-[#ff7a1a] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {generating ? (zh ? "正在生成…" : "Generating...") : (zh ? "开始生成 1 张" : "Generate 1 image")}
            </button>
          </div>

          <div className="rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-[0_18px_50px_rgba(52,34,20,.06)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "当前限制" : "Current live scope"}</div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-[#6a5e55]">
              <p>{zh ? "自由写真模板已接入真实生成：点击模板后会按该模板直接生成，不再随机挑风格。" : "Single-pet templates now drive real generation directly after selection instead of randomly choosing a style."}</p>
              <p>{zh ? "主宠合影模板现在支持主人照片上传，并会把宠物图与主人图一起送入生成模型。" : "Pet + owner templates now accept owner uploads and send both the pet and owner references into the generation model together."}</p>
              <p>{zh ? "生成仍然会保留现有的表情增强和 PBTI 气质逻辑，避免成片发呆。" : "Expression enhancement and PBTI-driven emotional styling remain active so results do not feel blank or stiff."}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
