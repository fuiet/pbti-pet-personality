"use client";

import { useState } from "react";

export default function UploadPage(){
 const [preview,setPreview]=useState<string>("");

 function handleUpload(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];
  if(file){
   setPreview(URL.createObjectURL(file));
  }
 }

 return(
  <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
   <section className="max-w-xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Upload Your Pet Photo</h1>

    <div className="rounded-3xl bg-white p-8 text-center">
      {preview ? (
        <img src={preview} className="mx-auto rounded-2xl max-h-80 object-cover" />
      ) : (
        <div className="py-20 text-5xl">🐾</div>
      )}

      <input
       type="file"
       accept="image/*"
       onChange={handleUpload}
       className="mt-6"
      />

      <a
       href="/quiz"
       className="block mt-8 rounded-full bg-[#8b5e3c] px-8 py-4 text-white"
      >
       Start Personality Test
      </a>
    </div>
   </section>
  </main>
 );
}
