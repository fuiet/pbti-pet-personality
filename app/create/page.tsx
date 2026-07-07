"use client";

import { useState } from "react";

export default function CreatePet() {
  const [species,setSpecies]=useState("cat");

  function saveProfile(){
    localStorage.setItem("pbti_pet",JSON.stringify({species}));
    window.location.href="/upload";
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Your Pet Profile</h1>

        <div className="space-y-4">
          <input className="w-full rounded-xl p-4 border" placeholder="Pet Name" />

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={()=>setSpecies("cat")}
              className={`rounded-2xl p-6 border ${species==="cat"?"bg-white shadow":""}`}
            >
              🐱 Cat
            </button>
            <button
              onClick={()=>setSpecies("dog")}
              className={`rounded-2xl p-6 border ${species==="dog"?"bg-white shadow":""}`}
            >
              🐶 Dog
            </button>
          </div>

          <input className="w-full rounded-xl p-4 border" placeholder="Breed" />
          <input className="w-full rounded-xl p-4 border" placeholder="Age" />
        </div>

        <button
          onClick={saveProfile}
          className="mt-8 rounded-full bg-[#8b5e3c] px-8 py-4 text-white"
        >
          Continue
        </button>
      </div>
    </main>
  );
}
