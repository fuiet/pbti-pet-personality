"use client";

export default function Premium() {
  return (
    <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
      <section className="max-w-xl mx-auto">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">🐾</div>
          <h1 className="text-4xl font-bold mb-4">
            Complete Pet Personality Report
          </h1>
          <p className="leading-7">
            Discover what makes your pet unique and learn how to build a deeper bond.
          </p>

          <button className="mt-8 rounded-full bg-[#8b5e3c] px-10 py-4 text-white font-bold">
            Unlock Full Report · $9.99
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-8">
          <h2 className="text-2xl font-bold mb-5">Your Premium Report Includes</h2>

          <div className="space-y-5">
            <div>
              <h3 className="font-semibold">🐾 AI Appearance Analysis</h3>
              <p className="text-sm mt-1">
                Discover your pet's visual personality, expression and unique aura.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">🌙 Personality Deep Dive</h3>
              <p className="text-sm mt-1">
                Understand your pet's hidden traits, emotions and behaviors.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">❤️ Relationship Analysis</h3>
              <p className="text-sm mt-1">
                Learn how your pet expresses love and sees you.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">🏡 Personalized Care Guide</h3>
              <p className="text-sm mt-1">
                Get suggestions for interaction, environment and daily activities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">📸 Shareable Personality Card</h3>
              <p className="text-sm mt-1">
                Create a beautiful personality card for your pet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
