"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Personality } from "@/data/personalities";
import { calculatePBTI, Trait } from "@/lib/pbtiEngine";

interface PetEntry { name: string; species: string; breed?: string; age?: string; }
interface ResultEntry { pet: PetEntry; type: string; personality: Personality; }

export default function Dashboard() {
  const router = useRouter();
  const [entries, setEntries] = useState<ResultEntry[]>([]);

  useEffect(() => {
    const petRaw = localStorage.getItem("pbti_pet");
    const answersRaw = localStorage.getItem("pbti_answers");
    if (!petRaw || !answersRaw) return;

    try {
      const pet = JSON.parse(petRaw) as PetEntry;
      const result = calculatePBTI(JSON.parse(answersRaw) as Trait[]);
      setEntries([{ pet, type: result.type, personality: result.personality }]);
    } catch {
      setEntries([]);
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div><h1 className="text-3xl font-black">My Pets</h1><p className="mt-1 text-sm text-[#7a6d63]">{entries.length ? "1 pet analyzed" : "No pets analyzed yet"}</p></div>
        <button onClick={() => router.push("/create")} className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white">+ New Pet</button>
      </div>

      <div className="mt-8 space-y-5">
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-[#eaded2] bg-white/60 p-12 text-center"><div className="text-6xl">🐾</div><h2 className="mt-4 text-xl font-bold">No pets yet</h2><p className="mt-2 text-sm text-[#7a6d63]">Create your first pet profile to discover their personality</p></div>
        ) : entries.map((entry) => (
          <div key={entry.pet.name} className="rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#fff0e4] text-3xl">{entry.pet.species === "dog" ? "🐶" : "🐱"}</div>
              <div className="min-w-0 flex-1"><h2 className="text-xl font-bold">{entry.pet.name}</h2><p className="text-sm text-[#7a6d63]">{entry.pet.species === "dog" ? "Dog" : "Cat"}{entry.pet.breed ? ` · ${entry.pet.breed}` : ""}{entry.pet.age ? ` · ${entry.pet.age}` : ""}</p></div>
              <div className="hidden text-right sm:block"><div className="text-sm font-bold text-[#ff7a1a]">{entry.personality.name}</div><div className="text-xs text-[#7a6d63]">{entry.personality.title}</div></div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 sm:ml-[5.25rem]"><div className="flex flex-wrap gap-2">{entry.personality.traits.map((trait) => <span key={trait} className="rounded-full bg-[#fff0e4] px-3 py-1 text-xs font-bold text-[#d96612]">{trait}</span>)}</div><button onClick={() => router.push(`/report/${entry.type}`)} className="rounded-full bg-[#ff7a1a] px-5 py-2 text-xs font-bold text-white">Report</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}
