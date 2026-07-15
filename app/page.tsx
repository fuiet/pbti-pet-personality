"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HeaderAccountActions from "@/components/HeaderAccountActions";
import LanguageSelector from "@/components/LanguageSelector";


const premiumFreeUntil = new Date("2026-08-15T23:59:59+08:00").getTime();

function getCountdownParts() {
  const distance = Math.max(0, premiumFreeUntil - Date.now());
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function PremiumCountdown() {
  const [timeLeft, setTimeLeft] = useState(getCountdownParts);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getCountdownParts()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:min-w-[300px]">
      {parts.map((part) => (
        <div key={part.label} className="rounded-2xl border border-white/10 bg-white/[.08] px-3 py-3 text-center">
          <div className="text-2xl font-black leading-none tracking-[-.04em] text-white">{String(part.value).padStart(2, "0")}</div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-[.12em] text-white/52">{part.label}</div>
        </div>
      ))}
    </div>
  );
}
const methodSteps = [
  {
    index: "01",
    title: "Pet Profile",
    body: "Name, species, breed, age, and daily living context create the baseline for interpreting behavior without relying on breed stereotypes.",
    signal: "Baseline context",
    badge: "Input layer",
  },
  {
    index: "02",
    title: "Visual Identification",
    body: "Upload up to 3 pet photos. The visual model reviews appearance cues such as coat, face shape, body structure, and possible breed mix to enrich the final report.",
    signal: "Photo analysis",
    badge: "Vision layer",
  },
  {
    index: "03",
    title: "36 Behavior Signals",
    body: "Owner-observed reactions, routines, social contact, novelty response, activity level, and vigilance are mapped into the four PBTI behavior axes.",
    signal: "Behavior scoring",
    badge: "Scoring layer",
  },
  {
    index: "04",
    title: "Personality Report",
    body: "The final result links one of 12 PBTI types with trait evidence, care suggestions, visual notes, and poster-ready material for sharing.",
    signal: "Report output",
    badge: "Insight delivery",
  },
] as const;
const researchPillars = [
  {
    label: "Cat basis",
    title: "Feline Five trait map",
    body: "Uses owner-observed cat traits from the Feline Five framework: sociability, neuroticism, impulsiveness, dominance, and agreeableness. PBTI translates them into comfort with people, sensitivity to change, activity level, confidence, and tolerance.",
  },
  {
    label: "Dog basis",
    title: "C-BARQ behavior signals",
    body: "Uses the same observation style as canine behavior questionnaires such as C-BARQ: social contact, fearfulness, excitability, trainability, play behavior, attachment, and vigilance. These become behavior clues rather than breed stereotypes.",
  },
  {
    label: "PBTI scoring",
    title: "4 axes, 12 prototypes",
    body: "The 36 answers are scored on A/I, E/S, V/C, and P/G. The final profile is selected by matching the pet's four-axis pattern to twelve fixed prototypes shared across cats and dogs.",
  },
] as const;
const methodDecorations = [
  {
    image: "/assets/personalities/cats/03-dreamer-cat.webp",
    className: "left-4 top-8 w-28 -rotate-12 lg:left-10 lg:top-10 lg:w-36",
  },
  {
    image: "/assets/personalities/cats/09-sunny-cat.webp",
    className: "right-5 top-12 w-32 rotate-6 lg:right-12 lg:top-14 lg:w-44",
  },
  {
    image: "/assets/personalities/cats/12-noble-cat.webp",
    className: "right-10 bottom-8 w-28 -rotate-6 lg:right-20 lg:bottom-10 lg:w-40",
  },
] as const;

