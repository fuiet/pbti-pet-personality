"use client";

import { useRouter } from "next/navigation";

const earlyAccessFeatures = [
  {
    title: "Full 10+ page report",
    body: "Behavior scoring, type evidence, care suggestions, relationship guidance, and practical support notes are open during launch month.",
  },
  {
    title: "Portrait poster pack",
    body: "Generate share-ready personality poster material from the pet result, visual style, and PBTI type identity.",
  },
  {
    title: "Multi-pet profiles",
    body: "Create and save reports for multiple cats and dogs under the same account while early access is active.",
  },
  {
    title: "Visual identification notes",
    body: "Photo-based breed, coat, face, body structure, and possible mix cues are included as report context.",
  },
];

export default function Premium() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <section className="overflow-hidden rounded-[2.4rem] border border-[#ff7a1a]/30 bg-[#171514] p-8 text-white shadow-[0_28px_85px_rgba(52,34,20,.16)] sm:p-10">
        <div className="inline-flex rounded-full bg-[#ff7a1a] px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-white">
          Launch month early access
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <h1 className="text-5xl font-black leading-[.95] tracking-[-.06em] sm:text-6xl">
              Premium is free for 1 month
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
              Full reports, portrait posters, visual identification notes, and multi-pet profiles are open to early users during launch month. No payment is required right now.
            </p>
          </div>
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[.07] p-5">
            <div className="text-sm font-black uppercase tracking-[.14em] text-[#ffb878]">Current access</div>
            <div className="mt-3 text-4xl font-black tracking-[-.05em]">$0</div>
            <p className="mt-2 text-sm leading-6 text-white/62">Early access remains free until the launch-month window closes.</p>
            <button
              onClick={() => router.push("/create")}
              className="mt-5 w-full rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.24)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
            >
              Start and unlock free
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {earlyAccessFeatures.map((feature, index) => (
          <article key={feature.title} className="rounded-[1.8rem] border border-[#eaded2] bg-white p-6 shadow-[0_18px_55px_rgba(52,34,20,.06)]">
            <div className="text-sm font-black text-[#ff7a1a]">0{index + 1}</div>
            <h2 className="mt-3 text-2xl font-black tracking-[-.04em] text-[#171514]">{feature.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#655a51]">{feature.body}</p>
          </article>
        ))}
      </section>

      <div className="mt-8 rounded-[2rem] border border-[#eaded2] bg-[#fff7ed] p-6 text-center">
        <h2 className="text-2xl font-black tracking-[-.04em] text-[#171514]">Full access is active</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#655a51]">
          Complete the test and your account can open the full report experience immediately during the launch-month free window.
        </p>
        <button
          onClick={() => router.push("/create")}
          className="mt-5 rounded-full bg-[#ff7a1a] px-8 py-4 text-sm font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.28)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          Claim early access
        </button>
      </div>
    </div>
  );
}

