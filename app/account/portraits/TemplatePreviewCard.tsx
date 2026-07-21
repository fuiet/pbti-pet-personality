"use client";

import type { PortraitStudioTemplate } from "@/lib/portraitStudioTemplates";

export default function TemplatePreviewCard({
  template,
  zh,
  selected,
  onSelect,
}: {
  template: PortraitStudioTemplate;
  zh: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group overflow-hidden rounded-[1.65rem] border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(52,34,20,.1)] ${selected ? "border-[#ff7a1a] ring-2 ring-[#ffd5b4]" : "border-[#eaded2]"}`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${template.previewTint}`}>
        <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.18))]" />
        <div className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[.12em] ${selected ? "bg-[#171514] text-white" : "bg-white/85 text-[#6d5848]"}`}>
          {template.mode === "duo" ? (zh ? "主宠合影" : "Pet + Owner") : template.orientation === "avatar" ? "Avatar" : template.orientation === "vertical" ? (zh ? "竖屏" : "Vertical") : (zh ? "横屏" : "Landscape")}
        </div>
        <img
          src={template.previewImage}
          alt={zh ? template.title.zh : template.title.en}
          className={`relative z-[1] w-full object-cover transition duration-300 group-hover:scale-[1.03] ${template.orientation === "avatar" ? "aspect-square" : template.orientation === "vertical" ? "aspect-[4/5]" : "aspect-[16/10]"}`}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[#171514]">{zh ? template.title.zh : template.title.en}</h3>
            <p className="mt-1 text-sm leading-6 text-[#7e6f64]">{zh ? template.subtitle.zh : template.subtitle.en}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#fff0e4] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#d96612]">
            {zh ? "选这个" : "Use this"}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-[#f8efe5] px-2.5 py-1 text-[11px] font-bold text-[#7b6657]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
