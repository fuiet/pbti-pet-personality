"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { calculatePBTI, Trait } from "@/lib/pbtiEngine";

interface PetEntry {
  name: string;
  species: string;
  breed?: string;
  age?: string;
}

interface ResultEntry {
  pet: PetEntry;
  code: string;
  personality: (typeof personalities)[typeof defaultPersonalityCode];
}

export default function Dashboard() {
  const router = useRouter();
  const [entries, setEntries] = useState<ResultEntry[]>([]);

  useEffect(() => {
    const results: ResultEntry[] = [];
    const petRaw = localStorage.getItem("pbti_pet");
    const answersRaw = localStorage.getItem("pbti_answers");

    if (petRaw && answersRaw) {
      try {
        const pet = JSON.parse(petRaw) as PetEntry;
        const answers = JSON.parse(answersRaw) as Trait[];
        const result = calculatePBTI(answers);
        results.push({ pet, code: result.code, personality: result.personality });
      } catch {
        // Ignore malformed local data and keep the dashboard empty.
      }
    }

    setEntries(results);
  }, []);

  const speciesLabel = (species: string) => (species === "dog" ? "Dog" : "Cat");

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
            <p className="mt-2 text-sm text-[#7a6d63]">
              Create your first pet profile to discover their personality
            </p>
            <button
              onClick={() => router.push("/create")}
              className="mt-6 rounded-full bg-[#ff7a1a] px-8 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,26,.3)] transition hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(52,34,20,.08)]"
            >
              <div className="flex items-center gap-5">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#fff0e4] text-base font-black text-[#d96612]">
                  {speciesLabel(entry.pet.species)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-[#171514]">{entry.pet.name}</h2>
                  <p className="text-sm text-[#7a6d63]">
                    {entry.pet.species === "dog" ? "Dog" : "Cat"}
                    {entry.pet.breed ? ` - ${entry.pet.breed}` : ""}
                    {entry.pet.age ? ` - ${entry.pet.age}` : ""}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-bold text-[#ff7a1a]">{entry.personality.name}</div>
                  <div className="text-xs text-[#7a6d63]">{entry.personality.title}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 sm:ml-[5.25rem]">
                <div className="flex gap-2">
                  {entry.personality.traits.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full bg-[#fff0e4] px-3 py-1 text-xs font-bold text-[#d96612]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => router.push(`/report/${entry.code}`)}
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
