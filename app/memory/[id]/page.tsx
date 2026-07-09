export const runtime = "edge";
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import MemoryTimeline from "@/components/MemoryTimeline";

export default function MemoryBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pet, setPet] = useState<{ name?: string; species?: string }>({});

  useEffect(() => {
    const stored = localStorage.getItem("pbti_pet");
    if (stored) {
      try { setPet(JSON.parse(stored)); } catch { /* */ }
    }
  }, []);

  return (\n    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">\n      {pet.name || "Pet"} || @components/MemoryTimeline }\n    </div>\n  );
}
