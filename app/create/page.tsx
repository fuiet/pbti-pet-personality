"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPersonalityAsset, type PetSpecies } from "@/data/personalityAssets";
import { getBreedDisplayName } from "@/data/breedLocalization";
import { createPetRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useLanguage } from "@/components/LanguageProvider";

const progressSteps = ["Profile", "Photo", "Test", "Report"] as const;

const catBreedOptions = [
  "Abyssinian",
  "American Bobtail",
  "American Curl",
  "American Shorthair",
  "Balinese",
  "Bengal",
  "Birman",
  "Bombay",
  "British Longhair",
  "British Shorthair",
  "Burmese",
  "Chartreux",
  "Cornish Rex",
  "Devon Rex",
  "Egyptian Mau",
  "Exotic Shorthair",
  "Himalayan",
  "Japanese Bobtail",
  "Maine Coon",
  "Manx",
  "Munchkin",
  "Norwegian Forest Cat",
  "Oriental Shorthair",
  "Persian",
  "Ragdoll",
  "Russian Blue",
  "Savannah",
  "Scottish Fold",
  "Selkirk Rex",
  "Siamese",
  "Siberian",
  "Singapura",
  "Snowshoe",
  "Somali",
  "Sphynx",
  "Tonkinese",
  "Turkish Angora",
  "Turkish Van",
] as const;

const dogBreedOptions = [
  "Akita",
  "Alaskan Malamute",
  "Australian Shepherd",
  "Basenji",
  "Basset Hound",
  "Beagle",
  "Bichon Frise",
  "Border Collie",
  "Boston Terrier",
  "Boxer",
  "Cavalier King Charles Spaniel",
  "Chihuahua",
  "Chow Chow",
  "Cocker Spaniel",
  "Dachshund",
  "Doberman Pinscher",
  "French Bulldog",
  "German Shepherd",
  "Golden Retriever",
  "Great Dane",
  "Havanese",
  "Jack Russell Terrier",
  "Labrador Retriever",
  "Maltese",
  "Miniature Schnauzer",
  "Papillon",
  "Pekingese",
  "Pembroke Welsh Corgi",
  "Pomeranian",
  "Poodle",
  "Pug",
  "Rottweiler",
  "Samoyed",
  "Shetland Sheepdog",
  "Shiba Inu",
  "Shih Tzu",
  "Siberian Husky",
  "Toy Poodle",
  "West Highland White Terrier",
  "Whippet",
  "Yorkshire Terrier",
] as const;

const ageOptions = [
  "Under 6 months",
  "6-12 months",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6-8 years",
  "9-11 years",
  "12+ years",
] as const;

const createPageDecorations = [
  {
    code: "ASVG",
    species: "cat",
    className: "left-[7%] top-24 w-28 -rotate-12 md:w-36",
  },
  {
    code: "IEVP",
    species: "dog",
    className: "right-[8%] top-36 w-32 rotate-6 md:w-44",
  },
  {
    code: "ISCP",
    species: "cat",
    className: "left-[10%] bottom-12 w-24 rotate-6 md:w-36",
  },
  {
    code: "AECP",
    species: "dog",
    className: "right-[14%] bottom-14 w-28 -rotate-6 md:w-40",
  },
] satisfies ReadonlyArray<{ code: string; species: PetSpecies; className: string }>;

