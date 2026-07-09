"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { personalities } from "@/data/personalities";

interface PetEntry {
  name: string;
  species: string;
  breed?: string;
  age?: string;
}

interface ResultEntry {
  pet: PetEntry;
  type: string;
  personality: typeof personalities.AECG;
}

export default function Dashboard() {
  const router = useRouter();
  const [entries, setEntries] = useState<ResultEntry[]>([]);

  useEffect(() => {
    const results: ResultEntry[] = [];

    // Read current pet
    const petRaw = localStorage.getItem("pbti_pet");
    const answersRaw = localStorage.getItem("pbti_answers");

    if (petRaw && answersRaw) {
      try {
        const pet = JSON.parse(petRaw) as PetEntry;
        const answers = JSON.parse(answersRaw) as string[];
        // Recalculate type from raw scores
        const scores: Record<string, number> = { A: 0, I: 0, E: 0, S: 0, V: 0, C: 0, P: 0, G: 0 };
        answers.forEach((a) => { if (a in scores) scores[a] += 1; });
        const type = [
          scores.A >= scores.I ? "A" : "I",
          scores.E >= scores.S ? "E" : "S",
          scores.V >= scores.C ? "V" : "C",
          scores.P >= scores.G ? "P" : "G",
        ].join("");
        const p = personalities[type] || personalities.AECG;
        results.push({ pet, type, personality: p });
      } catch { /* ignore parse errors */ }
    }

    setEntries(results);
  }, []);

  const speciesEmoji = (s: string) => (s === "dog" ? "??" : "??");

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
            <div className="text-6xl">??</div>
            <h2 className="mt-4 text-xl font-bold text-[#4f463f]">No pets yet</h2>
            <p className="mt-2 text-sm text-[#7a6d63]">
              Create your first pet profile to discover their personality
            </p>
            <button
              onClick={() => router.push("/create")}
              className="mt-6 rounded-full bg-[#ff7a1a] px-8 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5"
            >
              Get Started →
            </button>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div
              key={idx}
              className="group rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(52,34,20,.08)]"
            >
              <div className="flex items-center gap-5">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#fff0e4] text-3xl">
                  {speciesEmoji(entry.pet.species)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-[#171514]">{entry.pet.name}</h2>
                  <p className="text-sm text-[#7a6d63]">
                    {entry.pet.species === "dog" ? "Dog" : "Cat"}
                    {entry.pet.breed ? ` · ${entry.pet.breed}` : ""}
                    {entry.pet.age ? ` · ${entry.pet.age}` : ""}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-bold text-[#ff7a1a]">{entry.type}</div>
                  <div className="text-xs text-[#7a6d63]">{entry.personality.emoji} {entry.personality.name}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 sm:ml-[5.25rem]">
                <div className="flex gap-2">
                  {entry.personality.traits.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#fff0e4] px-3 py-1 text-xs font-bold text-[#d96612]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => router.push(`/report/${entry.type}`)}
                    className="rounded-full bg-[#ff7a1a] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#ee6b10]"
                  >
                    Report
                  </button>
                  <button
                    onClick={() => router.push(`/memory/${entry.personality.code}`)}
                    className="rounded-full border border-[#eaded2] px-5 py-2 text-xs font-bold text-[#4f463f] transition hover:bg-white/80"
                  >
                    Memory
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
