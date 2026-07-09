"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [pet, setPet] = useState<{ name?: string; species?: string }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Read pet info on mount
  useEffect(() => {
    const stored = localStorage.getItem("pbti_pet");
    if (stored) {
      try { setPet(JSON.parse(stored)); } catch { /* */ }
    }
  }, []);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    // Store image data for potential use later
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        localStorage.setItem("pbti_photo", e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      {/* Steps indicator */}
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
              {s < 2 ? "?" : s}
            </div>
            {s < 4 && (
              <div
                className={`h-0.5 w-8 transition ${
                  s < 2 ? "bg-[#8b5e3c]" : "bg-[#eaded2]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-black tracking-[-.04em] text-[#171514]">
        Upload a Photo
      </h1>
      <p className="mt-2 text-sm text-[#7a6d63]">
        {pet.name ? `${pet.name}'s photo` : "Upload a clear photo of your pet for AI analysis"}
      </p>

      <div
        className={`mt-6 rounded-3xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-[#ff7a1a] bg-[#fff0e4]"
            : preview
            ? "border-[#eaded2] bg-white"
            : "border-[#eaded2] bg-white/60 hover:border-[#ff7a1a]/40"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Pet preview"
              className="mx-auto max-h-72 rounded-2xl object-cover shadow-sm"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview("");
                localStorage.removeItem("pbti_photo");
              }}
              className="text-sm font-bold text-[#7a6d63] hover:text-[#ff7a1a]"
            >
              Remove photo
            </button>
          </div>
        ) : (
          <div className="py-10">
            <div className="text-6xl">??</div>
            <p className="mt-4 text-sm font-bold text-[#4f463f]">
              Drop your pet photo here or click to browse
            </p>
            <p className="mt-1 text-xs text-[#a3968a]">
              JPG, PNG or WebP ? Max 10MB
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push("/create")}
          className="rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 text-sm font-bold text-[#4f463f] transition hover:bg-white/80"
        >
          鈫?Back
        </button>
        <button
          onClick={() => router.push("/quiz")}
          className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          Start Personality Test 鈫?        </button>
      </div>
    </div>
  );
}
