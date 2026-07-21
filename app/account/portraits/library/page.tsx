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

export default function AccountPortraitLibraryPage() {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const { loading: authLoading } = useRequireAuth();
  const [portraits, setPortraits] = useState<PetPortraitRecord[]>([]);
  const [loadingPortraits, setLoadingPortraits] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<PortraitDeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteNotice, setDeleteNotice] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="relative overflow-hidden rounded-[2.2rem] bg-[#171514] px-8 py-10 text-white shadow-[0_28px_80px_rgba(52,34,20,.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,122,26,.25),transparent_28%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">{zh ? "全部写真" : "Portrait library"}</div>
            <h1 className="mt-3 text-5xl font-black tracking-[-.06em]">{zh ? "全部图片" : "All images"}</h1>
            <p className="mt-4 text-sm leading-7 text-white/72">
              {zh ? "按头像、竖屏与横屏分类查看全部写真。你可以集中浏览、打开原图，并删除不再需要的单张写真。" : "Browse every saved portrait by avatar, vertical, and landscape categories. Open originals or remove individual images you no longer need."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/account/portraits" className="rounded-full border border-white/14 bg-white/8 px-5 py-3 text-sm font-black text-white transition hover:bg-white/14">
              {zh ? "返回写真工作台" : "Back to studio"}
            </Link>
            <div className="rounded-full bg-[#ff7a1a] px-5 py-3 text-sm font-black text-white shadow-[0_16px_30px_rgba(255,122,26,.28)]">
              {zh ? `${portraits.length} 张图片` : `${portraits.length} images`}
            </div>
          </div>
        </div>
      </section>

      {deleteNotice ? <p className="mt-6 rounded-2xl bg-[#edf9f1] px-4 py-3 text-sm font-bold text-[#247347]">{deleteNotice}</p> : null}

      {portraits.length === 0 ? (
        <section className="mt-8 rounded-[2rem] border border-dashed border-[#e5d2bf] bg-[#fff9f2] p-12 text-center">
          <h2 className="text-3xl font-black text-[#171514]">{zh ? "还没有保存的写真" : "No saved portraits yet"}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#7a6d63]">
            {zh ? "打开一份报告后，系统会自动生成头像、竖屏与横屏三张写真，并在这里分类保存。" : "Open a report and the system will automatically generate avatar, vertical, and landscape portraits for this gallery."}
          </p>
          <Link href="/account/portraits" className="mt-6 inline-flex rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white">
            {zh ? "返回写真工作台" : "Back to studio"}
          </Link>
        </section>
      ) : (
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
      )}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#171514]/45 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-portrait-title">
          <div className="w-full max-w-md rounded-[1.75rem] border border-[#eaded2] bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,.24)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#b5482e]">{zh ? "永久删除" : "Permanent deletion"}</div>
            <h2 id="delete-portrait-title" className="mt-3 text-2xl font-black tracking-[-.04em] text-[#171514]">
              {zh ? `删除 ${deleteTarget.petName} 的这张写真？` : `Delete this portrait for ${deleteTarget.petName}?`}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#655a51]">
              {zh ? `这会永久删除 ${deleteTarget.styleName}，并尝试一并清理存储中的图片文件。此操作无法撤销。` : `This permanently removes the ${deleteTarget.styleName} image and attempts to clean up its stored file as well. This cannot be undone.`}
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
