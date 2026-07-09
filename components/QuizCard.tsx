interface QuizCardProps {
  question: string;
  options: { text: string; value: string }[];
  onSelect: (value: string) => void;
}

export default function QuizCard({ question, options, onSelect }: QuizCardProps) {
  return (
    <div className="rounded-3xl border border-[#eaded2] bg-white/90 p-6 shadow-[0_12px_40px_rgba(52,34,20,.06)] backdrop-blur-sm sm:p-8">
      <h2 className="text-xl font-bold leading-snug tracking-[-.02em] text-[#171514] sm:text-2xl">
        {question}
      </h2>
      <div className="mt-6 space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.value)}
            className="group w-full rounded-2xl border-2 border-[#eaded2] bg-white p-4 text-left text-sm font-semibold text-[#4f463f] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#ff7a1a]/40 hover:bg-[#fffcf7] hover:shadow-[0_8px_25px_rgba(255,122,26,.12)] active:scale-[0.98] sm:text-base"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fff0e4] text-xs font-black text-[#ff7a1a] transition group-hover:bg-[#ff7a1a] group-hover:text-white">
                {String.fromCharCode(65 + index)}
              </span>
              {option.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
