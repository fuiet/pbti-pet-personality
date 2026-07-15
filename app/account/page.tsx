"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { listCurrentUserResults, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function speciesLabel(species?: string) {
  return species === "dog" ? "Dog" : "Cat";
}

export default function AccountPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [records, setRecords] = useState<ResultRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    listCurrentUserResults()
      .then((results) => {
        if (active) setRecords(results);
      })
      .catch(() => {
        if (active) setRecords([]);
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

  if (authLoading || loadingRecords) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[2rem] border border-[#eaded2] bg-white/82 p-8 shadow-[0_24px_70px_rgba(52,34,20,.07)]">
          <div className="text-sm font-black uppercase tracking-[.16em] text-[#d96612]">Account center</div>
          <h1 className="mt-4 text-5xl font-black leading-[.95] tracking-[-.06em] text-[#171514]">
            Your pet personality library
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#655a51]">
            Review your saved pets, open personality reports, and collect portrait poster assets from one place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/create" className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(255,122,26,.28)] transition hover:-translate-y-0.5">
              Add a new pet
            </Link>
            {latestRecord ? (
              <Link href={`/report/${latestRecord.pbti_id}`} className="rounded-full border border-[#eaded2] bg-white px-6 py-3 text-sm font-black text-[#171514] transition hover:bg-[#fff7ed]">
                Open latest report
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <article className="rounded-[1.6rem] border border-[#eaded2] bg-white p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">Signed in as</div>
            <div className="mt-3 truncate text-xl font-black text-[#171514]">{user?.email}</div>
          </article>
          <article className="rounded-[1.6rem] border border-[#eaded2] bg-white p-6 shadow-sm">
            <div className="text-4xl font-black tracking-[-.05em] text-[#ff7a1a]">{petCount}</div>
            <div className="mt-1 text-sm font-black text-[#171514]">Saved pets</div>
          </article>
          <article className="rounded-[1.6rem] border border-[#eaded2] bg-white p-6 shadow-sm">
            <div className="text-4xl font-black tracking-[-.05em] text-[#ff7a1a]">{records.length}</div>
            <div className="mt-1 text-sm font-black text-[#171514]">Personality reports</div>
          </article>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[2rem] border border-[#eaded2] bg-white/78 p-6 shadow-[0_20px_60px_rgba(52,34,20,.06)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-[-.04em] text-[#171514]">Pets and reports</h2>
              <p className="mt-1 text-sm text-[#7a6d63]">Each record belongs to the current Supabase account.</p>
            </div>
            <Link href="/dashboard" className="hidden text-sm font-black text-[#ff7a1a] sm:block">
              Dashboard
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {records.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[#e5d2bf] bg-[#fff9f2] p-10 text-center">
                <h3 className="text-2xl font-black text-[#171514]">No saved reports yet</h3>
                <p className="mt-2 text-sm leading-6 text-[#7a6d63]">Create your first pet profile and finish the behavior quiz to build this library.</p>
                <Link href="/create" className="mt-6 inline-flex rounded-full bg-[#ff7a1a] px-7 py-3 text-sm font-black text-white">
                  Start the test
                </Link>
              </div>
            ) : (
              records.map((record) => {
                const personality = personalities[record.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];
                const pet = record.pet;

                return (
                  <article key={record.id} className="rounded-[1.5rem] border border-[#eaded2] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(52,34,20,.08)]">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#fff0e4] text-sm font-black text-[#d96612]">
                        {speciesLabel(pet?.species)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-[#171514]">{pet?.name || "Unnamed pet"}</h3>
                          <span className="rounded-full bg-[#fff0e4] px-3 py-1 text-xs font-black text-[#d96612]">{personality.code} / {personality.name}</span>
                        </div>
                        <p className="mt-1 text-sm text-[#7a6d63]">
                          {speciesLabel(pet?.species)}
                          {pet?.breed ? ` - ${pet.breed}` : ""}
                          {pet?.age ? ` - ${pet.age}` : ""}
                          {" - "}
                          {formatDate(record.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/report/${record.pbti_id}`} className="rounded-full bg-[#ff7a1a] px-5 py-2.5 text-xs font-black text-white">
                          Report
                        </Link>
                        <Link href={`/memory/${record.pbti_id}`} className="rounded-full border border-[#eaded2] px-5 py-2.5 text-xs font-black text-[#4f463f]">
                          Memory
                        </Link>
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
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#ffb878]">Portrait posters</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Poster assets</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Generated portrait posters will appear here so users can revisit, download, and share them.
            </p>
            <div className="mt-5 grid gap-3">
              {records.slice(0, 3).map((record) => {
                const personality = personalities[record.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];

                return (
                  <Link key={record.id} href={`/report/${record.pbti_id}`} className="rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:bg-white/12">
                    <div className="text-sm font-black">{record.pet?.name || "Unnamed pet"}</div>
                    <div className="mt-1 text-xs text-white/62">{personality.code} / {personality.name} portrait pack</div>
                  </Link>
                );
              })}
              {records.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-white/64">
                  No poster assets yet.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-.04em] text-[#171514]">Next actions</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/create" className="rounded-2xl bg-[#fff0e4] px-5 py-4 text-sm font-black text-[#d96612]">
                Create another pet profile
              </Link>
              <Link href="/types" className="rounded-2xl bg-[#f7f0e8] px-5 py-4 text-sm font-black text-[#4f463f]">
                Explore 12 personality types
              </Link>
              <Link href="/premium" className="rounded-2xl bg-[#f7f0e8] px-5 py-4 text-sm font-black text-[#4f463f]">
                View early access benefits
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

