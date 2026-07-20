import type { PetVisualProfile } from "@/lib/visualProfile";

export type PortraitStyle = {
  id: string;
  name: string;
  category: "editorial" | "playful" | "classic" | "cinematic" | "seasonal";
  direction: string;
};

export type PortraitRequestContext = {
  petName: string;
  species: "cat" | "dog";
  pbtiCode: string;
  personalityName: string;
  visualProfile?: PetVisualProfile | null;
};

const IDENTITY_LOCK = `
Create a portrait of the SAME real pet shown in the reference photos. Identity preservation is the highest priority.
The species must remain exactly the same: never turn a cat into a dog or a dog into a cat.
Keep the original coat colors, coat length, markings, pattern, eye color, face shape, ear shape, muzzle or nose shape, body proportions, sex, and age impression.
Do not invent breed-specific features that are not visible in the references. Do not make the pet look younger, older, thinner, larger, fluffier, or more muscular than the references.
The clothing, props, pose, set, lighting, and composition may change, but the pet must remain immediately recognizable.
Use the reference photos as identity references, not as a loose inspiration.
`;

const PHOTOSHOOT_DIRECTION = `
This is a contemporary commercial pet studio shoot for a youth-oriented fashion and social-media campaign. The visual language must feel current, bold, playful, graphic, and premium: saturated seamless-paper color, crisp direct-flash or large-softbox lighting, a close editorial crop, clean floor shadows, tactile styling, and energetic magazine-cover composition. Favor the polished look of a current pet photography studio or fashion feed, never an old-fashioned portrait studio.
Every portrait must visibly include all six modern signatures: a highly saturated solid-color background, a close camera position, crisp direct flash, a subtle wide-angle perspective, a candid split-second action or expressive movement, and one small contemporary fashion prop or accessory. These are required visual features, not optional suggestions.
The action may change from the reference photos: the pet can sit, stand, walk, look over its shoulder, lift one paw, stretch, jump, run, play with a prop, peek through a frame, or pose in profile. Choose the action that matches the selected style, but keep it physically safe, anatomically plausible, and natural for the species. Show real paws, realistic weight, and a believable relationship with the floor and props.
Use a pure solid color, a smooth modern color field, or a minimal graphic studio set. Use one memorable prop or styling idea rather than a cluttered scene. Allow eye-level, slightly low, close-up, and subtle wide-angle viewpoints. Keep fur and whiskers exceptionally crisp, eyes bright, expression lively, and color separation clean. Do not use vintage grading, sepia, faded film, painterly rendering, ornate interiors, heritage costumes, royal clothing, old libraries, antique props, theatrical period sets, or dark moody nostalgia.
`
const NEGATIVE_PROMPT = `
No species change, no coat-color change, no pattern change, no eye-color change, no altered facial proportions, no changed ears, no changed nose, no changed body type, no gender change, no age change, no invented breed traits, no second animal, no extra limbs, no malformed paws, no duplicate pet, no human face, no aggressive behavior, no medical claims, no watermark, no copied brand logo, no trademarked wordmark, no random letters, no generated text, no vintage look, no retro film, no sepia, no faded colors, no painterly style, no ornate classical set, no formal royal portrait, no gloomy brown color grade.
`;