export default function CreatePet() {
  const router = useRouter();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const { loading } = useRequireAuth();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"cat" | "dog">("cat");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [step] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [breedMenuOpen, setBreedMenuOpen] = useState(false);
  const [ageMenuOpen, setAgeMenuOpen] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const breedOptions = species === "cat" ? catBreedOptions : dogBreedOptions;
  const localizedAgeOptions = zh
    ? ["6 个月以内", "6–12 个月", "1 岁", "2 岁", "3 岁", "4 岁", "5 岁", "6–8 岁", "9–11 岁", "12 岁以上"]
    : ageOptions;

  async function saveProfile() {
    if (isSaving) return;

    if (!name.trim()) {
      setProfileError(zh ? "请先填写爱宠的名字。" : "Please enter your pet's name before continuing.");
      return;
    }

    setProfileError(null);
    setIsSaving(true);

    try {
      const pet = await createPetRecord({
        name: name.trim(),
        species,
        breed: breed.trim(),
        age: age.trim(),
        gender: gender || undefined,
      });

      router.push(`/upload?petId=${pet.id}`);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : zh ? "暂时无法保存测试信息，请稍后重试。" : "We could not save this test setup. Please try again.");
      setIsSaving(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">{zh ? "正在加载…" : "Loading..."}</div>;
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,122,26,.10),transparent_28%),radial-gradient(circle_at_85%_28%,rgba(255,184,120,.18),transparent_28%),radial-gradient(circle_at_75%_88%,rgba(255,122,26,.08),transparent_30%)]" />
      {createPageDecorations.map((item) => (
        <img
          key={`${item.species}-${item.code}`}
          src={getPersonalityAsset(item.code, item.species)}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute hidden object-contain drop-shadow-[0_22px_35px_rgba(52,34,20,.18)] sm:block ${item.className}`}
        />
      ))}
      <div className="relative z-10 mx-auto max-w-2xl">
      <div className="mb-10 flex items-center justify-center gap-2">
        {progressSteps.map((label, index) => {
          const current = index + 1;
          const active = current === step;
          const done = current < step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition ${
                  active
                    ? "bg-[#ff7a1a] text-white"
                    : done
                    ? "bg-[#8b5e3c] text-white"
                    : "border-2 border-[#eaded2] text-[#a3968a]"
                }`}
              >
                {done ? "OK" : current}
              </div>
              {current < progressSteps.length && <div className={`h-0.5 w-8 transition ${done ? "bg-[#8b5e3c]" : "bg-[#eaded2]"}`} />}
            </div>
          );
        })}
      </div>

      <h1 className="text-3xl font-black tracking-[-.04em] text-[#171514]">{zh ? "开始爱宠性格测试" : "Start Your Pet Personality Test"}</h1>
      <p className="mt-2 text-sm text-[#7a6d63]">{zh ? "先认识一下你的爱宠，再开始探索它的独特性格。" : "Tell us about your pet to begin the personality discovery journey."}</p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#4f463f]">{zh ? "爱宠名字" : "Pet Name"}</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (profileError) setProfileError(null);
            }}
            className="w-full rounded-2xl border-2 border-[#eaded2] bg-white p-4 text-sm font-semibold text-[#171514] outline-none transition placeholder:text-[#a3968a] focus:border-[#ff7a1a]/50"
            placeholder={zh ? "请输入爱宠的名字" : "Enter your pet's name"}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#4f463f]">{zh ? "物种" : "Species"}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setSpecies("cat");
                setBreedMenuOpen(false);
              }}
              className={`rounded-2xl border-2 p-5 text-center transition ${
                species === "cat"
                  ? "border-[#ff7a1a] bg-[#fff0e4] shadow-sm"
                  : "border-[#eaded2] bg-white hover:border-[#ff7a1a]/30"
              }`}
            >
              <div className="text-3xl font-black text-[#ff7a1a]">{zh ? "猫咪" : "Cat"}</div>
              <div className="mt-1 text-sm font-bold">{zh ? "猫" : "Cat"}</div>
            </button>
            <button
              onClick={() => {
                setSpecies("dog");
                setBreedMenuOpen(false);
              }}
              className={`rounded-2xl border-2 p-5 text-center transition ${
                species === "dog"
                  ? "border-[#ff7a1a] bg-[#fff0e4] shadow-sm"
                  : "border-[#eaded2] bg-white hover:border-[#ff7a1a]/30"
              }`}
            >
              <div className="text-3xl font-black text-[#ff7a1a]">{zh ? "狗狗" : "Dog"}</div>
              <div className="mt-1 text-sm font-bold">{zh ? "狗" : "Dog"}</div>
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#4f463f]">{zh ? "品种（选填）" : "Breed (optional)"}</label>
          <div className="relative">
            <input
              value={getBreedDisplayName(breed, language)}
              onChange={(e) => setBreed(e.target.value)}
              onFocus={() => setBreedMenuOpen(false)}
              className="w-full rounded-2xl border-2 border-[#eaded2] bg-white p-4 pr-14 text-sm font-semibold text-[#171514] outline-none transition placeholder:text-[#a3968a] focus:border-[#ff7a1a]/50"
              placeholder={zh ? `选择或输入${species === "cat" ? "猫咪" : "狗狗"}品种` : species === "cat" ? "Choose or type a cat breed" : "Choose or type a dog breed"}
            />
            <button
              type="button"
              aria-label={zh ? "选择品种" : "Choose breed"}
              aria-expanded={breedMenuOpen}
              onClick={() => {
                setBreedMenuOpen((open) => !open);
                setAgeMenuOpen(false);
              }}
              className="absolute inset-y-2 right-2 grid w-11 place-items-center rounded-xl bg-[#fff7ed] text-[#171514] transition hover:bg-[#fff0e4] focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]/30"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 transition ${breedMenuOpen ? "rotate-180" : ""}`}>
                <path d="M5.5 7.5 10 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {breedMenuOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+.5rem)] z-30 max-h-64 overflow-auto rounded-2xl border border-[#eaded2] bg-white p-2 shadow-[0_18px_45px_rgba(52,34,20,.14)]">
                {breedOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setBreed(option);
                      setBreedMenuOpen(false);
                    }}
                    className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition hover:bg-[#fff0e4] ${breed === option ? "bg-[#fff0e4] text-[#ff7a1a]" : "text-[#4f463f]"}`}
                  >
                    {getBreedDisplayName(option, language)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0">
            <label className="mb-2 block text-sm font-bold text-[#4f463f]">{zh ? "年龄（选填）" : "Age (optional)"}</label>
            <div className="relative">
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              onFocus={() => setAgeMenuOpen(false)}
              className="w-full rounded-2xl border-2 border-[#eaded2] bg-white p-4 pr-14 text-sm font-semibold text-[#171514] outline-none transition placeholder:text-[#a3968a] focus:border-[#ff7a1a]/50"
              placeholder={zh ? "选择或输入年龄" : "Choose or type an age"}
            />
            <button
              type="button"
              aria-label={zh ? "选择年龄" : "Choose age"}
              aria-expanded={ageMenuOpen}
              onClick={() => {
                setAgeMenuOpen((open) => !open);
                setBreedMenuOpen(false);
              }}
              className="absolute inset-y-2 right-2 grid w-11 place-items-center rounded-xl bg-[#fff7ed] text-[#171514] transition hover:bg-[#fff0e4] focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]/30"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 transition ${ageMenuOpen ? "rotate-180" : ""}`}>
                <path d="M5.5 7.5 10 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {ageMenuOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+.5rem)] z-30 max-h-64 overflow-auto rounded-2xl border border-[#eaded2] bg-white p-2 shadow-[0_18px_45px_rgba(52,34,20,.14)]">
                {localizedAgeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setAge(option);
                      setAgeMenuOpen(false);
                    }}
                    className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition hover:bg-[#fff0e4] ${age === option ? "bg-[#fff0e4] text-[#ff7a1a]" : "text-[#4f463f]"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
            </div>
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-bold text-[#4f463f]">{zh ? "性别（选填）" : "Sex (optional)"}</label>
            <div translate="no" className="notranslate grid h-[60px] grid-cols-2 gap-2 rounded-2xl border-2 border-[#eaded2] bg-white p-1.5">
              {(["male", "female"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  translate="no"
                  data-no-translation="true"
                  aria-pressed={gender === option}
                  onClick={() => setGender((current) => current === option ? "" : option)}
                  className={`rounded-xl text-sm font-black transition ${gender === option ? "bg-[#ff7a1a] text-white shadow-sm" : "bg-[#fff7ed] text-[#4f463f] hover:bg-[#fff0e4]"}`}
                >
                  {option === "male" ? (zh ? "公" : "Male") : (zh ? "母" : "Female")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {profileError ? (
        <div className="mt-6 rounded-2xl border border-[#ffd2ad] bg-[#fff7ed] px-4 py-3 text-sm font-bold text-[#9b3f10]">
          {profileError}
        </div>
      ) : null}

      <button
        type="button"
        onClick={saveProfile}
        disabled={isSaving}
        className="mt-8 w-full rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10] disabled:cursor-wait disabled:opacity-70"
      >
        {isSaving ? (zh ? "正在保存…" : "Saving test setup...") : (zh ? "下一步：上传照片" : "Continue to Photo")}
      </button>
      </div>
    </div>
  );
}
