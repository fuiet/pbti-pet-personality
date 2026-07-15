"use client";

import { useEffect, useMemo, useState } from "react";
import { choosePortraitStyles, PORTRAIT_STYLES } from "@/lib/portraitPrompts";

type PortraitAsset = { id: string; style_id: string; style_name: string; image_url: string };

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to prepare portrait artwork."));
    image.src = source;
  });
}

async function composePortrait(imageUrl: string, petName: string) {
  try {
    const [source, logo] = await Promise.all([loadImage(imageUrl), loadImage("/logo.png")]);
    const width = source.naturalWidth || source.width;
    const height = source.naturalHeight || source.height;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return imageUrl;

    context.drawImage(source, 0, 0, width, height);

    const padding = Math.max(32, Math.round(Math.min(width, height) * 0.045));
    const logoHeight = Math.max(44, Math.round(Math.min(width, height) * 0.065));
    const logoWidth = Math.round((logo.naturalWidth / logo.naturalHeight) * logoHeight);
    const logoX = width - padding - logoWidth;
    const logoY = padding;
    context.fillStyle = "rgba(255,255,255,.84)";
    context.fillRect(logoX - 14, logoY - 10, logoWidth + 28, logoHeight + 20);
    context.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

    const fontSize = Math.max(34, Math.round(Math.min(width, height) * 0.055));
    context.font = "700 " + fontSize + "px Arial, sans-serif";
    context.fillStyle = "#ffffff";
    context.shadowColor = "rgba(0,0,0,.5)";
    context.shadowBlur = Math.max(5, Math.round(fontSize * 0.18));
    context.fillText(petName, padding, padding + fontSize);
    context.shadowColor = "transparent";

    return await new Promise<string>((resolve) => {
      canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : imageUrl), "image/png");
    });
  } catch {
    return imageUrl;
  }
}
type PortraitGeneratorProps = { petId: string; resultId: string; petName: string; pbtiCode: string; personalityName: string };

export default function PortraitGenerator({ petId, resultId, petName, pbtiCode, personalityName }: PortraitGeneratorProps) {
  const styles = useMemo(() => choosePortraitStyles(3), []);
  const [portraits, setPortraits] = useState<PortraitAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compositedUrls, setCompositedUrls] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const generatedUrls: string[] = [];

    if (!portraits.length) {
      setCompositedUrls({});
      return () => undefined;
    }

    Promise.all(
      portraits.map(async (portrait) => {
        const sourceUrl = portrait.image_url.startsWith("/") ? portrait.image_url : "/api/portraits/asset?url=" + encodeURIComponent(portrait.image_url);
        const url = await composePortrait(sourceUrl, petName);
        if (url !== portrait.image_url) generatedUrls.push(url);
        return [portrait.id, url] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setCompositedUrls(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
      generatedUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [petName, portraits]);

  async function copyPortrait(id: string, imageUrl: string) {
    try {
      const blob = await fetch(imageUrl).then((response) => response.blob());
      if (!navigator.clipboard || typeof ClipboardItem === "undefined") throw new Error("Image copy is not supported in this browser.");
      await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/png"]: blob })]);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1800);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Unable to copy the portrait.");
    }
  }
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
          const renderedUrl = compositedUrls[id] || imageUrl;
          return (
            <article key={id} className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[.06]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#2a2522]">
                {imageUrl ? <img src={renderedUrl} alt={`${petName} portrait in ${style?.name || "custom"} style`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center px-5 text-center text-sm font-bold text-white/38">{loading ? "Generating..." : "Ready for a new portrait"}</div>}
                {imageUrl && !compositedUrls[id] ? <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3"><div className="max-w-[72%] text-xl font-black leading-none tracking-[-.04em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.45)]">{petName}</div><img src="/logo.png" alt="PBTI" className="h-7 w-auto rounded bg-white/85 p-1 opacity-90" /></div> : null}
              </div>
              <div className="p-4">
                <div className="text-sm font-black text-white">{style?.name || "Portrait style"}</div>
                <div className="mt-1 text-xs text-white/48">{pbtiCode} / {personalityName}</div>
                {imageUrl ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={renderedUrl} download={petName + "-" + id + "-4K.png"} className="inline-flex rounded-full bg-[#ffb878] px-3 py-2 text-xs font-black text-[#171514] hover:bg-white">
                      Download 4K PNG
                    </a>
                    <button type="button" onClick={() => copyPortrait(id, renderedUrl)} className="inline-flex rounded-full border border-white/15 px-3 py-2 text-xs font-black text-white/80 hover:bg-white/10">
                      {copiedId === id ? "Copied" : "Copy image"}
                    </button>
                  </div>
                ) : null}
              </div>            </article>
          );
        })}
      </div>

      {error ? <p className="mt-5 rounded-2xl bg-[#7d2d1e] px-4 py-3 text-sm font-bold leading-6 text-[#ffd2c4]">{error}</p> : null}
      <p className="mt-5 text-xs leading-5 text-white/42">The site composites the pet name and small PBTI logo into the full-resolution PNG used for preview, download, and copy. Portrait generation is an artistic edit, not proof of breed, health, or personality.</p>
    </section>
  );
}
