"use client";

import { useId } from "react";
import { LANGUAGE_OPTIONS, type Language } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-[#eaded2] bg-white/92 shadow-[0_8px_24px_rgba(52,34,20,.05)] ${compact ? "px-3 py-2" : "px-3 py-2.5"}`}
      title="More languages are planned. English is the active site language for now."
    >
      <label htmlFor={id} className="sr-only">
        Language
      </label>
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-[#7a6d63]" aria-hidden="true">
        <path d="M4.75 12a7.25 7.25 0 1 0 14.5 0 7.25 7.25 0 1 0-14.5 0Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.75 12h14.5M12 4.75c1.68 1.93 2.6 4.56 2.6 7.25 0 2.69-.92 5.32-2.6 7.25-1.68-1.93-2.6-4.56-2.6-7.25 0-2.69.92-5.32 2.6-7.25Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <select
        id={id}
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="min-w-[108px] bg-transparent pr-5 text-sm font-bold text-[#4f463f] outline-none"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} disabled={!option.available}>
            {option.available ? option.label : `${option.label} (Soon)`}
          </option>
        ))}
      </select>
    </div>
  );
}
