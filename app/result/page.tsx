"use client";

import { personalities } from "@/data/personalities";
import { calculatePBTI } from "@/lib/pbtiEngine";

export default function ResultPage(){
 const answers=typeof window!=="undefined"
 ? JSON.parse(localStorage.getItem("pbti_answers")||"[]")
 : [];

 const result=calculatePBTI(answers);
 const personality=personalities[result.type] || personalities.AECG;

 return (
  <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
   <section className="max-w-xl mx-auto text-center bg-white rounded-3xl p-8">
    <div className="text-5xl mb-4">🐾</div>
    <p className="text-sm">Your Pet's PBTI Type</p>
    <h1 className="text-5xl font-bold my-4">{personality.code}</h1>
    <h2 className="text-2xl font-semibold">{personality.emoji} {personality.name}</h2>
    <p className="mt-4 leading-7">{personality.description}</p>

    <a
     href="/premium"
     className="inline-block mt-8 rounded-full bg-[#8b5e3c] px-8 py-4 text-white"
    >
      Unlock Full Report · $9.99
    </a>
   </section>
  </main>
 );
}
