export type DogTrait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";

export interface Question {
  id: number;
  dimension: string;
  question: string;
  options: { text: string; value: DogTrait }[];
}

export const dogQuestions: Question[] = [
  { id: 1, dimension: "A/I", question: "When you leave home, your dog usually:", options: [{ text: "Watches you closely and waits for your return", value: "A" }, { text: "Settles into its own routine", value: "I" }, { text: "Notices, then relaxes independently", value: "I" }] },
  { id: 2, dimension: "A/I", question: "Your dog prefers:", options: [{ text: "Following you from room to room", value: "A" }, { text: "Being nearby but not always attached", value: "A" }, { text: "Having independent time", value: "I" }] },
  { id: 3, dimension: "A/I", question: "When you sit down, your dog:", options: [{ text: "Comes close or leans on you", value: "A" }, { text: "Stays comfortably nearby", value: "A" }, { text: "Chooses its own resting spot", value: "I" }] },
  { id: 4, dimension: "A/I", question: "When you call its name, your dog usually:", options: [{ text: "Comes over quickly", value: "A" }, { text: "Looks at you and decides", value: "I" }, { text: "Responds when it feels relevant", value: "I" }] },
  { id: 5, dimension: "A/I", question: "During quiet evenings, your dog:", options: [{ text: "Wants contact or shared space", value: "A" }, { text: "Checks in occasionally", value: "A" }, { text: "Enjoys its own comfortable corner", value: "I" }] },
  { id: 6, dimension: "A/I", question: "Your dog's ideal affection style is:", options: [{ text: "Frequent attention and closeness", value: "A" }, { text: "Short warm moments", value: "I" }, { text: "Affection on its own schedule", value: "I" }] },
  { id: 7, dimension: "A/I", question: "When family members gather, your dog:", options: [{ text: "Wants to be part of the group", value: "A" }, { text: "Stays near but calm", value: "A" }, { text: "Observes from a chosen spot", value: "I" }] },
  { id: 8, dimension: "A/I", question: "At bedtime, your dog often:", options: [{ text: "Sleeps close to people", value: "A" }, { text: "Starts nearby then moves away", value: "A" }, { text: "Chooses a separate bed", value: "I" }] },
  { id: 9, dimension: "A/I", question: "After being ignored for a while, your dog:", options: [{ text: "Asks for interaction", value: "A" }, { text: "Quietly stays near you", value: "A" }, { text: "Seems content doing its own thing", value: "I" }] },

  { id: 10, dimension: "E/S", question: "At a new park, your dog:", options: [{ text: "Explores immediately", value: "E" }, { text: "Studies the area first", value: "S" }, { text: "Needs time before relaxing", value: "S" }] },
  { id: 11, dimension: "E/S", question: "New visitors make your dog:", options: [{ text: "Curious and excited", value: "E" }, { text: "Careful and observant", value: "S" }, { text: "Cautious until familiar", value: "S" }] },
  { id: 12, dimension: "E/S", question: "Your dog enjoys:", options: [{ text: "New adventures", value: "E" }, { text: "Known routines", value: "S" }, { text: "Small changes after warming up", value: "S" }] },
  { id: 13, dimension: "E/S", question: "When a new toy appears, your dog:", options: [{ text: "Plays with it right away", value: "E" }, { text: "Sniffs and tests it first", value: "S" }, { text: "Waits until it feels safe", value: "S" }] },
  { id: 14, dimension: "E/S", question: "If furniture is moved, your dog:", options: [{ text: "Investigates the change", value: "E" }, { text: "Checks it carefully", value: "S" }, { text: "Prefers the familiar layout", value: "S" }] },
  { id: 15, dimension: "E/S", question: "On a new walking route, your dog:", options: [{ text: "Moves forward with interest", value: "E" }, { text: "Pauses to understand the route", value: "S" }, { text: "Feels better on known paths", value: "S" }] },
  { id: 16, dimension: "E/S", question: "When hearing an unfamiliar sound, your dog:", options: [{ text: "Moves toward it to check", value: "E" }, { text: "Freezes and listens", value: "S" }, { text: "Stays close to safety", value: "S" }] },
  { id: 17, dimension: "E/S", question: "Your dog's daily rhythm is:", options: [{ text: "Flexible and curious", value: "E" }, { text: "Mostly predictable", value: "S" }, { text: "Strongly tied to routine", value: "S" }] },
  { id: 18, dimension: "E/S", question: "In a busy place, your dog:", options: [{ text: "Wants to inspect everything", value: "E" }, { text: "Observes before engaging", value: "S" }, { text: "Stays close and careful", value: "S" }] },

  { id: 19, dimension: "V/C", question: "Your dog expresses happiness:", options: [{ text: "Very clearly and energetically", value: "V" }, { text: "Warmly but calmly", value: "C" }, { text: "With subtle signs", value: "C" }] },
  { id: 20, dimension: "V/C", question: "During play, your dog:", options: [{ text: "Gets highly excited", value: "V" }, { text: "Plays with steady control", value: "C" }, { text: "Prefers gentle interaction", value: "C" }] },
  { id: 21, dimension: "V/C", question: "When it wants something, your dog:", options: [{ text: "Uses obvious sounds or gestures", value: "V" }, { text: "Looks at you or waits", value: "C" }, { text: "Gives quiet signals", value: "C" }] },
  { id: 22, dimension: "V/C", question: "When excited by food, your dog:", options: [{ text: "Shows strong anticipation", value: "V" }, { text: "Waits with some excitement", value: "C" }, { text: "Stays composed", value: "C" }] },
  { id: 23, dimension: "V/C", question: "After a sudden surprise, your dog:", options: [{ text: "Reacts dramatically", value: "V" }, { text: "Recovers quickly and calmly", value: "C" }, { text: "Stays measured", value: "C" }] },
  { id: 24, dimension: "V/C", question: "Your dog's emotional expression is:", options: [{ text: "Easy to read and expressive", value: "V" }, { text: "Soft and understated", value: "C" }, { text: "Mostly calm unless very interested", value: "C" }] },
  { id: 25, dimension: "V/C", question: "When greeting favorite people, your dog:", options: [{ text: "Shows big excitement", value: "V" }, { text: "Gives calm attention", value: "C" }, { text: "Waits politely", value: "C" }] },
  { id: 26, dimension: "V/C", question: "On energetic days, your dog:", options: [{ text: "Bursts into movement and play", value: "V" }, { text: "Has controlled playful moments", value: "C" }, { text: "Keeps a steady pace", value: "C" }] },
  { id: 27, dimension: "V/C", question: "Your dog's personality feels:", options: [{ text: "Full of visible energy", value: "V" }, { text: "Peaceful and balanced", value: "C" }, { text: "Quietly expressive", value: "C" }] },

  { id: 28, dimension: "P/G", question: "Your dog usually:", options: [{ text: "Looks for games and fun", value: "P" }, { text: "Watches and protects family", value: "G" }, { text: "Keeps track of the home", value: "G" }] },
  { id: 29, dimension: "P/G", question: "When strangers arrive, your dog:", options: [{ text: "Wants to interact", value: "P" }, { text: "Checks the situation", value: "G" }, { text: "Keeps a watchful distance", value: "G" }] },
  { id: 30, dimension: "P/G", question: "Your dog's role at home is:", options: [{ text: "Playmate", value: "P" }, { text: "Companion and guardian", value: "G" }, { text: "Calm household observer", value: "G" }] },
  { id: 31, dimension: "P/G", question: "When people move around the home, your dog:", options: [{ text: "Tries to join the activity", value: "P" }, { text: "Monitors what is happening", value: "G" }, { text: "Stays aware from its spot", value: "G" }] },
  { id: 32, dimension: "P/G", question: "Your dog's favorite moments are:", options: [{ text: "Interactive play sessions", value: "P" }, { text: "Calm watchful companionship", value: "G" }, { text: "Following household routines", value: "G" }] },
  { id: 33, dimension: "P/G", question: "With a puzzle feeder, your dog:", options: [{ text: "Treats it like a game", value: "P" }, { text: "Studies it carefully", value: "G" }, { text: "Solves it patiently", value: "G" }] },
  { id: 34, dimension: "P/G", question: "If something unusual happens at home, your dog:", options: [{ text: "Turns it into a playful moment", value: "P" }, { text: "Checks the situation", value: "G" }, { text: "Keeps watch until things feel normal", value: "G" }] },
  { id: 35, dimension: "P/G", question: "Your dog's relationship with its space is:", options: [{ text: "Playful and flexible", value: "P" }, { text: "Careful and protective", value: "G" }, { text: "Observant and structured", value: "G" }] },
  { id: 36, dimension: "P/G", question: "If you hide a toy, your dog:", options: [{ text: "Hunts it like a game", value: "P" }, { text: "Searches methodically", value: "G" }, { text: "Watches and waits for clues", value: "G" }] },
];