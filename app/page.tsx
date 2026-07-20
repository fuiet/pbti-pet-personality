"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HeaderAccountActions from "@/components/HeaderAccountActions";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/components/LanguageProvider";
import { getPersonalityAsset, type PetSpecies } from "@/data/personalityAssets";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";


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
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getCountdownParts> | null>(null);

  useEffect(() => {
    setTimeLeft(getCountdownParts());
    const timer = window.setInterval(() => setTimeLeft(getCountdownParts()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = [
    { label: t("home.countdown.days"), value: timeLeft?.days ?? 0 },
    { label: t("home.countdown.hours"), value: timeLeft?.hours ?? 0 },
    { label: t("home.countdown.minutes"), value: timeLeft?.minutes ?? 0 },
    { label: t("home.countdown.seconds"), value: timeLeft?.seconds ?? 0 },
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
    title: "28 Behavior Signals",
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
    body: "Uses owner-observed cat personality research as conceptual background. PBTI uses related behavior cues, but does not reproduce the Feline Five scale or claim equivalent validation.",
  },
  {
    label: "Dog basis",
    title: "C-BARQ behavior signals",
    body: "Uses everyday behavior cues related to domains measured by instruments such as C-BARQ. PBTI is a separate educational model and does not use C-BARQ norms or diagnose behavior problems.",
  },
  {
    label: "PBTI scoring",
    title: "4 axes, 12 prototypes",
    body: "The 28 answers are scored on A/I, E/S, V/C, and P/G, then matched to twelve custom prototypes shared across cats and dogs.",
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
  { species: "cat", code: "IEVP", name: "Explorer", desc: "Curious", tint: "bg-[#f7eadc]" },
  { species: "dog", code: "ASVG", name: "Guardian", desc: "Loyal", tint: "bg-[#edf0f2]" },
  { species: "cat", code: "ISCP", name: "Dreamer", desc: "Gentle", tint: "bg-[#ece7f8]" },
  { species: "dog", code: "IEVG", name: "Maverick", desc: "Independent", tint: "bg-[#f2e2d6]" },
  { species: "cat", code: "IECG", name: "Scholar", desc: "Thoughtful", tint: "bg-[#e8ece8]" },
  { species: "dog", code: "AEVG", name: "Leader", desc: "Confident", tint: "bg-[#f7e3d5]" },
  { species: "cat", code: "ASCP", name: "Companion", desc: "Affectionate", tint: "bg-[#e8eee3]" },
  { species: "dog", code: "ASCG", name: "Healer", desc: "Caring", tint: "bg-[#e7eee4]" },
  { species: "cat", code: "AEVP", name: "Sunny", desc: "Optimistic", tint: "bg-[#fff0c9]" },
  { species: "dog", code: "ISCG", name: "Sentinel", desc: "Watchful", tint: "bg-[#e7e3df]" },
  { species: "cat", code: "AECP", name: "Player", desc: "Playful", tint: "bg-[#f7e0db]" },
  { species: "dog", code: "ISVG", name: "Noble", desc: "Graceful", tint: "bg-[#f8e2e6]" },
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


const PersonalityShowcaseCard = ({ species, code, name, desc, tint }: { species: PetSpecies; code: string; name: string; desc: string; tint: string }) => (
  <article className="min-w-0 overflow-hidden rounded-[1.8rem] border border-[#eaded2] bg-white shadow-[0_20px_55px_rgba(52,34,20,.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_65px_rgba(52,34,20,.13)]">
    <div className={"relative h-40 overflow-hidden sm:h-44 " + tint}>
      <Image
        src={getPersonalityAsset(code, species)}
        alt={code + " " + name + " " + (species === "dog" ? "dog" : "cat") + " personality character"}
        fill
        unoptimized
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
        className="object-contain p-2 drop-shadow-[0_12px_18px_rgba(52,34,20,.14)]"
      />
    </div>
    <div className="p-5 text-center">
      <div className="text-2xl font-black tracking-[.08em] text-[#171514]">{code}</div>
      <div className="mt-1 text-sm font-black text-[#7a6d63]">{name}</div>
      <div className="mt-1 text-xs text-[#9a8a7d]">{desc}</div>
    </div>
  </article>
);

const heroStats = [
  {
    value: "28",
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
    value: "10",
    unit: "chapters",
    title: "Visual report",
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

const storyScenarios = [
  { code: "ISCP", species: "cat", owner: "Emma, Mochi's human", ownerZh: "麻薯家长 · 林晴", pet: "Mochi", petZh: "麻薯", body: "I used to think Mochi was distant. The report helped me notice that sharing a room, slow blinking, and choosing the chair beside me were already her way of showing trust.", bodyZh: "以前我总觉得麻薯不够亲人。看完报告才发现，待在同一个房间、慢慢眨眼、主动睡在我旁边的椅子上，原来都是她表达信任的方式。", tag: "Finally understood her affection", tagZh: "终于读懂她的亲近" },
  { code: "ASVG", species: "dog", owner: "Daniel Chen", ownerZh: "来自杭州的麦洛爸爸", pet: "Milo", petZh: "麦洛", body: "The result described Milo's need for predictable routines so accurately. Small changes to our leaving-home ritual have made both of us noticeably calmer.", bodyZh: "报告把麦洛对规律和安全感的需要说得很准确。我们只是调整了出门前的固定流程，它的情绪就稳定了很多，我们也轻松多了。", tag: "Found a calmer routine", tagZh: "找到了更安心的相处节奏" },
  { code: "AECP", species: "cat", owner: "Cookie's family", ownerZh: "曲奇一家", pet: "Cookie", petZh: "曲奇", body: "Cookie was not being difficult—she needed shorter, more rewarding play. Once we changed the timing, the restless evenings became our favorite part of the day.", bodyZh: "曲奇并不是故意捣乱，她只是需要更短、更有成就感的互动游戏。调整时间以后，原本手忙脚乱的晚上，反而成了我们最期待的相处时刻。", tag: "Turned chaos into connection", tagZh: "把忙乱变成了默契" },
] as const;

const faqItems = [
  { q: "How is PBTI different from MBTI?", qZh: "PBTI 和 MBTI 有什么区别？", a: "PBTI is a custom educational indicator for pets. It uses owner-observed animal behavior across four PBTI dimensions and does not apply a human MBTI questionnaire to cats or dogs.", aZh: "PBTI 是面向宠物的自定义教育性行为指标，通过主人对日常行为的观察，在四个 PBTI 维度上计分；它不是把人类 MBTI 问卷直接套用到猫狗身上。" },
  { q: "How long does the assessment take?", qZh: "完成测试需要多长时间？", a: "The assessment contains 28 questions and usually takes several minutes. Answer from repeated daily behavior rather than one unusual event.", aZh: "测试共 28 道题，通常几分钟可以完成。请根据爱宠长期、反复出现的日常表现作答，不要只参考某一次特殊情况。" },
  { q: "Is the result scientifically validated?", qZh: "测试结果有科学依据吗？", a: "The item design is informed by owner-observed cat and dog behavior research, including concepts related to Feline Five and C-BARQ. PBTI remains a separate custom model and is not a clinical diagnosis or a validated reproduction of those instruments.", aZh: "题目设计参考了猫狗主人观察型行为研究，包括与 Feline Five 和 C-BARQ 相关的行为概念。但 PBTI 是独立的自定义模型，不是这些量表的复制品，也不属于临床诊断工具。" },
  { q: "Can photos determine personality or breed with certainty?", qZh: "照片能准确判断性格或品种吗？", a: "No. Photos are used only to describe visible appearance and possible breed cues. Personality comes from the behavior assessment, and visual identification cannot prove ancestry, health, or temperament.", aZh: "不能。照片仅用于描述可见外观和可能的品种线索；性格结果来自行为测试。外观鉴定不能证明血统、健康状况或真实性格。" },
  { q: "Is PBTI suitable for pets of every age?", qZh: "多大年龄的宠物适合测试？", a: "Most owners can complete it once they have observed stable daily patterns. Very young, newly adopted, unwell, or recently relocated pets may need more observation time before the result is representative.", aZh: "只要主人已经观察到相对稳定的日常行为，大多数年龄阶段都可以测试。幼龄、刚领养、身体不适或刚换环境的宠物，建议多观察一段时间后再作答。" },
  { q: "Can I create profiles for more than one pet?", qZh: "家里有多只宠物怎么办？", a: "Create a separate profile and answer the assessment independently for each pet. Do not combine the behavior of several animals into one result.", aZh: "请为每只宠物分别建立档案并独立作答，不要把多只宠物的表现混合在同一份测试中。" },
] as const;

function StoriesAndFaq({ zh }: { zh: boolean }) {
  const [feedback, setFeedback] = useState({ name: "", petName: "", species: "cat", rating: 5, message: "" });
  const [savedFeedback, setSavedFeedback] = useState<typeof feedback[]>([]);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [assessmentCount, setAssessmentCount] = useState(12847);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("pbti-home-feedback");
      if (saved) setSavedFeedback(JSON.parse(saved));
    } catch {
      // A private browsing policy may disable local storage; the form still works for this visit.
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await createSupabaseBrowserClient().rpc("get_public_pbti_stats");
        const stats = data as { assessment_count?: number | string }[] | { assessment_count?: number | string } | null;
        const count = Array.isArray(stats) ? Number(stats[0]?.assessment_count) : Number(stats?.assessment_count);
        if (Number.isFinite(count) && count >= 12847) setAssessmentCount(count);
      } catch {
        // Keep the launch baseline when the public counter migration is not available yet.
      }
    })();
  }, []);

  function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = [feedback, ...savedFeedback].slice(0, 6);
    setSavedFeedback(next);
    setFeedbackSent(true);
    setFeedback({ name: "", petName: "", species: "cat", rating: 5, message: "" });
    try {
      window.localStorage.setItem("pbti-home-feedback", JSON.stringify(next));
    } catch {
      // Keep the newly submitted review in memory when storage is unavailable.
    }
  }

  return (
    <>
      <section className="border-y border-[#eaded2] bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "真实用户故事" : "Real user stories"}</div>
            <h2 className="mt-4 text-4xl font-black tracking-[-.05em] text-[#171514] sm:text-5xl">{zh ? "从日常细节，重新认识它" : "See familiar behavior differently"}</h2>
            <p className="mt-5 text-base leading-8 text-[#655a51]">{zh ? "从日常行为里发现被忽略的信任、需要和爱。" : "Finding overlooked signs of trust, needs, and affection in everyday behavior."}</p>
            <p className="mt-3 text-xs text-[#9a8d83]">{zh ? "以下为页面展示用模拟用户故事，正式上线前将替换为经授权的真实反馈。" : "Demo stories for layout preview; they will be replaced with authorized customer feedback before final publication."}</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {storyScenarios.map((story) => (
              <article key={story.code} className="rounded-[1.8rem] border border-[#eaded2] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(52,34,20,.06)]">
                <div className="flex items-center gap-4 border-b border-[#f0e6dc] pb-5">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#fff0e4]"><Image src={getPersonalityAsset(story.code, story.species)} alt="" fill unoptimized sizes="64px" className="object-contain" /></div>
                  <div><div className="text-[#ffad00]" aria-label="5 out of 5 stars">★★★★★</div><h3 className="mt-1 text-lg font-black text-[#171514]">{zh ? story.ownerZh : story.owner}</h3><div className="text-xs text-[#8a7c72]">{zh ? `${story.petZh} · ${story.code}` : `${story.pet} · ${story.code}`}</div></div>
                </div>
                <div className="mt-5 inline-flex rounded-full bg-[#fff0e4] px-3 py-1 text-xs font-black text-[#d96612]">✓ {zh ? story.tagZh : story.tag}</div>
                <p className="mt-4 text-sm leading-7 text-[#655a51]">“{zh ? story.bodyZh : story.body}”</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid overflow-hidden rounded-[1.8rem] border border-[#f0dfc8] bg-gradient-to-r from-[#fff7e8] to-[#f2fff8] sm:grid-cols-3">
            {[
              [assessmentCount.toLocaleString(zh ? "zh-CN" : "en-US"), zh ? "累计完成评估" : "Assessments completed"],
              ["98%", zh ? "满意度" : "Satisfaction"],
              [(assessmentCount * 28).toLocaleString(zh ? "zh-CN" : "en-US"), zh ? "行为数据点" : "Behavior data points"],
            ].map(([value, label]) => <div key={label} className="border-b border-[#f0dfc8] px-6 py-7 text-center last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><div className="text-3xl font-black tracking-tight text-[#ff6b00]">{value}</div><div className="mt-1 text-xs font-bold text-[#655a51]">{label}</div></div>)}
          </div>
          <p className="mt-3 text-center text-[11px] text-[#aa9d93]">{zh ? "累计评估以 12,847 为上线基准，之后随新完成的真实测试自动增加。" : "Assessment totals start from the 12,847 launch baseline and increase with newly completed assessments."}</p>

          <div className="mt-16 overflow-hidden rounded-[2rem] border border-[#eaded2] bg-[#171514] text-white shadow-[0_28px_80px_rgba(52,34,20,.14)]">
            <div className="grid lg:grid-cols-[.9fr_1.1fr]">
              <div className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#ff7a1a]/20 blur-3xl" />
                <div className="relative">
                  <div className="text-xs font-black uppercase tracking-[.18em] text-[#ff9a4f]">{zh ? "用户反馈" : "Your feedback"}</div>
                  <h3 className="mt-4 text-3xl font-black tracking-[-.04em]">{zh ? "说说你和爱宠的发现" : "Share what you discovered"}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/65">{zh ? "你的体验会帮助我们继续改善题目、报告和使用流程。提交后的内容仅保存在当前浏览器中。" : "Your experience helps us improve the questions, report, and journey. Submitted feedback is stored only in this browser."}</p>
                  {feedbackSent && <div className="mt-6 rounded-2xl border border-[#7ee0b5]/30 bg-[#163c2e] px-5 py-4 text-sm font-bold text-[#a9f2d1]">{zh ? "感谢你的反馈，已经保存到本机。" : "Thank you—your feedback has been saved on this device."}</div>}
                  {savedFeedback[0] && (
                    <blockquote className="mt-6 rounded-2xl bg-white/7 p-5">
                      <div className="text-sm font-black text-[#ffb16f]">{"★".repeat(savedFeedback[0].rating)}</div>
                      <p className="mt-3 text-sm leading-6 text-white/80">“{savedFeedback[0].message}”</p>
                      <footer className="mt-3 text-xs text-white/50">{savedFeedback[0].name} · {savedFeedback[0].petName}</footer>
                    </blockquote>
                  )}
                </div>
              </div>

              <form onSubmit={submitFeedback} className="grid gap-5 bg-[#fffaf5] p-8 text-[#2f2925] sm:grid-cols-2 lg:p-10">
                <label className="text-sm font-bold">{zh ? "你的称呼" : "Your name"}<input required maxLength={40} value={feedback.name} onChange={(event) => setFeedback({ ...feedback, name: event.target.value })} className="mt-2 w-full rounded-2xl border border-[#e8d8ca] bg-white px-4 py-3 font-medium outline-none transition focus:border-[#ff7a1a] focus:ring-4 focus:ring-[#ff7a1a]/10" placeholder={zh ? "例如：林晴" : "e.g. Emma"} /></label>
                <label className="text-sm font-bold">{zh ? "爱宠名字" : "Pet's name"}<input required maxLength={40} value={feedback.petName} onChange={(event) => setFeedback({ ...feedback, petName: event.target.value })} className="mt-2 w-full rounded-2xl border border-[#e8d8ca] bg-white px-4 py-3 font-medium outline-none transition focus:border-[#ff7a1a] focus:ring-4 focus:ring-[#ff7a1a]/10" placeholder={zh ? "例如：麻薯" : "e.g. Mochi"} /></label>
                <label className="text-sm font-bold">{zh ? "物种" : "Species"}<select value={feedback.species} onChange={(event) => setFeedback({ ...feedback, species: event.target.value })} className="mt-2 w-full rounded-2xl border border-[#e8d8ca] bg-white px-4 py-3 font-medium outline-none focus:border-[#ff7a1a]"><option value="cat">{zh ? "猫" : "Cat"}</option><option value="dog">{zh ? "狗" : "Dog"}</option></select></label>
                <fieldset><legend className="text-sm font-bold">{zh ? "评分" : "Rating"}</legend><div className="mt-2 flex h-[50px] items-center gap-1 rounded-2xl border border-[#e8d8ca] bg-white px-3">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" onClick={() => setFeedback({ ...feedback, rating })} className={`px-1 text-2xl transition hover:scale-110 ${rating <= feedback.rating ? "text-[#ffad00]" : "text-[#d9cec5]"}`} aria-label={`${rating} ${zh ? "星" : "stars"}`}>★</button>)}</div></fieldset>
                <label className="text-sm font-bold sm:col-span-2">{zh ? "你的反馈" : "Your feedback"}<textarea required minLength={10} maxLength={500} rows={4} value={feedback.message} onChange={(event) => setFeedback({ ...feedback, message: event.target.value })} className="mt-2 w-full resize-none rounded-2xl border border-[#e8d8ca] bg-white px-4 py-3 font-medium leading-6 outline-none transition focus:border-[#ff7a1a] focus:ring-4 focus:ring-[#ff7a1a]/10" placeholder={zh ? "哪些内容让你更了解它？还有什么可以做得更好？" : "What helped you understand your pet, and what could be better?"} /></label>
                <div className="flex items-center justify-between gap-4 sm:col-span-2"><span className="text-xs text-[#8a7c72]">{feedback.message.length}/500</span><button type="submit" className="rounded-full bg-[#ff6f12] px-7 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(255,111,18,.25)] transition hover:-translate-y-0.5 hover:bg-[#e85e06]">{zh ? "提交评价" : "Submit review"}</button></div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center"><div className="text-sm font-black uppercase tracking-[.16em] text-[#d96612]">FAQ</div><h2 className="mt-4 text-4xl font-black tracking-[-.05em] text-[#171514]">{zh ? "常见问题解答" : "Frequently asked questions"}</h2><p className="mt-4 text-[#7a6d63]">{zh ? "关于测试方法、适用范围和结果边界。" : "Clear answers about the method, suitable use, and result boundaries."}</p></div>
        <div className="mt-10 divide-y divide-[#eaded2] border-y border-[#eaded2]">
          {faqItems.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-base font-black text-[#2f2925] marker:content-none"><span>{zh ? item.qZh : item.q}</span><span className="shrink-0 rounded-full bg-[#fff0e4] px-3 py-1 text-xs font-black text-[#ff7a1a] group-open:hidden">{zh ? "展开" : "Open"}</span><span className="hidden shrink-0 rounded-full bg-[#171514] px-3 py-1 text-xs font-black text-white group-open:inline">{zh ? "收起" : "Close"}</span></summary>
              <p className="max-w-3xl pb-6 pr-12 text-sm leading-7 text-[#655a51]">{zh ? item.aZh : item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

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

function SampleResultPreview({ zh }: { zh: boolean }) {
  const traits = zh ? ["有守护欲", "沉稳", "偏爱规律"] : previewTraits;
  const scores = zh ? [["亲密度", 76], ["稳定感", 84], ["探索欲", 58], ["敏感度", 42]] as const : previewScores;
  const tips = zh ? ["生活发生较大变化后，尽量保持日常节奏稳定。", "当它主动关注你时，用温和的赞美及时回应。", "客人到访前，可以先安排一轮益智游戏。"] : previewTips;
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="grid gap-8 rounded-[2rem] border border-[#eaded2] bg-white/72 p-6 shadow-[0_30px_90px_rgba(52,34,20,.08)] md:p-8 lg:grid-cols-[.85fr_1.15fr]">
        <div className="flex flex-col justify-center">
          <div className="text-sm font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "报告示例" : "Sample result preview"}</div>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-[.96] tracking-[-.05em] text-[#171514] md:text-5xl">
            {zh ? "提前看看爱宠会获得怎样的报告" : "See the kind of report your pet will get"}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-8 text-[#655a51]">
            {zh ? "报告会整合性格类型、行为特点、照护建议，以及适合分享的专属写真卡片。" : "Your pet's result brings together a personality type, readable behavior traits, care suggestions, and a share-ready portrait card."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {(zh ? ["类型概览", "维度得分", "照护指南", "分享卡片"] : ["Type summary", "Trait scores", "Care guide", "Share card"]).map((item) => (
              <span key={item} className="rounded-full border border-[#f2d8bf] bg-[#fff7ed] px-4 py-2 text-sm font-black text-[#8a4f22]">
                {item}
              </span>
            ))}
          </div>
          <Link
            href="/create"
            className="mt-8 inline-flex w-fit rounded-full bg-[#ff7a1a] px-7 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(255,122,26,.28)] transition hover:-translate-y-1 hover:bg-[#ee6b10]"
          >
            {zh ? "获取爱宠的测试结果" : "Get your pet's result"}
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_.72fr]">
          <article className="rounded-[1.6rem] border border-[#eaded2] bg-[#fffaf4] p-5 shadow-[0_20px_55px_rgba(52,34,20,.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "PBTI 性格报告" : "PBTI report"}</div>
                <div className="mt-2 text-xs font-black uppercase tracking-[.16em] text-[#d96612]">ASVG</div><h3 className="mt-1 text-3xl font-black tracking-[-.05em] text-[#171514]">{zh ? "守护者" : "Guardian"}</h3>
                <p className="mt-2 text-sm leading-6 text-[#655a51]">{zh ? "沉稳忠诚，在熟悉而稳定的环境里最安心。" : "Steady, loyal, and happiest when their world feels familiar."}</p>
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
              {traits.map((trait) => (
                <span key={trait} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#6b5f55] shadow-sm">
                  {trait}
                </span>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {scores.map(([label, score]) => (
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
              <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "照护建议" : "Care tips"}</div>
              <ul className="mt-4 space-y-3">
                {tips.map((tip) => (
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
                <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">{zh ? "分享海报" : "Share poster"}</div>
                <div className="mt-1 text-2xl font-black tracking-[-.04em]">{zh ? "守护者能量" : "Guardian Energy"}</div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { language, t } = useLanguage();
  const localizedHeroStats = language === "zh-CN" ? [
    { ...heroStats[0], unit: "道题", title: "行为性格测试", body: "从日常习惯与反应中梳理爱宠的性格倾向。" },
    { ...heroStats[1], unit: "种类型", title: "宠物性格模型", body: "猫狗共享 12 种性格名称与四字母代码。" },
    { ...heroStats[2], unit: "页以上", title: "完整解读报告", body: "把测试结果整理成容易理解的相处与照护建议。" },
    { ...heroStats[3], unit: "张写真", title: "专属写真套装", body: "生成适合保存与分享的爱宠写真。" },
  ] : heroStats;
  const localizedResearchPillars = language === "zh-CN" ? [
    { label: "猫咪研究参考", title: "Feline Five 性格维度", body: "以主人长期观察到的猫咪行为作为概念参考。PBTI 采用相关行为线索，但不复制 Feline Five 量表，也不宣称具有同等验证效力。" },
    { label: "狗狗研究参考", title: "C-BARQ 行为线索", body: "参考 C-BARQ 等研究涉及的日常行为领域。PBTI 是独立的科普型模型，不套用 C-BARQ 常模，也不用于诊断行为问题。" },
    { label: "PBTI 评分方式", title: "4 个维度，12 种类型", body: "28 道题分别映射到 A/I、E/S、V/C、P/G 四个行为维度，再匹配猫狗共用的 12 种性格原型。" },
  ] : researchPillars;
  const localizedMethodSteps = language === "zh-CN" ? [
    { index: "01", title: "建立爱宠档案", body: "填写名字、物种、品种和年龄，帮助系统了解爱宠的基本生活背景，但不会用品种刻板印象判断性格。", signal: "基础信息", badge: "档案建立" },
    { index: "02", title: "爱宠鉴定", body: "上传最多 3 张照片，识别毛色、脸型、体态和可能的品种构成，为完整报告补充外观信息。", signal: "照片分析", badge: "视觉识别" },
    { index: "03", title: "28 道行为题", body: "根据主人观察到的社交方式、日常规律、探索反应、活跃程度和警觉表现，计算四个 PBTI 行为维度。", signal: "行为评分", badge: "性格计算" },
    { index: "04", title: "生成性格报告", body: "匹配 12 种 PBTI 类型之一，并提供行为依据、相处建议、照护提示、外观信息与分享写真。", signal: "报告输出", badge: "完整解读" },
  ] : methodSteps;
  return (
    <main className="min-h-screen overflow-hidden bg-[#fff9f2] text-[#171514]">
      <header className="sticky top-0 z-50 border-b border-[#eaded2]/70 bg-[#fff9f2]/86 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <BrandLogo compact />
          <div className="hidden items-center gap-9 text-sm font-bold text-[#4f463f] lg:flex">
            <Link href="/" className="transition hover:text-[#ff7a1a]">{t("nav.home")}</Link>
            <a href="#method" className="transition hover:text-[#ff7a1a]">{t("nav.method")}</a>
            <Link href="/types" className="transition hover:text-[#ff7a1a]">{t("nav.types")}</Link>
            <Link href="/account" className="transition hover:text-[#ff7a1a]">{t("nav.account")}</Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector compact />
            <HeaderAccountActions />
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-16 lg:min-h-[700px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(720px,0.95fr)_minmax(360px,0.65fr)]">
        <div className="relative z-10">
          <h1 className={`max-w-3xl font-black leading-[.92] text-[#171514] ${language === "zh-CN" ? "text-[48px] tracking-[-.055em] md:text-[64px]" : "text-[54px] tracking-[-.07em] md:text-[78px]"}`}>
            {t("home.hero.title")}
            <span className="mt-3 block text-[#ff7a1a]">{t("home.hero.accent")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#655a51]">
            {t("home.hero.body")}
          </p>
          <div className="mt-6 max-w-3xl rounded-[1.5rem] border border-[#ff7a1a]/35 bg-[#171514] p-5 text-white shadow-[0_22px_55px_rgba(52,34,20,.14)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex rounded-full bg-[#ff7a1a] px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-white">{t("home.premium.label")}</div>
                <h2 className="mt-3 text-2xl font-black tracking-[-.04em]">{t("home.premium.title")}</h2>
                <p className="mt-2 text-sm leading-6 text-white/72">{t("home.premium.body")}</p>
                <Link href="/create" className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-center text-sm font-black text-[#171514] transition hover:-translate-y-0.5 hover:bg-[#fff7ed]">
                  {t("home.premium.cta")}
                </Link>
              </div>
              <PremiumCountdown />
            </div>
          </div>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="/create" className="rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_22px_50px_rgba(255,122,26,.34)] transition hover:-translate-y-1 hover:bg-[#ee6b10]">
              {t("home.cta.start")}
            </Link>
            <Link href="/types" className="rounded-full border border-[#eaded2] bg-white/85 px-8 py-4 text-center font-black text-[#171514] shadow-[0_16px_45px_rgba(52,34,20,.07)] transition hover:-translate-y-1">
              {t("home.cta.types")}
            </Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            {localizedHeroStats.map((item) => (
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

      <SampleResultPreview zh={language === "zh-CN"} />

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
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 border-b border-[#eaded2] pb-10 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
            <div>
              <div className="text-sm font-black uppercase tracking-[.16em] text-[#d96612]">{t("home.method.eyebrow")}</div>
              <h2 className="mt-4 max-w-2xl text-5xl font-black leading-[.95] tracking-[-.055em] text-[#171514]">
                {t("home.method.title")}
              </h2>
            </div>
            <div>
              <p className="text-base leading-8 text-[#655a51]">
                {t("home.method.body")}
              </p>
              <div className="mt-5 rounded-[1.35rem] border border-[#eaded2] bg-white p-4 text-sm leading-6 text-[#655a51] shadow-[0_16px_40px_rgba(52,34,20,.06)]">
                {t("home.method.note")}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:items-stretch lg:gap-10">
            <div className="flex h-full flex-col">
              <div className="grid grid-cols-3 overflow-hidden rounded-[1.35rem] border border-[#eaded2] bg-white shadow-[0_16px_40px_rgba(52,34,20,.06)]">
              <div className="border-r border-[#eaded2] p-4">
                <div className="text-2xl font-black tracking-[-.04em] text-[#ff7a1a]">28</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[.06em] text-[#6b5f55]">{t("common.questions")}</div>
              </div>
              <div className="border-r border-[#eaded2] p-4">
                <div className="text-2xl font-black tracking-[-.04em] text-[#ff7a1a]">12</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[.06em] text-[#6b5f55]">{t("common.types")}</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-black tracking-[-.04em] text-[#ff7a1a]">10</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[.06em] text-[#6b5f55]">{t("common.chapters")}</div>
              </div>
            </div>
              <div className="mt-4 grid flex-1 gap-4 lg:grid-rows-3">
              {localizedResearchPillars.map((pillar) => (
                <article key={pillar.title} className="rounded-[1.35rem] border border-[#eaded2] bg-white/92 p-5 shadow-[0_16px_40px_rgba(52,34,20,.05)]">
                  <div className="text-[11px] font-black uppercase tracking-[.14em] text-[#d96612]">{pillar.label}</div>
                  <h3 className="mt-2 text-lg font-black tracking-[-.035em] text-[#171514]">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#655a51]">{pillar.body}</p>
                </article>
              ))}
            </div>
          </div>

            <div className="relative h-full">
              <div className="absolute bottom-7 left-[1.65rem] top-7 hidden w-px bg-[#f2d8bf] md:block" />

              <div className="grid h-full gap-4 lg:grid-rows-4">
              {localizedMethodSteps.map((step) => (
                <article key={step.index} className="relative h-full rounded-[1.6rem] border border-[#eaded2] bg-white p-5 shadow-[0_18px_48px_rgba(52,34,20,.06)] md:ml-14 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8">
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
        </div>
      </section>

      <section id="types" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-[-.04em]">{language === "zh-CN" ? "性格类型" : "Personality types"}</h2>
            <p className="mt-3 text-[#655a51]">{language === "zh-CN" ? "猫咪和狗狗共享同一套 12 种性格名称与四字母代码，并会自动使用对应物种的素材。" : "The same 12 personality names and four-letter codes are shared by cats and dogs, with species-specific artwork used automatically."}</p>
          </div>
          <Link href="/quiz" className="hidden text-sm font-black text-[#ff7a1a] sm:block">{language === "zh-CN" ? "开始测试" : "Try the quiz"}</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {catPersonalityTypes.map((personality) => {
            const localized = language === "zh-CN" ? ({
              IEVP: ["探索家", "好奇"], ASVG: ["守护者", "忠诚"], ISCP: ["梦想家", "温柔"], IEVG: ["独行侠", "独立"],
              IECG: ["学者", "善思考"], AEVG: ["领袖", "自信"], ASCP: ["陪伴者", "亲昵"], ASCG: ["治愈者", "体贴"],
              AEVP: ["小太阳", "乐观"], ISCG: ["哨兵", "警觉"], AECP: ["玩乐家", "爱玩"], ISVG: ["贵族", "优雅"],
            } as const)[personality.code] : null;
            return <PersonalityShowcaseCard key={personality.name} {...personality} name={localized?.[0] || personality.name} desc={localized?.[1] || personality.desc} />;
          })}
        </div>
      </section>

      <StoriesAndFaq zh={language === "zh-CN"} />

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#eaded2] bg-gradient-to-r from-white via-[#fff0df] to-[#ffd8ad] p-10 shadow-[0_30px_90px_rgba(52,34,20,.1)] md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black tracking-[-.04em]">{language === "zh-CN" ? "准备好发现爱宠的性格类型了吗？" : "Ready to discover your pet's type?"}</h2>
            <p className="mt-5 text-lg leading-8 text-[#5f544d]">{language === "zh-CN" ? "创建档案、上传照片并完成测试，几分钟内获得专属性格结果。" : "Create a profile, upload a photo, answer the quiz, and get a personality result in minutes."}</p>
            <Link href="/create" className="mt-8 inline-block rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white shadow-[0_20px_45px_rgba(255,122,26,.32)]">
              {language === "zh-CN" ? "现在开始" : "Start now"}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#eaded2] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-[#7a6d63] md:flex-row md:items-center">
          <BrandLogo compact />
          <div>{language === "zh-CN" ? "© 2026 PBTI 爱宠行为性格指标" : "Copyright 2026 PBTI. Pet Behavior Type Indicator."}</div>
        </div>
      </footer>
    </main>
  );
}
