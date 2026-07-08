const LogoMark = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M29 103V31C29 19.95 37.95 11 49 11h15c27.61 0 50 22.39 50 50s-22.39 50-50 50H49" stroke="#181614" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M48 72c7-4 13-7 22-8 5-1 8-4 11-8" stroke="#181614" strokeWidth="5" strokeLinecap="round"/>
    <path d="M47 37c7-16 30-15 41-1 5 6 5 14 0 20" stroke="#181614" strokeWidth="5" strokeLinecap="round"/>
    <path d="M52 40c8 0 15 5 18 12" stroke="#181614" strokeWidth="5" strokeLinecap="round"/>
    <path d="M49 70c0-12 9-23 22-23 12 0 21 9 21 20" stroke="#181614" strokeWidth="5" strokeLinecap="round"/>
    <path d="M54 69l7-12 7 12" stroke="#181614" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="79" cy="38" r="3.8" fill="#181614"/>
    <circle cx="70" cy="71" r="3.4" fill="#181614"/>
    <path d="M87 46c5 0 8 2 10 5" stroke="#181614" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

const TinyLogo = () => (
  <div className="flex items-center gap-3">
    <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-[0_14px_40px_rgba(24,22,20,.08)] ring-1 ring-black/5">
      <LogoMark size={34} />
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#ff7a1a]" />
    </div>
    <div className="leading-none">
      <div className="text-xl font-black tracking-tight">Pawly</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[.22em] text-[#8f847b]">Pet AI Studio</div>
    </div>
  </div>
);

const Feature = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
  <div className="group rounded-[2rem] border border-black/5 bg-white/70 p-7 shadow-[0_24px_80px_rgba(24,22,20,.06)] backdrop-blur transition duration-300 hover:-translate-y-2 hover:shadow-[0_34px_90px_rgba(255,122,26,.16)]">
    <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-[#fff1e7] text-2xl text-[#ff7a1a]">{icon}</div>
    <h3 className="text-xl font-black tracking-tight text-[#181614]">{title}</h3>
    <p className="mt-3 text-sm leading-7 text-[#6f655c]">{text}</p>
  </div>
);

const Personality = ({ emoji, name, desc }: { emoji: string; name: string; desc: string }) => (
  <div className="min-w-[210px] rounded-[2rem] border border-black/5 bg-white p-5 shadow-[0_20px_60px_rgba(24,22,20,.08)]">
    <div className="grid h-36 place-items-center rounded-[1.5rem] bg-gradient-to-br from-[#fff4ea] to-[#f4eee7] text-6xl">{emoji}</div>
    <div className="mt-5 text-lg font-black">{name}</div>
    <div className="mt-1 text-sm text-[#7d746d]">{desc}</div>
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf7f1] text-[#181614]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-[#ffb26f]/25 blur-3xl" />
        <div className="absolute right-[-10rem] top-[10rem] h-[38rem] w-[38rem] rounded-full bg-[#a7bfae]/25 blur-3xl" />
        <div className="absolute bottom-[-18rem] left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[#fff1d8]/60 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fbf7f1]/75 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <TinyLogo />
          <div className="hidden items-center gap-9 text-sm font-semibold text-[#5f574f] md:flex">
            <a href="#features" className="hover:text-[#181614]">Features</a>
            <a href="#how" className="hover:text-[#181614]">How it works</a>
            <a href="#personalities" className="hover:text-[#181614]">Personalities</a>
            <a href="/premium" className="hover:text-[#181614]">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="hidden rounded-full px-5 py-3 text-sm font-bold text-[#181614] ring-1 ring-black/10 md:block">Sign in</a>
            <a href="/create" className="rounded-full bg-[#181614] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(24,22,20,.18)] transition hover:scale-105">Start free</a>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.02fr_.98fr]">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ff7a1a]/20 bg-white/80 px-4 py-2 text-sm font-bold text-[#c85d12] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#ff7a1a]" /> AI-powered pet personality platform
          </div>
          <h1 className="max-w-4xl text-6xl font-black tracking-[-.06em] text-[#181614] md:text-8xl">
            Every Paw
            <span className="block bg-gradient-to-r from-[#ff7a1a] via-[#d66b26] to-[#181614] bg-clip-text text-transparent">Has a Personality.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-9 text-[#655d55] md:text-xl">
            Discover your pet's behavioral DNA with AI vision, science-based questions, and a lifelong personality profile designed for cats and dogs.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="/create" className="rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_20px_45px_rgba(255,122,26,.32)] transition hover:-translate-y-1 hover:bg-[#ee6b10]">Start your pet journey →</a>
            <a href="/report/sample" className="rounded-full bg-white px-8 py-4 text-center font-black text-[#181614] shadow-[0_18px_45px_rgba(24,22,20,.08)] ring-1 ring-black/10 transition hover:-translate-y-1">See sample report</a>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-[#6f655c]">
            <div><b className="text-[#181614]">50,000+</b> pet profiles</div>
            <div><b className="text-[#181614]">12</b> behavior questions</div>
            <div><b className="text-[#181614]">Cat & Dog</b> focused</div>
          </div>
        </div>

        <div className="relative mx-auto h-[560px] w-full max-w-[560px]">
          <div className="absolute inset-0 rounded-[4rem] bg-gradient-to-br from-white to-[#fff0df] shadow-[0_40px_120px_rgba(24,22,20,.12)] ring-1 ring-black/5" />
          <div className="absolute inset-8 rounded-[3rem] border border-white/70 bg-white/40 backdrop-blur" />
          <div className="absolute left-1/2 top-16 -translate-x-1/2">
            <div className="relative grid h-72 w-72 place-items-center rounded-full bg-[#181614] shadow-[0_30px_80px_rgba(24,22,20,.25)]">
              <LogoMark size={230} />
              <div className="absolute -right-6 top-12 rounded-3xl bg-white px-5 py-4 shadow-xl">
                <div className="text-sm font-black">Duoduo</div>
                <div className="text-xs text-[#8f847b]">The Curious Explorer</div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-12 left-10 right-10 rounded-[2rem] bg-[#181614] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#ffb26f]">Live preview</p>
                <h3 className="mt-2 text-2xl font-black">Personality Report</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">AI transforms behavior into a clear, emotional, shareable profile.</p>
              </div>
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white text-4xl">🐱</div>
            </div>
          </div>
          <div className="absolute right-8 top-8 h-5 w-5 rounded-full bg-[#ff7a1a]" />
          <div className="absolute bottom-40 left-4 h-3 w-3 rounded-full bg-[#a7bfae]" />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[.22em] text-[#ff7a1a]">Why Pawly</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] md:text-6xl">Built for pet parents who want more than a cute quiz.</h2>
          </div>
          <p className="max-w-md text-base leading-8 text-[#6f655c]">Pawly combines emotional design with structured behavioral analysis, creating a premium experience people want to share.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Feature icon="📷" title="AI Vision" text="Photo-first experience that makes the analysis feel personal from the first second." />
          <Feature icon="🧠" title="Behavior DNA" text="Questions designed around energy, curiosity, attachment, and social patterns." />
          <Feature icon="🪪" title="Lifetime ID" text="Every pet receives a memorable profile ID and a report that can be revisited." />
          <Feature icon="✨" title="Shareable Cards" text="Beautiful result cards built for TikTok, Instagram, X, and private sharing." />
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[3rem] bg-[#181614] p-8 text-white shadow-[0_40px_120px_rgba(24,22,20,.18)] md:p-12">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[.22em] text-[#ff9a4c]">How it works</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.04em] md:text-6xl">Three steps to your pet's personality.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["01", "Create", "Tell us who your pet is."],
                ["02", "Upload", "Add a clear photo for the profile."],
                ["03", "Discover", "Answer questions and unlock the report."],
              ].map(([n, title, text]) => (
                <div key={n} className="rounded-[2rem] bg-white/8 p-6 ring-1 ring-white/10">
                  <div className="text-3xl font-black text-[#ff9a4c]">{n}</div>
                  <div className="mt-8 text-2xl font-black">{title}</div>
                  <p className="mt-3 text-sm leading-7 text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="personalities" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[.22em] text-[#ff7a1a]">Personality system</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] md:text-6xl">Meet the PBTI types.</h2>
          </div>
          <a href="/quiz" className="hidden rounded-full bg-white px-6 py-3 font-black shadow-sm ring-1 ring-black/10 md:block">Try quiz</a>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-6">
          <Personality emoji="🧭" name="Explorer" desc="Curious, brave, active" />
          <Personality emoji="🛡️" name="Guardian" desc="Loyal, protective, calm" />
          <Personality emoji="🌙" name="Dreamer" desc="Gentle, sensitive, soft" />
          <Personality emoji="⚡" name="Maverick" desc="Wild, playful, bold" />
          <Personality emoji="🎓" name="Scholar" desc="Observant, smart, precise" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-[#fff1e4] to-white p-10 shadow-[0_30px_90px_rgba(24,22,20,.08)] ring-1 ring-black/5 md:p-14">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black tracking-[-.04em] md:text-6xl">Ready to understand your pet better?</h2>
            <p className="mt-6 text-lg leading-8 text-[#655d55]">Start with a free profile. Upgrade later for the full AI report, share cards, and deeper recommendations.</p>
            <a href="/create" className="mt-8 inline-block rounded-full bg-[#181614] px-8 py-4 font-black text-white">Start free →</a>
          </div>
          <div className="absolute -right-10 -top-10 hidden h-64 w-64 rounded-full bg-[#ff7a1a]/20 blur-2xl md:block" />
        </div>
      </section>

      <footer className="border-t border-black/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-[#7d746d] md:flex-row md:items-center">
          <TinyLogo />
          <div>© 2026 Pawly. Understand. Connect. Together.</div>
        </div>
      </footer>
    </main>
  );
}
