"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { listCurrentUserPortraits, type PetPortraitRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

type PortraitDeleteTarget = {
  id: string;
  petName: string;
  styleName: string;
};

type PortraitGroup = {
  key: "avatar" | "vertical" | "landscape";
  title: string;
  subtitle: string;
  portraits: PetPortraitRecord[];
};

type StudioOrientation = "avatar" | "vertical" | "landscape";

const STUDIO_OPTIONS = {
  background: {
    en: ["Soft studio", "Nature outdoors", "Modern editorial", "Festive scene"],
    zh: ["柔光影棚", "自然户外", "时尚棚拍", "节日场景"],
  },
  styling: {
    en: ["No outfit", "Light accessory", "Statement outfit", "Formal look"],
    zh: ["不穿服饰", "轻配饰", "造型服饰", "正式造型"],
  },
  pose: {
    en: ["Face camera", "Side profile", "Sitting calmly", "Playful motion"],
    zh: ["看向镜头", "侧脸姿态", "安静坐姿", "动态互动"],
  },
} as const;

function classifyPortrait(portrait: PetPortraitRecord) {
  const baseStyleId = portrait.style_id.split("--")[0];
  if (baseStyleId === "white-sketch-avatar") return "avatar" as const;
  if (baseStyleId === "landscape-campaign") return "landscape" as const;
  return "vertical" as const;
}

function aspectClass(kind: PortraitGroup["key"]) {
  if (kind === "avatar") return "aspect-square";
  if (kind === "landscape") return "aspect-[16/10]";
  return "aspect-[4/5]";
}

function groupTitle(kind: PortraitGroup["key"], zh: boolean) {
  if (kind === "avatar") return zh ? "头像写真" : "Avatar portraits";
  if (kind === "landscape") return zh ? "横屏写真" : "Landscape portraits";
  return zh ? "竖屏写真" : "Vertical portraits";
}

function groupSubtitle(kind: PortraitGroup["key"], zh: boolean) {
  if (kind === "avatar") return zh ? "适合头像、封面与分享卡使用。" : "Best for covers, avatars, and share cards.";
  if (kind === "landscape") return zh ? "更适合场景化海报与横向展示。" : "Better suited to wide posters and horizontal layouts.";
  return zh ? "主视觉写真，适合海报展示。" : "Primary poster portraits for the main visual showcase.";
}

