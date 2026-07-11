"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPersonalityImage, Personality } from "@/data/personalities";
import { calculatePBTI, dimensionPercent, Trait } from "@/lib/pbtiEngine";

export default function ResultPage() {
  const router = useRouter();
  const [pet, setPet] = useState<{ name?: string; species?: "cat" | "dog"; breed?: string; age?: string }>({});
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [dna, setDna] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const storedPet = localStorage.getItem("pbti_pet");
    const storedAnswers = localStorage.getItem("pbti_answers");
    if (!storedAnswers) {
      router.push("/create");
      return;
    }

    let parsedPet: typeof pet = {};
    if (storedPet) {
      try { parsedPet = JSON.parse(storedPet); } catch { parsedPet = {}; }
    }
    setPet(parsedPet);

    const result = calculatePBTI(JSON.parse(storedAnswers) as Trait[]);
    setPersonality(result.personality);
    setDna([
      { name: "Attachment", value: dimensionPercent(result.dimensions.attachment) },
      { name: "Exploration", value: dimensionPercent(result.dimensions.exploration) },
      { name: "Vitality", value: dimensionPercent(result.dimensions.vitality) },
      { name: "Playfulness", value: dimensionPercent(result.dimensions.playfulness) },
    ]);
  }, [router]);

  if (!personality) return <div className="flex min-h-[60vh] items-center justify-center text-4xl animate-pulse">🐾</div>;

  const species = pet.species === "dog" ? "dog" : "cat";
  const image = getPersonalityImage(personality.code, species);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <div className="inline-flex rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] ring-1 ring-[#ffd8bd]">✓ Analysis Complete</div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#eaded2] bg-white shadow-sm">
        <div className="grid gap-6 p-6 sm:grid-cols-[220px_1fr] sm:items-center">
          <div className="rounded-3xl bg-[#fff5ea] p-3">
            <img src={image} alt={`${personality.name} ${species}`} className="mx-auto h-56 w-full object-contain" />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-sm font-black uppercase tracking-[.16em] text-[#ff7a1a]">PBTI Personality</div>
            <h1 className="mt-2 text-4xl font-black text-[#171514]">{personality.name}</h1>
            <p className="mt-1 font-bold text-[#d96612]">{personality.title}</p>
            <p className="mt-4 leading-7 text-[#655a51]">{personality.description}</p>
          </div>
        </div>
      </div>

      {pet.name && <div className="mt-4 text-center text-sm text-[#7a6d63]">{species === "dog" ? "🐶" : "🐱"} {pet.name}{pet.breed ? ` · ${pet.breed}` : ""}</div>}

      <section className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">✨ Key Traits</h2>
        <div className="flex flex-wrap gap-2">{personality.traits.map((trait) => <span key={trait} className="rounded-full bg-[#fff0e4] px-4 py-1.5 text-sm font-bold text-[#d96612]">{trait}</span>)}</div>
      </section>

      <section className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold">🧬 Personality DNA</h2>
        <div className="space-y-4">{dna.map((item) => <div key={item.name}><div className="mb-1.5 flex justify-between text-sm font-bold"><span>{item.name}</span><span className="text-[#ff7a1a]">{item.value}%</span></div><div className="h-2.5 rounded-full bg-[#eadfd3]"><div className="h-2.5 rounded-full bg-gradient-to-r from-[#ffb56f] to-[#ff7a1a]" style={{ width: `${item.value}%` }} /></div></div>)}</div>
      </section>

      <section className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">💡 Care Advice</h2>
        <ul className="space-y-2">{personality.advice.map((advice, index) => <li key={advice} className="flex gap-3 text-sm leading-6 text-[#655a51]"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#fff0e4] text-xs text-[#ff7a1a]">{index + 1}</span>{advice}</li>)}</ul>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button onClick={() => router.push(`/report/${personality.code}`)} className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white">View Full Report →</button>
        <button onClick={() => router.push("/dashboard")} className="flex-1 rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 font-bold">My Dashboard</button>
      </div>
    </div>
  );
}
