"use client";

const pets=[
 {
  name:"Luna",
  type:"Cat",
  pbti:"AECG",
  identity:"PBTI-M9K4X2",
  personality:"Gentle Guardian"
 }
];

export default function Dashboard(){
 return(
  <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
   <section className="max-w-3xl mx-auto">
    <h1 className="text-4xl font-bold mb-8">My Pets</h1>

    <div className="space-y-5">
     {pets.map((pet)=>(
      <div key={pet.identity} className="rounded-3xl bg-white p-6">
       <div className="text-4xl">🐱</div>
       <h2 className="text-2xl font-bold mt-3">{pet.name}</h2>
       <p>{pet.type}</p>
       <div className="mt-4 font-semibold">{pet.pbti} · {pet.personality}</div>
       <div className="text-sm mt-2">Identity ID: {pet.identity}</div>

       <button className="mt-5 rounded-full bg-[#8b5e3c] px-6 py-3 text-white">
        View Report
       </button>
      </div>
     ))}
    </div>
   </section>
  </main>
 );
}
