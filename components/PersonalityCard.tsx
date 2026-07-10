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
      <div className="text-5xl">{emoji}</div>
      <div className="mt-4 text-sm font-bold tracking-[0.16em] text-[#a3968a]">PERSONALITY</div>
      <h2 className="mt-3 text-4xl font-bold text-[#171514]">{name}</h2>
      <h3 className="mt-2 text-base font-semibold text-[#d96612]">{title}</h3>
      <p className="mt-2 text-sm font-bold text-[#7a6d63]">Profile code: {code}</p>
      <p className="mt-4 leading-7">{description}</p>
    </div>
  );
}
