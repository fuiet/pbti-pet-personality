export const runtime = "edge";

import { personalities } from "@/data/personalities";

export default async function ReportPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const personality=personalities.AECG;

 return (
  <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
   <section className="max-w-xl mx-auto">
    <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
      <div className="text-5xl">🐾</div>
      <p className="mt-4 text-sm">PET PERSONALITY ID</p>
      <h1 className="text-2xl font-bold">{id}</h1>

      <div className="text-6xl my-6}>{personality.emoji}</div>
      <h2 className="text-5xl font-bold">{personality.code}</h2>
      <h3 className="text-2xl mt-3">{personality.name}</h3>
      <p className="mt-5 leading-7">{personality.description}</p>

      <button className="mt-8 rounded-full bg-[#8b5e3c] px-8 py-4 text-white">
        Create Your Pet Personality
      </button>
    </div>
   </section>
  </main>
 );
}
