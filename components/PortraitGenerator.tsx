"use client";

import { useEffect, useMemo, useState } from "react";
import { choosePortraitStylesForPet, PORTRAIT_STYLES } from "@/lib/portraitPrompts";

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

function fitFontSize(context: CanvasRenderingContext2D, text: string, maxWidth: number, preferredSize: number, minimumSize: number) {
  let size = preferredSize;
  while (size > minimumSize) {
    context.font = `900 ${size}px "Arial Black", "Microsoft YaHei", sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function drawSpacedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cursor = x;
  for (const character of text) {
    context.fillText(character, cursor, y);
    cursor += context.measureText(character).width + spacing;
  }
}

async function composePortrait(imageUrl: string, petName: string) {
  const [source, logo] = await Promise.all([loadImage(imageUrl), loadImage("/pbti-logo-transparent.png")]);
    const width = source.naturalWidth || source.width;
    const height = source.naturalHeight || source.height;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to create the branded portrait.");

    context.drawImage(source, 0, 0, width, height);

    const shortEdge = Math.min(width, height);
    const padding = Math.max(34, Math.round(shortEdge * 0.052));
    const logoHeight = Math.max(42, Math.round(shortEdge * 0.058));
    const logoWidth = Math.round((logo.naturalWidth / logo.naturalHeight) * logoHeight);
    const logoX = width - padding - logoWidth;
    const logoY = padding;
    context.save();
    context.shadowColor = "rgba(255,255,255,.55)";
    context.shadowBlur = Math.max(3, Math.round(shortEdge * 0.006));
    context.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    context.restore();

    const displayName = petName.trim() || "MY PET";
    const preferredNameSize = Math.max(56, Math.round(shortEdge * 0.105));
    const minimumNameSize = Math.max(34, Math.round(shortEdge * 0.055));
    const maxNameWidth = Math.min(width * 0.62, width - padding * 2 - logoWidth);
    const fontSize = fitFontSize(context, displayName, maxNameWidth, preferredNameSize, minimumNameSize);
    const nameY = padding + fontSize;

    context.save();
    context.lineJoin = "round";
    context.lineWidth = Math.max(3, Math.round(fontSize * 0.075));
    context.strokeStyle = "rgba(18,15,13,.42)";
    context.fillStyle = "#ffffff";
    context.font = `900 ${fontSize}px "Arial Black", "Microsoft YaHei", sans-serif`;
    context.strokeText(displayName, padding, nameY);
    context.fillText(displayName, padding, nameY);
    const renderedNameWidth = context.measureText(displayName).width;
    context.restore();

    const accentY = nameY + Math.max(16, Math.round(shortEdge * 0.02));
    const accentWidth = Math.min(renderedNameWidth, maxNameWidth);
    const accentHeight = Math.max(6, Math.round(shortEdge * 0.008));
    context.fillStyle = "#ff7418";
    context.fillRect(padding, accentY, Math.max(accentHeight * 5, accentWidth * 0.24), accentHeight);
    context.fillStyle = "rgba(255,255,255,.96)";
    context.fillRect(padding + Math.max(accentHeight * 5, accentWidth * 0.24) + accentHeight, accentY, Math.max(accentHeight * 4, accentWidth * 0.12), accentHeight);

    const label = "PBTI  PET PORTRAIT";
    const labelSize = Math.max(14, Math.round(shortEdge * 0.022));
    context.font = `800 ${labelSize}px Arial, sans-serif`;
    context.fillStyle = "rgba(255,255,255,.92)";
    context.shadowColor = "rgba(0,0,0,.55)";
    context.shadowBlur = Math.max(3, Math.round(labelSize * 0.2));
    drawSpacedText(context, label, padding, accentY + accentHeight + labelSize * 1.65, Math.max(1, Math.round(labelSize * 0.16)));
    context.shadowColor = "transparent";

    return await new Promise<string>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Unable to export the branded portrait."));
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    });
}
type PortraitGeneratorProps = { petId: string; resultId: string; petName: string; pbtiCode: string; personalityName: string };

export default function PortraitGenerator({ petId, resultId, petName, pbtiCode, personalityName }: PortraitGeneratorProps) {
  const styles = useMemo(() => choosePortraitStylesForPet(petId, 3), [petId]);
  const [portraits, setPortraits] = useState<PortraitAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compositedUrls, setCompositedUrls] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOrCreatePortraits() {
      setLoading(true);
      setError("");

      try {
        const savedResponse = await fetch(`/api/portraits?petId=${encodeURIComponent(petId)}`);
        const savedData = await savedResponse.json();
        if (!savedResponse.ok) throw new Error(savedData?.error || "Unable to load saved portraits.");

        const saved = (savedData.portraits || []) as PortraitAsset[];
        if (!active) return;
        setPortraits(saved);

        const savedStyleIds = new Set(saved.map((portrait) => portrait.style_id));
        const missingStyles = styles.filter((style) => !savedStyleIds.has(style.id)).slice(0, Math.max(0, 3 - saved.length));
        const completed = [...saved];

        for (const style of missingStyles) {
          const response = await fetch("/api/portraits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ petId, resultId, styleId: style.id }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data?.error || `Unable to generate ${style.name}.`);
          if (!completed.some((portrait) => portrait.id === data.portrait.id)) completed.push(data.portrait as PortraitAsset);
          if (active) setPortraits([...completed].slice(0, 3));
        }
      } catch (generationError) {
        if (active) setError(generationError instanceof Error ? generationError.message : "Portrait generation failed.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrCreatePortraits();
    return () => { active = false; };
  }, [petId, resultId, styles]);

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
        generatedUrls.push(url);
        return [portrait.id, url] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setCompositedUrls(Object.fromEntries(entries));
    }).catch((compositionError) => {
      if (!cancelled) setError(compositionError instanceof Error ? compositionError.message : "Unable to add the PBTI logo.");
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
  return (
    <section className="mt-6 rounded-[2rem] border border-[#eaded2] bg-[#171514] p-6 text-white shadow-[0_24px_70px_rgba(52,34,20,.12)] sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">Portrait studio</div>
          <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">Three portraits, one real pet</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">Each generation uses your photo set as the identity reference. The setting, wardrobe, lighting, and art direction vary; species, coat, eyes, face, body, sex, and age impression stay protected.</p>
        </div>
        <div className="shrink-0 rounded-full bg-white/10 px-5 py-3 text-xs font-black text-white/72">
          {loading ? `Creating and saving ${Math.max(3 - portraits.length, 0)} portrait${3 - portraits.length === 1 ? "" : "s"}...` : "Saved to this pet's report"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(portraits.length ? portraits : styles).map((item) => {
          const id = "style_id" in item ? item.style_id : item.id;
          const style = PORTRAIT_STYLES.find((candidate) => candidate.id === id);
          const imageUrl = "image_url" in item ? item.image_url : "";
          const portraitRecordId = "image_url" in item ? item.id : "";
          const brandedUrl = portraitRecordId ? compositedUrls[portraitRecordId] : "";
          return (
            <article key={id} className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[.06]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#2a2522]">
                {imageUrl ? <img src={brandedUrl || imageUrl} alt={`${petName} portrait in ${style?.name || "custom"} style`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center px-5 text-center text-sm font-bold text-white/38">{loading ? "Generating..." : "Ready for a new portrait"}</div>}
                {imageUrl && !brandedUrl ? <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-black/58 px-3 py-2 text-center text-[10px] font-black text-white backdrop-blur-sm">Adding name and PBTI logo...</div> : null}
              </div>
              <div className="p-4">
                <div className="text-sm font-black text-white">{style?.name || "Portrait style"}</div>
                <div className="mt-1 text-xs text-white/48">{pbtiCode} / {personalityName}</div>
                {imageUrl ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={brandedUrl || undefined} download={petName + "-" + id + "-original.png"} aria-disabled={!brandedUrl} className={`inline-flex rounded-full bg-[#ffb878] px-3 py-2 text-xs font-black text-[#171514] hover:bg-white ${brandedUrl ? "" : "pointer-events-none opacity-40"}`}>
                      Download original
                    </a>
                    <button type="button" disabled={!brandedUrl} onClick={() => brandedUrl && copyPortrait(portraitRecordId, brandedUrl)} className="inline-flex rounded-full border border-white/15 px-3 py-2 text-xs font-black text-white/80 hover:bg-white/10 disabled:cursor-wait disabled:opacity-40">
                      {copiedId === portraitRecordId ? "Copied" : "Copy image"}
                    </button>
                  </div>
                ) : null}
              </div>            </article>
          );
        })}
      </div>

      {error ? <p className="mt-5 rounded-2xl bg-[#7d2d1e] px-4 py-3 text-sm font-bold leading-6 text-[#ffd2c4]">{error}</p> : null}
      <p className="mt-5 text-xs leading-5 text-white/42">The first three portraits are generated automatically, saved to this pet, and reused whenever the report is opened. The site composites the pet name and small PBTI logo into the full-resolution PNG used for preview, download, and copy.</p>
    </section>
  );
}
