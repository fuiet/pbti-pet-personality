export type CatTrait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";

export interface Question {
  id:number;
  dimension:string;
  question:string;
  options:{text:string; value:CatTrait}[];
}

export const catQuestions:Question[]=[
{id:1,dimension:"A/I",question:"When you come home, your cat usually:",options:[{text:"Comes to greet you",value:"A"},{text:"Watches you and slowly approaches",value:"A"},{text:"Continues doing its own thing",value:"I"}]},
{id:2,dimension:"A/I",question:"Your cat prefers:",options:[{text:"Being close to you",value:"A"},{text:"Having its own private space",value:"I"},{text:"Choosing when to interact",value:"I"}]},
{id:3,dimension:"A/I",question:"When resting, your cat:",options:[{text:"Sleeps near family members",value:"A"},{text:"Chooses a quiet place alone",value:"I"}]},
{id:4,dimension:"E/S",question:"A new object appears at home:",options:[{text:"Immediately investigates",value:"E"},{text:"Observes first",value:"S"}]},
{id:5,dimension:"E/S",question:"Your cat reacts to new rooms by:",options:[{text:"Exploring quickly",value:"E"},{text:"Slowly adapting",value:"S"}]},
{id:6,dimension:"E/S",question:"Your cat likes:",options:[{text:"New experiences",value:"E"},{text:"Familiar routines",value:"S"}]},
{id:7,dimension:"V/C",question:"When excited, your cat:",options:[{text:"Shows obvious excitement",value:"V"},{text:"Remains calm",value:"C"}]},
{id:8,dimension:"V/C",question:"Your cat communicates by:",options:[{text:"Frequent actions and sounds",value:"V"},{text:"Quiet signals",value:"C"}]},
{id:9,dimension:"V/C",question:"During play, your cat is:",options:[{text:"Very energetic",value:"V"},{text:"Gentle and controlled",value:"C"}]},
{id:10,dimension:"P/G",question:"Your cat sees the home as:",options:[{text:"A playground",value:"P"},{text:"A territory to watch",value:"G"}]},
{id:11,dimension:"P/G",question:"Your cat often:",options:[{text:"Starts games",value:"P"},{text:"Observes everyone",value:"G"}]},
{id:12,dimension:"P/G",question:"With guests, your cat:",options:[{text:"Wants interaction",value:"P"},{text:"Carefully observes",value:"G"}]}
];
