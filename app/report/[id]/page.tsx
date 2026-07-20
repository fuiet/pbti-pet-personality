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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e4] px-5 py-2 text-sm font-black text-[#d96612] shadow-sm ring-1 ring-[#ffd8bd]">
          PBTI ID {record.pbti_id}
        </div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-3xl border border-[#eaded2] bg-white p-5 shadow-sm">
        <div className="relative z-10 max-w-[72%]">
          <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{zh ? (species === "dog" ? "狗狗档案" : "猫咪档案") : species === "dog" ? "Dog profile" : "Cat profile"}</div>
          <div className="mt-2 text-2xl font-black text-[#171514]">{personality.code} / {displayPersonality.name}</div>
          <p className="mt-2 text-sm leading-6 text-[#655a51]">{zh ? "页面素材会根据爱宠物种与 PBTI 类型自动匹配。" : "The artwork shown here follows this pet's species and PBTI type."}</p>
        </div>
        <div className="pointer-events-none absolute -right-2 -bottom-8 h-36 w-36 sm:h-44 sm:w-44">
          <Image src={typeArtwork} alt="" fill unoptimized sizes="176px" className="object-contain drop-shadow-[0_14px_24px_rgba(52,34,20,.16)]" />
        </div>
      </div>
      <ShareCard
        petName={record.pet.name}
        pbtiId={record.pbti_id}
        type={personality.code}
        personality={`${personality.emoji} ${displayPersonality.name}`}
      />

      <div className="mt-6 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">{zh ? "性格总结" : "Summary"}</h3>
        <p className="text-sm leading-7 text-[#655a51]">{report.summary}</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">{zh ? "行为维度" : "Behavior Dimensions"}</h3>
        <div className="space-y-3">
          {(report.dimensionNarrative || []).map((item) => (
            <p key={item} className="text-sm leading-7 text-[#655a51]">{item}</p>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">{zh ? "爱宠鉴定" : "Pet Identification"}</h3>
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
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">{zh ? "爱的语言" : "Love Language"}</h3>
        <div className="space-y-5">
          {report.loveLanguage.map((section) => <div key={section.title}><h4 className="text-sm font-black text-[#4f463f]">{section.title}</h4><p className="mt-1 text-sm leading-7 text-[#655a51]">{section.body}</p></div>)}
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-[#171514]">{zh ? "相处关系" : "Relationship"}</h3>
        <div className="space-y-5">
          {report.relationship.map((section) => <div key={section.title}><h4 className="text-sm font-black text-[#4f463f]">{section.title}</h4><p className="mt-1 text-sm leading-7 text-[#655a51]">{section.body}</p></div>)}
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-[#eaded2] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#171514]">{zh ? "陪伴建议" : "Recommendations"}</h3>
        <ul className="space-y-3">
          {report.recommendations.map((rec, index) => (
            <li key={rec.title} className="flex items-start gap-3 text-sm leading-6 text-[#655a51]">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#fff0e4] text-xs text-[#ff7a1a]">
                {index + 1}
              </span>
              <div><h4 className="font-black text-[#4f463f]">{rec.title}</h4><p className="mt-1 leading-7">{rec.detail}</p></div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-3xl border border-[#ff7a1a]/30 bg-gradient-to-br from-[#fff0e4] to-white p-6 text-center shadow-sm">
        <div className="text-3xl font-black text-[#ff7a1a]">PBTI</div>
        <h3 className="mt-3 text-xl font-bold text-[#171514]">{zh ? "完整报告已生成" : "Your complete report is included"}</h3>
        <p className="mt-2 text-sm text-[#655a51]">{zh ? `这里包含 ${record.pet.name} 的行为分析、爱宠鉴定、照护建议与写真素材。` : `This report includes the full behavior analysis, visual notes, care guidance, and portrait-ready materials for ${record.pet.name}.`}</p>

      </div>

      <PortraitGenerator
        petId={record.pet.id}
        resultId={record.pbti_id}
        petName={record.pet.name}
        pbtiCode={personality.code}
        personalityName={displayPersonality.name}
      />

      <div className="mt-6 rounded-3xl border border-[#eaded2] bg-[#fffaf5] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#171514]">{zh ? "重要声明" : "Important notice"}</h3>
        <div className="mt-3 space-y-3 text-sm leading-7 text-[#655a51]">
          <p>{zh ? "本服务提供的品种与外观鉴定仅供参考，不用于判断宠物的来源、所有权、繁育经历，以及饲养、送养或交易行为是否合法。请遵守所在地适用的法律法规与动物福利要求，以尊重生命、负责任的方式作出决定。" : <>This service provides reference-only breed and appearance identification. It does not verify an animal&apos;s origin, ownership, breeding history, or the legality of keeping, rehoming, or trading the animal. Please comply with all applicable laws and animal-welfare requirements and make responsible decisions that respect life.</>}</p>
          <p className="font-bold text-[#4f463f]">{zh ? "拒绝弃养，爱不流浪。每个生命都值得拥有安全、稳定且充满关爱的家。" : "Never abandon a pet. Every companion animal deserves a safe, stable, and caring home for life."}</p>
          <p>{zh ? "健康与照护内容仅为喂养、日常养护及一般健康知识，不构成兽医诊断、问诊、处方或治疗方案，也不能替代执业兽医的线下面诊。宠物如有身体不适、受伤，或出现突发的身体与行为变化，请及时就医。" : "Health and care content is general educational information about feeding, husbandry, and everyday wellness. It is not a veterinary diagnosis, consultation, prescription, or treatment plan and cannot replace an in-person examination by a qualified veterinarian. Seek veterinary care promptly if a pet is unwell, injured, or shows sudden physical or behavioral changes."}</p>
        </div>
      </div>

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