const catPersonalityTypes = [
  { image: "/assets/personalities/cats/01-explorer-cat.webp", name: "Explorer", desc: "Curious", tint: "bg-[#f7eadc]" },
  { image: "/assets/personalities/cats/02-guardian-cat.webp", name: "Guardian", desc: "Loyal", tint: "bg-[#edf0f2]" },
  { image: "/assets/personalities/cats/03-dreamer-cat.webp", name: "Dreamer", desc: "Gentle", tint: "bg-[#ece7f8]" },
  { image: "/assets/personalities/cats/04-maverick-cat.webp", name: "Maverick", desc: "Independent", tint: "bg-[#f2e2d6]" },
  { image: "/assets/personalities/cats/05-scholar-cat.webp", name: "Scholar", desc: "Thoughtful", tint: "bg-[#e8ece8]" },
  { image: "/assets/personalities/cats/06-leader-cat.webp", name: "Leader", desc: "Confident", tint: "bg-[#f7e3d5]" },
  { image: "/assets/personalities/cats/07-companion-cat.webp", name: "Companion", desc: "Affectionate", tint: "bg-[#e8eee3]" },
  { image: "/assets/personalities/cats/08-healer-cat.webp", name: "Healer", desc: "Caring", tint: "bg-[#e7eee4]" },
  { image: "/assets/personalities/cats/09-sunny-cat.webp", name: "Sunny", desc: "Optimistic", tint: "bg-[#fff0c9]" },
  { image: "/assets/personalities/cats/10-sentinel-cat.webp", name: "Sentinel", desc: "Watchful", tint: "bg-[#e7e3df]" },
  { image: "/assets/personalities/cats/11-player-cat.webp", name: "Player", desc: "Playful", tint: "bg-[#f7e0db]" },
  { image: "/assets/personalities/cats/12-noble-cat.webp", name: "Noble", desc: "Graceful", tint: "bg-[#f8e2e6]" },
] as const;

const BrandLogo = ({ compact = false }: { compact?: boolean }) => (
  <Link href="/" className="block shrink-0" aria-label="PBTI Home">
    <img
      src="/logo.png"
      alt="PBTI Pet Behavior Type Indicator"
      className={compact ? "h-[72px] w-auto object-contain" : "h-[112px] w-auto object-contain"}
    />
  </Link>
);


const PersonalityShowcaseCard = ({ image, name, desc, tint }: { image: string; name: string; desc: string; tint: string }) => (
  <article className="min-w-0 overflow-hidden rounded-[1.8rem] border border-[#eaded2] bg-white shadow-[0_20px_55px_rgba(52,34,20,.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_65px_rgba(52,34,20,.13)]">
    <div className={`relative h-40 overflow-hidden sm:h-44 ${tint}`}>
      <Image
        src={image}
        alt={`${name} Cat personality character`}
        fill
        unoptimized
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
        className="object-contain p-2 drop-shadow-[0_12px_18px_rgba(52,34,20,.14)]"
      />
    </div>
    <div className="p-5 text-center">
      <div className="text-lg font-black tracking-[-.03em] text-[#171514]">{name}</div>
      <div className="mt-1 text-sm text-[#7a6d63]">{desc}</div>
    </div>
  </article>
);

const heroStats = [
  {
    value: "36",
    unit: "questions",
    title: "Behavior assessment",
    body: "Map daily habits, routines, and reactions into a clearer personality baseline.",
    icon: "clipboard",
  },
  {
    value: "12",
    unit: "types",
    title: "Personality model",
    body: "Place every pet into one of twelve distinct profiles shared across cats and dogs.",
    icon: "star",
  },
  {
    value: "10+",
    unit: "pages",
    title: "Deep report",
    body: "Turn test signals into readable insights, behavior patterns, and care recommendations.",
    icon: "report",
  },
  {
    value: "3",
    unit: "posters",
    title: "Portrait pack",
    body: "Generate polished shareable posters that turn the result into something giftable and fun.",
    icon: "image",
  },
] as const;

const previewTraits = ["Protective", "Steady", "Routine-loving"] as const;

const previewScores = [
  ["Sociability", 76],
  ["Confidence", 84],
  ["Curiosity", 58],
  ["Sensitivity", 42],
] as const;

const previewTips = [
  "Keep routines predictable after big changes.",
  "Use calm praise when your pet checks in with you.",
  "Offer puzzle play before guests arrive.",
] as const;

