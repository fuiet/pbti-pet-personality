export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#33251d] flex items-center justify-center px-6">
      <section className="max-w-3xl text-center">
        <div className="text-6xl mb-6">🐾</div>
        <h1 className="text-5xl font-bold mb-4">PBTI™</h1>
        <h2 className="text-2xl mb-6">Pet Behavior Type Indicator</h2>
        <p className="text-lg leading-8 mb-8">
          Discover your pet's unique personality through behavior analysis.
          Upload a photo, answer questions, and reveal your pet's personality type.
        </p>
        <a
          href="/create"
          className="inline-block rounded-full bg-[#8b5e3c] px-8 py-4 text-white font-semibold"
        >
          Start Analysis
        </a>
      </section>
    </main>
  );
}
