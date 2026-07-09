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
{id:4,dimension:"A/I",question:"When you call its name, your cat usually:",options:[{text:"Comes over or clearly responds",value:"A"},{text:"Looks at you but stays where it is",value:"I"},{text:"Responds only when it wants to",value:"I"}]},
{id:5,dimension:"A/I",question:"When you work or study, your cat:",options:[{text:"Stays nearby or sits on your things",value:"A"},{text:"Checks on you occasionally",value:"A"},{text:"Prefers another quiet spot",value:"I"}]},
{id:6,dimension:"A/I",question:"Your cat's ideal affection style is:",options:[{text:"Frequent touch and attention",value:"A"},{text:"Short gentle moments",value:"I"},{text:"Affection on its own schedule",value:"I"}]},
{id:7,dimension:"A/I",question:"When family members gather, your cat:",options:[{text:"Likes being part of the group",value:"A"},{text:"Watches from a comfortable distance",value:"I"},{text:"Leaves for a private space",value:"I"}]},
{id:8,dimension:"A/I",question:"At bedtime, your cat often:",options:[{text:"Sleeps close to you",value:"A"},{text:"Starts close then moves away",value:"A"},{text:"Chooses its own separate bed",value:"I"}]},
{id:9,dimension:"A/I",question:"After being ignored for a while, your cat:",options:[{text:"Asks for attention",value:"A"},{text:"Quietly stays near you",value:"A"},{text:"Seems perfectly fine alone",value:"I"}]},

{id:10,dimension:"E/S",question:"A new object appears at home:",options:[{text:"Immediately investigates",value:"E"},{text:"Observes first",value:"S"}]},
{id:11,dimension:"E/S",question:"Your cat reacts to new rooms by:",options:[{text:"Exploring quickly",value:"E"},{text:"Slowly adapting",value:"S"}]},
{id:12,dimension:"E/S",question:"Your cat likes:",options:[{text:"New experiences",value:"E"},{text:"Familiar routines",value:"S"}]},
{id:13,dimension:"E/S",question:"When a cardboard box appears, your cat:",options:[{text:"Jumps in or inspects it fast",value:"E"},{text:"Smells and studies it first",value:"S"},{text:"May ignore it until later",value:"S"}]},
{id:14,dimension:"E/S",question:"With a new toy, your cat usually:",options:[{text:"Plays right away",value:"E"},{text:"Approaches carefully",value:"S"},{text:"Needs time before trying it",value:"S"}]},
{id:15,dimension:"E/S",question:"If furniture is moved, your cat:",options:[{text:"Investigates the change",value:"E"},{text:"Feels cautious at first",value:"S"},{text:"Prefers things back to normal",value:"S"}]},
{id:16,dimension:"E/S",question:"When hearing an unfamiliar sound, your cat:",options:[{text:"Moves toward it to check",value:"E"},{text:"Freezes and listens",value:"S"},{text:"Hides until it feels safe",value:"S"}]},
{id:17,dimension:"E/S",question:"Your cat's daily route is:",options:[{text:"Always changing and exploratory",value:"E"},{text:"Mostly predictable",value:"S"},{text:"Focused on favorite safe places",value:"S"}]},
{id:18,dimension:"E/S",question:"At the window, your cat:",options:[{text:"Tracks every movement outside",value:"E"},{text:"Watches calmly",value:"S"},{text:"Only looks when something familiar appears",value:"S"}]},

{id:19,dimension:"V/C",question:"When excited, your cat:",options:[{text:"Shows obvious excitement",value:"V"},{text:"Remains calm",value:"C"}]},
{id:20,dimension:"V/C",question:"Your cat communicates by:",options:[{text:"Frequent actions and sounds",value:"V"},{text:"Quiet signals",value:"C"}]},
{id:21,dimension:"V/C",question:"During play, your cat is:",options:[{text:"Very energetic",value:"V"},{text:"Gentle and controlled",value:"C"}]},
{id:22,dimension:"V/C",question:"When hungry, your cat:",options:[{text:"Clearly reminds everyone",value:"V"},{text:"Waits or gives subtle hints",value:"C"},{text:"Quietly sits near the food area",value:"C"}]},
{id:23,dimension:"V/C",question:"When it wants something, your cat:",options:[{text:"Uses meows, paws, or big gestures",value:"V"},{text:"Uses eye contact or small movements",value:"C"},{text:"Waits patiently",value:"C"}]},
{id:24,dimension:"V/C",question:"After a sudden surprise, your cat:",options:[{text:"Reacts dramatically",value:"V"},{text:"Recovers quietly",value:"C"},{text:"Stays composed",value:"C"}]},
{id:25,dimension:"V/C",question:"Your cat's emotional expression is:",options:[{text:"Easy to read and expressive",value:"V"},{text:"Soft and understated",value:"C"},{text:"Mostly calm unless very interested",value:"C"}]},
{id:26,dimension:"V/C",question:"During zoomies, your cat:",options:[{text:"Runs wildly with strong energy",value:"V"},{text:"Has short controlled bursts",value:"C"},{text:"Rarely gets very intense",value:"C"}]},
{id:27,dimension:"V/C",question:"When greeting people it likes, your cat:",options:[{text:"Shows visible excitement",value:"V"},{text:"Gives gentle, quiet attention",value:"C"},{text:"Stays relaxed and composed",value:"C"}]},

{id:28,dimension:"P/G",question:"Your cat sees the home as:",options:[{text:"A playground",value:"P"},{text:"A territory to watch",value:"G"}]},
{id:29,dimension:"P/G",question:"Your cat often:",options:[{text:"Starts games",value:"P"},{text:"Observes everyone",value:"G"}]},
{id:30,dimension:"P/G",question:"With guests, your cat:",options:[{text:"Wants interaction",value:"P"},{text:"Carefully observes",value:"G"}]},
{id:31,dimension:"P/G",question:"When another pet or person moves around, your cat:",options:[{text:"Tries to join the activity",value:"P"},{text:"Monitors what is happening",value:"G"},{text:"Keeps a watchful distance",value:"G"}]},
{id:32,dimension:"P/G",question:"Your cat's favorite moments are:",options:[{text:"Interactive play sessions",value:"P"},{text:"Quiet observation from a high spot",value:"G"},{text:"Watching the household routine",value:"G"}]},
{id:33,dimension:"P/G",question:"When you introduce a puzzle feeder, your cat:",options:[{text:"Treats it like a game",value:"P"},{text:"Studies the mechanism carefully",value:"G"},{text:"Solves it patiently",value:"G"}]},
{id:34,dimension:"P/G",question:"If something unusual happens at home, your cat:",options:[{text:"Turns it into a game",value:"P"},{text:"Checks the situation",value:"G"},{text:"Keeps watch until it feels normal",value:"G"}]},
{id:35,dimension:"P/G",question:"Your cat's relationship with its territory is:",options:[{text:"Playful and flexible",value:"P"},{text:"Careful and protective",value:"G"},{text:"Observant and structured",value:"G"}]},
{id:36,dimension:"P/G",question:"If you hide a toy, your cat:",options:[{text:"Hunts it like a game",value:"P"},{text:"Searches methodically",value:"G"},{text:"Watches and waits for clues",value:"G"}]}
];