function HeroStatIcon({ kind }: { kind: (typeof heroStats)[number]["icon"] }) {
  const common = "h-7 w-7 text-[#ff7a1a]";
  if (kind === "clipboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M9 4.75h6a1.25 1.25 0 0 1 1.25 1.25v.75H7.75V6A1.25 1.25 0 0 1 9 4.75Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 6.75h8a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.2 12h5.6M9.2 15h3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "star") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="m12 4.75 2.48 4.95 5.47.8-3.97 3.86.94 5.45L12 16.96 7.08 19.81l.94-5.45L4.05 10.5l5.47-.8L12 4.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "report") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M7.5 4.75h6.8l2.95 2.95v11.55a1.25 1.25 0 0 1-1.25 1.25H7.5a1.25 1.25 0 0 1-1.25-1.25V6A1.25 1.25 0 0 1 7.5 4.75Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14.3 4.75v3.15h3.15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.8 12.2h6.4M8.8 15.2h4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
      <rect x="4.5" y="5.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m7 14 3.1-3 2.35 2.15 1.6-1.35 2.95 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="8.2" r="1.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SampleResultPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="grid gap-8 rounded-[2rem] border border-[#eaded2] bg-white/72 p-6 shadow-[0_30px_90px_rgba(52,34,20,.08)] md:p-8 lg:grid-cols-[.85fr_1.15fr]">
        <div className="flex flex-col justify-center">
          <div className="text-sm font-black uppercase tracking-[.16em] text-[#d96612]">Sample result preview</div>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-[.96] tracking-[-.05em] text-[#171514] md:text-5xl">
            See the kind of report your pet will get
          </h2>
          <p className="mt-5 max-w-lg text-base leading-8 text-[#655a51]">
            Your pet's result brings together a personality type, readable behavior traits, care suggestions, and a share-ready portrait card.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {["Type summary", "Trait scores", "Care guide", "Share card"].map((item) => (
              <span key={item} className="rounded-full border border-[#f2d8bf] bg-[#fff7ed] px-4 py-2 text-sm font-black text-[#8a4f22]">
                {item}
              </span>
            ))}
          </div>
          <Link
            href="/create"
            className="mt-8 inline-flex w-fit rounded-full bg-[#ff7a1a] px-7 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(255,122,26,.28)] transition hover:-translate-y-1 hover:bg-[#ee6b10]"
          >
            Get your pet's result
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_.72fr]">
          <article className="rounded-[1.6rem] border border-[#eaded2] bg-[#fffaf4] p-5 shadow-[0_20px_55px_rgba(52,34,20,.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">PBTI report</div>
                <h3 className="mt-2 text-3xl font-black tracking-[-.05em] text-[#171514]">Guardian</h3>
                <p className="mt-2 text-sm leading-6 text-[#655a51]">Steady, loyal, and happiest when their world feels familiar.</p>
              </div>
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.2rem] bg-[#edf0f2]">
                <Image
                  src="/assets/personalities/cats/02-guardian-cat.webp"
                  alt="Guardian personality preview"
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-contain p-1"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {previewTraits.map((trait) => (
                <span key={trait} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#6b5f55] shadow-sm">
                  {trait}
                </span>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {previewScores.map(([label, score]) => (
                <div key={label}>
                  <div className="mb-1.5 flex justify-between text-xs font-black text-[#6b5f55]">
                    <span>{label}</span>
                    <span>{score}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#f0e3d7]">
                    <div className="h-full rounded-full bg-[#ff7a1a]" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-4">
            <article className="rounded-[1.6rem] border border-[#eaded2] bg-white p-5 shadow-[0_18px_45px_rgba(52,34,20,.06)]">
              <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">Care tips</div>
              <ul className="mt-4 space-y-3">
                {previewTips.map((tip) => (
                  <li key={tip} className="flex gap-3 text-sm leading-6 text-[#655a51]">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ff7a1a]" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="overflow-hidden rounded-[1.6rem] border border-[#eaded2] bg-[#171514] text-white shadow-[0_18px_45px_rgba(52,34,20,.1)]">
              <div className="relative h-40 bg-[#edf0f2]">
                <Image
                  src="/assets/personalities/cats/02-guardian-cat.webp"
                  alt="Share poster preview"
                  fill
                  unoptimized
                  sizes="260px"
                  className="object-contain p-2"
                />
              </div>
              <div className="p-5">
                <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">Share poster</div>
                <div className="mt-1 text-2xl font-black tracking-[-.04em]">Guardian Energy</div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fff9f2] text-[#171514]">
      <header className="sticky top-0 z-50 border-b border-[#eaded2]/70 bg-[#fff9f2]/86 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <BrandLogo compact />
          <div className="hidden items-center gap-9 text-sm font-bold text-[#4f463f] lg:flex">
            <Link href="/" className="transition hover:text-[#ff7a1a]">{"\u9996\u9875"}</Link>
            <a href="#method" className="transition hover:text-[#ff7a1a]">{"\u6d4b\u8bd5\u65b9\u6cd5"}</a>
            <Link href="/types" className="transition hover:text-[#ff7a1a]">{"\u6027\u683c\u5206\u7c7b"}</Link>
            <Link href="/premium" className="transition hover:text-[#ff7a1a]">{"\u5b9a\u4ef7"}</Link>
            <Link href="/account" className="transition hover:text-[#ff7a1a]">{"\u7528\u6237\u4e2d\u5fc3"}</Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector compact />
            <HeaderAccountActions />
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-16 lg:min-h-[700px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(720px,0.95fr)_minmax(360px,0.65fr)]">
        <div className="relative z-10">
          <h1 className="max-w-3xl text-[54px] font-black leading-[.92] tracking-[-.07em] text-[#171514] md:text-[78px]">
            Discover who they really are
            <span className="mt-3 block text-[#ff7a1a]">Science-backed, thoughtful, and fun</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#655a51]">
            PBTI turns pet behavior research into a clear personality readout with a 36-question assessment, a 12-type framework, a deep report, and portrait-style share cards.
          </p>
          <div className="mt-6 max-w-3xl rounded-[1.5rem] border border-[#ff7a1a]/35 bg-[#171514] p-5 text-white shadow-[0_22px_55px_rgba(52,34,20,.14)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex rounded-full bg-[#ff7a1a] px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-white">Premium free access</div>
                <h2 className="mt-3 text-2xl font-black tracking-[-.04em]">Premium is free for 1 month</h2>
                <p className="mt-2 text-sm leading-6 text-white/72">Full reports, portrait posters, and multi-pet profiles are open during launch month.</p>
                <Link href="/create" className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-center text-sm font-black text-[#171514] transition hover:-translate-y-0.5 hover:bg-[#fff7ed]">
                  Claim premium access
                </Link>
              </div>
              <PremiumCountdown />
            </div>
          </div>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="/create" className="rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_22px_50px_rgba(255,122,26,.34)] transition hover:-translate-y-1 hover:bg-[#ee6b10]">
              Start the free test
            </Link>
            <Link href="/types" className="rounded-full border border-[#eaded2] bg-white/85 px-8 py-4 text-center font-black text-[#171514] shadow-[0_16px_45px_rgba(52,34,20,.07)] transition hover:-translate-y-1">
              Explore the 12 personality types
            </Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            {heroStats.map((item) => (
              <article key={item.title} className="group min-h-[136px] rounded-[1.65rem] border border-[#eaded2] bg-white/92 p-5 shadow-[0_16px_34px_rgba(52,34,20,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(52,34,20,.1)]">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fff1dc] transition duration-300 group-hover:scale-105">
                    <HeroStatIcon kind={item.icon} />
                  </div>
                  <div className="text-right text-[#ff7a1a]">
                    <div className="text-[2.7rem] font-black leading-[.8] tracking-[-.05em]">{item.value}</div>
                    <div className="mt-2 text-sm font-black uppercase leading-none tracking-[.02em]">{item.unit}</div>
                  </div>
                </div>
                <div className="mt-5 max-w-[11rem] text-[1.55rem] font-black leading-[1.02] tracking-[-.035em] text-[#181512]">
                  {item.title}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[560px] items-center justify-center lg:min-h-[640px]">
          <img
            src="/hero-pets.png?v=2"
            alt="A happy cat and dog together wearing PBTI tags"
            className="relative z-10 h-auto w-[200%] max-w-[1320px] object-contain drop-shadow-[0_28px_58px_rgba(52,34,20,.18)] lg:w-[220%] lg:max-w-[1540px]"
          />
        </div>
      </section>

      <SampleResultPreview />

      <section id="method" className="relative overflow-hidden border-y border-[#eaded2]/80 bg-white/58 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,122,26,.08),transparent_28%),radial-gradient(circle_at_88%_74%,rgba(255,184,120,.16),transparent_30%)]" />
        {methodDecorations.map((item) => (
          <img
            key={item.image}
            src={item.image}
            alt=""
            aria-hidden="true"
            className={`pointer-events-none absolute hidden object-contain drop-shadow-[0_22px_35px_rgba(52,34,20,.18)] sm:block ${item.className}`}
          />
        ))}
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <div className="text-sm font-black uppercase tracking-[.16em] text-[#d96612]">PBTI method</div>
            <h2 className="mt-4 max-w-xl text-5xl font-black leading-[.95] tracking-[-.055em] text-[#171514]">
              How PBTI turns behavior into a useful report
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-[#655a51]">
              PBTI is a behavior-based personality indicator. It uses owner-observed daily behavior as the scoring source, with breed, age, and photo context used only to personalize the report experience.
            </p>
            <div className="mt-8 rounded-[1.35rem] border border-[#eaded2] bg-white p-4 text-sm leading-6 text-[#655a51] shadow-[0_16px_40px_rgba(52,34,20,.06)]">
              Based on behavior research, not breed stereotypes. Educational indicator only, not a veterinary diagnosis.
            </div>
            <div className="mt-4 grid max-w-md grid-cols-3 overflow-hidden rounded-[1.35rem] border border-[#eaded2] bg-white shadow-[0_16px_40px_rgba(52,34,20,.06)]">
              <div className="border-r border-[#eaded2] p-4">
                <div className="text-2xl font-black tracking-[-.04em] text-[#ff7a1a]">36</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[.06em] text-[#6b5f55]">questions</div>
              </div>
              <div className="border-r border-[#eaded2] p-4">
                <div className="text-2xl font-black tracking-[-.04em] text-[#ff7a1a]">12</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[.06em] text-[#6b5f55]">types</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-black tracking-[-.04em] text-[#ff7a1a]">10+</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[.06em] text-[#6b5f55]">pages</div>
              </div>
            </div>
            <div className="mt-5 grid max-w-xl gap-3">
              {researchPillars.map((pillar) => (
                <article key={pillar.title} className="rounded-[1.35rem] border border-[#eaded2] bg-white/92 p-5 shadow-[0_16px_40px_rgba(52,34,20,.05)]">
                  <div className="text-[11px] font-black uppercase tracking-[.14em] text-[#d96612]">{pillar.label}</div>
                  <h3 className="mt-2 text-lg font-black tracking-[-.035em] text-[#171514]">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#655a51]">{pillar.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative lg:pt-14 xl:pt-20">
            <div className="absolute left-[1.65rem] top-10 hidden h-[calc(100%-5rem)] w-px bg-[#f2d8bf] md:block lg:top-24 xl:top-28" />

            <div className="grid gap-4">
              {methodSteps.map((step) => (
                <article key={step.index} className="relative rounded-[1.6rem] border border-[#eaded2] bg-white p-5 shadow-[0_18px_48px_rgba(52,34,20,.06)] md:ml-14 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8">
                  <div className="absolute -left-14 top-6 hidden h-14 w-14 items-center justify-center rounded-full border border-[#f4d8bd] bg-[#fff3e2] text-sm font-black text-[#ff7a1a] shadow-sm md:flex">
                    {step.index}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 md:hidden">
                      <span className="rounded-full bg-[#fff3e2] px-3 py-1 text-xs font-black text-[#ff7a1a]">{step.index}</span>
                      <span className="text-xs font-black uppercase tracking-[.14em] text-[#9b7d63]">{step.signal}</span>
                    </div>
                    <div className="hidden text-xs font-black uppercase tracking-[.14em] text-[#9b7d63] md:block">{step.signal}</div>
                    <h3 className="mt-3 text-2xl font-black tracking-[-.04em] text-[#171514]">{step.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#655a51]">{step.body}</p>
                  </div>
                  <div className="mt-5 rounded-2xl bg-[#fff8ef] px-4 py-3 text-sm font-black text-[#8a4f22] md:mt-0">
                    {step.badge}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="types" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-[-.04em]">Personality types</h2>
            <p className="mt-3 text-[#655a51]">The same 12 personality names are used across both cats and dogs, and the cat art set is now live in the site.</p>
          </div>
          <Link href="/quiz" className="hidden text-sm font-black text-[#ff7a1a] sm:block">Try the quiz</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {catPersonalityTypes.map((personality) => (
            <PersonalityShowcaseCard key={personality.name} {...personality} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#eaded2] bg-gradient-to-r from-white via-[#fff0df] to-[#ffd8ad] p-10 shadow-[0_30px_90px_rgba(52,34,20,.1)] md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black tracking-[-.04em]">Ready to discover your pet's type?</h2>
            <p className="mt-5 text-lg leading-8 text-[#5f544d]">Create a profile, upload a photo, answer the quiz, and get a personality result in minutes.</p>
            <Link href="/create" className="mt-8 inline-block rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white shadow-[0_20px_45px_rgba(255,122,26,.32)]">
              Start now
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#eaded2] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-[#7a6d63] md:flex-row md:items-center">
          <BrandLogo compact />
          <div>Copyright 2026 PBTI. Pet Behavior Type Indicator.</div>
        </div>
      </footer>
    </main>
  );
}
