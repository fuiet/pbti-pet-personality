"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPersonalityAsset, type PetSpecies } from "@/data/personalityAssets";
import { useLanguage } from "@/components/LanguageProvider";

const zhTypeDetails: Record<string, { name: string; tone: string; traits: string[]; care: string }> = {
  IEVP: { name: "探索家", tone: "好奇勇敢，总是第一个去探索新的声音和气味。", traits: ["好奇", "爱冒险", "独立"], care: "提供安全的新鲜体验，轮换玩具，每周安排几次小小的探索时刻。" },
  ASVG: { name: "守护者", tone: "沉稳忠诚，对家庭环境的安全变化格外敏锐。", traits: ["忠诚", "守护", "稳定"], care: "保持生活节奏稳定，并给它一个能安心观察环境变化的位置。" },
  ISCP: { name: "梦想家", tone: "温柔细腻，在安静舒适的环境里最自在。", traits: ["温柔", "安静", "享受舒适"], care: "准备舒适的休息区，用不带压力的方式亲近，让它主动选择距离。" },
  IEVG: { name: "独行侠", tone: "独立大胆，总能用自己的方式表达鲜明个性。", traits: ["大胆", "有主见", "活跃"], care: "提供选择和丰富活动，用清晰但不过度限制的方式建立边界。" },
  IECG: { name: "学者", tone: "善于观察、冷静聪明，行动之前会先看清局势。", traits: ["聪明", "敏锐", "善思考"], care: "安排益智游戏和耐心训练，进入新环境时给它充分的观察时间。" },
  AEVG: { name: "领袖", tone: "自信外向，对自己想要什么表达得非常清楚。", traits: ["自信", "善表达", "果断"], care: "通过游戏、任务和明确的正向规则，引导它恰当地释放自信。" },
  ASCP: { name: "陪伴者", tone: "温暖亲人，熟悉而稳定的陪伴会让它格外安心。", traits: ["亲昵", "亲人", "温暖"], care: "建立每日互动仪式，经常温柔回应，并营造容易相互陪伴的空间。" },
  ASCG: { name: "治愈者", tone: "敏感温和，常常能给身边的人带来安定感。", traits: ["体贴", "敏感", "信任"], care: "保护安静时间，用稳定、令人安心的信号鼓励它建立信心。" },
  AEVP: { name: "小太阳", tone: "开朗合群，擅长把普通日常变成快乐时刻。", traits: ["爱玩", "合群", "乐观"], care: "提供规律的游戏、赞美和互动，让它的热情得到积极回应。" },
  ISCG: { name: "哨兵", tone: "警觉耐心，能察觉环境里很细微的变化。", traits: ["警觉", "耐心", "敏锐"], care: "允许它先观察，不要催促社交，并让家庭环境中的信号保持稳定。" },
  AECP: { name: "玩乐家", tone: "爱互动、会调皮，随时都能把关注变成一场游戏。", traits: ["有趣", "爱互动", "调皮"], care: "用短时游戏、玩具轮换和趣味训练持续满足它的好奇心。" },
  ISVG: { name: "贵族", tone: "沉着优雅，安静自信，也很重视自己的空间。", traits: ["优雅", "从容", "独立"], care: "尊重它的边界，把亲近变成邀请，而不是强迫。" },
};

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

function SpeciesStatus({ species, zh }: { species: PetSpecies; zh: boolean }) {
  return (
    <div className="shrink-0 rounded-full border border-[#eaded2] bg-white/78 px-3 py-1.5 text-xs font-black text-[#6b5f55]">
      <span>{species === "dog" ? (zh ? "狗狗类型" : "Dog type") : (zh ? "猫咪类型" : "Cat type")}</span>
    </div>
  );
}