export const PORTRAIT_STYLES: PortraitStyle[] = [
  { id: "crimson-editorial", name: "Cherry Flash", category: "editorial", direction: "Saturated cherry-red seamless backdrop, crisp direct flash, close low-angle fashion crop, sporty color-block bandana, lively confident expression, contemporary campaign energy." },
  { id: "rose-sequin", name: "Pink Pop", category: "editorial", direction: "Hot-pink seamless paper, bright clean softbox, playful close-up, one modern translucent accessory, glossy current social-editorial finish." },
  { id: "sunset-studio", name: "Tangerine Jump", category: "editorial", direction: "Vivid tangerine studio sweep, freeze-frame action, crisp direct flash, simple streetwear accent, joyful high-energy commercial pet photography." },
  { id: "monochrome-runway", name: "Graphic Mono", category: "editorial", direction: "Clean black-and-white graphic set, high-key lighting, bold asymmetrical crop, modern minimal collar, sharp fashion-zine composition without retro styling." },
  { id: "silver-satin", name: "Chrome Pop", category: "editorial", direction: "Cool light-gray studio with one chrome sphere, bright hard-soft mixed light, sleek contemporary styling, close expressive portrait with clean reflections." },
  { id: "electric-blue", name: "Cobalt Street", category: "editorial", direction: "Electric cobalt seamless background, crisp contrast, current streetwear shirt or bandana, subtle wide-angle perspective, playful direct-to-camera energy." },
  { id: "violet-sculpture", name: "Purple Cutout", category: "editorial", direction: "Vivid violet set with one oversized geometric cutout, bright edge light, curious pose, clean modern art-direction and saturated color." },
  { id: "cream-luxury", name: "Vanilla Clean", category: "classic", direction: "Bright warm-cream seamless studio, airy softbox, close natural portrait, minimal modern knit accent, fresh catalog polish with no vintage mood." },
  { id: "heritage-tailoring", name: "Lime Club", category: "classic", direction: "Acid-lime background, contemporary varsity-style neck accessory, direct flash, energetic three-quarter crop, youthful fashion-feed styling." },
  { id: "navy-explorer", name: "Blue Utility", category: "classic", direction: "Clean deep-blue seamless set, modern lightweight utility vest, bright facial lighting, bold low-angle commercial composition with no explorer nostalgia." },
  { id: "library-scholar", name: "Smart Cookie", category: "classic", direction: "Sunny yellow studio, lightweight modern glasses placed safely without hiding the eyes, one colorful book-like prop with no text, humorous close-up campaign shot." },
  { id: "royal-portrait", name: "Purple Star", category: "classic", direction: "Saturated purple studio, glossy star-shaped prop, modern statement collar, punchy flash, playful celebrity-cover pose with no ceremonial or royal styling." },
  { id: "garden-bloom", name: "Garden Bloom", category: "seasonal", direction: "Fresh botanical studio set with flowers and leaves, airy natural light, gentle spring color palette, fashion portrait framing." },
  { id: "autumn-leaves", name: "Orange Confetti", category: "seasonal", direction: "Bold orange seamless set, a small burst of graphic paper confetti, crisp flash, playful movement, saturated current campaign color without rustic autumn styling." },
  { id: "winter-scarf", name: "Winter Scarf", category: "seasonal", direction: "Snowy pale-blue studio set, soft knitted scarf, luminous cool light, calm winter portrait with clear face and body." },
  { id: "summer-poolside", name: "Summer Poolside", category: "seasonal", direction: "Turquoise poolside-inspired studio set, light summer shirt, bright sunlight, playful clean campaign portrait." },
  { id: "raincoat-day", name: "Raincoat Day", category: "seasonal", direction: "Glossy rainy-day set, small yellow raincoat, reflective floor, soft overcast light, charming editorial portrait." },
  { id: "lantern-night", name: "Night Flash", category: "seasonal", direction: "Deep teal studio, bright frontal flash with a clean cobalt rim, one translucent colored orb, modern nightlife editorial energy while keeping the eyes fully visible." },
  { id: "purple-action", name: "Purple Action", category: "playful", direction: "Vivid purple studio, dynamic running or jumping pose that remains anatomically natural, colorful playful outfit, crisp motion energy." },
  { id: "orange-pillow", name: "Orange Pillow", category: "playful", direction: "Bright tangerine background, oversized soft pillows, playful relaxed pose, cheerful commercial pet photography." },
  { id: "paper-airplane", name: "Paper Airplane", category: "playful", direction: "Sky-blue paper set with floating paper airplanes, lightweight bandana, curious action pose, clean graphic composition." },
  { id: "toy-box", name: "Toy Box", category: "playful", direction: "Colorful toy studio set, one simple toy prop, energetic but safe pose, polished children's campaign photography." },
  { id: "bubble-pop", name: "Bubble Pop", category: "playful", direction: "Pastel bubble studio, soft translucent bubbles, playful collar or bow, bright clean portrait with shallow depth of field." },
  { id: "comic-frame", name: "Comic Frame", category: "playful", direction: "Graphic primary-color studio panels, simple cape-like clothing, bold editorial framing, no printed words or logos." },
  { id: "disco-soft", name: "Disco Soft", category: "playful", direction: "Soft disco lights, reflective pastel floor, tiny fashion sunglasses only if they do not cover the eyes, joyful portrait." },
  { id: "picnic-camp", name: "Snack Club", category: "playful", direction: "Sunny sky-blue set, one oversized graphic snack-shaped prop with no packaging or words, colorful neckerchief, cheeky close-up commercial composition." },
  { id: "neon-night", name: "Neon Night", category: "cinematic", direction: "Magenta and cyan neon studio, cinematic contrast, tasteful futuristic jacket, clear eye visibility and strong silhouette." },
  { id: "film-noir", name: "White Flash", category: "cinematic", direction: "Pure white seamless studio, punchy direct flash, high-contrast contemporary black accessory, dynamic off-center crop, sharp fashion-feed finish with no noir or vintage treatment." },
  { id: "space-cadet", name: "Space Cadet", category: "cinematic", direction: "Deep indigo space-inspired studio with soft stars, comfortable astronaut-inspired vest, cinematic rim light, grounded pose." },
  { id: "safari-still", name: "Green Screen", category: "cinematic", direction: "Fresh saturated green seamless set, modern mesh vest or bandana, crisp frontal light, close playful portrait with strong color separation and no safari styling." },
  { id: "retro-cinema", name: "Coral Close-Up", category: "cinematic", direction: "Bright coral studio, extreme but flattering close-up with subtle wide-angle energy, tiny contemporary bow or collar, razor-sharp eyes and fur, no retro treatment." },
  { id: "glasshouse", name: "Glasshouse", category: "cinematic", direction: "Modern glasshouse set with leafy shadows, clean neutral clothing, natural window light, premium lifestyle portrait." },
  { id: "midnight-cobalt", name: "Midnight Cobalt", category: "cinematic", direction: "Cobalt blue night set, subtle spotlight, refined leather-free fashion styling, bold centered portrait." },
  { id: "cloud-studio", name: "Cloud Studio", category: "cinematic", direction: "Soft white cloud-like studio, pale blue wardrobe, luminous high-key light, dreamy but photorealistic portrait." },
];

