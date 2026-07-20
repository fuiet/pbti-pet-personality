"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPersonalityAsset, type PetSpecies } from "@/data/personalityAssets";

const typeDetails = [
  {
    code: "IEVP",
    name: "Explorer",
    catImage: "/assets/personalities/cats/01-explorer-cat.webp",
    tone: "Curious, brave, and always first to inspect a new sound or scent.",
    traits: ["Curious", "Adventurous", "Independent"],
    care: "Offer safe novelty, rotating toys, and little discovery moments throughout the week.",
    bg: "bg-[#f7eadc]",
  },
  {
    code: "ASVG",
    name: "Guardian",
    catImage: "/assets/personalities/cats/02-guardian-cat.webp",
    tone: "Steady, loyal, and deeply tuned to the safety of their home base.",
    traits: ["Loyal", "Protective", "Stable"],
    care: "Keep routines predictable and give them a trusted place to observe changes calmly.",
    bg: "bg-[#edf0f2]",
  },
  {
    code: "ISCP",
    name: "Dreamer",
    catImage: "/assets/personalities/cats/03-dreamer-cat.webp",
    tone: "Gentle, soft-hearted, and happiest in quiet comfort.",
    traits: ["Gentle", "Calm", "Comfort-loving"],
    care: "Create cozy rest zones and use low-pressure affection that lets them choose closeness.",
    bg: "bg-[#ece7f8]",
  },
  {
    code: "IEVG",
    name: "Maverick",
    catImage: "/assets/personalities/cats/04-maverick-cat.webp",
    tone: "Independent, bold, and likely to do things in their own unmistakable style.",
    traits: ["Bold", "Self-directed", "Active"],
    care: "Offer choices, enrichment, and boundaries that feel clear without feeling restrictive.",
    bg: "bg-[#f2e2d6]",
  },
  {
    code: "IECG",
    name: "Scholar",
    catImage: "/assets/personalities/cats/05-scholar-cat.webp",
    tone: "Observant, thoughtful, and quietly clever before making a move.",
    traits: ["Smart", "Observant", "Analytical"],
    care: "Use puzzle play, patient training, and time to watch before joining new situations.",
    bg: "bg-[#e8ece8]",
  },
  {
    code: "AEVG",
    name: "Leader",
    catImage: "/assets/personalities/cats/06-leader-cat.webp",
    tone: "Confident, expressive, and clear about what they want from the room.",
    traits: ["Confident", "Expressive", "Decisive"],
    care: "Channel confidence into games, tasks, and positive structure they can understand.",
    bg: "bg-[#f7e3d5]",
  },
  {
    code: "ASCP",
    name: "Companion",
    catImage: "/assets/personalities/cats/07-companion-cat.webp",
    tone: "Warm, attached, and happiest when connection feels close and familiar.",
    traits: ["Affectionate", "People-oriented", "Warm"],
    care: "Build daily rituals, gentle check-ins, and shared spaces that make bonding easy.",
    bg: "bg-[#e8eee3]",
  },
  {
    code: "ASCG",
    name: "Healer",
    catImage: "/assets/personalities/cats/08-healer-cat.webp",
    tone: "Soothing, sensitive, and emotionally grounding for the people around them.",
    traits: ["Caring", "Sensitive", "Trusting"],
    care: "Protect calm time and reward gentle confidence with consistent, reassuring cues.",
    bg: "bg-[#e7eee4]",
  },
  {
    code: "AEVP",
    name: "Sunny",
    catImage: "/assets/personalities/cats/09-sunny-cat.webp",
    tone: "Bright, social, and quick to turn ordinary moments into joy.",
    traits: ["Playful", "Social", "Upbeat"],
    care: "Give regular play, praise, and interactive moments that let their enthusiasm land.",
    bg: "bg-[#fff0c9]",
  },
  {
    code: "ISCG",
    name: "Sentinel",
    catImage: "/assets/personalities/cats/10-sentinel-cat.webp",
    tone: "Watchful, patient, and alert to tiny shifts in the environment.",
    traits: ["Watchful", "Patient", "Aware"],
    care: "Let them observe first, avoid rushing social contact, and keep household signals steady.",
    bg: "bg-[#e7e3df]",
  },
  {
    code: "AECP",
    name: "Player",
    catImage: "/assets/personalities/cats/11-player-cat.webp",
    tone: "Interactive, mischievous, and always ready to turn attention into a game.",
    traits: ["Fun-loving", "Interactive", "Mischievous"],
    care: "Use short games, toy rotation, and playful training to keep their mind busy.",
    bg: "bg-[#f7e0db]",
  },
  {
    code: "ISVG",
    name: "Noble",
    catImage: "/assets/personalities/cats/12-noble-cat.webp",
    tone: "Calm, poised, and quietly confident with a strong sense of personal space.",
    traits: ["Graceful", "Composed", "Independent"],
    care: "Respect their boundaries and offer affection as an invitation, not a demand.",
    bg: "bg-[#f8e2e6]",
  },
] as const;

function SpeciesStatus({ species }: { species: PetSpecies }) {
  return (
    <div className="shrink-0 rounded-full border border-[#eaded2] bg-white/78 px-3 py-1.5 text-xs font-black text-[#6b5f55]">
      <span>{species === "dog" ? "Dog profile" : "Cat profile"}</span>
    </div>
  );
}

