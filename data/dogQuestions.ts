export type DogTrait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";

export interface Question {
  id: number;
  dimension: string;
  question: string;
  options: { text: string; value: DogTrait }[];
}

const allDogQuestions: Question[] = [
  {
    id: 1,
    dimension: "A/I",
    question: "How does your dog react when you return home?",
    options: [
      { text: "Greets you with close body contact, tail movement, or leaning", value: "A" },
      { text: "Checks in, then settles nearby", value: "A" },
      { text: "Notices you but continues resting or doing its own activity", value: "I" },
    ],
  },
  {
    id: 2,
    dimension: "A/I",
    question: "What does your dog do when you change rooms?",
    options: [
      { text: "Follows closely or waits at the doorway", value: "A" },
      { text: "Checks your location but does not always follow", value: "A" },
      { text: "Stays where it is comfortable", value: "I" },
    ],
  },
  {
    id: 3,
    dimension: "A/I",
    question: "Where does your dog rest during quiet time?",
    options: [
      { text: "Lie against people or within touching distance", value: "A" },
      { text: "Rest in the same room with some space", value: "A" },
      { text: "Choose a separate bed, crate, or quiet corner", value: "I" },
    ],
  },
  {
    id: 4,
    dimension: "A/I",
    question: "How does your dog respond when you call its name?",
    options: [
      { text: "Turns and comes toward you quickly", value: "A" },
      { text: "Looks back, then decides whether to return", value: "I" },
      { text: "Responds only if the situation feels worthwhile", value: "I" },
    ],
  },
  {
    id: 5,
    dimension: "A/I",
    question: "How does your dog behave when briefly left alone?",
    options: [
      { text: "Waits near the door or watches for your return", value: "A" },
      { text: "Settles after checking the environment", value: "A" },
      { text: "Continues an independent routine calmly", value: "I" },
    ],
  },
  {
    id: 6,
    dimension: "A/I",
    question: "How much contact does your dog seek from familiar people?",
    options: [
      { text: "Seeks petting, eye contact, leaning, or shared space", value: "A" },
      { text: "Accepts contact briefly, then moves off", value: "I" },
      { text: "Prefers contact only when it initiates it", value: "I" },
    ],
  },
  {
    id: 7,
    dimension: "A/I",
    question: "When family members gather, your dog:",
    options: [
      { text: "Joins the group and stays near people", value: "A" },
      { text: "Settles nearby but keeps a little distance", value: "A" },
      { text: "Chooses its own resting spot away from the group", value: "I" },
    ],
  },
  {
    id: 8,
    dimension: "A/I",
    question: "How often does your dog check on you during walks?",
    options: [
      { text: "Looking back often or staying close to your pace", value: "A" },
      { text: "Checking in sometimes while exploring", value: "A" },
      { text: "Focusing mostly on scents, space, or its own route", value: "I" },
    ],
  },
  {
    id: 9,
    dimension: "A/I",
    question: "After a period without attention, your dog:",
    options: [
      { text: "Asks for interaction through nudging, pawing, or eye contact", value: "A" },
      { text: "Moves closer but waits calmly", value: "A" },
      { text: "Seems content with independent activity", value: "I" },
    ],
  },

  {
    id: 10,
    dimension: "E/S",
    question: "How does your dog explore a new outdoor area?",
    options: [
      { text: "Moves forward to sniff and explore immediately", value: "E" },
      { text: "Studies the area before moving farther", value: "S" },
      { text: "Stays close and needs time to relax", value: "S" },
    ],
  },
  {
    id: 11,
    dimension: "E/S",
    question: "How does your dog approach unfamiliar people?",
    options: [
      { text: "Approaches with curiosity or friendly interest", value: "E" },
      { text: "Watches body language before engaging", value: "S" },
      { text: "Keeps distance until the person feels familiar", value: "S" },
    ],
  },
  {
    id: 12,
    dimension: "E/S",
    question: "How does your dog react to a different walking route?",
    options: [
      { text: "Enjoys the new smells and moves forward", value: "E" },
      { text: "Pauses often to understand the route", value: "S" },
      { text: "Prefers the known path and familiar landmarks", value: "S" },
    ],
  },
  {
    id: 13,
    dimension: "E/S",
    question: "How does your dog approach a new object?",
    options: [
      { text: "Investigates or uses it right away", value: "E" },
      { text: "Sniffs and tests it before accepting it", value: "S" },
      { text: "Waits until it becomes familiar", value: "S" },
    ],
  },
  {
    id: 14,
    dimension: "E/S",
    question: "How does your dog react when familiar items move?",
    options: [
      { text: "Checks the change and adapts quickly", value: "E" },
      { text: "Inspects carefully before relaxing", value: "S" },
      { text: "Shows caution or prefers the old arrangement", value: "S" },
    ],
  },
  {
    id: 15,
    dimension: "E/S",
    question: "How does your dog react to an unfamiliar sound?",
    options: [
      { text: "Moves toward it to inspect", value: "E" },
      { text: "Stops, listens, and scans for context", value: "S" },
      { text: "Retreats, barks from safety, or stays close to you", value: "S" },
    ],
  },
  {
    id: 16,
    dimension: "E/S",
    question: "In a busy street, park, or waiting room, your dog:",
    options: [
      { text: "Wants to sniff and interact with the environment", value: "E" },
      { text: "Observes first and engages gradually", value: "S" },
      { text: "Stays close and avoids too much stimulation", value: "S" },
    ],
  },
  {
    id: 17,
    dimension: "E/S",
    question: "When daily timing changes, your dog:",
    options: [
      { text: "Adjusts without much stress", value: "E" },
      { text: "Notices the change and needs a little reassurance", value: "S" },
      { text: "Relies strongly on the usual schedule", value: "S" },
    ],
  },
  {
    id: 18,
    dimension: "E/S",
    question: "How quickly does your dog recover after being startled?",
    options: [
      { text: "Recovers quickly and returns to normal behavior", value: "E" },
      { text: "Needs a few minutes to assess the situation", value: "S" },
      { text: "Remains cautious or vigilant for a while", value: "S" },
    ],
  },

  {
    id: 19,
    dimension: "V/C",
    question: "How does your dog show excitement when greeting someone?",
    options: [
      { text: "Jumps, wiggles, vocalizes, or moves with big energy", value: "V" },
      { text: "Greets warmly but settles quickly", value: "C" },
      { text: "Gives quiet attention or a calm tail wag", value: "C" },
    ],
  },
  {
    id: 20,
    dimension: "V/C",
    question: "How does your dog behave during active play?",
    options: [
      { text: "Gets intense, fast, and highly animated", value: "V" },
      { text: "Plays in controlled rounds with pauses", value: "C" },
      { text: "Prefers gentle, slower, or shorter play", value: "C" },
    ],
  },
  {
    id: 21,
    dimension: "V/C",
    question: "How does your dog ask for something it wants?",
    options: [
      { text: "Uses obvious barking, pawing, jumping, or repeated signals", value: "V" },
      { text: "Looks at you, waits near the item, or gives small signals", value: "C" },
      { text: "Waits quietly until noticed", value: "C" },
    ],
  },
  {
    id: 22,
    dimension: "V/C",
    question: "How does your dog react to sudden movement?",
    options: [
      { text: "Reacts strongly with barking, jumping, or rapid movement", value: "V" },
      { text: "Startles, checks, and settles", value: "C" },
      { text: "Shows only a small pause or head turn", value: "C" },
    ],
  },
  {
    id: 23,
    dimension: "V/C",
    question: "How easy is it to read your dog's emotions?",
    options: [
      { text: "Very visible through body movement, sound, and facial expression", value: "V" },
      { text: "Readable but moderate", value: "C" },
      { text: "Subtle, controlled, or quiet", value: "C" },
    ],
  },
  {
    id: 24,
    dimension: "V/C",
    question: "How does your dog behave while waiting for a walk or meal?",
    options: [
      { text: "Shows strong anticipation through pacing or vocalizing", value: "V" },
      { text: "Waits with some excitement but can settle", value: "C" },
      { text: "Stays composed until the routine starts", value: "C" },
    ],
  },
  {
    id: 25,
    dimension: "V/C",
    question: "How does your dog behave when frustrated?",
    options: [
      { text: "Barks, paws, whines, or escalates visibly", value: "V" },
      { text: "Looks for another way and settles with guidance", value: "C" },
      { text: "Waits, redirects, or disengages calmly", value: "C" },
    ],
  },
  {
    id: 26,
    dimension: "V/C",
    question: "During high-energy moments, your dog:",
    options: [
      { text: "Bursts into running, spinning, jumping, or loud play", value: "V" },
      { text: "Has controlled bursts, then slows down", value: "C" },
      { text: "Keeps a steady, measured pace", value: "C" },
    ],
  },
  {
    id: 27,
    dimension: "V/C",
    question: "Overall, your dog's arousal level is:",
    options: [
      { text: "Quick to rise and easy to see", value: "V" },
      { text: "Moderate and responsive to routine", value: "C" },
      { text: "Generally calm and slow to intensify", value: "C" },
    ],
  },

  {
    id: 28,
    dimension: "P/G",
    question: "What does your dog focus on while at home?",
    options: [
      { text: "Looks for games, toys, or interaction", value: "P" },
      { text: "Monitors entrances, sounds, and movement", value: "G" },
      { text: "Settles where it can watch the household", value: "G" },
    ],
  },
  {
    id: 29,
    dimension: "P/G",
    question: "How does your dog react when someone passes the home?",
    options: [
      { text: "May turn it into excitement or play behavior", value: "P" },
      { text: "Alerts, watches, or moves to check", value: "G" },
      { text: "Keeps a steady watch until things feel normal", value: "G" },
    ],
  },
  {
    id: 30,
    dimension: "P/G",
    question: "With toys, your dog usually:",
    options: [
      { text: "Initiates fetch, tug, chase, or repeated play", value: "P" },
      { text: "Studies the toy and uses it purposefully", value: "G" },
      { text: "Keeps toys close or checks them calmly", value: "G" },
    ],
  },
  {
    id: 31,
    dimension: "P/G",
    question: "What does your dog do when people move around the home?",
    options: [
      { text: "Tries to join the activity", value: "P" },
      { text: "Tracks movement and checks what is happening", value: "G" },
      { text: "Stays in a spot where it can observe", value: "G" },
    ],
  },
  {
    id: 32,
    dimension: "P/G",
    question: "How does your dog react to unfamiliar animals or people?",
    options: [
      { text: "Attempts playful greeting or interaction", value: "P" },
      { text: "Assesses distance, posture, and movement", value: "G" },
      { text: "Maintains a guarded or watchful position", value: "G" },
    ],
  },
  {
    id: 33,
    dimension: "P/G",
    question: "How does your dog approach a food puzzle or scent game?",
    options: [
      { text: "Treats the task like a fun game", value: "P" },
      { text: "Works through it methodically", value: "G" },
      { text: "Watches and solves carefully before acting", value: "G" },
    ],
  },
  {
    id: 34,
    dimension: "P/G",
    question: "What does your dog do when something unusual happens?",
    options: [
      { text: "Turns the moment into movement, curiosity, or play", value: "P" },
      { text: "Checks the situation and monitors it", value: "G" },
      { text: "Keeps watch until the environment feels stable", value: "G" },
    ],
  },
  {
    id: 35,
    dimension: "P/G",
    question: "During outdoor time, your dog is more drawn to:",
    options: [
      { text: "Running, chasing, fetching, or social play", value: "P" },
      { text: "Scanning the area and tracking movement", value: "G" },
      { text: "Following scent trails in an organized way", value: "G" },
    ],
  },
  {
    id: 36,
    dimension: "P/G",
    question: "What role does your dog usually take at home?",
    options: [
      { text: "Play initiator and activity partner", value: "P" },
      { text: "Alert observer and household monitor", value: "G" },
      { text: "Quiet guardian of familiar routines", value: "G" },
    ],
  },
];

// Seven observable behaviors per dimension keep the four-axis score balanced
// while making the assessment meaningfully shorter.
const selectedQuestionIds = new Set([
  1, 2, 3, 4, 5, 6, 8,
  10, 11, 12, 13, 14, 15, 18,
  19, 20, 21, 22, 23, 24, 26,
  28, 29, 31, 32, 33, 34, 36,
]);

export const dogQuestions = allDogQuestions.filter(({ id }) => selectedQuestionIds.has(id));
