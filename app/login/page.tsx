"use client";

export default function LoginPage(){
 return(
  <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
   <section className="max-w-md mx-auto rounded-3xl bg-white p-8 text-center">
    <h1 className="text-3xl font-bold mb-6">Welcome Back</h1>
    <input className="w-full rounded-xl border p-4 mb-4" placeholder="Email" />
    <input className="w-full rounded-xl border p-4 mb-6" placeholder="Password" type="password" />
    <button className="w-full rounded-full bg-[#8b5e3c] p-4 text-white">
      Login
    </button>
   </section>
  </main>
 );
}
