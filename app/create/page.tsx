export default function CreatePet() {
  return (
    <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Your Pet Profile</h1>

        <div className="space-y-4">
          <input className="w-full rounded-xl p-4 border" placeholder="Pet Name" />
          <select className="w-full rounded-xl p-4 border">
            <option>🐱 Cat</option>
            <option>🐶 Dog</option>
          </select>
          <input className="w-full rounded-xl p-4 border" placeholder="Breed" />
          <input className="w-full rounded-xl p-4 border" placeholder="Age" />
        </div>

        <a
          href="/quiz"
          className="mt-8 inline-block rounded-full bg-[#8b5e3c] px-8 py-4 text-white"
        >
          Continue
        </a>
      </div>
    </main>
  );
}
