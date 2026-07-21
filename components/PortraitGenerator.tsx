"use client";

import { useEffect, useMemo, useState } from "react";
import { choosePortraitStylesForPet, getPortraitStyleDisplayName, PORTRAIT_PROMPT_VERSION, PORTRAIT_STYLES } from "@/lib/portraitPrompts";
import { useLanguage } from "@/components/LanguageProvider";

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

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function fontStack(kind: "block" | "rounded" | "condensed" | "script" = "block") {
  if (kind === "rounded") return `"Arial Rounded MT Bold", "Trebuchet MS", "Microsoft YaHei", sans-serif`;
  if (kind === "condensed") return `"Impact", "Arial Black", "Microsoft YaHei", sans-serif`;
  if (kind === "script") return `"Comic Sans MS", "Segoe Print", "Microsoft YaHei", cursive`;
  return `"Arial Black", "Microsoft YaHei", sans-serif`;
}

function fitFontSizeWithFont(context: CanvasRenderingContext2D, text: string, maxWidth: number, preferredSize: number, minimumSize: number, weight = 900, family = fontStack()) {
  let size = preferredSize;
  while (size > minimumSize) {
    context.font = `${weight} ${size}px ${family}`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function drawOutlinedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, options: { font: string; fill: string; stroke?: string; lineWidth?: number; shadow?: string; shadowBlur?: number; align?: CanvasTextAlign }) {
  context.save();
  context.font = options.font;
  context.textAlign = options.align || "left";
  context.textBaseline = "alphabetic";
  context.lineJoin = "round";
  if (options.shadow) {
    context.shadowColor = options.shadow;
    context.shadowBlur = options.shadowBlur || 0;
  }
  if (options.stroke && options.lineWidth) {
    context.lineWidth = options.lineWidth;
    context.strokeStyle = options.stroke;
    context.strokeText(text, x, y);
  }
  context.fillStyle = options.fill;
  context.fillText(text, x, y);
  context.restore();
}

function drawNameBadge(context: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, height: number, bg: string, fg: string, font: string) {
  context.save();
  context.fillStyle = bg;
  context.beginPath();
  context.roundRect(x, y, width, height, height / 2);
  context.fill();
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = fg;
  context.fillText(text, x + width / 2, y + height / 2 + height * 0.02);
  context.restore();
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
    const maxNameWidth = width - padding * 2 - logoWidth * 0.5;
    const layout = hashString(`${imageUrl}:${displayName}`) % 7;
    const isLandscape = width > height * 1.16;
    const isSquare = Math.abs(width - height) < shortEdge * 0.08;

    if (layout === 0) {
      const fontSize = fitFontSizeWithFont(context, displayName, Math.min(width * 0.66, maxNameWidth), Math.round(shortEdge * 0.12), Math.round(shortEdge * 0.052), 900, fontStack("block"));
      const x = padding;
      const y = padding + fontSize;
      const font = `900 ${fontSize}px ${fontStack("block")}`;
      drawOutlinedText(context, displayName, x, y, { font, fill: "#ffffff", stroke: "rgba(13,39,45,.58)", lineWidth: Math.max(4, fontSize * 0.08), shadow: "rgba(0,0,0,.28)", shadowBlur: fontSize * 0.1 });
      const barHeight = Math.max(7, shortEdge * 0.008);
      context.fillStyle = "#ff7418";
      context.fillRect(x, y + fontSize * 0.25, Math.max(barHeight * 8, context.measureText(displayName).width * 0.22), barHeight);
      context.fillStyle = "rgba(255,255,255,.96)";
      context.fillRect(x + Math.max(barHeight * 8, context.measureText(displayName).width * 0.22) + barHeight * 1.4, y + fontSize * 0.25, barHeight * 6, barHeight);
      context.font = `800 ${Math.max(14, shortEdge * 0.022)}px Arial, sans-serif`;
      context.fillStyle = "rgba(255,255,255,.9)";
      drawSpacedText(context, "PBTI PET PORTRAIT", x, y + fontSize * 0.62, Math.max(1, shortEdge * 0.003));
    } else if (layout === 1) {
      const fontSize = fitFontSizeWithFont(context, displayName.toUpperCase(), width * 0.76, Math.round(shortEdge * 0.09), Math.round(shortEdge * 0.04), 900, fontStack("condensed"));
      const text = displayName.toUpperCase();
      const y = isLandscape ? height - padding - fontSize * 0.55 : padding + fontSize * 0.95;
      context.save();
      context.translate(width / 2, y);
      context.rotate(-0.035);
      drawOutlinedText(context, text, 0, 0, { font: `900 ${fontSize}px ${fontStack("condensed")}`, fill: "#fff7ef", stroke: "rgba(0,0,0,.38)", lineWidth: Math.max(3, fontSize * 0.055), shadow: "rgba(0,0,0,.32)", shadowBlur: fontSize * 0.12, align: "center" });
      context.restore();
      const labelSize = Math.max(13, shortEdge * 0.02);
      drawNameBadge(context, "PBTI", padding, padding, labelSize * 3.8, labelSize * 2.15, "rgba(255,116,24,.95)", "#171514", `900 ${labelSize}px Arial, sans-serif`);
    } else if (layout === 2) {
      const fontSize = fitFontSizeWithFont(context, displayName, width * 0.52, Math.round(shortEdge * 0.085), Math.round(shortEdge * 0.04), 900, fontStack("rounded"));
      const badgeWidth = Math.min(width - padding * 2, context.measureText(displayName).width + fontSize * 1.3);
      const badgeHeight = fontSize * 1.45;
      const x = padding;
      const y = height - padding - badgeHeight;
      drawNameBadge(context, displayName, x, y, badgeWidth, badgeHeight, "rgba(255,255,255,.9)", "#171514", `900 ${fontSize}px ${fontStack("rounded")}`);
      context.fillStyle = "#ff7418";
      context.beginPath();
      context.arc(x + badgeHeight * 0.48, y - badgeHeight * 0.2, badgeHeight * 0.12, 0, Math.PI * 2);
      context.arc(x + badgeHeight * 0.82, y - badgeHeight * 0.32, badgeHeight * 0.12, 0, Math.PI * 2);
      context.fill();
    } else if (layout === 3) {
      const fontSize = fitFontSizeWithFont(context, displayName, isSquare ? width * 0.74 : width * 0.42, Math.round(shortEdge * 0.095), Math.round(shortEdge * 0.04), 900, fontStack("block"));
      const x = isLandscape ? padding : width / 2;
      const y = height - padding - fontSize * 0.5;
      drawOutlinedText(context, displayName, x, y, { font: `900 ${fontSize}px ${fontStack("block")}`, fill: "#ffffff", stroke: "rgba(255,116,24,.92)", lineWidth: Math.max(5, fontSize * 0.09), shadow: "rgba(0,0,0,.28)", shadowBlur: fontSize * 0.08, align: isLandscape ? "left" : "center" });
      context.font = `900 ${Math.max(14, shortEdge * 0.026)}px Arial, sans-serif`;
      context.fillStyle = "rgba(255,255,255,.8)";
      context.textAlign = isLandscape ? "left" : "center";
      context.fillText("PET PERSONALITY PORTRAIT", x, y + fontSize * 0.45);
      context.textAlign = "left";
    } else if (layout === 4) {
      const fontSize = fitFontSizeWithFont(context, displayName, height * 0.55, Math.round(shortEdge * 0.075), Math.round(shortEdge * 0.035), 900, fontStack("condensed"));
      context.save();
      context.translate(padding + fontSize * 0.2, height - padding);
      context.rotate(-Math.PI / 2);
      drawOutlinedText(context, displayName.toUpperCase(), 0, 0, { font: `900 ${fontSize}px ${fontStack("condensed")}`, fill: "#ffffff", stroke: "rgba(0,0,0,.46)", lineWidth: Math.max(3, fontSize * 0.055), shadow: "rgba(0,0,0,.22)", shadowBlur: fontSize * 0.08 });
      context.font = `800 ${Math.max(12, shortEdge * 0.018)}px Arial, sans-serif`;
      context.fillStyle = "#ff7418";
      drawSpacedText(context, "PBTI", 0, fontSize * 0.58, Math.max(1, shortEdge * 0.004));
      context.restore();
    } else if (layout === 5) {
      const fontSize = fitFontSizeWithFont(context, displayName, width * 0.58, Math.round(shortEdge * 0.082), Math.round(shortEdge * 0.038), 900, fontStack("script"));
      const x = width - padding;
      const y = height - padding - fontSize * 0.3;
      drawOutlinedText(context, displayName, x, y, { font: `900 ${fontSize}px ${fontStack("script")}`, fill: "#ffffff", stroke: "rgba(23,21,20,.5)", lineWidth: Math.max(3, fontSize * 0.06), shadow: "rgba(0,0,0,.32)", shadowBlur: fontSize * 0.1, align: "right" });
      const labelSize = Math.max(12, shortEdge * 0.018);
      context.font = `900 ${labelSize}px Arial, sans-serif`;
      context.fillStyle = "#ff7418";
      context.textAlign = "right";
      context.fillText("PBTI ORIGINAL", x, y + fontSize * 0.48);
      context.textAlign = "left";
    } else {
      const fontSize = fitFontSizeWithFont(context, displayName, width * 0.7, Math.round(shortEdge * 0.1), Math.round(shortEdge * 0.045), 900, fontStack("rounded"));
      const x = width / 2;
      const y = padding + fontSize;
      drawOutlinedText(context, displayName, x, y, { font: `900 ${fontSize}px ${fontStack("rounded")}`, fill: "#ffffff", stroke: "rgba(0,0,0,.5)", lineWidth: Math.max(4, fontSize * 0.065), shadow: "rgba(255,116,24,.55)", shadowBlur: fontSize * 0.14, align: "center" });
      context.save();
      context.strokeStyle = "rgba(255,255,255,.78)";
      context.lineWidth = Math.max(2, shortEdge * 0.004);
      context.beginPath();
      context.moveTo(width / 2 - fontSize * 1.9, y + fontSize * 0.18);
      context.lineTo(width / 2 + fontSize * 1.9, y + fontSize * 0.18);
      context.stroke();
      context.restore();
    }

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
  const { language } = useLanguage();
  const zh = language === "zh-CN";
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

        const saved = ((savedData.portraits || []) as PortraitAsset[])
          .filter((portrait) => portrait.style_id.endsWith(`--${PORTRAIT_PROMPT_VERSION}`) && !portrait.style_id.startsWith("personality-cover-"))
          .slice(0, 3);
        if (!active) return;
        setPortraits(saved);

        const savedStyleIds = new Set(saved.map((portrait) => portrait.style_id.split("--")[0]));
        const missingStyles = styles.filter((style) => !savedStyleIds.has(style.id)).slice(0, Math.max(0, 3 - saved.length));
        const completed = [...saved];
        const failedStyles: string[] = [];

        for (const style of missingStyles) {
          let generated = false;
          for (let attempt = 0; attempt < 2 && !generated; attempt += 1) {
            try {
              if (attempt > 0) await new Promise((resolve) => window.setTimeout(resolve, 1800));
              const response = await fetch("/api/portraits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ petId, resultId, styleId: `${style.id}--${PORTRAIT_PROMPT_VERSION}` }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data?.error || `Unable to generate ${style.name}.`);
              if (!completed.some((portrait) => portrait.id === data.portrait.id)) completed.push(data.portrait as PortraitAsset);
              if (active) setPortraits([...completed].slice(0, 3));
              generated = true;
            } catch {
              if (attempt === 1) failedStyles.push(getPortraitStyleDisplayName(style.id, language, style.name));
            }
          }
        }
        if (active && failedStyles.length) setError(zh ? `${failedStyles.join("、")}生成失败，系统已保留成功的图片。请稍后重新打开报告继续生成。` : `${failedStyles.join(", ")} could not be generated. Successful images were saved; reopen the report later to retry.`);
      } catch (generationError) {
        if (active) setError(generationError instanceof Error ? generationError.message : "Portrait generation failed.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrCreatePortraits();
    return () => { active = false; };
  }, [language, petId, resultId, styles, zh]);

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
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">{zh ? "爱宠写真工作室" : "Portrait studio"}</div>
          <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">{zh ? "三张写真，记录真实的它" : "Three portraits, one real pet"}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">{zh ? "系统会以你上传的照片作为身份参考，只改变场景、服饰、灯光和艺术方向，并尽量保留物种、毛色、眼睛、脸型、体态、性别与年龄特征。" : "Each generation uses your photo set as the identity reference. The setting, wardrobe, lighting, and art direction vary; species, coat, eyes, face, body, sex, and age impression stay protected."}</p>
        </div>
        <div className="shrink-0 rounded-full bg-white/10 px-5 py-3 text-xs font-black text-white/72">
          {loading ? (zh ? `正在生成并保存 ${Math.max(3 - portraits.length, 0)} 张写真…` : `Creating and saving ${Math.max(3 - portraits.length, 0)} portrait${3 - portraits.length === 1 ? "" : "s"}...`) : (zh ? "已保存到爱宠报告" : "Saved to this pet's report")}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(portraits.length ? portraits : styles).map((item) => {
          const id = "style_id" in item ? item.style_id : item.id;
          const baseStyleId = id.split("--")[0];
          const style = PORTRAIT_STYLES.find((candidate) => candidate.id === baseStyleId);
          const styleDisplayName = getPortraitStyleDisplayName(id, language, style?.name);
          const aspectClass = baseStyleId === "white-sketch-avatar" ? "aspect-square" : baseStyleId === "landscape-campaign" ? "aspect-[3/2]" : "aspect-[4/5]";
          const imageUrl = "image_url" in item ? item.image_url : "";
          const portraitRecordId = "image_url" in item ? item.id : "";
          const brandedUrl = portraitRecordId ? compositedUrls[portraitRecordId] : "";
          return (
            <article key={id} className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[.06]">
              <div className={`relative overflow-hidden bg-[#2a2522] ${aspectClass}`}>
                {imageUrl ? <img src={brandedUrl || imageUrl} alt={`${petName} ${styleDisplayName}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center px-5 text-center text-sm font-bold text-white/38">{loading ? (zh ? "正在生成…" : "Generating...") : (zh ? "写真准备中" : "Ready for a new portrait")}</div>}
                {imageUrl && !brandedUrl ? <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-black/58 px-3 py-2 text-center text-[10px] font-black text-white backdrop-blur-sm">{zh ? "正在添加名字与 PBTI Logo…" : "Adding name and PBTI logo..."}</div> : null}
              </div>
              <div className="p-4">
                <div className="text-sm font-black text-white">{styleDisplayName}</div>
                <div className="mt-1 text-xs text-white/48">{pbtiCode} / {personalityName}</div>
                {imageUrl ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={brandedUrl || undefined} download={petName + "-" + id + "-original.png"} aria-disabled={!brandedUrl} className={`inline-flex rounded-full bg-[#ffb878] px-3 py-2 text-xs font-black text-[#171514] hover:bg-white ${brandedUrl ? "" : "pointer-events-none opacity-40"}`}>
                      {zh ? "下载原图" : "Download original"}
                    </a>
                    <button type="button" disabled={!brandedUrl} onClick={() => brandedUrl && copyPortrait(portraitRecordId, brandedUrl)} className="inline-flex rounded-full border border-white/15 px-3 py-2 text-xs font-black text-white/80 hover:bg-white/10 disabled:cursor-wait disabled:opacity-40">
                      {copiedId === portraitRecordId ? (zh ? "已复制" : "Copied") : (zh ? "复制图片" : "Copy image")}
                    </button>
                  </div>
                ) : null}
              </div>            </article>
          );
        })}
      </div>

      {error ? <p className="mt-5 rounded-2xl bg-[#7d2d1e] px-4 py-3 text-sm font-bold leading-6 text-[#ffd2c4]">{error}</p> : null}
      <p className="mt-5 text-xs leading-5 text-white/42">{zh ? "前三张写真会自动生成并保存到这只爱宠的档案中。再次打开报告时会继续使用同一组写真；预览、下载和复制的 PNG 都会带有爱宠名字与 PBTI Logo。" : "The first three portraits are generated automatically, saved to this pet, and reused whenever the report is opened. The site composites the pet name and small PBTI logo into the full-resolution PNG used for preview, download, and copy."}</p>
    </section>
  );
}
