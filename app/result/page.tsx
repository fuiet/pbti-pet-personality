"use client";

import { personalities } from "@/data/personalities";
import { calculatePBTI } from "@/lib/pbtiEngine";

export default function ResultPage(){
 const answers=typeof window!=="undefined"
 ? JSON.parse(localStorage.getItem("pbti_answers")||"[]")
 : [];

 const pet=typeof window!=="undefined"
 ? JSON.parse(localStorage.getItem("pbti_pet")||"{}")
 : {};

 const result=calculatePBTI(answers);
 const personality=personalities[result.type] || personalities.AECG;

 const total=Object.values(result.scores).reduce((a,b)=>a+b,0)||1;

 const dna=[
  {name:"Attachment",value:Math.round(((result.scores.A||0)/total)*100)},
  {name:"Exploration",value:Math.round(((result.scores.E||0)/total)*100)},
  {name:"Calmness",value:Math.round(((result.scores.C||0)/total)*100)},
  {name:"Guardian",value:Math.round(((result.scores.G||0)/total)*100)}
 ];

 return (
  <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
   <section className="max-w-xl mx-auto">
    <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
      <div className="text-5xl mb-4">
        {pet.species==="dog"?"🐶":"🐱"}
      </div>

      <p className="text-sm tracking-widest">YOUR PET'S PBTI TYPE</p>

      <h1 className="text-6xl font-bold my-4">
        {personality.code}
      </h1>

      <h2 className="text-2xl font-semibold">
        {personality.emoji} {personality.name}
      </h2>

      <p className="mt-5 leading-7">
        {personality.description}
      </p>
    </div>

    <div className="mt-6 rounded-3xl bg-white p-8">
      <h3 className="text-xl font-bold mb-5">Personality DNA</h3>

      <div className="space-y-4">
       {dna.map(item=>(
        <div key={item.name}>
          <div className="flex justify-between text-sm mb-1">
            <span>{item.name}</span>
            <span>{item.value}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#eadfd3]">
            <div
             className="h-2 rounded-full bg-[#8b5e3c]"
             style={{width:`${item.value}%`}}
            />
          </div>
        </div>
       ))}
      </div>
    </div>

    <a
      href="/premium"
      className="block mt-6 text-center rounded-full bg-[#8b5e3c] px-8 py-4 text-white"
    >
      Unlock Full Report · $9.99
    </a>
   </section>
  </main>
 );
}
