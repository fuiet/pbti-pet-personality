export default function ProgressBar({current,total}:{current:number;total:number}){
 const width=`${(current/total)*100}%`;
 return (
  <div className="h-2 rounded-full bg-[#eadfd3] overflow-hidden">
   <div className="h-full bg-[#8b5e3c]" style={{width}} />
  </div>
 );
}
