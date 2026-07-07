interface QuizCardProps {
  question:string;
  options:{text:string;value:string}[];
  onSelect:(value:string)=>void;
}

export default function QuizCard({question,options,onSelect}:QuizCardProps){
 return (
  <div className="rounded-3xl bg-white p-8 shadow-sm">
    <h2 className="text-xl font-semibold mb-6">{question}</h2>
    <div className="space-y-3">
      {options.map((option,index)=>(
        <button
          key={index}
          onClick={()=>onSelect(option.value)}
          className="w-full rounded-2xl border p-4 text-left hover:bg-[#faf7f2]"
        >
          {option.text}
        </button>
      ))}
    </div>
  </div>
 );
}
