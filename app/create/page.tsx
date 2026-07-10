"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePet() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"cat" | "dog">("cat");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [step, setStep] = useState(1);

  function saveProfile() {
    if (!name.trim()) return;
    localStorage.setItem(
      "pbti_pet",
      JSON.stringify({
        name: name.trim(),
        species,
        breed: breed.trim(),
        age: age.trim(),
      })
    );
    router.push("/upload");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      {/* Steps indicator */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition ${
                s === step
                  ? "bg-[#ff7a1a] text-white"
                  : s < step
                  ? "bg-[#8b5e3c] text-white"
                  : "border-2 border-[#eaded2] text-[#a3968a]"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
            {s < 4 && (
              <div
                className={`h-0.5 w-8 transition ${
                  s < step ? "bg-[#8b5e3c]" : "bg-[#eaded2]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-black tracking-[-.04em] text-[#171514]">
        Create Your Pet Profile
      </h1>
      <p className="mt-2 text-sm text-[#7a6d63]">
        Tell us about your pet to begin the personality discovery journey.
      </p>

      <div className="mt-8 space-y-5">
        {/* Pet Name */}
        <div>
          <label className="mb-2 block text-sm font-bold text-[#4f463f]">Pet Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border-2 border-[#eaded2] bg-white p-4 text-sm font-semibold text-[#171514] outline-none transition placeholder:text-[#a3968a] focus:border-[#ff7a1a]/50"
            placeholder="Enter your pet's name"
          />
        </div>

        {/* Species */}
        <div>
          <label className="mb-2 block text-sm font-bold text-[#4f463f]">Species</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSpecies("cat")}
              className={`rounded-2xl border-2 p-5 text-center transition ${
                species === "cat"
                  ? "border-[#ff7a1a] bg-[#fff0e4] shadow-sm"
                  : "border-[#eaded2] bg-white hover:border-[#ff7a1a]/30"
              }`}
            >
              <div className="text-3xl">🐱</div>
              <div className="mt-1 text-sm font-bold">Cat</div>
            </button>
            <button
              onClick={() => setSpecies("dog")}
              className={`rounded-2xl border-2 p-5 text-center transition ${
                species === "dog"
                  ? "border-[#ff7a1a] bg-[#fff0e4] shadow-sm"
                  : "border-[#eaded2] bg-white hover:border-[#ff7a1a]/30"
              }`}
            >
              <div className="text-3xl">🐶</div>
              <div className="mt-1 text-sm font-bold">Dog</div>
            </button>
          </div>
        </div>

        {/* Breed */}
        <div>
          <label className="mb-2 block text-sm font-bold text-[#4f463f]">Breed (optional)</label>
          <input
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="w-full rounded-2xl border-2 border-[#eaded2] bg-white p-4 text-sm font-semibold text-[#171514] outline-none transition placeholder:text-[#a3968a] focus:border-[#ff7a1a]/50"
            placeholder={species === "cat" ? "e.g. Persian, Siamese" : "e.g. Golden Retriever, Poodle"}
          />
        </div>

        {/* Age */}
        <div>
          <label className="mb-2 block text-sm font-bold text-[#4f463f]">Age (optional)</label>
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-2xl border-2 border-[#eaded2] bg-white p-4 text-sm font-semibold text-[#171514] outline-none transition placeholder:text-[#a3968a] focus:border-[#ff7a1a]/50"
            placeholder="e.g. 3 years"
          />
        </div>
      </div>

      <button
        onClick={saveProfile}
        disabled={!name.trim()}
        className="mt-8 w-full rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to Photo →
      </button>
    </div>
  );
}