const ACTIONS_BY_STYLE: Record<string, string> = {
  "crimson-editorial": "Lean slightly toward the lens with one front paw forward and a lively direct gaze.",
  "rose-sequin": "Turn the head toward camera during a playful side-step, framed in a close crop.",
  "sunset-studio": "Freeze a natural small jump, pounce, or quick step with correct paws and a joyful expression.",
  "monochrome-runway": "Walk toward camera with a clear full-body stride and an energetic off-center composition.",
  "silver-satin": "Investigate the chrome sphere with a curious head tilt while keeping the full face visible.",
  "electric-blue": "Make a small natural hop or side-step toward the lens with the body angled diagonally.",
  "violet-sculpture": "Peek through the geometric cutout or reach one paw naturally around its edge.",
  "cream-luxury": "Hold a relaxed close seated pose with one front paw slightly nearer the camera.",
  "heritage-tailoring": "Turn quickly toward an off-camera sound with a bright alert expression.",
  "navy-explorer": "Take one confident step toward the low camera with the lightweight vest clearly visible.",
  "library-scholar": "Tilt the head toward the lens beside the colorful blank prop, with bright unobstructed eyes.",
  "royal-portrait": "Reach one paw toward the star prop or pose beside it with a playful head tilt.",
  "garden-bloom": "Lean forward to inspect one flower with a curious, gentle neck movement.",
  "autumn-leaves": "Move through the confetti with one paw lifted at the moment of a lively step.",
  "winter-scarf": "Stand naturally and look back over one shoulder while keeping the scarf below the face.",
  "summer-poolside": "Reach one paw toward a floating toy or turn playfully toward the camera.",
  "raincoat-day": "Step through the scene with one paw forward as if crossing a shallow puddle.",
  "lantern-night": "Turn toward the translucent orb with one paw lifted and a bright flash-lit expression.",
  "purple-action": "Perform a natural playful pounce or short leap with all paws anatomically correct.",
  "orange-pillow": "Climb onto a pillow, peek over its edge, or lounge with one paw hanging down.",
  "paper-airplane": "Reach upward toward a paper airplane or take a curious step beneath it.",
  "toy-box": "Lean over the toy box and bat one simple toy with one front paw.",
  "bubble-pop": "Turn toward a nearby bubble with one front paw lifted in mid-reach.",
  "comic-frame": "Step through the graphic frame or place one paw on its lower edge.",
  "disco-soft": "Make a playful side-step with a natural head turn and balanced footing.",
  "picnic-camp": "Interact with the oversized snack-shaped prop or peek around it toward camera.",
  "neon-night": "Walk through the neon set in a confident stride or hold a strong three-quarter turn.",
  "film-noir": "Step toward the direct flash or turn sharply back toward camera in a dynamic close crop.",
  "space-cadet": "Stand with one paw on the platform and look toward the circular portal.",
  "safari-still": "Lean slightly toward the camera with a curious head tilt and one paw forward.",
  "retro-cinema": "Move the nose slightly closer to the wide-angle lens while keeping the face natural and recognizable.",
  "glasshouse": "Walk through the window light or look through a translucent glass panel.",
  "midnight-cobalt": "Hold a strong three-quarter stance with one paw placed forward.",
  "cloud-studio": "Step between the cloud props or look upward with one front paw lifted.",
};
function appearanceLock(profile?: PetVisualProfile | null) {
  if (!profile) return "No visual profile is available; preserve every visible feature directly from the reference photos and do not guess hidden traits.";

  return [
    `Appearance notes from the visual profile: species ${profile.species}; visible breed estimate ${profile.breedAssessment.primaryBreed}; possible mix ${profile.breedAssessment.mixedLikelihood}.`,
    `Coat visible in the references: ${profile.coat.color}, ${profile.coat.length}, ${profile.coat.pattern}, ${profile.coat.texture}.`,
    `Face cues visible in the references: eyes ${profile.face.eyeExpression}; ears ${profile.face.earPosition}; muzzle ${profile.face.muzzleShape}.`,
    "These notes are constraints, not permission to redesign the pet. When a note conflicts with the reference image, the reference image wins.",
  ].join(" ");
}

