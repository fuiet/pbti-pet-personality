"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type DimensionScore = { label: string; value: number };

interface ShareCardProps {
  petName: string;
  pbtiId: string;
  type: string;
  personality: string;
  imageUrl: string;
  summary: string;
  traits: string[];
  dimensions: DimensionScore[];
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load the pet image."));
    image.src = src;
  });
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const chars = [...text];
  const lines: string[] = [];
  let line = "";
  for (const char of chars) {
    const next = line + char;
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = char;
      if (lines.length === maxLines - 1) break;
    } else line = next;
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

export default function ShareCard({ petName, pbtiId, type, personality, imageUrl, summary, traits, dimensions }: ShareCardProps) {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const [status, setStatus] = useState("");

  async function createSharePng() {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1500;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare the share image.");

    context.fillStyle = "#171514";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const image = await loadImage(imageUrl);
    const photoHeight = 720;
    const scale = Math.max(canvas.width / image.naturalWidth, photoHeight / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, (canvas.width - width) / 2, (photoHeight - height) / 2, width, height);
    const fade = context.createLinearGradient(0, 500, 0, 760);
    fade.addColorStop(0, "rgba(23,21,20,0)");
    fade.addColorStop(1, "#171514");
    context.fillStyle = fade;
    context.fillRect(0, 480, canvas.width, 300);

    context.fillStyle = "#ff7a1a";
    context.font = "900 34px Arial, sans-serif";
    context.fillText("PBTI", 72, 72);
    context.textAlign = "right";
    context.fillStyle = "rgba(255,255,255,.82)";
    context.font = "700 22px Arial, sans-serif";
    context.fillText(pbtiId, 1128, 72);
    context.textAlign = "left";

    context.fillStyle = "#ffffff";
    context.font = "900 72px 'Microsoft YaHei', Arial, sans-serif";
    context.fillText(petName, 72, 790);
    context.fillStyle = "#ff9a50";
    context.font = "900 38px 'Microsoft YaHei', Arial, sans-serif";
    context.fillText(`${type} / ${personality}`, 72, 846);

    context.font = "700 25px 'Microsoft YaHei', Arial, sans-serif";
    let traitX = 72;
    traits.slice(0, 3).forEach((trait) => {
      const pillWidth = context.measureText(trait).width + 42;
      context.fillStyle = "#302d2b";
      context.beginPath();
      context.roundRect(traitX, 880, pillWidth, 48, 24);
      context.fill();
      context.fillStyle = "#ffffff";
      context.fillText(trait, traitX + 21, 913);
      traitX += pillWidth + 14;
    });

    dimensions.slice(0, 4).forEach((dimension, index) => {
      const x = 72 + (index % 2) * 540;
      const y = 980 + Math.floor(index / 2) * 108;
      context.fillStyle = "rgba(255,255,255,.62)";
      context.font = "700 22px 'Microsoft YaHei', Arial, sans-serif";
      context.fillText(dimension.label, x, y);
      context.textAlign = "right";
      context.fillStyle = "#ffffff";
      context.fillText(`${dimension.value}%`, x + 465, y);
      context.textAlign = "left";
      context.fillStyle = "#3b3734";
      context.fillRect(x, y + 18, 465, 12);
      context.fillStyle = "#ff7a1a";
      context.fillRect(x, y + 18, 465 * Math.max(0, Math.min(100, dimension.value)) / 100, 12);
    });

    context.fillStyle = "rgba(255,255,255,.76)";
    context.font = "500 25px 'Microsoft YaHei', Arial, sans-serif";
    wrapText(context, summary, 1056, 3).forEach((line, index) => context.fillText(line, 72, 1250 + index * 42));
    context.fillStyle = "#ff7a1a";
    context.font = "900 24px Arial, sans-serif";
    context.fillText("PBTI PET PERSONALITY", 72, 1430);
    context.textAlign = "right";
    context.fillStyle = "rgba(255,255,255,.5)";
    context.font = "600 20px 'Microsoft YaHei', Arial, sans-serif";
    context.fillText(zh ? "扫码或打开链接，发现爱宠性格" : "Discover your pet's personality", 1128, 1430);

    return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to export the share image.")), "image/png"));
  }

  async function downloadCard() {
    try {
      setStatus(zh ? "正在生成分享图…" : "Preparing image...");
      const blob = await createSharePng();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${petName}-${type}-PBTI.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus(zh ? "分享图已保存" : "Share image saved");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : (zh ? "生成失败" : "Unable to create image"));
    }
  }

  async function shareCard() {
    const shareText = zh ? `${petName} 的 PBTI 性格是 ${type} / ${personality}` : `${petName}'s PBTI personality is ${type} / ${personality}`;
    try {
      const blob = await createSharePng();
      const file = new File([blob], `${petName}-${type}-PBTI.png`, { type: "image/png" });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: `${petName} · PBTI`, text: shareText, url: window.location.href, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: `${petName} · PBTI`, text: shareText, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        setStatus(zh ? "分享文案和链接已复制" : "Share text and link copied");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setStatus(zh ? "分享未完成，请下载图片后分享" : "Share not completed; download the image instead");
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setStatus(zh ? "报告链接已复制" : "Report link copied");
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#312c29] bg-[#171514] text-white shadow-[0_24px_70px_rgba(40,28,20,.16)]">
      <div className="grid lg:grid-cols-[.92fr_1.08fr]">
        <div className="relative min-h-[360px] overflow-hidden bg-[#2a2522]">
          <img src={imageUrl} alt={`${petName} PBTI`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171514] via-transparent to-black/10" />
          <div className="absolute left-6 top-6 text-2xl font-black text-[#ff7a1a]">PBTI</div>
          <div className="absolute inset-x-6 bottom-6"><div className="text-3xl font-black">{petName}</div><div className="mt-1 text-sm font-bold text-white/65">{pbtiId}</div></div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="text-sm font-black uppercase tracking-[.16em] text-[#ff9a50]">{type} · {personality}</div>
          <p className="mt-4 text-sm leading-7 text-white/68">{summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">{traits.slice(0, 3).map((trait) => <span key={trait} className="rounded-full border border-white/12 bg-white/7 px-3 py-2 text-xs font-black">{trait}</span>)}</div>
          <div className="mt-7 grid gap-x-5 gap-y-4 sm:grid-cols-2">{dimensions.map((dimension) => <div key={dimension.label}><div className="flex justify-between text-xs font-bold text-white/62"><span>{dimension.label}</span><span>{dimension.value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ff7a1a]" style={{ width: `${dimension.value}%` }} /></div></div>)}</div>
          <div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={shareCard} className="rounded-full bg-[#ff6f12] px-5 py-3 text-sm font-black shadow-[0_10px_25px_rgba(255,111,18,.25)] hover:bg-[#e85e06]">{zh ? "分享到朋友或平台" : "Share"}</button><button type="button" onClick={downloadCard} className="rounded-full border border-white/18 px-5 py-3 text-sm font-black hover:bg-white/8">{zh ? "下载分享图" : "Download image"}</button><button type="button" onClick={copyLink} className="rounded-full border border-white/18 px-5 py-3 text-sm font-black hover:bg-white/8">{zh ? "复制链接" : "Copy link"}</button></div>
          {status && <p className="mt-4 text-xs font-bold text-[#ffb878]" role="status">{status}</p>}
        </div>
      </div>
    </div>
  );
}
