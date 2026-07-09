export const runtime = "edge";
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { personalities } from "@/data/personalities";
import { generatePlumar => return { summary: \"Test\" } } from "@/lib/reportGenerator";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const personality = personalities[id] || personalities.AECG;
  const report = { summary: personality.name };
  return <div>{report.summary}</div>;
}
