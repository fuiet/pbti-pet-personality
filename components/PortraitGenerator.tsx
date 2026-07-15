"use client";

import { useMemo, useState } from "react";
import { choosePortraitStyles, PORTRAIT_STYLES } from "@/lib/portraitPrompts";

type PortraitAsset = { id: string; style_id: string; style_name: string; image_url: string };
type PortraitGeneratorProps = { petId: string; resultId: string; petName: string; pbtiCode: string; personalityName: string };

export default function PortraitGenerator({ petId, resultId, petName, pbtiCode, personalityName }: PortraitGeneratorProps) {
  const styles = useMemo(() => choosePortraitStyles(3), []);
  const [portraits, setPortraits] = useState<PortraitAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generatePortraits() {
    setLoading(true);
    setError("");
    try {
      const results = await Promise.all(styles.map(async (style) => {
        const response = await fetch("/api/portraits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ petId, resultId, styleId: style.id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || `Unable to generate ${style.name}.`);
        return data.portrait as PortraitAsset;
      }));
      setPortraits(results);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Portrait generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-[2rem] border border-[#eaded2] bg-[#171514] p-6 text-white shadow-[0_24px_70px_rgba(52,34,20,.12)] sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">Portrait studio</div>
          <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Three portraits, one real pet</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">Each generation uses your photo set as the identity reference. The setting, wardrobe, lighting, and art direction vary; species, coat, eyes, face, body, sex, and age impression stay protected.</p>
        </div>
        <button type="button" onClick={generatePortraits} disabled={loading} className="shrink-0 rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.28)] transition hover:bg-[#ee6b10] disabled:cursor-wait disabled:bg-[#a96843]">
          {loading ? "Creating 3 portraits..." : portraits.length ? "Create 3 new portraits" : "Generate 3 portraits"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(portraits.length ? portraits : styles).map((item) => {
          const id = "style_id" in item ? item.style_id : item.id;
          const style = PORTRAIT_STYLES.find((candidate) => candidate.id === id);
          const imageUrl = "image_url" in item ? item.image_url : "";
          return (
            <article key={id} className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[.06]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#2a2522]">
                {imageUrl ? <img src={imageUrl} alt={`${petName} portrait in ${style?.name || "custom"} style`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center px-5 text-center text-sm font-bold text-white/38">{loading ? "Generating..." : "Ready for a new portrait"}</div>}
                {imageUrl ? <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3"><div className="max-w-[72%] text-xl font-black leading-none tracking-[-.04em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.45)]">{petName}</div><img src="/logo.png" alt="PBTI" className="h-7 w-auto rounded bg-white/85 p-1 opacity-90" /></div> : null}
              </div>
              <div className="p-4"><div className="text-sm font-black text-white">{style?.name || "Portrait style"}</div><div className="mt-1 text-xs text-white/48">{pbtiCode} · {personalityName}</div>{imageUrl ? <a href={imageUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-black text-[#ffb878] hover:text-white">Open image</a> : null}</div>
            </article>
          );
        })}
      </div>

      {error ? <p className="mt-5 rounded-2xl bg-[#7d2d1e] px-4 py-3 text-sm font-bold leading-6 text-[#ffd2c4]">{error}</p> : null}
      <p className="mt-5 text-xs leading-5 text-white/42">PBTI adds the pet name and small logo after generation so the image model cannot distort typography. Portrait generation is an artistic edit, not proof of breed, health, or personality.</p>
    </section>
  );
}
