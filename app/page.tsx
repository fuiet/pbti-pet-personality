const LogoMark = ({ size = 84 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M23 106V31C23 18.3 33.3 8 46 8h20c28.7 0 52 23.3 52 52s-23.3 52-52 52H47" stroke="#171514" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M42 66C48 53 60 45 75 45c14 0 26 10 29 24" stroke="#171514" strokeWidth="6" strokeLinecap="round" />
    <path d="M40 39C43 24 58 17 74 21c13 3 23 13 25 26" stroke="#171514" strokeWidth="6" strokeLinecap="round" />
    <path d="M45 37c5 11 4 21-3 29" stroke="#171514" strokeWidth="6" strokeLinecap="round" />
    <path d="M55 65l8-15 9 15" stroke="#171514" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M50 90c7-14 18-21 34-23" stroke="#171514" strokeWidth="6" strokeLinecap="round" />
    <path d="M84 47c6 0 11 3 15 8" stroke="#171514" strokeWidth="6" strokeLinecap="round" />
    <circle cx="78" cy="34" r="4" fill="#171514" />
    <circle cx="69" cy="69" r="3.6" fill="#171514" />
    <path d="M75 77c5-1 9-1 13 0" stroke="#171514" strokeWidth="3" strokeLinecap="round" />
    <path d="M74 84c5-1 9-1 13 0" stroke="#171514" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const BrandLogo = ({ compact = false }: { compact?: boolean }) => (
  <a href="/" className="block shrink-0" aria-label="PBTI Home">
    <img
      src="/logo.png"
      alt="PBTI Pet Behavior Type Indicator"
      className={compact ? "h-[90px] w-auto object-contain" : "h-[130px] w-auto object-contain"}
    />
  </a>
);

const FeatureCard = ({ icon, title, body, index }: { icon: string; title: string; body: string; index: string }) => (
  <div className="group relative overflow-hidden rounded-[2rem] border border-[#eaded2] bg-white/80 p-7 shadow-[0_24px_70px_rgba(52,34,20,.07)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_34px_90px_rgba(255,122,26,.16)]">
    <div className="grid h-16 w-16 place-items-center rounded-full bg-[#fff0e4] text-3xl text-[#ff7a1a]">{icon}</div>
    <h3 className="mt-7 text-2xl font-black tracking-[-.04em] text-[#171514]">{title}</h3>
    <p className="mt-3 text-sm leading-7 text-[#655a51]">{body}</p>
    <div className="absolute bottom-6 right-7 text-xl font-black text-[#d5c4b6]">{index}</div>
  </div>
);

const PersonalityCard = ({ icon, name, desc, tint }: { icon: string; name: string; desc: string; tint: string }) => (
  <div className="min-w-[190px] overflow-hidden rounded-[1.8rem] border border-[#eaded2] bg-white shadow-[0_20px_55px_rgba(52,34,20,.08)]">
    <div className={`grid h-36 place-items-center ${tint} text-6xl`}>{icon}</div>
    <div className="p-5 text-center">
      <div className="text-lg font-black tracking-[-.03em] text-[#171514]">{name}</div>
      <div className="mt-1 text-sm text-[#7a6d63]">{desc}</div>
    </div>
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fff9f2] text-[#171514]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute right-[-10rem] top-[-8rem] h-[42rem] w-[42rem] rounded-full bg-[#ffb570]/35 blur-3xl" />
        <div className="absolute left-[-12rem] top-[20rem] h-[35rem] w-[35rem] rounded-full bg-[#f8e7d2]/70 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-[#eaded2]/70 bg-[#fff9f2]/78 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <BrandLogo compact />
          <div className="hidden items-center gap-10 text-sm font-bold text-[#4f463f] lg:flex">
            <a href="#features" className="hover:text-[#ff7a1a]">Features</a>
            <a href="#how" className="hover:text-[#ff7a1a]">How it Works</a>
            <a href="#personalities" className="hover:text-[#ff7a1a]">Personalities</a>
            <a href="/premium" className="hover:text-[#ff7a1a]">Pricing</a>
            <a href="#about" className="hover:text-[#ff7a1a]">About</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="hidden rounded-full border border-[#eaded2] bg-white/60 px-6 py-3 text-sm font-bold text-[#171514] shadow-sm transition hover:bg-white md:block">Sign In</a>
            <a href="/create" className="rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]">Start Free →</a>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-20 lg:min-h-[720px] lg:grid-cols-[.92fr_1.08fr]">
        <div className="relative z-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-black text-[#d96612] shadow-sm ring-1 ring-[#ffd8bd]">
            ✦ AI-powered personality analysis
          </div>
          <h1 className="max-w-3xl text-[64px] font-black leading-[.92] tracking-[-.075em] text-[#171514] md:text-[88px]">
            Every <span className="bg-gradient-to-r from-[#ff7a1a] to-[#c35b16] bg-clip-text text-transparent">Paw</span>
            <span className="block">Has a Personality.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#655a51]">
            Discover your pet's unique behavioral DNA with AI vision, science, and 12 personality questions.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a href="/create" className="rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_22px_50px_rgba(255,122,26,.34)] transition hover:-translate-y-1">Start Free →</a>
            <a href="/report/sample" className="rounded-full border border-[#eaded2] bg-white/80 px-8 py-4 text-center font-black text-[#171514] shadow-[0_16px_45px_rgba(52,34,20,.07)] transition hover:-translate-y-1">▷ See Sample Report</a>
          </div>
          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {['🐱','🐶','🐈','🦮','🐕'].map((x) => <div key={x} className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-[#fff0e4] text-xl shadow-sm">{x}</div>)}
            </div>
            <div className="text-sm leading-6 text-[#655a51]"><span className="font-black text-[#ff7a1a]">★★★★★ 4.9</span><br />Loved by 50,000+ pet parents worldwide</div>
          </div>
        </div>

        <div className="relative flex min-h-[560px] items-center justify-center">
          <div className="relative z-10 w-full max-w-[600px] overflow-hidden rounded-[2.5rem] p-4">
            <img
              src="/hero-pets.png"
              alt="A happy cat and dog together wearing PBTI tags"
              className="h-auto w-full rounded-[2rem] object-contain drop-shadow-[0_20px_50px_rgba(52,34,20,.1)]"
            />
          </div>

          <div className="particle h-2 w-2 left-[8%] top-[22%] animate-float" style={{ animationDelay: '0s' }} />
          <div className="particle h-3 w-3 left-[15%] top-[60%] animate-float-reverse" style={{ animationDelay: '0.7s' }} />
          <div className="particle h-2.5 w-2.5 left-[24%] top-[85%] animate-float" style={{ animationDelay: '1.4s' }} />
          <div className="particle h-4 w-4 left-[6%] top-[78%] animate-pulse-glow" style={{ animationDelay: '0.3s' }} />
          <div className="particle h-2 w-2 right-[10%] top-[18%] animate-float-reverse" style={{ animationDelay: '0.5s' }} />
          <div className="particle h-3 w-3 right-[18%] top-[55%] animate-float" style={{ animationDelay: '1.1s' }} />
          <div className="particle h-2.5 w-2.5 right-[8%] top-[82%] animate-float-reverse" style={{ animationDelay: '1.8s' }} />
          <div className="particle h-4 w-4 right-[22%] top-[30%] animate-pulse-glow" style={{ animationDelay: '0.9s' }} />
          <div className="particle h-2 w-2 left-[40%] top-[10%] animate-float" style={{ animationDelay: '2.1s' }} />
          <div className="particle h-2 w-2 right-[42%] top-[88%] animate-float-reverse" style={{ animationDelay: '2.5s' }} />
        </div>
      </section>

      <section className="border-y border-[#eaded2]/80 bg-white/40 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-16 gap-y-4 px-6 text-sm font-black text-[#8a7c70]">
          <span>Petkit</span><span>vetstreet</span><span>Rover</span><span>Tractive</span><span>PetMD</span><span>Chewy</span>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon="📸" title="AI Vision" body="Advanced AI identifies facial features, expressions, and behavioral patterns." index="01" />
          <FeatureCard icon="🧠" title="Behavior Analysis" body="12 science-based questions analyze your pet's daily behaviors and habits." index="02" />
          <FeatureCard icon="🧬" title="Personality DNA" body="Our AI maps each pet across personality dimensions designed for cats and dogs." index="03" />
          <FeatureCard icon="🪪" title="Lifetime Profile" body="Get a beautiful, shareable report and a permanent Personality ID for your pet." index="04" />
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 text-center text-3xl font-black tracking-[-.04em]">🐾 How it works</div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[#eaded2] bg-white/75 p-8 shadow-[0_24px_65px_rgba(52,34,20,.07)]">
            <div className="text-4xl font-black text-[#ff7a1a]">01</div>
            <h3 className="mt-8 text-2xl font-black">Upload Photo</h3>
            <p className="mt-3 text-sm leading-7 text-[#655a51]">Upload a clear photo of your cat or dog.</p>
          </div>
          <div className="rounded-[2rem] border border-[#eaded2] bg-white/75 p-8 shadow-[0_24px_65px_rgba(52,34,20,.07)]">
            <div className="text-4xl font-black text-[#ff7a1a]">02</div>
            <h3 className="mt-8 text-2xl font-black">Answer Questions</h3>
            <p className="mt-3 text-sm leading-7 text-[#655a51]">Answer 12 simple questions about their behavior.</p>
          </div>
          <div className="rounded-[2rem] border border-[#eaded2] bg-white/75 p-8 shadow-[0_24px_65px_rgba(52,34,20,.07)]">
            <div className="text-4xl font-black text-[#ff7a1a]">03</div>
            <h3 className="mt-8 text-2xl font-black">Discover Personality</h3>
            <p className="mt-3 text-sm leading-7 text-[#655a51]">AI generates a visual personality report you can revisit and share.</p>
          </div>
        </div>
      </section>

      <section id="personalities" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-7 flex items-end justify-between gap-6">
          <h2 className="text-3xl font-black tracking-[-.04em]">12 Unique Personality Types</h2>
          <a href="/quiz" className="text-sm font-black text-[#ff7a1a]">See all →</a>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4">
          <PersonalityCard icon="🔍" name="Explorer" desc="Curious" tint="bg-[#f7eadc]" />
          <PersonalityCard icon="🛡️" name="Guardian" desc="Loyal" tint="bg-[#fff0d6]" />
          <PersonalityCard icon="🌙" name="Dreamer" desc="Gentle" tint="bg-[#ece7f8]" />
          <PersonalityCard icon="⚡" name="Maverick" desc="Adventurous" tint="bg-[#ffe1ce]" />
          <PersonalityCard icon="📚" name="Scholar" desc="Intelligent" tint="bg-[#e8f0e8]" />
          <PersonalityCard icon="👑" name="Leader" desc="Confident" tint="bg-[#ffe6be]" />
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#eaded2] bg-gradient-to-r from-white via-[#fff0df] to-[#ffd8ad] p-10 shadow-[0_30px_90px_rgba(52,34,20,.1)] md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black tracking-[-.05em]">Ready to discover your pet's true personality?</h2>
            <p className="mt-5 text-lg leading-8 text-[#5f544d]">Join thousands of pet parents who understand their pets on a deeper level.</p>
            <a href="/create" className="mt-8 inline-block rounded-full bg-[#ff7a1a] px-8 py-4 font-black text-white shadow-[0_20px_45px_rgba(255,122,26,.32)]">Start Your Pet's Journey →</a>
          </div>
          <div className="absolute bottom-0 right-10 hidden text-[220px] leading-none md:block">🐱</div>
        </div>
      </section>

      <footer className="border-t border-[#eaded2] px-6 py-9">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-[#7a6d63] md:flex-row md:items-center">
          <BrandLogo compact />
          <div>© 2026 PBTI. Pet Behavior Type Indicator.</div>
        </div>
      </footer>
    </main>
  );
}
