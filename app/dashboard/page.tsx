"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { listCurrentUserResults, type ResultRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function Dashboard() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [entries, setEntries] = useState<ResultRecord[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    async function loadResults() {
      try {
        const results = await listCurrentUserResults();
        if (active) {
          setEntries(results);
        }
      } catch {
        if (active) {
          setEntries([]);
        }
      } finally {
        if (active) {
          setLoadingResults(false);
        }
      }
    }

    loadResults();

    return () => {
      active = false;
    };
  }, [authLoading]);

  const speciesLabel = (species: string) => (species === "dog" ? "Dog" : "Cat");

  if (authLoading || loadingResults) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-[-.04em] text-[#171514]">My Pets</h1>
          <p className="mt-1 text-sm text-[#7a6d63]">
            {entries.length > 0
              ? `You have ${entries.length} pet${entries.length > 1 ? "s" : ""} analyzed`
              : "No pets analyzed yet"}
          </p>
        </div>
        <button
          onClick={() => router.push("/create")}
          className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          + New Pet
        </button>
      </div>

      <div className="mt-8 space-y-5">
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-[#eaded2] bg-white/60 p-12 text-center">
            <div className="text-6xl font-black text-[#ff7a1a]">PBTI</div>
            <h2 className="mt-4 text-xl font-bold text-[#4f463f]">No pets yet</h2>
            <p className="mt-2 text-sm text-[#7a6d63]">Create your first pet profile to discover their personality</p>
            <button
              onClick={() => router.push("/create")}
              className="mt-6 rounded-full bg-[#ff7a1a] px-8 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        ) : (
          entries.map((entry) => {
            const personality = personalities[entry.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];
            const pet = entry.pet;

            return (
              <div
                key={entry.id}
                className="group rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(52,34,20,.08)]"
              >
                <div className="flex items-center gap-5">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#fff0e4] text-base font-black text-[#d96612]">
                    {speciesLabel(pet?.species || "cat")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-[#171514]">{pet?.name || "Unnamed Pet"}</h2>
                    <p className="text-sm text-[#7a6d63]">
                      {pet?.species === "dog" ? "Dog" : "Cat"}
                      {pet?.breed ? ` - ${pet.breed}` : ""}
                      {pet?.age ? ` - ${pet.age}` : ""}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-sm font-bold text-[#ff7a1a]">{personality.code} 路 {personality.name}</div>
                    <div className="text-xs text-[#7a6d63]">{personality.title}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 sm:ml-[5.25rem]">
                  <div className="flex flex-wrap gap-2">
                    {personality.traits.map((trait) => (
                      <span key={trait} className="rounded-full bg-[#fff0e4] px-3 py-1 text-xs font-bold text-[#d96612]">
                        {trait}
                      </span>
                    ))}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => router.push(`/report/${entry.pbti_id}`)}
                      className="rounded-full bg-[#ff7a1a] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#ee6b10]"
                    >
                      Report
                    </button>
                    <button
                      onClick={() => router.push(`/memory/${entry.pbti_id}`)}
                      className="rounded-full border border-[#eaded2] px-5 py-2 text-xs font-bold text-[#4f463f] transition hover:bg-white/80"
                    >
                      Memory
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
