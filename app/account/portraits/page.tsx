"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TemplatePreviewCard from "@/app/account/portraits/TemplatePreviewCard";
import { useLanguage } from "@/components/LanguageProvider";
import { PORTRAIT_STUDIO_TEMPLATES, type PortraitStudioCategory, type PortraitStudioMode } from "@/lib/portraitStudioTemplates";
import { getLatestResultForCurrentUser, listCurrentUserPortraits, type PetPortraitRecord, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

const MAX_UPLOAD_IMAGE_EDGE = 1280;
const MAX_UPLOAD_DATA_URL_BYTES = 800_000;
const IMAGE_QUALITY_STEPS = [0.78, 0.68, 0.58, 0.5];

const MODE_TABS: Array<{ id: PortraitStudioMode | "history"; en: string; zh: string }> = [
  { id: "free", en: "Create", zh: "创作" },
  { id: "duo", en: "Pet + Owner", zh: "合照" },
  { id: "history", en: "History", zh: "历史" },
];

const CATEGORY_FILTERS: Array<{ id: "all" | PortraitStudioCategory; en: string; zh: string }> = [
  { id: "all", en: "All templates", zh: "全部模板" },
  { id: "trending", en: "Trending", zh: "热门推荐" },
  { id: "avatars", en: "Avatar", zh: "头像写真" },
  { id: "posters", en: "Vertical", zh: "竖屏海报" },
  { id: "landscapes", en: "Landscape", zh: "横屏场景" },
  { id: "holiday", en: "Holiday", zh: "节日主题" },
  { id: "pet-owner", en: "Pet + Owner", zh: "宠主合照" },
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

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M12 2.5 13.9 8l5.6 1.9-5.6 1.9L12 17.5l-1.9-5.7L4.5 9.9 10.1 8 12 2.5Z" fill="currentColor" />
      <path d="M18.8 14.6 19.7 17l2.3.9-2.3.8-.9 2.5-.8-2.5-2.4-.8 2.4-.9.8-2.4Z" fill="currentColor" />
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

function modeIcon(tab: StudioTab) {
  if (tab === "duo") return <DuoIcon />;
  if (tab === "history") return <HistoryIcon />;
  return <SparkIcon />;
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
      setGenerationError(zh ? "请先上传至少 1 张主人的照片，再生成宠主合照。" : "Upload at least one owner photo before generating a pet + owner portrait.");
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
          customPrompt: promptText.trim(),
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
          ? `已按“${selectedTemplate.title.zh}”为 ${latestRecord.pet.name} 发起生成。`
          : `Started generation for ${latestRecord.pet.name} using "${selectedTemplate.title.en}".`,
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
      setGenerationError(zh ? "主人照片处理失败，请换一张更清晰的 JPG 或 PNG 重新上传。" : "Unable to process the owner photo. Try a clearer JPG or PNG image.");
    }
  }

  if (authLoading || loadingPortraits) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black text-[#171514]">{zh ? "正在加载写真工作台..." : "Loading portrait studio..."}</div>;
  }

  const currentPetName = latestRecord?.pet?.name || (zh ? "你的宠物" : "your pet");
  const studioSteps = [
    {
      title: zh ? "1. 选择模板" : "1. Pick a template",
      text: zh ? "模板不是参考图，而是实际生成目标。" : "The template is the real generation target, not just mood inspiration.",
    },
    {
      title: zh ? "2. 代入你的宠物" : "2. Swap in your pet",
      text: zh ? "系统会保留构图、道具、服饰和场景逻辑。" : "Composition, props, wardrobe, and scene logic stay anchored to the template.",
    },
    {
      title: zh ? "3. 生成 1 张成片" : "3. Generate one finish",
      text: zh ? "不满意再继续改提示词或换模板重来。" : "If it misses, revise the prompt or pick another template and retry.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2.4rem] border border-[#ece3d8] bg-[radial-gradient(circle_at_top_left,#fffdf9_0%,#fff8ee_36%,#fffaf5_62%,#ffffff_100%)] p-4 shadow-[0_28px_80px_rgba(49,32,18,.08)] sm:p-6 lg:p-8">
        <div className="mx-auto flex w-full justify-center">
          <div className="inline-flex rounded-full bg-[#f3efe8] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.92)]">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition ${activeTab === tab.id ? "bg-white text-[#ff6a1a] shadow-[0_8px_24px_rgba(255,106,26,.14)]" : "text-[#6f6257] hover:text-[#171514]"}`}
              >
                {modeIcon(tab.id)}
                <span>{zh ? tab.zh : tab.en}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.02fr_.98fr]">
          <div className="rounded-[2rem] bg-white/82 p-6 shadow-[0_18px_45px_rgba(51,33,17,.06)] backdrop-blur">
            <h1 className="max-w-3xl text-[2.25rem] font-black leading-[.92] tracking-[-.07em] text-[#12110f] sm:text-[3.35rem]">
              {activeTab === "history"
                ? (zh ? "你的宠物写真都在这里，随时回看和继续创作" : "All your portraits live here, ready to revisit and create from again")
                : (zh ? "像选成片一样选模板，再把它变成你家宠物的照片" : "Choose a finished-looking template, then turn it into a portrait of your own pet")}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6d6056] sm:text-[15px]">
              {activeTab === "history"
                ? (zh ? "这里保留你已经生成过的头像、竖屏和横屏写真。你可以继续回看、打开原图，或者回到模板区做新一轮生成。" : "This is your saved portrait shelf for avatars, vertical posters, and landscape scenes. Reopen, review, and jump back into a new generation round whenever you want.")
                : (zh ? "工作台的重点不是解释很多，而是马上开始创作。选中模板后，系统会锁定那张图的构图、场景、服饰、道具与气质，再用真实宠物照片做替换生成。" : "The studio should feel like a creative desk, not a wall of instructions. Once you select a template, the system locks its composition, scene, styling, prop language, and mood, then rebuilds the shot around your real pet photos.")}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[#f1e4d7] bg-[#fffaf4] p-4">
                <div className="text-[11px] font-black uppercase tracking-[.14em] text-[#c86b2a]">{zh ? "当前宠物" : "Current pet"}</div>
                <div className="mt-2 text-lg font-black text-[#171514]">{latestRecord?.pet ? latestRecord.pet.name : (zh ? "请先完成报告" : "Create a report first")}</div>
                <p className="mt-1 text-sm leading-6 text-[#7e6e63]">{zh ? "工作台会默认使用最近完成报告的宠物。" : "The studio uses the most recent pet with a completed report."}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#f1e4d7] bg-[#fffaf4] p-4">
                <div className="text-[11px] font-black uppercase tracking-[.14em] text-[#c86b2a]">{zh ? "已生成写真" : "Portrait count"}</div>
                <div className="mt-2 text-lg font-black text-[#171514]">{portraits.length}</div>
                <p className="mt-1 text-sm leading-6 text-[#7e6e63]">
                  {zh ? `${portraitCounts.avatar} 头像 / ${portraitCounts.vertical} 竖屏 / ${portraitCounts.landscape} 横屏` : `${portraitCounts.avatar} avatars / ${portraitCounts.vertical} vertical / ${portraitCounts.landscape} landscape`}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[#f1e4d7] bg-[#fffaf4] p-4">
                <div className="text-[11px] font-black uppercase tracking-[.14em] text-[#c86b2a]">{zh ? "当前模板" : "Selected template"}</div>
                <div className="mt-2 text-lg font-black text-[#171514]">{selectedTemplate ? (zh ? selectedTemplate.title.zh : selectedTemplate.title.en) : "--"}</div>
                <p className="mt-1 text-sm leading-6 text-[#7e6e63]">{selectedTemplate ? (zh ? selectedTemplate.subtitle.zh : selectedTemplate.subtitle.en) : (zh ? "请先选择模板" : "Choose a template to begin.")}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {studioSteps.map((step) => (
                <div key={step.title} className="rounded-[1.4rem] border border-[#eee4d9] bg-white p-4">
                  <div className="text-sm font-black text-[#171514]">{step.title}</div>
                  <p className="mt-2 text-sm leading-6 text-[#807164]">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => selectedTemplate && generateFromTemplate()}
                disabled={generating || !selectedTemplate || !latestRecord?.pet}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,122,26,.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <SparkIcon />
                <span>{generating ? (zh ? "生成中..." : "Generating...") : (zh ? "按当前模板生成" : "Generate with this template")}</span>
              </button>
              <Link href="/account/portraits/library" className="rounded-full border border-[#eaded2] bg-white px-6 py-3 text-sm font-black text-[#3e352d] transition hover:border-[#ff7a1a] hover:text-[#ff7a1a]">
                {zh ? "查看全部图片" : "Open full gallery"}
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#ede4d9] bg-white p-4 shadow-[0_18px_48px_rgba(52,34,20,.06)]">
            {selectedTemplate ? (
              <div className="overflow-hidden rounded-[1.75rem] bg-[#171514]">
                <div className="relative">
                  <img
                    src={selectedTemplate.previewImage}
                    alt={zh ? selectedTemplate.title.zh : selectedTemplate.title.en}
                    className={`w-full object-cover ${selectedTemplate.orientation === "avatar" ? "aspect-square" : selectedTemplate.orientation === "vertical" ? "aspect-[4/5]" : "aspect-[16/10]"}`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_28%,rgba(0,0,0,.62)_100%)]" />
                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
                    <div className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[.14em] text-[#5c4b40]">
                      {zh ? "真实模板图" : "Live template image"}
                    </div>
                    <div className="rounded-full bg-[#ff7a1a] px-3 py-1 text-[11px] font-black uppercase tracking-[.14em] text-white">
                      {selectedTemplate.mode === "duo" ? (zh ? "宠物 + 主人" : "Pet + Owner") : selectedTemplate.orientation}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h2 className="text-2xl font-black tracking-[-.04em]">{zh ? selectedTemplate.title.zh : selectedTemplate.title.en}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/78">{zh ? selectedTemplate.subtitle.zh : selectedTemplate.subtitle.en}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black tracking-[.12em] text-white/85">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] bg-white/6 p-4">
                    <div className="text-[11px] font-black uppercase tracking-[.14em] text-[#ffb878]">{zh ? "模板锁定" : "Template lock"}</div>
                    <p className="mt-2 text-sm leading-6 text-white/75">
                      {zh
                        ? `会尽量复刻这张图的镜头距离、姿态、背景、服饰和道具逻辑，只把其中的示例宠物替换成 ${currentPetName}。`
                        : `The system preserves the shot distance, pose, background, styling, and prop grammar of this image, then swaps the example pet for ${currentPetName}.`}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] bg-white/6 p-4">
                    <div className="text-[11px] font-black uppercase tracking-[.14em] text-[#ffb878]">{zh ? "为什么看起来更像成片" : "Why this feels closer"}</div>
                    <p className="mt-2 text-sm leading-6 text-white/75">
                      {zh
                        ? "模板图本身会作为真实参考图传给模型，不再只是一个装饰封面，所以生成结果会更贴近你选中的那张成片。"
                        : "The template image itself is sent to the model as a real visual reference, so the result tracks the chosen finished shot more closely instead of treating it as decorative cover art."}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {generationNotice ? <p className="mt-5 rounded-[1.4rem] bg-[#edf9f1] px-4 py-3 text-sm font-bold text-[#247347]">{generationNotice}</p> : null}
      {generationError ? <p className="mt-5 rounded-[1.4rem] bg-[#fff2e8] px-4 py-3 text-sm font-bold text-[#b5482e]">{generationError}</p> : null}

      <section className="mt-8 grid gap-8 xl:grid-cols-[.92fr_1.08fr]">
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-[#ece1d6] bg-white p-6 shadow-[0_18px_50px_rgba(52,34,20,.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "创作面板" : "Creation panel"}</div>
                <h2 className="mt-2 text-3xl font-black tracking-[-.05em] text-[#171514]">{zh ? "把输入区做得像真的工作台" : "A real studio desk, not a settings form"}</h2>
                <p className="mt-2 text-sm leading-7 text-[#74685f]">
                  {zh
                    ? "参考你发来的优秀案例，这里不再堆很多说明文，而是把核心输入收敛成几个真正影响结果的控制项。"
                    : "Following the stronger references you shared, the input area is compressed into a few controls that actually shape the result instead of a long block of explanation text."}
                </p>
              </div>
              <div className="hidden rounded-[1.2rem] border border-[#f0e3d7] bg-[#fff7ef] px-4 py-3 text-right text-sm font-bold text-[#7d695b] sm:block">
                <div>{zh ? "一次只生成 1 张" : "One image per run"}</div>
                <div className="mt-1 text-xs text-[#a08f82]">{zh ? "更像精修而不是盲抽" : "Closer to a refined shot than a blind batch"}</div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#efe2d7] bg-[#fffaf4] p-4">
              <div className="text-xs font-black uppercase tracking-[.14em] text-[#d96612]">{zh ? "当前生成对象" : "Current subject"}</div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-[#171514]">{latestRecord?.pet ? latestRecord.pet.name : (zh ? "暂无可用宠物" : "No pet ready yet")}</div>
                  <p className="mt-1 text-sm leading-6 text-[#7b6d62]">{zh ? "默认使用最近完成报告的宠物。如果没有报告，先去完成一次测试。" : "The latest pet with a finished report is used by default. If none exists yet, complete a test first."}</p>
                </div>
                <Link href="/account" className="shrink-0 rounded-full border border-[#eaded2] px-4 py-2 text-sm font-black text-[#44372f] transition hover:border-[#ff7a1a] hover:text-[#ff7a1a]">
                  {zh ? "返回用户中心" : "Back to account"}
                </Link>
              </div>
            </div>

            {selectedTemplate?.mode === "duo" ? (
              <div className="rounded-[1.5rem] border border-[#efe2d7] bg-[#fffaf4] p-4">
                <div className="text-sm font-black text-[#171514]">{zh ? "上传主人照片" : "Upload owner photos"}</div>
                <p className="mt-2 text-sm leading-6 text-[#7a6d63]">
                  {zh ? "上传 1-3 张主人的半身或全身照片，系统会让主人和宠物共同进入当前模板。" : "Upload 1-3 half-body or full-body owner photos so both the owner and pet can be placed into the selected template."}
                </p>
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-[#efc3b4] bg-white px-4 py-8 text-center transition hover:border-[#ff7a1a]">
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
                      <div key={photo} className="overflow-hidden rounded-[1rem] border border-[#eaded2] bg-white">
                        <img src={photo} alt={`Owner upload ${index + 1}`} className="aspect-[4/5] w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-[1.5rem] border border-[#efe2d7] bg-[#fffaf4] p-4">
              <label htmlFor="portrait-prompt" className="text-sm font-black text-[#171514]">
                {zh ? "补充微调要求" : "Prompt refinements"}
              </label>
              <p className="mt-2 text-sm leading-6 text-[#7a6d63]">
                {zh ? "这里的文字不再是摆设，提交后会一起送进生成链路。适合写背景、服饰、动作、眼神、氛围等微调要求。" : "This field is now connected to generation. Use it for small refinements to background, outfit, pose, eyes, mood, and scene details."}
              </p>
              <textarea
                id="portrait-prompt"
                value={promptText}
                onChange={(event) => setPromptText(event.target.value)}
                placeholder={zh ? "例如：像杂志封面一样干净，眼神更自信一点，毛发更轻盈，背景别太杂乱。" : "For example: cleaner like a magazine cover, slightly more confident eyes, lighter fur rendering, and a less cluttered background."}
                className="mt-3 min-h-[150px] w-full rounded-[1.25rem] border border-[#eaded2] bg-white px-4 py-3 text-sm text-[#33251d] outline-none transition placeholder:text-[#a39489] focus:border-[#ff7a1a]"
              />
            </div>

            <button
              type="button"
              onClick={generateFromTemplate}
              disabled={generating || !selectedTemplate || !latestRecord?.pet}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-[#171514] px-6 py-4 text-sm font-black text-white shadow-[0_18px_40px_rgba(23,21,20,.16)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SparkIcon />
              <span>{generating ? (zh ? "正在生成 1 张写真..." : "Generating 1 portrait...") : (zh ? "生成 1 张写真" : "Generate 1 portrait")}</span>
            </button>
          </div>

          <div className="rounded-[2rem] bg-[#171514] p-6 text-white shadow-[0_22px_56px_rgba(52,34,20,.14)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#ffb878]">{zh ? "当前链路说明" : "Live generation logic"}</div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/78">
              <p>{zh ? "选中的模板图会直接参与生成，不再只是页面封面。" : "The selected template image is sent into generation directly, not just used as visual cover art."}</p>
              <p>{zh ? "宠物原图会继续负责身份锁定，避免换品种、换脸型、换毛色。" : "The pet's real photos still act as the identity lock so the model does not drift into another breed, face shape, or coat color."}</p>
              <p>{zh ? "表情增强和 PBTI 气质策略仍然保留，避免成片呆、空、没有神态。" : "Expression enhancement and PBTI-driven mood shaping stay active so the final portrait does not feel stiff or emotionally blank."}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#ece1d6] bg-white p-6 shadow-[0_18px_50px_rgba(52,34,20,.05)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{activeTab === "history" ? (zh ? "最近生成" : "Recent work") : (zh ? "模板图库" : "Template gallery")}</div>
              <h2 className="mt-2 text-3xl font-black tracking-[-.05em] text-[#171514]">
                {activeTab === "history" ? (zh ? "先从你的已有写真里找感觉" : "Use your finished portraits as your launchpad") : (zh ? "像逛写真样片一样选模板" : "Browse templates like finished studio samples")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#74685f]">
                {activeTab === "history"
                  ? (zh ? "这里只保留最近 6 张，完整图库请进入“全部图片”页面查看。" : "This shelf keeps the latest six portraits visible here. Open the full gallery for the complete library.")
                  : (zh ? "你发来的参考站点有一个共同点：模板要大、可逛、像成片，而不是小卡片拼图。这里改成了更接近样片库的浏览方式。" : "The stronger sites you shared all treat templates like a real lookbook: larger, more browseable, and closer to finished imagery rather than tiny option cards.")}
              </p>
            </div>
            {activeTab !== "history" ? (
              <div className="rounded-full bg-[#fff4ea] px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-[#b96a2b]">
                {zh ? `${filteredTemplates.length} 张模板可用` : `${filteredTemplates.length} templates available`}
              </div>
            ) : null}
          </div>

          {activeTab === "history" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featuredPortraits.length ? (
                featuredPortraits.map((portrait) => (
                  <a
                    key={portrait.id}
                    href={portrait.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-[1.55rem] border border-[#eaded2] bg-[#fffdf9] shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(52,34,20,.08)]"
                  >
                    <img src={portrait.image_url} alt={`${portrait.style_name} portrait`} className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                    <div className="p-4">
                      <div className="text-base font-black text-[#171514]">{portrait.pet?.name || currentPetName}</div>
                      <div className="mt-1 text-xs font-bold text-[#8c7d72]">{portrait.style_name}</div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[#eaded2] bg-[#fffaf5] px-5 py-10 text-sm font-bold text-[#8f8175] sm:col-span-2 xl:col-span-3">
                  {zh ? "你还没有已保存写真。先在上面选一个模板，生成第一张成片。" : "You do not have saved portraits yet. Pick a template above and create your first finished shot."}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap gap-3">
                {CATEGORY_FILTERS
                  .filter((filter) => (activeTab === "free" ? filter.id !== "pet-owner" : filter.id === "all" || filter.id === "pet-owner"))
                  .map((filter) => (
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
        </div>
      </section>
    </div>
  );
}
