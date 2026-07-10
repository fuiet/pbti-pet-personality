export type DogTrait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";

export interface Question {
  id: number;
  dimension: string;
  question: string;
  options: { text: string; value: DogTrait }[];
}

export const dogQuestions: Question[] = [
  { id: 1, dimension: "A/I", question: "When you come home, your dog usually:", options: [{ text: "Greets you immediately and enthusiastically", value: "A" }, { text: "Comes over after finishing what it is doing", value: "A" }, { text: "Stays relaxed and waits for you to approach", value: "I" }] },
  { id: 2, dimension: "A/I", question: "Around the house, your dog prefers:", options: [{ text: "Following you from room to room", value: "A" }, { text: "Resting nearby but not always beside you", value: "A" }, { text: "Spending comfortable time alone", value: "I" }] },
  { id: 3, dimension: "A/I", question: "When you sit down, your dog:", options: [{ text: "Moves close or asks for contact", value: "A" }, { text: "Settles where it can see you", value: "A" }, { text: "Keeps enjoying its own space", value: "I" }] },
  { id: 4, dimension: "A/I", question: "When left alone for a normal period, your dog:", options: [{ text: "Clearly misses you and waits for your return", value: "A" }, { text: "Alternates between resting and checking the door", value: "A" }, { text: "Comfortably follows its own routine", value: "I" }] },
  { id: 5, dimension: "A/I", question: "Your dog's ideal affection style is:", options: [{ text: "Frequent touch and attention", value: "A" }, { text: "Regular but gentle contact", value: "A" }, { text: "Affection when it chooses", value: "I" }] },
  { id: 6, dimension: "A/I", question: "When family members gather, your dog:", options: [{ text: "Wants to be in the middle of the group", value: "A" }, { text: "Stays close and observes", value: "A" }, { text: "May choose a quieter place", value: "I" }] },
  { id: 7, dimension: "A/I", question: "At bedtime, your dog often:", options: [{ text: "Sleeps very close to someone", value: "A" }, { text: "Chooses a nearby bed", value: "A" }, { text: "Prefers its own separate sleeping area", value: "I" }] },
  { id: 8, dimension: "A/I", question: "When you call your dog's name, it usually:", options: [{ text: "Comes quickly", value: "A" }, { text: "Looks over and decides whether to come", value: "I" }, { text: "Responds only when interested", value: "I" }] },
  { id: 9, dimension: "A/I", question: "After being ignored for a while, your dog:", options: [{ text: "Actively asks for attention", value: "A" }, { text: "Quietly moves closer", value: "A" }, { text: "Continues happily on its own", value: "I" }] },

  { id: 10, dimension: "E/S", question: "At a new park, your dog:", options: [{ text: "Explores immediately", value: "E" }, { text: "Looks around before moving", value: "S" }, { text: "Stays close until it feels safe", value: "S" }] },
  { id: 11, dimension: "E/S", question: "When meeting a new person, your dog:", options: [{ text: "Approaches with curiosity", value: "E" }, { text: "Observes before interacting", value: "S" }, { text: "Needs repeated meetings to relax", value: "S" }] },
  { id: 12, dimension: "E/S", question: "Your dog enjoys:", options: [{ text: "New adventures and changing routes", value: "E" }, { text: "A mix of novelty and routine", value: "E" }, { text: "Known places and predictable routines", value: "S" }] },
  { id: 13, dimension: "E/S", question: "When a new object appears at home, your dog:", options: [{ text: "Investigates it right away", value: "E" }, { text: "Sniffs from a safe distance first", value: "S" }, { text: "Avoids it until it becomes familiar", value: "S" }] },
  { id: 14, dimension: "E/S", question: "With a new toy, your dog usually:", options: [{ text: "Starts playing immediately", value: "E" }, { text: "Inspects it carefully", value: "S" }, { text: "Needs encouragement before trying it", value: "S" }] },
  { id: 15, dimension: "E/S", question: "If furniture is moved, your dog:", options: [{ text: "Checks every changed area", value: "E" }, { text: "Seems cautious at first", value: "S" }, { text: "Prefers the old arrangement", value: "S" }] },
  { id: 16, dimension: "E/S", question: "When hearing an unfamiliar sound, your dog:", options: [{ text: "Moves toward it to investigate", value: "E" }, { text: "Stops and listens carefully", value: "S" }, { text: "Moves away until it understands the sound", value: "S" }] },
  { id: 17, dimension: "E/S", question: "On walks, your dog's route is:", options: [{ text: "Always changing and exploratory", value: "E" }, { text: "A balance of favorite and new paths", value: "E" }, { text: "Mostly familiar and predictable", value: "S" }] },
  { id: 18, dimension: "E/S", question: "In a busy environment, your dog:", options: [{ text: "Wants to inspect everything", value: "E" }, { text: "Takes time to process the activity", value: "S" }, { text: "Looks for a calm, familiar anchor", value: "S" }] },

  { id: 19, dimension: "V/C", question: "Your dog expresses happiness:", options: [{ text: "With full-body excitement", value: "V" }, { text: "With a clear but controlled response", value: "V" }, { text: "Quietly and gently", value: "C" }] },
  { id: 20, dimension: "V/C", question: "During play, your dog:", options: [{ text: "Gets highly excited", value: "V" }, { text: "Has energetic bursts", value: "V" }, { text: "Plays gently and steadily", value: "C" }] },
  { id: 21, dimension: "V/C", question: "When hungry, your dog:", options: [{ text: "Makes the message very obvious", value: "V" }, { text: "Follows you or points toward food", value: "V" }, { text: "Waits quietly near the feeding area", value: "C" }] },
  { id: 22, dimension: "V/C", question: "When it wants something, your dog:", options: [{ text: "Uses sounds, paws, or big gestures", value: "V" }, { text: "Uses repeated eye contact", value: "C" }, { text: "Waits patiently", value: "C" }] },
  { id: 23, dimension: "V/C", question: "After a sudden surprise, your dog:", options: [{ text: "Reacts dramatically", value: "V" }, { text: "Shows a quick reaction and recovers", value: "V" }, { text: "Stays composed or recovers quietly", value: "C" }] },
  { id: 24, dimension: "V/C", question: "Your dog's emotions are:", options: [{ text: "Very easy to read", value: "V" }, { text: "Visible in posture and movement", value: "V" }, { text: "Subtle and understated", value: "C" }] },
  { id: 25, dimension: "V/C", question: "When greeting a favorite person, your dog:", options: [{ text: "Shows intense visible excitement", value: "V" }, { text: "Becomes lively but manageable", value: "V" }, { text: "Offers calm, gentle attention", value: "C" }] },
  { id: 26, dimension: "V/C", question: "During training, your dog:", options: [{ text: "Responds with strong enthusiasm", value: "V" }, { text: "Works with steady energy", value: "C" }, { text: "Stays calm and deliberate", value: "C" }] },
  { id: 27, dimension: "V/C", question: "At home, your dog's general energy feels:", options: [{ text: "High and expressive", value: "V" }, { text: "Variable with clear active periods", value: "V" }, { text: "Peaceful and controlled", value: "C" }] },

  { id: 28, dimension: "P/G", question: "Your dog sees the home as:", options: [{ text: "A place for games and shared fun", value: "P" }, { text: "A place to watch over", value: "G" }, { text: "A territory with clear routines", value: "G" }] },
  { id: 29, dimension: "P/G", question: "Your dog often:", options: [{ text: "Starts games", value: "P" }, { text: "Invites people to interact", value: "P" }, { text: "Observes what everyone is doing", value: "G" }] },
  { id: 30, dimension: "P/G", question: "When visitors arrive, your dog:", options: [{ text: "Wants social interaction", value: "P" }, { text: "Checks the situation first", value: "G" }, { text: "Keeps watch from a chosen position", value: "G" }] },
  { id: 31, dimension: "P/G", question: "When another pet starts moving around, your dog:", options: [{ text: "Tries to join the activity", value: "P" }, { text: "Watches before deciding", value: "G" }, { text: "Monitors the movement carefully", value: "G" }] },
  { id: 32, dimension: "P/G", question: "Your dog's favorite shared moments are:", options: [{ text: "Interactive games", value: "P" }, { text: "Training and structured tasks", value: "G" }, { text: "Quietly staying close and observing", value: "G" }] },
  { id: 33, dimension: "P/G", question: "With a puzzle feeder, your dog:", options: [{ text: "Treats it like an exciting game", value: "P" }, { text: "Studies how it works", value: "G" }, { text: "Solves it patiently and methodically", value: "G" }] },
  { id: 34, dimension: "P/G", question: "If something unusual happens at home, your dog:", options: [{ text: "Turns it into an opportunity to play", value: "P" }, { text: "Checks what changed", value: "G" }, { text: "Keeps watch until things feel normal", value: "G" }] },
  { id: 35, dimension: "P/G", question: "Your dog's relationship with its space is:", options: [{ text: "Flexible and playful", value: "P" }, { text: "Organized around favorite positions", value: "G" }, { text: "Protective and watchful", value: "G" }] },
  { id: 36, dimension: "P/G", question: "When you hide a toy, your dog:", options: [{ text: "Searches with playful excitement", value: "P" }, { text: "Uses a careful strategy", value: "G" }, { text: "Waits and watches for clues", value: "G" }] },
];