export default function AccountPortraitsPage() {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const { loading: authLoading } = useRequireAuth();
  const [portraits, setPortraits] = useState<PetPortraitRecord[]>([]);
  const [loadingPortraits, setLoadingPortraits] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<PortraitDeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteNotice, setDeleteNotice] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [orientation, setOrientation] = useState<StudioOrientation>("vertical");
  const [backgroundChoice, setBackgroundChoice] = useState(0);
  const [stylingChoice, setStylingChoice] = useState(1);
  const [poseChoice, setPoseChoice] = useState(0);
  const [promptText, setPromptText] = useState("");

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    listCurrentUserPortraits()
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

  const groupedPortraits = useMemo<PortraitGroup[]>(() => {
    const avatar = portraits.filter((portrait) => classifyPortrait(portrait) === "avatar");
    const vertical = portraits.filter((portrait) => classifyPortrait(portrait) === "vertical");
    const landscape = portraits.filter((portrait) => classifyPortrait(portrait) === "landscape");

    return [
      { key: "avatar", title: groupTitle("avatar", zh), subtitle: groupSubtitle("avatar", zh), portraits: avatar },
      { key: "vertical", title: groupTitle("vertical", zh), subtitle: groupSubtitle("vertical", zh), portraits: vertical },
      { key: "landscape", title: groupTitle("landscape", zh), subtitle: groupSubtitle("landscape", zh), portraits: landscape },
    ];
  }, [portraits, zh]);

  const generatedPrompt = useMemo(() => {
    const background = (zh ? STUDIO_OPTIONS.background.zh : STUDIO_OPTIONS.background.en)[backgroundChoice];
    const styling = (zh ? STUDIO_OPTIONS.styling.zh : STUDIO_OPTIONS.styling.en)[stylingChoice];
    const pose = (zh ? STUDIO_OPTIONS.pose.zh : STUDIO_OPTIONS.pose.en)[poseChoice];
    const orientationText = zh
      ? orientation === "avatar"
        ? "头像写真"
        : orientation === "vertical"
          ? "竖屏写真"
          : "横屏写真"
      : orientation === "avatar"
        ? "avatar portrait"
        : orientation === "vertical"
          ? "vertical portrait"
          : "landscape portrait";
    const custom = promptText.trim();

    return zh
      ? `生成一张${orientationText}，背景为${background}，服饰设定为${styling}，动作为${pose}。优先保留宠物真实身份，同时强化眼神交流感、面部神态与整体生命力，避免发呆、空洞或僵硬表情。${custom ? ` 用户补充：${custom}` : ""}`
      : `Create one ${orientationText} with a ${background} background, ${styling} styling, and a ${pose} pose. Preserve the pet's real identity while improving eye contact, facial engagement, and overall liveliness so the result never feels blank, vacant, or stiff.${custom ? ` User direction: ${custom}` : ""}`;
  }, [backgroundChoice, orientation, poseChoice, promptText, stylingChoice, zh]);

  const featuredPortraits = useMemo(() => portraits.slice(0, 3), [portraits]);

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    setDeleteError("");
    setDeleteNotice("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portrait", portraitId: deleteTarget.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || (zh ? "暂时无法删除这张写真，请稍后重试。" : "Unable to delete this portrait."));

      setPortraits((current) => current.filter((portrait) => portrait.id !== deleteTarget.id));
      setDeleteNotice(
        data?.storageWarning ||
          (zh ? `${deleteTarget.petName} 的 ${deleteTarget.styleName} 已删除。` : `${deleteTarget.petName}'s ${deleteTarget.styleName} was deleted.`),
      );
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : (zh ? "暂时无法删除这张写真，请稍后重试。" : "Unable to delete this portrait."));
    } finally {
      setDeleting(false);
    }
  }

  if (authLoading || loadingPortraits) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">{zh ? "正在加载…" : "Loading..."}</div>;
  }

  if (portraits.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="relative overflow-hidden rounded-[2.4rem] bg-[#171514] px-8 py-10 text-white shadow-[0_28px_80px_rgba(52,34,20,.18)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_14%,rgba(255,122,26,.28),transparent_26%)]" />
          <div className="relative z-10">
            <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">{zh ? "写真工作台" : "AI Portrait Studio"}</div>
            <h1 className="mt-3 text-5xl font-black tracking-[-.06em]">{zh ? "AI Portrait Studio" : "AI Portrait Studio"}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              {zh
                ? "这里会同时承载自主写真生成与全部图片管理。当前账户下还没有已保存写真，先打开一份报告生成首批作品。"
                : "This studio is where self-serve generation and image management come together. There are no saved portraits yet, so open a report to create your first set."}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-dashed border-[#e5d2bf] bg-[#fff9f2] p-12 text-center">
          <h2 className="text-3xl font-black text-[#171514]">{zh ? "还没有保存的写真" : "No saved portraits yet"}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#7a6d63]">
            {zh
              ? "打开一份报告后，系统会自动生成头像、竖屏与横屏三张写真，并在这里统一管理。"
              : "Open a report and the system will automatically generate avatar, vertical, and landscape portraits for this library."}
          </p>
          <Link href="/account" className="mt-6 inline-flex rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white">
            {zh ? "返回报告中心" : "Back to report center"}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="relative overflow-hidden rounded-[2.4rem] bg-[#171514] text-white shadow-[0_28px_80px_rgba(52,34,20,.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_14%,rgba(255,122,26,.28),transparent_26%),linear-gradient(135deg,rgba(255,255,255,.04),transparent_40%)]" />
        <div className="relative z-10 grid gap-8 px-8 py-8 lg:grid-cols-[1.25fr_.95fr] lg:px-10 lg:py-10">
          <div>
            <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">{zh ? "写真工作台" : "AI Portrait Studio"}</div>
            <h1 className="mt-3 text-4xl font-black tracking-[-.06em] text-white sm:text-5xl">AI Portrait Studio</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              {zh
                ? "把全部写真图库和自主创作入口放在同一个工作台里。先规划画面方向、背景、服饰与动作，再继续生成；也可以直接按头像、竖屏、横屏查看所有已保存作品。"
                : "Bring your full portrait gallery and your next-generation workflow into one studio. Shape the image direction, background, styling, and pose first, then browse every saved image by format."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-white/84">
                {zh ? `${portraits.length} 张图片` : `${portraits.length} images`}
              </div>
              <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-white/70">
                {zh
                  ? `${groupedPortraits[0]?.portraits.length || 0} 张头像 / ${groupedPortraits[1]?.portraits.length || 0} 张竖屏 / ${groupedPortraits[2]?.portraits.length || 0} 张横屏`
                  : `${groupedPortraits[0]?.portraits.length || 0} avatars / ${groupedPortraits[1]?.portraits.length || 0} vertical / ${groupedPortraits[2]?.portraits.length || 0} landscape`}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <div className="text-xs font-black uppercase tracking-[.15em] text-[#ffb878]">{zh ? "创作路径" : "Studio flow"}</div>
              <div className="mt-3 space-y-3 text-sm text-white/72">
                <p>{zh ? "1. 上传 3 张参考图，锁定宠物真实身份" : "1. Upload 3 references to lock the pet identity."}</p>
                <p>{zh ? "2. 选择头像、竖屏或横屏画幅" : "2. Choose avatar, vertical, or landscape framing."}</p>
                <p>{zh ? "3. 设定背景、服饰、动作与自定义想法" : "3. Shape the background, styling, pose, and custom direction."}</p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur md:col-span-2 lg:col-span-1">
              <div className="text-xs font-black uppercase tracking-[.15em] text-[#ffb878]">{zh ? "当前方向" : "Current direction"}</div>
              <p className="mt-3 text-2xl font-black tracking-[-.04em]">
                {orientation === "avatar" ? (zh ? "头像写真" : "Avatar portrait") : orientation === "vertical" ? (zh ? "竖屏写真" : "Vertical portrait") : (zh ? "横屏写真" : "Landscape portrait")}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                {zh
                  ? "这一版先完成工作台设计与提示词组织，后续可以直接把这里接成真正的一键生成入口。"
                  : "This redesign establishes the studio workflow and prompt structure, ready to be wired into a one-image generation action next."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {deleteNotice ? <p className="mt-6 rounded-2xl bg-[#edf9f1] px-4 py-3 text-sm font-bold text-[#247347]">{deleteNotice}</p> : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-[2rem] border border-[#eaded2] bg-[linear-gradient(180deg,#fffdf9_0%,#fff7ee_100%)] p-6 shadow-[0_18px_50px_rgba(52,34,20,.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "写真工作台" : "AI Portrait Studio"}</div>
              <h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#171514]">{zh ? "定制下一张写真" : "Design your next portrait"}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7a6d63]">
                {zh
                  ? "固定一次只生成一张，不满意就调整提示词重新生成。这一版先把画面配置、提示词优化预览和图库合并到一起。"
                  : "Generate one image at a time, then refine the prompt if it is not right yet. This version unifies visual controls, prompt preview, and gallery browsing in one place."}
              </p>
            </div>
            <Link href="/account" className="inline-flex rounded-full border border-[#eaded2] bg-white px-5 py-3 text-sm font-black text-[#4f463f] transition hover:border-[#ff7a1a] hover:text-[#ff7a1a]">
              {zh ? "返回用户中心" : "Back to account"}
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div>
                <div className="text-sm font-black text-[#171514]">{zh ? "画幅类型" : "Orientation"}</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {(["avatar", "vertical", "landscape"] as StudioOrientation[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setOrientation(value)}
                      className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${orientation === value ? "border-[#ff7a1a] bg-[#fff0e4] shadow-[0_12px_24px_rgba(255,122,26,.12)]" : "border-[#eaded2] bg-white hover:border-[#ffcfab]"}`}
                    >
                      <div className="text-sm font-black text-[#171514]">
                        {value === "avatar" ? (zh ? "头像" : "Avatar") : value === "vertical" ? (zh ? "竖屏" : "Vertical") : (zh ? "横屏" : "Landscape")}
                      </div>
                      <div className="mt-1 text-xs leading-6 text-[#8b7c71]">
                        {value === "avatar"
                          ? (zh ? "适合头像、封面、社媒缩略图" : "Best for avatar, cover, and social thumbnail use.")
                          : value === "vertical"
                            ? (zh ? "适合海报主视觉与人物化呈现" : "Best for hero posters and editorial framing.")
                            : (zh ? "适合场景化和宽幅叙事画面" : "Best for environmental storytelling and wide scenes.")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                {(["background", "styling", "pose"] as const).map((field) => {
                  const values = zh ? STUDIO_OPTIONS[field].zh : STUDIO_OPTIONS[field].en;
                  const selected = field === "background" ? backgroundChoice : field === "styling" ? stylingChoice : poseChoice;
                  const onSelect = field === "background" ? setBackgroundChoice : field === "styling" ? setStylingChoice : setPoseChoice;

                  return (
                    <div key={field} className="rounded-[1.5rem] border border-[#eaded2] bg-white p-4">
                      <div className="text-xs font-black uppercase tracking-[.14em] text-[#d96612]">
                        {field === "background" ? (zh ? "背景" : "Background") : field === "styling" ? (zh ? "服饰" : "Styling") : (zh ? "动作" : "Pose")}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {values.map((value, index) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => onSelect(index)}
                            className={`rounded-full px-3 py-2 text-xs font-black transition ${selected === index ? "bg-[#171514] text-white" : "bg-[#f8efe5] text-[#5f5248] hover:bg-[#f2e5d7]"}`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[1.5rem] border border-[#eaded2] bg-white p-4">
                <label htmlFor="portrait-prompt" className="text-sm font-black text-[#171514]">
                  {zh ? "补充你的创意想法" : "Add your creative direction"}
                </label>
                <textarea
                  id="portrait-prompt"
                  value={promptText}
                  onChange={(event) => setPromptText(event.target.value)}
                  placeholder={zh ? "例如：法式杂志感、微风草地、佩戴针织围巾、眼神更有互动感" : "For example: French editorial mood, breezy meadow, knitted scarf, stronger eye contact"}
                  className="mt-3 min-h-[120px] w-full rounded-[1.25rem] border border-[#eaded2] bg-[#fffaf5] px-4 py-3 text-sm text-[#33251d] outline-none transition placeholder:text-[#a39489] focus:border-[#ff7a1a]"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[1.6rem] bg-[#171514] p-5 text-white shadow-[0_20px_40px_rgba(23,21,20,.18)]">
                <div className="text-xs font-black uppercase tracking-[.15em] text-[#ffb878]">{zh ? "AI 优化后的提示词预览" : "AI-optimized prompt preview"}</div>
                <p className="mt-4 text-sm leading-7 text-white/78">{generatedPrompt}</p>
              </div>

              <div className="rounded-[1.6rem] border border-[#eaded2] bg-white p-5">
                <div className="text-xs font-black uppercase tracking-[.15em] text-[#d96612]">{zh ? "参考图要求" : "Reference image guidance"}</div>
                <div className="mt-3 space-y-3 text-sm leading-7 text-[#6a5e55]">
                  <p>{zh ? "建议上传 3 张不同角度的清晰照片，至少包含一张正脸与一张自然互动状态。" : "Use 3 clear reference photos from different angles, including one front-facing and one naturally engaged moment."}</p>
                  <p>{zh ? "如果原图表情偏平，系统会主动增强眼神交流感、口鼻部神态和整体生命力，避免成片发呆。" : "If the source expression is flat, the system should actively enhance eye contact, muzzle expression, and overall liveliness so the result never feels blank."}</p>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-dashed border-[#e7cdb8] bg-[#fff6ed] p-5">
                <div className="text-sm font-black text-[#171514]">{zh ? "下一步可直接接入真实生成" : "Ready for real generation wiring"}</div>
                <p className="mt-2 text-sm leading-7 text-[#7a6d63]">
                  {zh ? "后续把上传组件、提示词优化接口和单张生成按钮接到这里，就能形成完整的自主写真工作流。" : "The next step is to connect uploads, prompt refinement, and a single-image generation action here for a complete self-serve studio flow."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-[0_18px_50px_rgba(52,34,20,.06)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "全部图片库" : "Portrait library"}</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#171514]">{zh ? `${portraits.length} 张图片` : `${portraits.length} images`}</h2>
            <p className="mt-2 text-sm leading-7 text-[#7a6d63]">
              {zh ? "下面按头像、竖屏、横屏分组管理作品。可以打开原图，也可以删除单张写真。" : "Manage saved work below by avatar, vertical, and landscape groups. Open originals or remove one image at a time."}
            </p>
          </section>

          <section className="rounded-[2rem] border border-[#eaded2] bg-[#fffaf5] p-6 shadow-[0_18px_50px_rgba(52,34,20,.04)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "近期作品" : "Recent work"}</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {featuredPortraits.map((portrait) => (
                <a key={portrait.id} href={portrait.image_url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-[1.4rem] border border-[#eaded2] bg-white">
                  <img src={portrait.image_url} alt={`${portrait.style_name} portrait`} className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]" />
                  <div className="p-3">
                    <div className="text-sm font-black text-[#171514]">{portrait.pet?.name || (zh ? "已保存爱宠" : "Saved pet")}</div>
                    <div className="mt-1 text-xs font-bold text-[#8c7d72]">{portrait.style_name}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-8 space-y-8">
        {groupedPortraits.map((group) => (
          <section key={group.key} className="rounded-[2rem] border border-[#eaded2] bg-white/82 p-6 shadow-[0_18px_50px_rgba(52,34,20,.06)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{group.title}</div>
                <h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#171514]">{group.portraits.length}</h2>
                <p className="mt-1 text-sm text-[#7a6d63]">{group.subtitle}</p>
              </div>
            </div>

            {group.portraits.length === 0 ? (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#eaded2] bg-[#fffaf5] px-5 py-8 text-sm font-bold text-[#8f8175]">
                {zh ? "这个分类里暂时还没有图片。" : "There are no images in this category yet."}
              </div>
            ) : (
              <div className={`mt-5 grid gap-4 ${group.key === "landscape" ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
                {group.portraits.map((portrait) => (
                  <article key={portrait.id} className="overflow-hidden rounded-[1.6rem] border border-[#eaded2] bg-[#fffdf9] shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(52,34,20,.08)]">
                    <div className={`overflow-hidden bg-[#f4ece4] ${aspectClass(group.key)}`}>
                      <img src={portrait.image_url} alt={`${portrait.style_name} portrait`} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-black text-[#171514]">{portrait.pet?.name || (zh ? "已保存爱宠" : "Saved pet")}</h3>
                          <p className="mt-1 text-xs font-bold text-[#8c7d72]">{portrait.pet?.species === "dog" ? "Dog" : "Cat"} · {portrait.style_name}</p>
                        </div>
                        <span className="rounded-full bg-[#fff0e4] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#d96612]">
                          {group.key === "avatar" ? "Avatar" : group.key === "vertical" ? "Vertical" : "Landscape"}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a href={portrait.image_url} target="_blank" rel="noreferrer" className="rounded-full bg-[#ff7a1a] px-4 py-2 text-xs font-black text-white transition hover:bg-[#ee6b10]">
                          {zh ? "打开原图" : "Open image"}
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget({
                              id: portrait.id,
                              petName: portrait.pet?.name || (zh ? "这只爱宠" : "This pet"),
                              styleName: portrait.style_name,
                            });
                          }}
                          className="rounded-full border border-[#e7b7aa] px-4 py-2 text-xs font-black text-[#b5482e] transition hover:bg-[#fff1ec]"
                        >
                          {zh ? "删除写真" : "Delete image"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#171514]/45 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-portrait-title">
          <div className="w-full max-w-md rounded-[1.75rem] border border-[#eaded2] bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,.24)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#b5482e]">{zh ? "永久删除" : "Permanent deletion"}</div>
            <h2 id="delete-portrait-title" className="mt-3 text-2xl font-black tracking-[-.04em] text-[#171514]">
              {zh ? `删除 ${deleteTarget.petName} 的这张写真？` : `Delete this portrait for ${deleteTarget.petName}?`}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#655a51]">
              {zh
                ? `这会永久删除 ${deleteTarget.styleName}，并尝试一并清理存储中的图片文件。此操作无法撤销。`
                : `This permanently removes the ${deleteTarget.styleName} image and attempts to clean up its stored file as well. This cannot be undone.`}
            </p>
            {deleteError ? <p className="mt-4 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-bold text-[#b5482e]">{deleteError}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={deleting} onClick={() => { setDeleteTarget(null); setDeleteError(""); }} className="rounded-full border border-[#eaded2] px-5 py-3 text-sm font-black text-[#4f463f] disabled:opacity-50">
                {zh ? "取消" : "Cancel"}
              </button>
              <button type="button" disabled={deleting} onClick={confirmDelete} className="rounded-full bg-[#7d2d1e] px-5 py-3 text-sm font-black text-white transition hover:bg-[#692416] disabled:cursor-wait disabled:opacity-60">
                {deleting ? (zh ? "正在删除…" : "Deleting...") : (zh ? "删除写真" : "Delete image")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
