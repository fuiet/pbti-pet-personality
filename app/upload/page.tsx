"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { getLatestPetRecord, getPetRecord, updatePetPhoto, type PetRecord } from "@/lib/pbtiRecords";
import { useRequireAuth } from "@/lib/useRequireAuth";

function getPetIdFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("petId");
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { loading: authLoading } = useRequireAuth();
  const [preview, setPreview] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [pet, setPet] = useState<PetRecord | null>(null);
  const [loadingPet, setLoadingPet] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    const petId = getPetIdFromLocation();

    async function loadPet() {
      try {
        const record = petId ? await getPetRecord(petId) : await getLatestPetRecord();

        if (!active) return;

        if (!record) {
          router.replace("/create");
          return;
        }

        setPet(record);
        setPreview(record.photo_url || "");
      } catch {
        if (active) {
          setError("Unable to load your pet profile.");
        }
      } finally {
        if (active) {
          setLoadingPet(false);
        }
      }
    }

    loadPet();

    return () => {
      active = false;
    };
  }, [authLoading, router]);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/") || !pet) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = typeof e.target?.result === "string" ? e.target.result : "";
      if (!dataUrl) return;

      setPreview(dataUrl);

      try {
        await updatePetPhoto(pet.id, dataUrl);
      } catch {
        setError("Unable to save photo right now.");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  if (authLoading || loadingPet) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition ${
                s === 2
                  ? "bg-[#ff7a1a] text-white"
                  : s < 2
                  ? "bg-[#8b5e3c] text-white"
                  : "border-2 border-[#eaded2] text-[#a3968a]"
              }`}
            >
              {s < 2 ? "OK" : s}
            </div>
            {s < 4 && <div className={`h-0.5 w-8 transition ${s < 2 ? "bg-[#8b5e3c]" : "bg-[#eaded2]"}`} />}
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-black tracking-[-.04em] text-[#171514]">Upload a Photo</h1>
      <p className="mt-2 text-sm text-[#7a6d63]">
        {pet?.name ? `${pet.name}'s photo` : "Upload a clear photo of your pet for AI analysis"}
      </p>

      {error ? <p className="mt-4 rounded-2xl bg-[#fff0e4] px-4 py-3 text-sm font-semibold text-[#d96612]">{error}</p> : null}

      <div
        className={`mt-6 rounded-3xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-[#ff7a1a] bg-[#fff0e4]"
            : preview
            ? "border-[#eaded2] bg-white"
            : "border-[#eaded2] bg-white/60 hover:border-[#ff7a1a]/40"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Pet preview" className="mx-auto max-h-72 rounded-2xl object-cover shadow-sm" />
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setPreview("");
                if (pet) {
                  try {
                    await updatePetPhoto(pet.id, null);
                  } catch {
                    setError("Unable to remove photo right now.");
                  }
                }
              }}
              className="text-sm font-bold text-[#7a6d63] hover:text-[#ff7a1a]"
            >
              Remove photo
            </button>
          </div>
        ) : (
          <div className="py-10">
            <div className="text-6xl font-black text-[#ff7a1a]">PBTI</div>
            <p className="mt-4 text-sm font-bold text-[#4f463f]">Drop your pet photo here or click to browse</p>
            <p className="mt-1 text-xs text-[#a3968a]">JPG, PNG or WebP - Max 10MB</p>
          </div>
        )}

        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push("/create")}
          className="rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 text-sm font-bold text-[#4f463f] transition hover:bg-white/80"
        >
          Back
        </button>
        <button
          onClick={() => router.push(`/quiz?petId=${pet?.id || ""}`)}
          className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          Start Personality Test
        </button>
      </div>
    </div>
  );
}