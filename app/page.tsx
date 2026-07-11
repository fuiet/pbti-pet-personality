import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Photo-aware start",
    body: "Begin with a pet profile and image so the report feels personal from the first step.",
    index: "01",
  },
  {
    title: "Behavior questions",
    body: "A focused question flow maps daily habits into four readable personality dimensions.",
    index: "02",
  },
  {
    title: "PBTI result",
    body: "Each pet receives a type, traits, care advice, and a share-friendly personality card.",
    index: "03",
  },
  {
    title: "Premium report",
    body: "Upgrade paths support deeper analysis, lifetime profiles, and memory-book experiences.",
    index: "04",
  },
];

const steps = [
  ["Create profile", "Add your pet's name, species, breed, and age."],
  ["Upload photo", "Choose a clear image for the visual personality flow."],
  ["Answer quiz", "Complete the short PBTI behavior assessment."],
  ["Read report", "Review traits, DNA scores, advice, and next steps."],
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

const FeatureCard = ({ title, body, index }: { title: string; body: string; index: string }) => (
  <article className="group relative overflow-hidden rounded-2xl border border-[#eaded2] bg-white p-7 shadow-[0_20px_60px_rgba(52,34,20,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(255,122,26,.14)]">
    <div className="text-sm font-black text-[#ff7a1a]">{index}</div>
    <h3 className="mt-5 text-2xl font-black tracking-[-.03em] text-[#171514]">{title}</h3>
    <p className="mt-3 text-sm leading-7 text-[#655a51]">{body}</p>
  </article>
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

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fff9f2] text-[#171514]">
      <header className="sticky top-0 z-50 border-b border-[#eaded2]/70 bg-[#fff9f2]/86 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <BrandLogo compact />
          <div className="hidden items-center gap-9 text-sm font-bold text-[#4f463f] lg:flex">
            <a href="#features" className="transition hover:text-[#ff7a1a]">Features</a>
            <a href="#how" className="transition hover:text-[#ff7a1a]">How it works</a>
            <a href="#types" className="transition hover:text-[#ff7a1a]">Types</a>
            <Link href="/premium" className="transition hover:text-[#ff7a1a]">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-full border border-[#eaded2] bg-white/70 px-5 py-3 text-sm font-bold text-[#171514] shadow-sm transition hover:bg-white md:block">
              Sign in
            </Link>
            <Link href="/create" className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]">
              Start free
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-16 lg:min-h-[700px] lg:grid-cols-[.9fr_1.1fr]">
        <div className="relative z-10">
          <h1 className="max-w-3xl text-[54px] font-black leading-[.92] tracking-[-.07em] text-[#171514] md:text-[78px]">
            发现它真正的性格
            <span className="mt-3 block text-[#ff7a1a]">科学・专业・有趣</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#655a51]">
            基于猫狗行为学研究的 PBTI 性格测评。通过 36 道行为问题，结合外貌特征和日常习惯，为你的宠物生成专属性格分类、深度报告和写真海报。
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="/create" className="rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_22px_50px_rgba(255,122,26,.34)] transition hover:-translate-y-1 hover:bg-[#ee6b10]">
              开始免费测试
            </Link>
            <Link href="/premium" className="rounded-full border border-[#eaded2] bg-white/85 px-8 py-4 text-center font-black text-[#171514] shadow-[0_16px_45px_rgba(52,34,20,.07)] transition hover:-translate-y-1">
              查看 12 种性格类型
            </Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 text-sm text-[#655a51] sm:grid-cols-4">
            <div className="rounded-2xl border border-[#eaded2] bg-white/80 p-4 shadow-[0_14px_30px_rgba(52,34,20,.05)]">
              <strong className="block text-3xl font-black text-[#171514]">36</strong>
              行为问题
            </div>
            <div className="rounded-2xl border border-[#eaded2] bg-white/80 p-4 shadow-[0_14px_30px_rgba(52,34,20,.05)]">
              <strong className="block text-3xl font-black text-[#171514]">12</strong>
              性格分类
            </div>
            <div className="rounded-2xl border border-[#eaded2] bg-white/80 p-4 shadow-[0_14px_30px_rgba(52,34,20,.05)]">
              <strong className="block text-3xl font-black text-[#171514]">10+</strong>
              深度报告
            </div>
            <div className="rounded-2xl border border-[#eaded2] bg-white/80 p-4 shadow-[0_14px_30px_rgba(52,34,20,.05)]">
              <strong className="block text-3xl font-black text-[#171514]">3</strong>
              写真海报
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[500px] items-center justify-center">
          <div className="absolute inset-8 rounded-[2rem] bg-gradient-to-br from-white via-[#fff0df] to-[#ffd5a8] shadow-[0_35px_100px_rgba(52,34,20,.1)]" />
          <img
            src="/hero-pets.png?v=2"
            alt="A happy cat and dog together wearing PBTI tags"
            className="relative z-10 h-auto w-full max-w-[600px] object-contain drop-shadow-[0_24px_50px_rgba(52,34,20,.16)]"
          />
          <div className="absolute bottom-8 left-8 z-20 rounded-2xl border border-[#eaded2] bg-white/90 p-4 shadow-[0_18px_50px_rgba(52,34,20,.1)]">
            <div className="text-xs font-black uppercase tracking-[.12em] text-[#d96612]">Sample type</div>
            <div className="mt-1 text-2xl font-black">Guardian</div>
            <div className="text-sm text-[#655a51]">Steady, loyal, and protective.</div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-4xl font-black tracking-[-.04em]">A complete pet personality flow</h2>
          <p className="mt-3 text-[#655a51]">The site now has a clearer story from discovery to report, with each step pointing to the next action.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => <FeatureCard key={feature.index} {...feature} />)}
        </div>
      </section>

      <section id="how" className="border-y border-[#eaded2]/80 bg-white/55 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-4xl font-black tracking-[-.04em]">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map(([title, body], index) => (
              <article key={title} className="rounded-2xl bg-[#fff9f2] p-6">
                <div className="text-sm font-black text-[#ff7a1a]">0{index + 1}</div>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#655a51]">{body}</p>
              </article>
            ))}
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
