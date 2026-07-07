export type DogTrait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";

export interface Question {
 id:number;
 dimension:string;
 question:string;
 options:{text:string;value:DogTrait}[];
}

export const dogQuestions:Question[]=[
{id:1,dimension:"A/I",question:"When you leave home, your dog usually:",options:[{text:"Waits and shows strong attachment",value:"A"},{text:"Relaxes and follows its routine",value:"I"}]},
{id:2,dimension:"A/I",question:"Your dog prefers:",options:[{text:"Following you everywhere",value:"A"},{text:"Having independent time",value:"I"}]},
{id:3,dimension:"A/I",question:"When you sit down, your dog:",options:[{text:"Wants to be near you",value:"A"},{text:"Stays comfortably nearby",value:"I"}]},
{id:4,dimension:"E/S",question:"At a new park, your dog:",options:[{text:"Explores immediately",value:"E"},{text:"Adapts slowly",value:"S"}]},
{id:5,dimension:"E/S",question:"New visitors make your dog:",options:[{text:"Curious and excited",value:"E"},{text:"Careful and observant",value:"S"}]},
{id:6,dimension:"E/S",question:"Your dog enjoys:",options:[{text:"New adventures",value:"E"},{text:"Known routines",value:"S"}]},
{id:7,dimension:"V/C",question:"Your dog expresses happiness:",options:[{text:"Very clearly and energetically",value:"V"},{text:"Calmly",value:"C"}]},
{id:8,dimension:"V/C",question:"During play, your dog:",options:[{text:"Gets highly excited",value:"V"},{text:"Plays gently",value:"C"}]},
{id:9,dimension:"V/C",question:"Your dog's personality feels:",options:[{text:"Full of energy",value:"V"},{text:"Peaceful",value:"C"}]},
{id:10,dimension:"P/G",question:"Your dog usually:",options:[{text:"Wants games and fun",value:"P"},{text:"Watches and protects family",value:"G"}]},
{id:11,dimension:"P/G",question:"When strangers arrive:",options:[{text:"Wants to interact",value:"P"},{text:"Checks the situation",value:"G"}]},
{id:12,dimension:"P/G",question:"Your dog's role at home is:",options:[{text:"Playmate",value:"P"},{text:"Companion and guardian",value:"G"}]}
];