export default function TypesPage() {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const [species, setSpecies] = useState<PetSpecies>("cat");

  return (
    <main className="bg-[#fff9f2] text-[#171514]">
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-14">
        <div className="rounded-[2rem] border border-[#eaded2] bg-white/70 p-6 shadow-[0_26px_80px_rgba(52,34,20,.07)] md:p-9">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,.85fr)_minmax(360px,.55fr)] lg:items-end">
            <div>
              <div className="text-sm font-black uppercase tracking-[.18em] text-[#d96612]">{zh ? "PBTI 性格图鉴" : "PBTI personality library"}</div>
              <h1 className="mt-4 max-w-4xl text-[42px] font-black leading-[.94] tracking-[-.04em] md:text-7xl">
                {zh ? "12 种爱宠性格" : "12 pet personality types"}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#655a51]">
{zh ? "完整了解 PBTI 四字母性格体系。每种类型都包含专属名称、行为特点和相处建议，帮助你读懂爱宠的测试结果。" : "A clean reference for the full PBTI code system. Each profile uses a four-letter type as the main identity, with the personality name, behavior cues, and care style behind the result your pet may receive."}
              </p>
            <div className="mt-6 inline-flex rounded-full border border-[#eaded2] bg-white p-1 shadow-sm" aria-label={zh ? "选择物种形象" : "Choose species artwork"}>
              {(["cat", "dog"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSpecies(option)}
                  className={"rounded-full px-5 py-2 text-sm font-black transition " + (species === option ? "bg-[#ff7a1a] text-white shadow-sm" : "text-[#6b5f55] hover:bg-[#fff0e4]")}
                >
                  {option === "dog" ? (zh ? "狗狗形象" : "Dog artwork") : (zh ? "猫咪形象" : "Cat artwork")}
                </button>
              ))}
            </div>
            </div>
            <div className="grid gap-4 rounded-[1.5rem] bg-[#fff9f2] p-4">
              <div className="rounded-[1.2rem] border border-[#eaded2] bg-white p-4 shadow-sm">
                <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? "代码含义" : "Code logic"}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black text-[#6b5f55]">
                  <div className="rounded-xl bg-[#fff8ef] px-3 py-2"><span className="text-[#ff7a1a]">A/I</span> {zh ? "亲密 / 独立" : "Bond vs independence"}</div>
                  <div className="rounded-xl bg-[#fff8ef] px-3 py-2"><span className="text-[#ff7a1a]">E/S</span> {zh ? "探索 / 稳定" : "Explore vs stable"}</div>
                  <div className="rounded-xl bg-[#fff8ef] px-3 py-2"><span className="text-[#ff7a1a]">V/C</span> {zh ? "活力 / 沉静" : "Vital vs calm"}</div>
                  <div className="rounded-xl bg-[#fff8ef] px-3 py-2"><span className="text-[#ff7a1a]">P/G</span> {zh ? "玩乐 / 守护" : "Play vs guard"}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-[1rem] bg-white px-3 py-4 shadow-sm">
                  <div className="text-2xl font-black text-[#ff7a1a]">12</div>
                  <div className="mt-1 text-xs font-black text-[#6b5f55]">{zh ? "类型代码" : "Codes"}</div>
                </div>
                <div className="rounded-[1rem] bg-white px-3 py-4 shadow-sm">
                  <div className="text-2xl font-black text-[#ff7a1a]">2</div>
                  <div className="mt-1 text-xs font-black text-[#6b5f55]">{zh ? "物种" : "Species"}</div>
                </div>
                <div className="rounded-[1rem] bg-white px-3 py-4 shadow-sm">
                  <div className="text-2xl font-black text-[#ff7a1a]">28</div>
                  <div className="mt-1 text-xs font-black text-[#6b5f55]">{zh ? "行为题" : "Signals"}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/create" className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(255,122,26,.26)] transition hover:-translate-y-1 hover:bg-[#ee6b10]">
                  {zh ? "免费开始测试" : "Start the free test"}
                </Link>
                <Link href="/" className="rounded-full border border-[#eaded2] bg-white/85 px-6 py-3 text-sm font-black text-[#171514] transition hover:-translate-y-1">
                  {zh ? "返回首页" : "Back to home"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {typeDetails.map((type, index) => {
            const copy = zh ? zhTypeDetails[type.code] : type;
            return (
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
                  {species === "dog" ? (zh ? "狗狗类型" : "Dog type") : (zh ? "猫咪类型" : "Cat type")}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{String(index + 1).padStart(2, "0")}</div>
                    <h2 className="mt-1 text-[2.6rem] font-black leading-none tracking-[-.06em] text-[#171514]">{type.code}</h2>
                    <div className="mt-2 text-lg font-black tracking-[-.03em] text-[#d96612]">{copy.name}</div>
                  </div>
                  <SpeciesStatus species={species} zh={zh} />
                </div>
                <p className="mt-4 min-h-[72px] text-sm leading-6 text-[#655a51]">{copy.tone}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {copy.traits.map((trait) => (
                    <span key={trait} className="rounded-full border border-[#f0dac5] bg-[#fff8ef] px-3 py-1.5 text-xs font-black text-[#72543a]">
                      {trait}
                    </span>
                  ))}
                </div>
                <div className="mt-5 border-t border-[#f0e2d5] pt-4">
                  <div className="text-xs font-black uppercase tracking-[.14em] text-[#d96612]">{zh ? "相处建议" : "Care cue"}</div>
                  <p className="mt-2 text-sm leading-6 text-[#655a51]">{copy.care}</p>
                </div>
              </div>
            </article>
          )})}
        </div>
      </section>
    </main>
  );
}
