interface ShareCardProps {
  petName: string;
  pbtiId: string;
  type: string;
  personality: string;
}

export default function ShareCard({ petName, pbtiId, type, personality }: ShareCardProps) {
  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
      <div className="text-5xl font-black text-[#ff7a1a]">PBTI</div>
      <h2 className="mt-4 text-2xl font-bold">{petName}</h2>
      <p className="mt-2 text-sm">{pbtiId}</p>
      <div className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-[#a3968a]">Profile code</div>
      <div className="my-2 text-4xl font-bold">{type}</div>
      <p className="text-lg">{personality}</p>
    </div>
  );
}
