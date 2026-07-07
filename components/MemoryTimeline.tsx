interface MemoryItem{
 date:string;
 title:string;
 description:string;
}

export default function MemoryTimeline({items}:{items:MemoryItem[]}){
 return(
  <div className="space-y-5">
   {items.map((item,index)=>(
    <div key={index} className="rounded-2xl bg-white p-5">
     <div className="text-sm">{item.date}</div>
     <h3 className="font-bold mt-2">{item.title}</h3>
     <p className="text-sm mt-2">{item.description}</p>
    </div>
   ))}
  </div>
 );
}
