export type CatTrait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";

export interface Question {
  id: number;
  dimension: string;
  question: string;
  options: { text: string; value: CatTrait }[];
}

export const catQuestions: Question[] = [
  {
    id: 1,
    dimension: "A/I",
    question: "When you return home, your cat usually:",
    options: [
      { text: "Comes to the door, tail up, or rubs against you", value: "A" },
      { text: "Looks at you first, then approaches when ready", value: "A" },
      { text: "Keeps resting, grooming, or watching from its spot", value: "I" },
    ],
  },
  {
    id: 2,
    dimension: "A/I",
    question: "During quiet time at home, your cat most often:",
    options: [
      { text: "Chooses a place close to your body or within arm's reach", value: "A" },
      { text: "Stays in the same room but keeps a little distance", value: "A" },
      { text: "Chooses a separate room, shelf, bed, or hiding spot", value: "I" },
    ],
  },
  {
    id: 3,
    dimension: "A/I",
    question: "When you call your cat's name, it usually:",
    options: [
      { text: "Comes over, chirps, or clearly turns toward you", value: "A" },
      { text: "Looks at you and decides whether to come closer", value: "I" },
      { text: "Ignores the call unless food or play is involved", value: "I" },
    ],
  },
  {
    id: 4,
    dimension: "A/I",
    question: "If you sit on the sofa, your cat tends to:",
    options: [
      { text: "Climb onto you or press against your side", value: "A" },
      { text: "Settle nearby after checking the space", value: "A" },
      { text: "Pick its own resting place away from people", value: "I" },
    ],
  },
  {
    id: 5,
    dimension: "A/I",
    question: "When unfamiliar people enter the home, your cat:",
    options: [
      { text: "May approach, sniff, or stay visible near the group", value: "A" },
      { text: "Watches from a safe distance before deciding", value: "I" },
      { text: "Leaves, hides, or avoids contact until things are quiet", value: "I" },
    ],
  },
  {
    id: 6,
    dimension: "A/I",
    question: "Your cat's preferred physical contact is:",
    options: [
      { text: "Frequent head bumps, rubbing, kneading, or lap time", value: "A" },
      { text: "Brief contact, then moving away when satisfied", value: "I" },
      { text: "Contact only on its own schedule and location", value: "I" },
    ],
  },
  {
    id: 7,
    dimension: "A/I",
    question: "When family members gather in one room, your cat:",
    options: [
      { text: "Joins the room and stays near the activity", value: "A" },
      { text: "Observes from a chair, window, or hallway", value: "I" },
      { text: "Moves to a quieter private area", value: "I" },
    ],
  },
  {
    id: 8,
    dimension: "A/I",
    question: "At night or nap time, your cat often:",
    options: [
      { text: "Sleeps on the bed, beside you, or close to people", value: "A" },
      { text: "Starts nearby, then relocates to its own spot", value: "A" },
      { text: "Uses a separate bed, shelf, box, or hidden corner", value: "I" },
    ],
  },
  {
    id: 9,
    dimension: "A/I",
    question: "If you stop paying attention for a while, your cat:",
    options: [
      { text: "Solicits contact with meows, paw taps, rubbing, or staring", value: "A" },
      { text: "Checks in briefly, then waits nearby", value: "A" },
      { text: "Continues its own routine without asking for contact", value: "I" },
    ],
  },

  {
    id: 10,
    dimension: "E/S",
    question: "When a new object appears on the floor, your cat:",
    options: [
      { text: "Walks over quickly to sniff, tap, or inspect it", value: "E" },
      { text: "Circles or watches before moving closer", value: "S" },
      { text: "Avoids it until it has been there for a while", value: "S" },
    ],
  },
  {
    id: 11,
    dimension: "E/S",
    question: "When entering a new room or carrier space, your cat:",
    options: [
      { text: "Explores corners, surfaces, and scent marks quickly", value: "E" },
      { text: "Moves slowly and checks exits before settling", value: "S" },
      { text: "Freezes, hides, or needs repeated exposure", value: "S" },
    ],
  },
  {
    id: 12,
    dimension: "E/S",
    question: "If furniture or litter box placement changes, your cat:",
    options: [
      { text: "Investigates the change and adapts soon", value: "E" },
      { text: "Inspects carefully and may be cautious at first", value: "S" },
      { text: "Shows stress or prefers the old arrangement", value: "S" },
    ],
  },
  {
    id: 13,
    dimension: "E/S",
    question: "With a new toy or puzzle feeder, your cat usually:",
    options: [
      { text: "Touches, bats, or tests it right away", value: "E" },
      { text: "Sniffs and studies it before playing", value: "S" },
      { text: "Waits until it feels familiar or safe", value: "S" },
    ],
  },
  {
    id: 14,
    dimension: "E/S",
    question: "When hearing an unfamiliar noise, your cat:",
    options: [
      { text: "Moves toward the sound to investigate", value: "E" },
      { text: "Stops, listens, and scans the room", value: "S" },
      { text: "Retreats under furniture or to a safe place", value: "S" },
    ],
  },
  {
    id: 15,
    dimension: "E/S",
    question: "Your cat's daily movement pattern is usually:",
    options: [
      { text: "Flexible, with frequent route changes and inspections", value: "E" },
      { text: "Mostly predictable with a few preferred checkpoints", value: "S" },
      { text: "Strongly tied to the same safe routes and resting areas", value: "S" },
    ],
  },
  {
    id: 16,
    dimension: "E/S",
    question: "At a window or balcony door, your cat:",
    options: [
      { text: "Tracks birds, people, and movement with active interest", value: "E" },
      { text: "Watches calmly and reacts only to stronger signals", value: "S" },
      { text: "Prefers familiar views and avoids sudden outside activity", value: "S" },
    ],
  },
  {
    id: 17,
    dimension: "E/S",
    question: "When its food, bowl, or feeding time changes, your cat:",
    options: [
      { text: "Checks the change and tries the new setup", value: "E" },
      { text: "Approaches carefully and may need encouragement", value: "S" },
      { text: "Refuses or waits for the familiar routine", value: "S" },
    ],
  },
  {
    id: 18,
    dimension: "E/S",
    question: "After a stressful event such as vacuuming or a doorbell, your cat:",
    options: [
      { text: "Recovers quickly and returns to normal activity", value: "E" },
      { text: "Takes time to check that the room is safe", value: "S" },
      { text: "Stays hidden or cautious for a long period", value: "S" },
    ],
  },

  {
    id: 19,
    dimension: "V/C",
    question: "When excited before meals, your cat:",
    options: [
      { text: "Meows, circles, jumps, or clearly rushes the routine", value: "V" },
      { text: "Waits near the food area with moderate signals", value: "C" },
      { text: "Stays quiet and composed until food appears", value: "C" },
    ],
  },
  {
    id: 20,
    dimension: "V/C",
    question: "During play with a wand or ball, your cat:",
    options: [
      { text: "Makes fast bursts, big pounces, and repeated chases", value: "V" },
      { text: "Plays in short controlled rounds", value: "C" },
      { text: "Prefers slow tracking, gentle taps, or watching first", value: "C" },
    ],
  },
  {
    id: 21,
    dimension: "V/C",
    question: "When your cat wants a door opened or a need met, it:",
    options: [
      { text: "Uses clear meows, pawing, scratching, or repeated signals", value: "V" },
      { text: "Looks at you, waits nearby, or gives small signals", value: "C" },
      { text: "Waits quietly or returns later", value: "C" },
    ],
  },
  {
    id: 22,
    dimension: "V/C",
    question: "If startled by a sudden movement, your cat:",
    options: [
      { text: "Jumps, runs, vocalizes, or reacts visibly", value: "V" },
      { text: "Pauses, watches, and settles after checking", value: "C" },
      { text: "Shows only a small body or ear movement", value: "C" },
    ],
  },
  {
    id: 23,
    dimension: "V/C",
    question: "Your cat's tail, ears, and body language are usually:",
    options: [
      { text: "Easy to read, with clear changes in posture and motion", value: "V" },
      { text: "Subtle but understandable if you watch closely", value: "C" },
      { text: "Mostly steady, with few dramatic changes", value: "C" },
    ],
  },
  {
    id: 24,
    dimension: "V/C",
    question: "When greeting a favorite person, your cat:",
    options: [
      { text: "Shows obvious excitement through sound or movement", value: "V" },
      { text: "Gives quiet rubbing, blinking, or nearby presence", value: "C" },
      { text: "Acknowledges calmly without much display", value: "C" },
    ],
  },
  {
    id: 25,
    dimension: "V/C",
    question: "During active evening periods, your cat:",
    options: [
      { text: "Runs, climbs, vocalizes, or creates strong visible energy", value: "V" },
      { text: "Has moderate bursts, then settles", value: "C" },
      { text: "Keeps activity gentle or predictable", value: "C" },
    ],
  },
  {
    id: 26,
    dimension: "V/C",
    question: "When frustrated, blocked, or overstimulated, your cat:",
    options: [
      { text: "Shows it clearly with tail flicks, swats, bites, or loud sounds", value: "V" },
      { text: "Moves away or gives quieter warning signs", value: "C" },
      { text: "Settles or disengages without much visible reaction", value: "C" },
    ],
  },
  {
    id: 27,
    dimension: "V/C",
    question: "Overall, your cat's energy changes are:",
    options: [
      { text: "Large and easy to notice from across the room", value: "V" },
      { text: "Moderate and tied to specific routines", value: "C" },
      { text: "Soft, measured, and rarely intense", value: "C" },
    ],
  },

  {
    id: 28,
    dimension: "P/G",
    question: "When moving through the home, your cat tends to:",
    options: [
      { text: "Turn spaces into climbing, chasing, or hiding games", value: "P" },
      { text: "Patrol familiar spots and check changes", value: "G" },
      { text: "Watch household activity from a chosen lookout", value: "G" },
    ],
  },
  {
    id: 29,
    dimension: "P/G",
    question: "When someone opens a door or window, your cat:",
    options: [
      { text: "Treats the movement as something to chase or play near", value: "P" },
      { text: "Moves over to inspect the opening and boundary", value: "G" },
      { text: "Watches carefully from a safe position", value: "G" },
    ],
  },
  {
    id: 30,
    dimension: "P/G",
    question: "With household routines, your cat often:",
    options: [
      { text: "Interrupts or invites interaction with playful behavior", value: "P" },
      { text: "Tracks who is moving and where things happen", value: "G" },
      { text: "Keeps watch from a stable resting place", value: "G" },
    ],
  },
  {
    id: 31,
    dimension: "P/G",
    question: "When a toy is hidden under a blanket or box, your cat:",
    options: [
      { text: "Pounces, digs, or turns it into a game", value: "P" },
      { text: "Studies the edges and searches methodically", value: "G" },
      { text: "Waits and watches for movement before acting", value: "G" },
    ],
  },
  {
    id: 32,
    dimension: "P/G",
    question: "If another pet or person moves quickly nearby, your cat:",
    options: [
      { text: "Joins, chases, or swats playfully", value: "P" },
      { text: "Monitors the movement and keeps position", value: "G" },
      { text: "Moves to a lookout or guarded distance", value: "G" },
    ],
  },
  {
    id: 33,
    dimension: "P/G",
    question: "When guests arrive, your cat is more likely to:",
    options: [
      { text: "Engage with bags, shoes, strings, or movement", value: "P" },
      { text: "Inspect scent marks and monitor the new presence", value: "G" },
      { text: "Stay hidden or watching until the home feels normal", value: "G" },
    ],
  },
  {
    id: 34,
    dimension: "P/G",
    question: "When you initiate play, your cat usually:",
    options: [
      { text: "Responds quickly and keeps the game going", value: "P" },
      { text: "Plays briefly, then returns to watching the room", value: "G" },
      { text: "Prefers observing or choosing the right moment", value: "G" },
    ],
  },
  {
    id: 35,
    dimension: "P/G",
    question: "Your cat's relationship with territory is mostly:",
    options: [
      { text: "Flexible and playful, using many areas for fun", value: "P" },
      { text: "Structured, with preferred zones and lookout points", value: "G" },
      { text: "Careful, protective, and sensitive to changes", value: "G" },
    ],
  },
  {
    id: 36,
    dimension: "P/G",
    question: "When something small moves across the floor, your cat:",
    options: [
      { text: "Stalks, pounces, or bats at it as play", value: "P" },
      { text: "Tracks it carefully before deciding what to do", value: "G" },
      { text: "Watches until it is sure the space is safe", value: "G" },
    ],
  },
];