export function buildPortraitPrompt(style: PortraitStyle, context: PortraitRequestContext) {
  return [
    IDENTITY_LOCK,
    appearanceLock(context.visualProfile),
    "Art direction: " + style.direction,
    PHOTOSHOOT_DIRECTION,
    "Required action variation: " + (ACTIONS_BY_STYLE[style.id] || "Use a natural, species-appropriate action that differs from the reference pose."),
    "The selected style is the primary art direction. Do not blend it into a generic portrait. Make the requested pose, action, background, prop relationship, camera angle, lighting, and poster composition visibly present in the final frame. The pose may differ from every reference photo while the pet's anatomy and identity remain consistent.",
    "The wardrobe and props are styling only. They must fit the species safely and must not hide the face, eyes, ears, nose, coat pattern, or identifying markings. Keep the eyes visible and preserve the real eye color even under colored lighting.",
    "Leave a clean area for website compositing. Do not render any words, pet name, website name, logo, watermark, or brand mark inside the image; the website will add a small PBTI logo and the pet name after generation.",
    "Pet name for metadata only: " + context.petName + ". PBTI type for metadata only: " + context.pbtiCode + ", " + context.personalityName + ".",
    NEGATIVE_PROMPT,
  ].join("\n\n");
}

export function choosePortraitStyles(count = 3, random = Math.random) {
  const pool = [...PORTRAIT_STYLES];
  const selected: PortraitStyle[] = [];

  while (selected.length < Math.min(count, pool.length)) {
    const index = Math.floor(random() * pool.length);
    const [style] = pool.splice(index, 1);
    if (style) selected.push(style);
  }

  return selected;
}

export function choosePortraitStylesForPet(petId: string, count = 3) {
  let hash = 2166136261;
  for (let index = 0; index < petId.length; index += 1) {
    hash ^= petId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  const pool = [...PORTRAIT_STYLES];
  const selected: PortraitStyle[] = [];
  let state = hash >>> 0;

  while (selected.length < Math.min(count, pool.length)) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const index = state % pool.length;
    const [style] = pool.splice(index, 1);
    if (style) selected.push(style);
  }

  return selected;
}
