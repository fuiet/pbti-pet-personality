interface QuizCardProps {
  question: string;
  options: { text: string; value: string }[];
  onSelect: (value: string) => void;
}

export default function QuizCard({ question, options, onSelect }: QuizCardProps) {
  return (
    <section className="rounded-[2rem] border border-[#eaded2] bg-white p-6 shadow-[0_24px_80px_rgba(52,34,20,.08)] sm:p-9">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fff0e4] text-sm font-black text-[#ff7a1a]">?</span>
        <span className="text-xs font-black uppercase tracking-[.18em] text-[#a3968a]">Choose the closest answer</span>
      </div>

      <h2 className="max-w-2xl text-[1.55rem] font-black leading-[1.3] tracking-[-.035em] text-[#171514] sm:text-[2rem]">
        {question}
      </h2>

      <div className="mt-8 space-y-4">
        {options.map((option, index) => (
          <button
            key={`${option.value}-${index}`}
            type="button"
            onClick={() => onSelect(option.value)}
            className="group flex w-full items-center gap-4 rounded-[1.35rem] border-2 border-[#eaded2] bg-[#fffdfa] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#ff7a1a] hover:bg-[#fff7ef] hover:shadow-[0_14px_32px_rgba(255,122,26,.12)] active:translate-y-0 active:scale-[.99] sm:p-5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#f1d8c2] bg-white text-sm font-black text-[#d96612] transition group-hover:border-[#ff7a1a] group-hover:bg-[#ff7a1a] group-hover:text-white">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1 text-sm font-bold leading-6 text-[#4f463f] sm:text-base">
              {option.text}
            </span>
            <span className="translate-x-[-4px] text-xl text-[#c8b6a7] opacity-0 transition group-hover:translate-x-0 group-hover:text-[#ff7a1a] group-hover:opacity-100">→</span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-[#a3968a]">
        There is no right or wrong answer. Choose what best matches your pet's usual behavior.
      </p>
    </section>
  );
}
