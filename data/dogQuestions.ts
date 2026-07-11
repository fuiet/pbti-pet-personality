export type DogTrait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";

export interface Question {
  id: number;
  dimension: string;
  question: string;
  options: { text: string; value: DogTrait }[];
}

export const dogQuestions: Question[] = [
  { id: 1, dimension: "A/I", question: "When you come home, your dog usually:", options: [{ text: "Rushes over to greet you", value: "A" }, { text: "Greets you calmly after a moment", value: "A" }, { text: "Continues what it was doing", value: "I" }] },
  { id: 2, dimension: "A/I", question: "Your dog prefers:", options: [{ text: "Following you from room to room", value: "A" }, { text: "Staying nearby without constant contact", value: "A" }, { text: "Having plenty of independent time", value: "I" }] },
  { id: 3, dimension: "A/I", question: "When you sit down, your dog:", options: [{ text: "Immediately comes close", value: "A" }, { text: "Settles somewhere nearby", value: "A" }, { text: "Chooses its own separate spot", value: "I" }] },
  { id: 4, dimension: "A/I", question: "When left alone for a short time, your dog:", options: [{ text: "Waits near the door or window", value: "A" }, { text: "Checks for you, then relaxes", value: "A" }, { text: "Comfortably follows its own routine", value: "I" }] },
  { id: 5, dimension: "A/I", question: "During family activities, your dog:", options: [{ text: "Wants to be included", value: "A" }, { text: "Observes from nearby", value: "A" }, { text: "Often prefers another room", value: "I" }] },
  { id: 6, dimension: "A/I", question: "Your dog's ideal affection style is:", options: [{ text: "Frequent touch and attention", value: "A" }, { text: "Regular but gentle contact", value: "A" }, { text: "Affection mostly on its own terms", value: "I" }] },
  { id: 7, dimension: "A/I", question: "At bedtime, your dog usually:", options: [{ text: "Sleeps very close to you", value: "A" }, { text: "Sleeps in the same room", value: "A" }, { text: "Chooses a separate place", value: "I" }] },
  { id: 8, dimension: "A/I", question: "When you call its name, your dog:", options: [{ text: "Comes quickly", value: "A" }, { text: "Looks to you and decides", value: "A" }, { text: "Responds mainly when motivated", value: "I" }] },
  { id: 9, dimension: "A/I", question: "After a busy day, your dog relaxes best by:", options: [{ text: "Resting against you", value: "A" }, { text: "Staying in the same space", value: "A" }, { text: "Unwinding alone", value: "I" }] },

  { id: 10, dimension: "E/S", question: "At a new park, your dog:", options: [{ text: "Explores immediately", value: "E" }, { text: "Looks around before moving", value: "S" }, { text: "Stays close until it feels safe", value: "S" }] },
  { id: 11, dimension: "E/S", question: "When meeting a new person, your dog:", options: [{ text: "Approaches with curiosity", value: "E" }, { text: "Observes first", value: "S" }, { text: "Keeps distance for a while", value: "S" }] },
  { id: 12, dimension: "E/S", question: "Your dog enjoys:", options: [{ text: "New routes and adventures", value: "E" }, { text: "A mix of new and familiar places", value: "E" }, { text: "Known routines and locations", value: "S" }] },
  { id: 13, dimension: "E/S", question: "When a new toy appears, your dog:", options: [{ text: "Starts investigating at once", value: "E" }, { text: "Sniffs and studies it first", value: "S" }, { text: "Needs encouragement to try it", value: "S" }] },
  { id: 14, dimension: "E/S", question: "If furniture is moved, your dog:", options: [{ text: "Checks every change", value: "E" }, { text: "Notices but adjusts slowly", value: "S" }, { text: "Prefers the old arrangement", value: "S" }] },
  { id: 15, dimension: "E/S", question: "On a walk, your dog:", options: [{ text: "Pulls toward unfamiliar sights and smells", value: "E" }, { text: "Explores selectively", value: "E" }, { text: "Follows a familiar route", value: "S" }] },
  { id: 16, dimension: "E/S", question: "With an unfamiliar sound, your dog:", options: [{ text: "Moves toward it to investigate", value: "E" }, { text: "Stops and listens", value: "S" }, { text: "Retreats until it feels safe", value: "S" }] },
  { id: 17, dimension: "E/S", question: "In a new indoor space, your dog:", options: [{ text: "Checks the whole area", value: "E" }, { text: "Explores one section at a time", value: "S" }, { text: "Stays near a trusted person", value: "S" }] },
  { id: 18, dimension: "E/S", question: "Your dog's daily habits are:", options: [{ text: "Flexible and always changing", value: "E" }, { text: "Mostly stable with some variety", value: "S" }, { text: "Very predictable", value: "S" }] },

  { id: 19, dimension: "V/C", question: "Your dog expresses happiness:", options: [{ text: "With big, energetic reactions", value: "V" }, { text: "With clear but controlled excitement", value: "V" }, { text: "Quietly and calmly", value: "C" }] },
  { id: 20, dimension: "V/C", question: "During play, your dog:", options: [{ text: "Gets highly excited", value: "V" }, { text: "Has lively bursts", value: "V" }, { text: "Plays gently and steadily", value: "C" }] },
  { id: 21, dimension: "V/C", question: "When hungry, your dog:", options: [{ text: "Makes it very obvious", value: "V" }, { text: "Reminds you with small actions", value: "C" }, { text: "Waits quietly near the food area", value: "C" }] },
  { id: 22, dimension: "V/C", question: "When it wants attention, your dog:", options: [{ text: "Uses paws, sounds, or large gestures", value: "V" }, { text: "Uses eye contact or gentle nudges", value: "C" }, { text: "Waits patiently", value: "C" }] },
  { id: 23, dimension: "V/C", question: "After a sudden surprise, your dog:", options: [{ text: "Reacts strongly", value: "V" }, { text: "Recovers after a brief reaction", value: "C" }, { text: "Stays composed", value: "C" }] },
  { id: 24, dimension: "V/C", question: "Your dog's emotions are:", options: [{ text: "Easy to read", value: "V" }, { text: "Visible but moderate", value: "V" }, { text: "Subtle and understated", value: "C" }] },
  { id: 25, dimension: "V/C", question: "When guests arrive, your dog:", options: [{ text: "Shows immediate excitement", value: "V" }, { text: "Greets them with controlled energy", value: "V" }, { text: "Remains calm and observant", value: "C" }] },
  { id: 26, dimension: "V/C", question: "During training, your dog:", options: [{ text: "Responds with lots of visible enthusiasm", value: "V" }, { text: "Works eagerly but steadily", value: "C" }, { text: "Stays focused and composed", value: "C" }] },
  { id: 27, dimension: "V/C", question: "Your dog's general energy feels:", options: [{ text: "High and expressive", value: "V" }, { text: "Balanced", value: "C" }, { text: "Peaceful and controlled", value: "C" }] },

  { id: 28, dimension: "P/G", question: "Your dog sees home as:", options: [{ text: "A place for games and fun", value: "P" }, { text: "A shared family space", value: "P" }, { text: "A territory to watch over", value: "G" }] },
  { id: 29, dimension: "P/G", question: "When family members move around, your dog:", options: [{ text: "Tries to join the activity", value: "P" }, { text: "Follows out of interest", value: "P" }, { text: "Monitors what is happening", value: "G" }] },
  { id: 30, dimension: "P/G", question: "With guests, your dog:", options: [{ text: "Looks for interaction", value: "P" }, { text: "Warms up through play", value: "P" }, { text: "Carefully checks the situation", value: "G" }] },
  { id: 31, dimension: "P/G", question: "Your dog's favorite activity is:", options: [{ text: "Interactive games", value: "P" }, { text: "Playful training", value: "P" }, { text: "Watching people and surroundings", value: "G" }] },
  { id: 32, dimension: "P/G", question: "When something unusual happens at home, your dog:", options: [{ text: "Turns it into an activity", value: "P" }, { text: "Approaches with playful curiosity", value: "P" }, { text: "Checks and watches until things feel normal", value: "G" }] },
  { id: 33, dimension: "P/G", question: "When given a puzzle feeder, your dog:", options: [{ text: "Treats it like a game", value: "P" }, { text: "Experiments enthusiastically", value: "P" }, { text: "Solves it methodically", value: "G" }] },
  { id: 34, dimension: "P/G", question: "Around unfamiliar dogs, your dog:", options: [{ text: "Invites play", value: "P" }, { text: "Approaches socially", value: "P" }, { text: "Observes posture and distance first", value: "G" }] },
  { id: 35, dimension: "P/G", question: "Your dog's natural role in the family is:", options: [{ text: "The entertainer", value: "P" }, { text: "The active companion", value: "P" }, { text: "The watcher and protector", value: "G" }] },
  { id: 36, dimension: "P/G", question: "When you hide a toy or treat, your dog:", options: [{ text: "Searches excitedly like a game", value: "P" }, { text: "Uses playful trial and error", value: "P" }, { text: "Searches carefully and systematically", value: "G" }] },
];
