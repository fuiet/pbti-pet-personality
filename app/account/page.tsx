"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { localizePersonality } from "@/data/personalityLocalization";
import { getPersonalityAsset } from "@/data/personalityAssets";
import { listCurrentUserPortraits, listCurrentUserResults, type PetPortraitRecord, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useLanguage } from "@/components/LanguageProvider";

type DeleteTarget =
  | { kind: "report"; recordId: string; petId: string; petName: string }
  | { kind: "pet"; petId: string; petName: string };

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh-CN" ? "zh-CN" : "en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function speciesLabel(species: string | undefined, zh: boolean) {
  return species === "dog" ? (zh ? "狗狗" : "Dog") : (zh ? "猫咪" : "Cat");
}

export default function AccountPage() {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const { user, loading: authLoading } = useRequireAuth();
  const [records, setRecords] = useState<ResultRecord[]>([]);
  const [portraits, setPortraits] = useState<PetPortraitRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteNotice, setDeleteNotice] = useState("");

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    Promise.all([listCurrentUserResults(), listCurrentUserPortraits()])
      .then(([results, savedPortraits]) => {
        if (active) {
          setRecords(results);
          setPortraits(savedPortraits);
        }
      })
      .catch(() => {
        if (active) {
          setRecords([]);
          setPortraits([]);
        }
      })
      .finally(() => {
        if (active) setLoadingRecords(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading]);

  const petCount = useMemo(() => new Set(records.map((record) => record.pet?.id).filter(Boolean)).size, [records]);
  const latestRecord = records[0];

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    setDeleteError("");
    setDeleteNotice("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteTarget.kind === "report"
          ? { action: "report", recordId: deleteTarget.recordId }
          : { action: "pet", petId: deleteTarget.petId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || (zh ? "暂时无法删除，请稍后重试。" : "Unable to delete this item."));

      if (deleteTarget.kind === "report") {
        setRecords((current) => current.filter((record) => record.id !== deleteTarget.recordId));
        setDeleteNotice(zh ? `已删除 ${deleteTarget.petName} 的报告。` : `${deleteTarget.petName}'s report was deleted.`);
      } else {
        setRecords((current) => current.filter((record) => record.pet?.id !== deleteTarget.petId));
        setPortraits((current) => current.filter((portrait) => portrait.pet_id !== deleteTarget.petId));
        setDeleteNotice(data.storageWarning || (zh ? `已删除 ${deleteTarget.petName} 的档案及相关记录。` : `${deleteTarget.petName}'s profile and related records were deleted.`));
      }

      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : (zh ? "暂时无法删除，请稍后重试。" : "Unable to delete this item."));
    } finally {
      setDeleting(false);
    }
  }

  if (authLoading || loadingRecords) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">{zh ? "正在加载…" : "Loading..."}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[2rem] border border-[#eaded2] bg-white/82 p-8 shadow-[0_24px_70px_rgba(52,34,20,.07)]">
          <div className="text-sm font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "用户中心" : "Account center"}</div>
          <h1 className="mt-4 text-5xl font-black leading-[.95] tracking-[-.06em] text-[#171514]">
            {zh ? "你的爱宠个性档案库" : "Your pet personality library"}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#655a51]">
            {zh ? "在这里管理爱宠档案、查看性格报告，并保存专属写真海报。" : "Review your saved pets, open personality reports, and collect portrait poster assets from one place."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/create" className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(255,122,26,.28)] transition hover:-translate-y-0.5">
              {zh ? "添加爱宠" : "Add a new pet"}
            </Link>
            {latestRecord ? (
              <Link href={`/report/${latestRecord.pbti_id}/preparing`} className="rounded-full border border-[#eaded2] bg-white px-6 py-3 text-sm font-black text-[#171514] transition hover:bg-[#fff7ed]">
                {zh ? "打开最新报告" : "Open latest report"}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <article className="rounded-[1.6rem] border border-[#eaded2] bg-white p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "当前账号" : "Signed in as"}</div>
            <div className="mt-3 truncate text-xl font-black text-[#171514]">{user?.email}</div>
          </article>
          <article className="rounded-[1.6rem] border border-[#eaded2] bg-white p-6 shadow-sm">
            <div className="text-4xl font-black tracking-[-.05em] text-[#ff7a1a]">{petCount}</div>
            <div className="mt-1 text-sm font-black text-[#171514]">{zh ? "爱宠档案" : "Saved pets"}</div>
          </article>
          <article className="rounded-[1.6rem] border border-[#eaded2] bg-white p-6 shadow-sm">
            <div className="text-4xl font-black tracking-[-.05em] text-[#ff7a1a]">{records.length}</div>
            <div className="mt-1 text-sm font-black text-[#171514]">{zh ? "性格报告" : "Personality reports"}</div>
          </article>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[2rem] border border-[#eaded2] bg-white/78 p-6 shadow-[0_20px_60px_rgba(52,34,20,.06)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-[-.04em] text-[#171514]">{zh ? "爱宠与报告" : "Pets and reports"}</h2>
              <p className="mt-1 text-sm text-[#7a6d63]">{zh ? "以下内容仅属于当前登录账号。" : "Each record belongs to the current Supabase account."}</p>
            </div>
            <Link href="/dashboard" className="hidden text-sm font-black text-[#ff7a1a] sm:block">
              {zh ? "概览" : "Dashboard"}
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {deleteNotice ? <p className="rounded-2xl bg-[#edf9f1] px-4 py-3 text-sm font-bold text-[#247347]">{deleteNotice}</p> : null}
            {records.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[#e5d2bf] bg-[#fff9f2] p-10 text-center">
                <h3 className="text-2xl font-black text-[#171514]">{zh ? "还没有保存的报告" : "No saved reports yet"}</h3>
                <p className="mt-2 text-sm leading-6 text-[#7a6d63]">{zh ? "先创建爱宠档案并完成行为测试，第一份报告就会出现在这里。" : "Create your first pet profile and finish the behavior quiz to build this library."}</p>
                <Link href="/create" className="mt-6 inline-flex rounded-full bg-[#ff7a1a] px-7 py-3 text-sm font-black text-white">
                  {zh ? "开始测试" : "Start the test"}
                </Link>
              </div>
            ) : (
              records.map((record) => {
                const personality = personalities[record.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];
                const displayPersonality = localizePersonality(personality, language);
                const pet = record.pet;
                const fallbackArtwork = getPersonalityAsset(personality.code, pet?.species === "dog" ? "dog" : "cat");
                const uploadedPhoto = pet?.photo_urls?.[0] || pet?.photo_url || "";

                return (
                  <article key={record.id} className="rounded-[1.5rem] border border-[#eaded2] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(52,34,20,.08)]">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#fff0e4]">
                        <img
                          src={uploadedPhoto || fallbackArtwork}
                          alt={uploadedPhoto ? `${pet?.name || "Pet"}'s uploaded photo` : displayPersonality.name + " personality artwork"}
                          className={`h-full w-full ${uploadedPhoto ? "object-cover" : "object-contain p-1"}`}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = fallbackArtwork;
                            event.currentTarget.className = "h-full w-full object-contain p-1";
                          }}
                        />
                        <span className="absolute bottom-1 left-1 rounded-full bg-white/88 px-1.5 py-0.5 text-[9px] font-black text-[#d96612]">
                          {speciesLabel(pet?.species, zh)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-[#171514]">{pet?.name || (zh ? "未命名爱宠" : "Unnamed pet")}</h3>
                          <span className="rounded-full bg-[#fff0e4] px-3 py-1 text-xs font-black text-[#d96612]">{personality.code} / {displayPersonality.name}</span>
                        </div>
                        <p className="mt-1 text-sm text-[#7a6d63]">
                          {speciesLabel(pet?.species, zh)}
                          {pet?.breed ? ` - ${pet.breed}` : ""}
                          {pet?.age ? ` - ${pet.age}` : ""}
                          {" - "}
                          {formatDate(record.created_at, language)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/report/${record.pbti_id}/preparing`} className="rounded-full bg-[#ff7a1a] px-5 py-2.5 text-xs font-black text-white">
                          {zh ? "报告" : "Report"}
                        </Link>
                        <Link href={`/memory/${record.pbti_id}`} className="rounded-full border border-[#eaded2] px-5 py-2.5 text-xs font-black text-[#4f463f]">
                          {zh ? "回忆" : "Memory"}
                        </Link>
                        <button type="button" onClick={() => { setDeleteError(""); setDeleteTarget({ kind: "report", recordId: record.id, petId: pet?.id || "", petName: pet?.name || "This pet" }); }} className="rounded-full border border-[#e7b7aa] px-4 py-2.5 text-xs font-black text-[#b5482e] transition hover:bg-[#fff1ec]">
                          {zh ? "删除报告" : "Delete report"}
                        </button>
                        {pet?.id ? <button type="button" onClick={() => { setDeleteError(""); setDeleteTarget({ kind: "pet", petId: pet.id, petName: pet.name || "This pet" }); }} className="rounded-full bg-[#7d2d1e] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#692416]">
                          {zh ? "删除爱宠" : "Delete pet"}
                        </button> : null}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-[#eaded2] bg-[#171514] p-6 text-white shadow-[0_22px_65px_rgba(52,34,20,.12)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#ffb878]">{zh ? "写真海报" : "Portrait posters"}</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">{zh ? "我的写真" : "Poster assets"}</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">
              {zh ? "生成的写真会保存在这里，方便你随时查看、下载和分享。" : "Generated portrait posters will appear here so users can revisit, download, and share them."}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {portraits.slice(0, 6).map((portrait) => (
                <a key={portrait.id} href={portrait.image_url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-white/10 bg-white/8 transition hover:bg-white/12">
                  <img src={portrait.image_url} alt={`${portrait.style_name} portrait`} className="aspect-[4/5] w-full object-cover transition group-hover:scale-[1.02]" />
                  <div className="p-3">
                    <div className="text-sm font-black text-white">{portrait.pet?.name || (zh ? "已保存的爱宠" : "Saved pet")}</div>
                    <div className="mt-1 text-xs font-bold text-white/58">{portrait.pet?.species === "dog" ? (zh ? "狗狗" : "Dog") : (zh ? "猫咪" : "Cat")} · {portrait.style_name}</div>
                  </div>
                </a>
              ))}
              {portraits.length === 0 ? <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-white/64 sm:col-span-3 lg:col-span-2">{zh ? "还没有写真。打开一份报告后，系统会自动生成三张专属写真。" : "No generated portraits yet. Open a report to create your first three."}</div> : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-.04em] text-[#171514]">{zh ? "接下来" : "Next actions"}</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/create" className="rounded-2xl bg-[#fff0e4] px-5 py-4 text-sm font-black text-[#d96612]">
                {zh ? "创建新的爱宠档案" : "Create another pet profile"}
              </Link>
              <Link href="/types" className="rounded-2xl bg-[#f7f0e8] px-5 py-4 text-sm font-black text-[#4f463f]">
                {zh ? "探索 12 种性格类型" : "Explore 12 personality types"}
              </Link>
            </div>
          </section>
        </aside>
      </section>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#171514]/45 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="w-full max-w-md rounded-[1.75rem] border border-[#eaded2] bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,.24)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#b5482e]">{zh ? "永久删除" : "Permanent deletion"}</div>
            <h2 id="delete-dialog-title" className="mt-3 text-2xl font-black tracking-[-.04em] text-[#171514]">
              {zh ? (deleteTarget.kind === "pet" ? `删除 ${deleteTarget.petName} 的档案？` : `删除 ${deleteTarget.petName} 的报告？`) : (deleteTarget.kind === "pet" ? `Delete ${deleteTarget.petName}'s profile?` : `Delete ${deleteTarget.petName}'s report?`)}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#655a51]">
              {deleteTarget.kind === "pet"
                ? (zh ? "该操作会永久删除爱宠档案、所有相关性格报告、爱宠鉴定与已保存写真，且无法撤销。" : "This permanently removes the pet profile, every related personality report, visual identification, and saved portrait record. Stored portrait files will also be removed when available. This cannot be undone.")
                : (zh ? "该操作只会永久删除这份性格报告，爱宠档案和其他报告仍会保留。此操作无法撤销。" : "This permanently removes only this personality report. The pet profile and its other reports will remain. This cannot be undone.")}
            </p>
            {deleteError ? <p className="mt-4 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-bold text-[#b5482e]">{deleteError}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={deleting} onClick={() => { setDeleteTarget(null); setDeleteError(""); }} className="rounded-full border border-[#eaded2] px-5 py-3 text-sm font-black text-[#4f463f] disabled:opacity-50">
                {zh ? "取消" : "Cancel"}
              </button>
              <button type="button" disabled={deleting} onClick={confirmDelete} className="rounded-full bg-[#7d2d1e] px-5 py-3 text-sm font-black text-white transition hover:bg-[#692416] disabled:cursor-wait disabled:opacity-60">
                {deleting ? (zh ? "正在删除…" : "Deleting...") : deleteTarget.kind === "pet" ? (zh ? "删除爱宠及相关记录" : "Delete pet and records") : (zh ? "删除报告" : "Delete report")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