export default function TypesPage() {
  const [species, setSpecies] = useState<PetSpecies>("cat");

  return (
    <main className="bg-[#fff9f2] text-[#171514]">
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-14">
        <div className="rounded-[2rem] border border-[#eaded2] bg-white/70 p-6 shadow-[0_26px_80px_rgba(52,34,20,.07)] md:p-9">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,.85fr)_minmax(360px,.55fr)] lg:items-end">
            <div>
              <div className="text-sm font-black uppercase tracking-[.18em] text-[#d96612]">PBTI personality library</div>
              <h1 className="mt-4 max-w-4xl text-[42px] font-black leading-[.94] tracking-[-.04em] md:text-7xl">
                12 pet personality types
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#655a51]">
A clean reference for the full PBTI code system. Each profile uses a four-letter type as the main identity, with the personality name, behavior cues, and care style behind the result your pet may receive.
              </p>
            <div className="mt-6 inline-flex rounded-full border border-[#eaded2] bg-white p-1 shadow-sm" aria-label="Choose species artwork">
              {(["cat", "dog"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSpecies(option)}
                  className={"rounded-full px-5 py-2 text-sm font-black transition " + (species === option ? "bg-[#ff7a1a] text-white shadow-sm" : "text-[#6b5f55] hover:bg-[#fff0e4]")}
                >
                  {option === "dog" ? "Dog artwork" : "Cat artwork"}
                </button>
              ))}
            </div>
            </div>
            <div className="grid gap-4 rounded-[1.5rem] bg-[#fff9f2] p-4">
              <div className="rounded-[1.2rem] border border-[#eaded2] bg-white p-4 shadow-sm">
                <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">Code logic</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black text-[#6b5f55]">
                  <div className="rounded-xl bg-[#fff8ef] px-3 py-2"><span className="text-[#ff7a1a]">A/I</span> Bond vs independence</div>
                  <div className="rounded-xl bg-[#fff8ef] px-3 py-2"><span className="text-[#ff7a1a]">E/S</span> Explore vs stable</div>
                  <div className="rounded-xl bg-[#fff8ef] px-3 py-2"><span className="text-[#ff7a1a]">V/C</span> Vital vs calm</div>
                  <div className="rounded-xl bg-[#fff8ef] px-3 py-2"><span className="text-[#ff7a1a]">P/G</span> Play vs guard</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-[1rem] bg-white px-3 py-4 shadow-sm">
                  <div className="text-2xl font-black text-[#ff7a1a]">12</div>
                  <div className="mt-1 text-xs font-black text-[#6b5f55]">Codes</div>
                </div>
                <div className="rounded-[1rem] bg-white px-3 py-4 shadow-sm">
                  <div className="text-2xl font-black text-[#ff7a1a]">2</div>
                  <div className="mt-1 text-xs font-black text-[#6b5f55]">Species</div>
                </div>
                <div className="rounded-[1rem] bg-white px-3 py-4 shadow-sm">
                  <div className="text-2xl font-black text-[#ff7a1a]">28</div>
                  <div className="mt-1 text-xs font-black text-[#6b5f55]">Signals</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/create" className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(255,122,26,.26)] transition hover:-translate-y-1 hover:bg-[#ee6b10]">
                  Start the free test
                </Link>
                <Link href="/" className="rounded-full border border-[#eaded2] bg-white/85 px-6 py-3 text-sm font-black text-[#171514] transition hover:-translate-y-1">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {typeDetails.map((type, index) => (
            <article key={type.name} className="group overflow-hidden rounded-[1.4rem] border border-[#eaded2] bg-white shadow-[0_18px_48px_rgba(52,34,20,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(52,34,20,.1)]">
              <div className={`relative h-48 overflow-hidden ${type.bg}`}>
                <Image
                  src={getPersonalityAsset(type.code, species)}
                  alt={`${type.code} ${type.name} species personality artwork`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-contain p-3 transition duration-300 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/86 px-3 py-1 text-xs font-black text-[#6b5f55]">
                  {species === "dog" ? "Dog profile" : "Cat profile"}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{String(index + 1).padStart(2, "0")}</div>
                    <h2 className="mt-1 text-[2.6rem] font-black leading-none tracking-[-.06em] text-[#171514]">{type.code}</h2>
                    <div className="mt-2 text-lg font-black tracking-[-.03em] text-[#d96612]">{type.name}</div>
                  </div>
                  <SpeciesStatus species={species} />
                </div>
                <p className="mt-4 min-h-[72px] text-sm leading-6 text-[#655a51]">{type.tone}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {type.traits.map((trait) => (
                    <span key={trait} className="rounded-full border border-[#f0dac5] bg-[#fff8ef] px-3 py-1.5 text-xs font-black text-[#72543a]">
                      {trait}
                    </span>
                  ))}
                </div>
                <div className="mt-5 border-t border-[#f0e2d5] pt-4">
                  <div className="text-xs font-black uppercase tracking-[.14em] text-[#d96612]">Care cue</div>
                  <p className="mt-2 text-sm leading-6 text-[#655a51]">{type.care}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
