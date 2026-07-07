interface PersonalityCardProps{
 emoji:string;
 code:string;
 name:string;
 description:string;
}

export default function PersonalityCard({emoji,code,name,description}:PersonalityCardProps){
 return(
  <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
   <div className="text-5xl">{emoji}</div>
   <div className="mt-4 text-sm">PBTI TYPE</div>
   <h2 className="text-5xl font-bold my-3">{code}</h2>
   <h3 className="text-2xl font-semibold">{name}</h3>
   <p className="mt-4 leading-7">{description}</p>
  </div>
 );
}
