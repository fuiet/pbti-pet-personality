"use client";

export const runtime = "edge";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { localizePersonality } from "@/data/personalityLocalization";
import { getPersonalityAsset } from "@/data/personalityAssets";
import { dimensionScoresFromTraitScores, generatePetReport } from "@/lib/reportGenerator";
import { getLatestVisualProfileForPet, getResultByRecordId, type ResultRecord } from "@/lib/pbtiRecords";
import type { PetVisualProfile } from "@/lib/visualProfile";
import ShareCard from "@/components/ShareCard";
import PortraitGenerator from "@/components/PortraitGenerator";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useLanguage } from "@/components/LanguageProvider";

const visualTermsZh: Record<string, string> = {
  low: "较低", medium: "中等", high: "较高", unclear: "暂不明确", mixed: "混血",
  short: "短毛", medium_length: "中长毛", long: "长毛", smooth: "顺滑", fluffy: "蓬松",
  upright: "竖耳", folded: "折耳", relaxed: "放松", alert: "警觉", curious: "好奇",
  standing: "站立", sitting: "坐姿", lying: "趴卧", round: "圆润", narrow: "偏窄", broad: "宽阔",
};

function localizeVisualValue(value: string | undefined, zh: boolean) {
  if (!value) return zh ? "暂不明确" : "Unclear";
  if (!zh) return value;
  return value.split(/([,;/])/).map((part) => visualTermsZh[part.trim().toLowerCase().replaceAll(" ", "_")] || part).join("");
}

const chapterNumbers = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"] as const;

