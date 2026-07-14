interface PersonalityCardProps {
  emoji: string;
  code: string;
  name: string;
  title: string;
  description: string;
}

export default function PersonalityCard({ emoji, code, name, title, description }: PersonalityCardProps) {
  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff0e4] text-2xl font-black text-[#ff7a1a]">{emoji}</div>
      <div className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#a3968a]">PBTI type code</div>
      <h2 className="mt-3 text-6xl font-black leading-none tracking-[-.07em] text-[#171514]">{code}</h2>
      <div className="mt-3 text-2xl font-black tracking-[-.04em] text-[#d96612]">{name}</div>
      <h3 className="mt-1 text-base font-semibold text-[#7a6d63]">{title}</h3>
      <p className="mt-5 leading-7 text-[#655a51]">{description}</p>
    </div>
  );
}
