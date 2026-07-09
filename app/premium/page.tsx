"use client";

import { useRouter } from "next/navigation";

export default function Premium() {
  const router = useRouter();

  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "Basic personality discovery",
      features: [
        "12-question personality test",
        "Basic PBTI type result",
        "Personality DNA overview",
        "Shareable personality card"
      ],
      cta: "Current Plan",
      ctaStyle: "border-2 border-[#eaded2] bg-white text-[#4f463f]",
      highlight: false,
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "one-time",
      desc: "Complete personality deep dive",
      features: [
        "Everything in Free",
        "AI appearance analysis",
        "Deep personality breakdown",
        "Personalized care guide",
        "Relationship analysis",
        "Lifetime personality profile",
        "Priority support"
      ],
      cta: "Unlock Premium",
      ctaStyle: "bg-[#ff7a1a] text-white shadow-[0_16px_35px_rgba(255,122,26,.32)]",
      highlight: true,
    },
    {
      name: "Memory Book",
      price: "$19.99",
      period: "one-time",
      desc: "Full memory & timeline pack",
      features: [
        "Everything in Premium",
        "AI memory story generation",
        "Unlimited photo timeline",
        "Custom memory book PDF",
        "Multi-pet support"
      ],
      cta: "Unlock Memory Book",
      ctaStyle: "border-2 border-[#eaded2] bg-white text-[#4f463f]",
      highlight: false,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] shadow-sm ring-1 ring-[#ffd8bd]">
          ?? Understand Your Pet Deeper
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-[-.05em] text-[#171514]">
          Choose Your Plan
        </h1>
        <p className="mt-3 text-[#7a6d63]">
          Unlock the full story of your pet&apos;s personality
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl border p-8 transition hover:-translate-y-1 ${
              plan.highlight
                ? "border-[#ff7a1a] bg-white shadow-[0_24px_60px_rgba(255,122,26,.15)]"
                : "border-[#eaded2] bg-white shadow-sm"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ff7a1a] px-4 py-1 text-xs font-black text-white">
                BEST VALUE
              </div>
            )}

            <h2 className="text-xl font-black text-[#171514]">{plan.name}</h2>
            <div className="mt-3">
              <span className="text-4xl font-black text-[#171514]">{plan.price}</span>
              {plan.period && (
                <span className="ml-1 text-sm text-[#7a6d63]">/{plan.period}</span>
              )}
            </div>
            <p className="mt-2 text-sm text-[#7a6d63]">{plan.desc}</p>

            <ul className="mt-6 space-y-3">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#4f463f]">
                  <span className="mt-0.5 text-[#ff7a1a]">?</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push("/create")}
              className={`mt-8 w-full rounded-full px-6 py-3 text-sm font-black transition hover:-translate-y-0.5 ${plan.ctaStyle}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