function ReportHeading({ number, title, subtitle, dark = false }: { number: string; title: string; subtitle: string; dark?: boolean }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xs font-black ${dark ? "bg-[#ff7a1a] text-white" : "bg-[#171514] text-white"}`}>{number}</span>
      <div>
        <h2 className={`text-2xl font-black tracking-[-.04em] ${dark ? "text-white" : "text-[#171514]"}`}>{title}</h2>
        <p className={`mt-1 text-sm leading-6 ${dark ? "text-white/60" : "text-[#7a6d63]"}`}>{subtitle}</p>
      </div>
    </div>
  );
}



export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const { loading: authLoading } = useRequireAuth();
  const [record, setRecord] = useState<ResultRecord | null>(null);
  const [visualProfile, setVisualProfile] = useState<PetVisualProfile | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    async function loadRecord() {
      try {
        const saved = await getResultByRecordId(id);
        if (!active) return;

        if (!saved) {
          router.replace("/dashboard");
          return;
        }

        let visual: PetVisualProfile | null = null;
        if (saved.pet?.id) {
          try {
            visual = await getLatestVisualProfileForPet(saved.pet.id);
          } catch {
            // A missing visual profile should not block the behavior report.
          }
        }

        setRecord(saved);
        setVisualProfile(visual);
      } catch {
        if (active) {
          router.replace("/dashboard");
        }
      } finally {
        if (active) {
          setLoadingRecord(false);
        }
      }
    }

    loadRecord();

    return () => {
      active = false;
    };
  }, [authLoading, id, router]);

  if (authLoading || loadingRecord || !record || !record.pet) {
    return <div className="flex min-h-[60vh] items-center justify-center text-3xl font-black">{zh ? "正在加载…" : "Loading..."}</div>;
  }

  const personality = personalities[record.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];
  const displayPersonality = localizePersonality(personality, language);
  const species = record.pet.species === "dog" ? "dog" : "cat";
  const typeArtwork = getPersonalityAsset(personality.code, species);
  const scores = record.scores || {};
  const dimensionScores = dimensionScoresFromTraitScores(scores);
  const generatedReport = generatePetReport({
    language,
    petName: record.pet.name,
    species,
    pbtiType: personality.code,
    personalityName: displayPersonality.name,
    traits: displayPersonality.traits,
    advice: personality.advice,
    dimensionScores,
    fitScore: scores.fit,
    modelVersion: "PBTI Behavior Model v2.0",
    modelCue: personality.modelCue,
    visualProfile,
  });
  const report = { ...generatedReport, answers: record.report?.answers };
  const dimensionVisuals = [
    { key: "attachment", code: "A / I", label: zh ? "亲近方式" : "Connection", left: zh ? "亲近" : "Attached", right: zh ? "独立" : "Independent", value: dimensionScores.attachment },
    { key: "exploration", code: "E / S", label: zh ? "适应变化" : "Adaptability", left: zh ? "探索" : "Explore", right: zh ? "稳定" : "Stable", value: dimensionScores.exploration },
    { key: "vitality", code: "V / C", label: zh ? "情绪表达" : "Expression", left: zh ? "活力" : "Vital", right: zh ? "沉静" : "Calm", value: dimensionScores.vitality },
    { key: "playfulness", code: "P / G", label: zh ? "玩心与守护" : "Play style", left: zh ? "玩乐" : "Playful", right: zh ? "守护" : "Watchful", value: dimensionScores.playfulness },
  ] as const;
  const chapters = zh
    ? ["档案封面", "性格速览", "行为维度", "爱宠鉴定", "爱的语言", "相处关系", "个性建议", "今日行动", "写真与分享", "重要声明"]
    : ["Cover", "At a glance", "Behavior map", "Pet identification", "Love language", "Relationship", "Recommendations", "Action plan", "Portraits & sharing", "Important notice"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div id="chapter-1" className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] shadow-sm ring-1 ring-[#ffd8bd]">
          PBTI ID {record.pbti_id}
        </div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-[#171514] p-7 text-white shadow-[0_28px_80px_rgba(52,34,20,.16)] sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,122,26,.28),transparent_32%)]" />
        <div className="relative z-10 max-w-[68%]">
          <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? (species === "dog" ? "狗狗档案" : "猫咪档案") : species === "dog" ? "Dog profile" : "Cat profile"}</div>
          <h1 className="mt-4 text-4xl font-black tracking-[-.06em] sm:text-6xl">{record.pet.name}</h1>
          <div className="mt-3 text-2xl font-black text-[#ff9a50]">{personality.code} / {displayPersonality.name}</div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">{report.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {displayPersonality.traits.map((trait) => <span key={trait} className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-black text-white/82">{trait}</span>)}
          </div>
        </div>
        <div className="pointer-events-none absolute -right-4 -bottom-10 h-52 w-52 sm:h-72 sm:w-72">
          <Image src={typeArtwork} alt="" fill unoptimized sizes="288px" className="object-contain drop-shadow-[0_20px_35px_rgba(255,122,26,.22)]" />
        </div>
      </div>

      <nav aria-label={zh ? "报告章节" : "Report chapters"} className="mb-6 grid grid-cols-2 gap-2 rounded-[2rem] border border-[#eaded2] bg-white p-3 shadow-sm sm:grid-cols-5">
        {chapters.map((chapter, index) => (
          <a key={chapter} href={`#chapter-${index + 1}`} className="rounded-2xl px-3 py-3 text-left transition hover:bg-[#fff7ed]">
            <span className="block text-[10px] font-black text-[#ff7a1a]">{chapterNumbers[index]}</span>
            <span className="mt-1 block text-xs font-black text-[#4f463f]">{chapter}</span>
          </a>
        ))}
      </nav>

      <section id="chapter-2" className="scroll-mt-24 rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-sm sm:p-8">
        <ReportHeading number="02" title={zh ? "性格速览" : "Personality at a glance"} subtitle={zh ? "先看结论，再进入测试证据与详细解释。" : "Start with the result, then explore the assessment evidence behind it."} />
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-[#171514] p-5 text-white sm:col-span-2">
            <div className="text-xs font-black text-[#ffb878]">PBTI TYPE</div>
            <div className="mt-3 text-3xl font-black">{personality.code}</div>
            <div className="mt-1 text-sm text-white/65">{displayPersonality.name} · {displayPersonality.title}</div>
          </div>
          <div className="rounded-2xl bg-[#fff0e4] p-5">
            <div className="text-3xl font-black text-[#ff7a1a]">28</div>
            <div className="mt-1 text-xs font-black text-[#7a6d63]">{zh ? "日常行为观察题" : "behavior observations"}</div>
          </div>
          <div className="rounded-2xl bg-[#eef9f4] p-5">
            <div className="text-3xl font-black text-[#14835f]">4</div>
            <div className="mt-1 text-xs font-black text-[#547568]">{zh ? "核心行为维度" : "behavior dimensions"}</div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border-l-4 border-[#ff7a1a] bg-[#fffaf5] p-5 text-sm leading-7 text-[#655a51]">
          <span className="font-black text-[#4f463f]">{zh ? "结论依据：" : "Assessment basis: "}</span>{zh ? "主人对 28 个日常行为场景的观察，经四个维度计分后匹配到最接近的 PBTI 原型。品种和照片不参与性格计分。" : "28 owner-observed behavior scenarios are scored across four dimensions and matched to the nearest PBTI prototype. Breed and photos do not determine personality."}
        </div>
      </section>

      <section id="chapter-3" className="mt-5 scroll-mt-24 rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-sm sm:p-8">
        <ReportHeading number="03" title={zh ? "四维行为地图" : "Four-dimension behavior map"} subtitle={zh ? "百分比来自本次测试答案，用来表示两端倾向的相对位置。" : "Percentages come from this assessment and show the relative position between each pair of tendencies."} />
        <div className="grid gap-4 sm:grid-cols-2">
          {dimensionVisuals.map((item, index) => (
            <div key={item.key} className="rounded-2xl bg-[#fffaf5] p-5">
              <div className="flex items-center justify-between gap-3">
                <div><span className="text-xs font-black text-[#ff7a1a]">{item.code}</span><h3 className="mt-1 font-black text-[#171514]">{item.label}</h3></div>
                <span className="text-2xl font-black text-[#171514]">{item.value}%</span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#eaded2]"><div className="h-full rounded-full bg-[#ff7a1a]" style={{ width: `${item.value}%` }} /></div>
              <div className="mt-2 flex justify-between text-[11px] font-bold text-[#8b7d71]"><span>{item.left}</span><span>{item.right}</span></div>
              <p className="mt-4 text-xs leading-6 text-[#655a51]">{report.dimensionNarrative?.[index]}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="chapter-4" className="mt-5 scroll-mt-24 rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-sm sm:p-8">
        <ReportHeading number="04" title={zh ? "爱宠鉴定" : "Pet identification"} subtitle={zh ? "这一章只描述三张照片中可见的外观，不参与性格评分。" : "This chapter describes visible features from the three photos and does not influence personality scoring."} />
        <p className="text-sm leading-7 text-[#655a51]">{report.appearance}</p>
        {report.visualAnalysis ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#fff7ed] p-4">
              <div className="text-xs font-black uppercase tracking-[.12em] text-[#a3968a]">{zh ? "品种判断" : "Breed estimate"}</div>
              <div className="mt-2 font-bold text-[#171514]">{report.visualAnalysis.breedAssessment.primaryBreed}</div>
              <div className="mt-1 text-sm text-[#655a51]">{report.visualAnalysis.breedAssessment.variety}</div>
            </div>
            <div className="rounded-2xl bg-[#fff7ed] p-4">
              <div className="text-xs font-black uppercase tracking-[.12em] text-[#a3968a]">{zh ? "混血可能性" : "Mixed-breed likelihood"}</div>
              <div className="mt-2 font-bold capitalize text-[#171514]">{localizeVisualValue(report.visualAnalysis.breedAssessment.mixedLikelihood, zh)}</div>
            </div>
            <div className="rounded-2xl bg-[#fff7ed] p-4">
              <div className="text-xs font-black uppercase tracking-[.12em] text-[#a3968a]">{zh ? "毛发特征" : "Visible coat"}</div>
              <div className="mt-2 text-sm leading-6 text-[#655a51]">{[report.visualAnalysis.coat.color, report.visualAnalysis.coat.length, report.visualAnalysis.coat.pattern, report.visualAnalysis.coat.texture].filter((value) => value !== "unclear").map((value) => localizeVisualValue(value, zh)).join(zh ? "、" : ", ") || (zh ? "暂不明确" : "Unclear")}</div>
            </div>
            <div className="rounded-2xl bg-[#fff7ed] p-4">
              <div className="text-xs font-black uppercase tracking-[.12em] text-[#a3968a]">{zh ? "脸部与体态" : "Face and structure"}</div>
              <div className="mt-2 text-sm leading-6 text-[#655a51]">{zh ? `口鼻部：${localizeVisualValue(report.visualAnalysis.face.muzzleShape, true)}；眼神：${localizeVisualValue(report.visualAnalysis.face.eyeExpression, true)}；耳位：${localizeVisualValue(report.visualAnalysis.face.earPosition, true)}；姿态：${localizeVisualValue(report.visualAnalysis.bodyLanguage.posture, true)}。` : `${report.visualAnalysis.face.muzzleShape}; ${report.visualAnalysis.face.eyeExpression} eyes; ${report.visualAnalysis.face.earPosition} ears; ${report.visualAnalysis.bodyLanguage.posture} posture.`}</div>
            </div>
          </div>
        ) : null}
      </section>

      <section id="chapter-5" className="mt-5 scroll-mt-24 rounded-[2rem] bg-[#eaf8f3] p-6 sm:p-8">
        <ReportHeading number="05" title={zh ? "爱的语言" : "Love language"} subtitle={zh ? "根据亲近、探索与情绪表达得分，理解它如何表达信任。" : "Understand how trust may appear from connection, exploration, and expression scores."} />
        <div className="grid gap-4 lg:grid-cols-3">
          {report.loveLanguage.map((section, index) => <article key={section.title} className="rounded-2xl bg-white p-5 shadow-sm"><div className="text-3xl font-black text-[#22a477]/25">0{index + 1}</div><h4 className="mt-3 text-base font-black text-[#244b3f]">{section.title}</h4><p className="mt-3 text-sm leading-7 text-[#547568]">{section.body}</p></article>)}
        </div>
      </section>

      <section id="chapter-6" className="mt-5 scroll-mt-24 rounded-[2rem] bg-[#eef5ff] p-6 sm:p-8">
        <ReportHeading number="06" title={zh ? "相处关系" : "Relationship guide"} subtitle={zh ? "把测试倾向转化为日常沟通和建立安全感的方法。" : "Turn assessment tendencies into everyday communication and security-building habits."} />
        <div className="grid gap-4 lg:grid-cols-3">
          {report.relationship.map((section, index) => <article key={section.title} className="rounded-2xl bg-white p-5 shadow-sm"><span className="inline-flex rounded-full bg-[#e3eeff] px-3 py-1 text-[10px] font-black text-[#5078b8]">{zh ? `关系提示 ${index + 1}` : `RELATIONSHIP ${index + 1}`}</span><h4 className="mt-4 text-base font-black text-[#263c61]">{section.title}</h4><p className="mt-3 text-sm leading-7 text-[#61718e]">{section.body}</p></article>)}
        </div>
      </section>

      <section id="chapter-7" className="mt-5 scroll-mt-24 rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-sm sm:p-8">
        <ReportHeading number="07" title={zh ? "个性化建议" : "Personalized recommendations"} subtitle={zh ? "每条建议都标明对应的测试维度，不使用与答案无关的通用套话。" : "Each recommendation names the assessment dimensions behind it rather than using unrelated generic advice."} />
        <ul className="grid gap-4 lg:grid-cols-2">
          {report.recommendations.map((rec, index) => (
            <li key={rec.title} className="flex items-start gap-4 rounded-2xl border border-[#f0e4d9] bg-[#fffaf5] p-5 text-sm leading-6 text-[#655a51]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ff7a1a] text-xs font-black text-white">
                {index + 1}
              </span>
              <div><h4 className="font-black text-[#4f463f]">{rec.title}</h4><p className="mt-2 leading-7">{rec.detail}</p>{rec.basis ? <p className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] font-black leading-5 text-[#d96612]">{rec.basis}</p> : null}</div>
            </li>
          ))}
        </ul>
      </section>

      <section id="chapter-8" className="mt-5 scroll-mt-24 rounded-[2rem] bg-[#171514] p-6 text-white shadow-sm sm:p-8">
        <ReportHeading dark number="08" title={zh ? "今天就能开始的行动" : "Actions to start today"} subtitle={zh ? "从测试建议中提炼的低压力、可执行步骤。" : "Low-pressure, practical steps distilled from the assessment recommendations."} />
        <div className="grid gap-3 sm:grid-cols-3">
          {report.recommendations.slice(0, 3).map((rec, index) => (
            <div key={rec.title} className="rounded-2xl border border-white/10 bg-white/[.06] p-5">
              <div className="text-xs font-black text-[#ffb878]">{zh ? `今日任务 ${index + 1}` : `TODAY ${index + 1}`}</div>
              <h3 className="mt-3 font-black text-white">{rec.title}</h3>
              <p className="mt-2 text-xs leading-6 text-white/62">{rec.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="chapter-9" className="mt-5 scroll-mt-24">
        <div className="mb-5 rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-sm sm:p-8">
          <ReportHeading number="09" title={zh ? "写真与分享" : "Portraits and sharing"} subtitle={zh ? "将本次测试结果整理成可保存、可分享的视觉档案。" : "Turn this assessment into a visual record that can be saved and shared."} />
          <ShareCard petName={record.pet.name} pbtiId={record.pbti_id} type={personality.code} personality={`${personality.emoji} ${displayPersonality.name}`} />
        </div>
        <PortraitGenerator petId={record.pet.id} resultId={record.pbti_id} petName={record.pet.name} pbtiCode={personality.code} personalityName={displayPersonality.name} />
      </section>

      <section id="chapter-10" className="mt-6 scroll-mt-24 rounded-[2rem] border border-[#eaded2] bg-[#fffaf5] p-6 shadow-sm sm:p-8">
        <ReportHeading number="10" title={zh ? "重要声明" : "Important notice"} subtitle={zh ? "明确测试、照片鉴定与健康建议的使用边界。" : "Clear boundaries for assessment, photo identification, and health guidance."} />
        <div className="mt-3 space-y-3 text-sm leading-7 text-[#655a51]">
          <p>{zh ? "本服务提供的品种与外观鉴定仅供参考，不用于判断宠物的来源、所有权、繁育经历，以及饲养、送养或交易行为是否合法。请遵守所在地适用的法律法规与动物福利要求，以尊重生命、负责任的方式作出决定。" : <>This service provides reference-only breed and appearance identification. It does not verify an animal&apos;s origin, ownership, breeding history, or the legality of keeping, rehoming, or trading the animal. Please comply with all applicable laws and animal-welfare requirements and make responsible decisions that respect life.</>}</p>
          <p className="font-bold text-[#4f463f]">{zh ? "拒绝弃养，爱不流浪。每个生命都值得拥有安全、稳定且充满关爱的家。" : "Never abandon a pet. Every companion animal deserves a safe, stable, and caring home for life."}</p>
          <p>{zh ? "健康与照护内容仅为喂养、日常养护及一般健康知识，不构成兽医诊断、问诊、处方或治疗方案，也不能替代执业兽医的线下面诊。宠物如有身体不适、受伤，或出现突发的身体与行为变化，请及时就医。" : "Health and care content is general educational information about feeding, husbandry, and everyday wellness. It is not a veterinary diagnosis, consultation, prescription, or treatment plan and cannot replace an in-person examination by a qualified veterinarian. Seek veterinary care promptly if a pet is unwell, injured, or shows sudden physical or behavioral changes."}</p>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push("/result")}
          className="flex-1 rounded-full border-2 border-[#eaded2] bg-white px-8 py-4 text-center font-bold text-[#4f463f] transition hover:bg-white/80"
        >
          {zh ? "返回结果" : "Back to Results"}
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex-1 rounded-full bg-[#ff7a1a] px-8 py-4 text-center font-black text-white shadow-[0_16px_35px_rgba(255,122,26,.32)] transition hover:-translate-y-0.5 hover:bg-[#ee6b10]"
        >
          {zh ? "前往用户中心" : "My Dashboard"}
        </button>
      </div>
    </div>
  );
}
