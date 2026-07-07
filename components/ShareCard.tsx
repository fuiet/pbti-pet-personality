interface ShareCardProps{
 petName:string;
 pbtiId:string;
 type:string;
 personality:string;
}

export default function ShareCard({petName,pbtiId,type,personality}:ShareCardProps){
 return (
  <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
   <div className="text-5xl">🐾</div>
   <h2 className="text-2xl font-bold mt-4">{petName}</h2>
   <p className="text-sm mt-2">{pbtiId}</p>
   <div className="text-5xl font-bold my-4">{type}</div>
   <p className="text-lg">{personality}</p>
  </div>
 );
}
