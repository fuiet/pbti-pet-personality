export default async function MemoryBookPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;

 return(
  <main className="min-h-screen bg-[#faf7f2] p-8 text-[#33251d]">
   <section className="max-w-xl mx-auto">
    <div className="rounded-3xl bg-white p-8 text-center">
      <div className="text-5xl">🐾</div>
      <h1 className="text-3xl font-bold mt-4">Pet Memory Book</h1>
      <p className="mt-3">Memory ID: {id}</p>

      <div className="mt-8 rounded-2xl bg-[#faf7f2] p-6 text-left">
        <h2 className="font-bold">Your Pet's Journey</h2>
        <p className="mt-3 text-sm leading-6">
          Upload photos and create a timeline of your pet's life story with AI.
        </p>
      </div>
    </div>
   </section>
  </main>
 );
}
