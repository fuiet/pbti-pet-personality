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
This is a professional pet fashion editorial, not a casual pet snapshot or a generic centered avatar. Build a complete photographic scene with a strong color-blocked or designed background, intentional set styling, a clear subject silhouette, controlled studio lighting, realistic contact shadows, and a deliberate vertical poster composition inspired by premium pet campaign photography.
The action may change from the reference photos: the pet can sit, stand, walk, look over its shoulder, lift one paw, stretch, jump, run, play with a prop, peek through a frame, or pose in profile. Choose the action that matches the selected style, but keep it physically safe, anatomically plausible, and natural for the species. Show real paws, realistic weight, and a believable relationship with the floor and props.
The background may be a pure solid color, a clean color field, a gradient-free poster wall, or a fully designed studio set. Strong color, fashion clothing, tactile fabrics, graphic negative space, and props are encouraged. Avoid empty generic backgrounds. Make the image look like a real professional photoshoot: deliberate camera angle, campaign lighting, layered depth, crisp fur and whisker detail, realistic shadows, and a clear visual story.
`
const NEGATIVE_PROMPT = `
No species change, no coat-color change, no pattern change, no eye-color change, no altered facial proportions, no changed ears, no changed nose, no changed body type, no gender change, no age change, no invented breed traits, no second animal, no extra limbs, no malformed paws, no duplicate pet, no human face, no aggressive behavior, no medical claims, no watermark, no copied brand logo, no trademarked wordmark, no random letters, no generated text.
`;

export const PORTRAIT_STYLES: PortraitStyle[] = [
  { id: "crimson-editorial", name: "Crimson Editorial", category: "editorial", direction: "Bold red studio backdrop, high-fashion editorial lighting, sculptural clothing, confident seated portrait, clean negative space at the top for a later title overlay." },
  { id: "rose-sequin", name: "Rose Sequin", category: "editorial", direction: "Deep rose studio set, elegant sequined fabric, softbox highlights, luxurious magazine portrait, refined and playful without changing the pet's body." },
  { id: "sunset-studio", name: "Sunset Studio", category: "editorial", direction: "Warm orange studio background, glossy fashion styling, soft rim light, joyful premium pet campaign portrait, clear silhouette." },
  { id: "monochrome-runway", name: "Monochrome Runway", category: "editorial", direction: "Charcoal and ivory fashion set, minimal tailored outfit, directional studio light, sophisticated magazine composition." },
  { id: "silver-satin", name: "Silver Satin", category: "editorial", direction: "Cool silver backdrop, satin fabric, controlled reflections, luxury campaign lighting, calm centered portrait." },
  { id: "electric-blue", name: "Electric Blue", category: "editorial", direction: "Cobalt blue studio background, crisp contrast, modern street-fashion outfit, expressive but natural pose." },
  { id: "violet-sculpture", name: "Violet Sculpture", category: "editorial", direction: "Violet studio background, sculptural paper set pieces, soft lavender edge light, art-gallery pet portrait." },
  { id: "cream-luxury", name: "Cream Luxury", category: "classic", direction: "Warm ivory background, understated luxury styling, fine textured fabric, soft daylight, elegant fashion magazine portrait." },
  { id: "heritage-tailoring", name: "Heritage Tailoring", category: "classic", direction: "Deep forest green backdrop, classic cap and utility vest, polished studio portrait, restrained vintage styling." },
  { id: "navy-explorer", name: "Navy Explorer", category: "classic", direction: "Navy blue studio backdrop, practical explorer jacket and map-like prop, cinematic portrait lighting, adventurous mood." },
  { id: "library-scholar", name: "Library Scholar", category: "classic", direction: "Warm wood library set, neat academic jacket, small book prop, soft window light, intelligent editorial mood without claiming intelligence." },
  { id: "royal-portrait", name: "Royal Portrait", category: "classic", direction: "Muted jewel-tone backdrop, tasteful ceremonial collar, painterly soft light, dignified formal portrait." },
  { id: "garden-bloom", name: "Garden Bloom", category: "seasonal", direction: "Fresh botanical studio set with flowers and leaves, airy natural light, gentle spring color palette, fashion portrait framing." },
  { id: "autumn-leaves", name: "Autumn Leaves", category: "seasonal", direction: "Warm amber studio floor with autumn leaves, cozy knit styling, cinematic golden-hour light, grounded full-body portrait." },
  { id: "winter-scarf", name: "Winter Scarf", category: "seasonal", direction: "Snowy pale-blue studio set, soft knitted scarf, luminous cool light, calm winter portrait with clear face and body." },
  { id: "summer-poolside", name: "Summer Poolside", category: "seasonal", direction: "Turquoise poolside-inspired studio set, light summer shirt, bright sunlight, playful clean campaign portrait." },
  { id: "raincoat-day", name: "Raincoat Day", category: "seasonal", direction: "Glossy rainy-day set, small yellow raincoat, reflective floor, soft overcast light, charming editorial portrait." },
  { id: "lantern-night", name: "Lantern Night", category: "seasonal", direction: "Midnight blue background, warm paper lanterns, cozy scarf, cinematic low-key lighting, intimate portrait." },
  { id: "purple-action", name: "Purple Action", category: "playful", direction: "Vivid purple studio, dynamic running or jumping pose that remains anatomically natural, colorful playful outfit, crisp motion energy." },
  { id: "orange-pillow", name: "Orange Pillow", category: "playful", direction: "Bright tangerine background, oversized soft pillows, playful relaxed pose, cheerful commercial pet photography." },
  { id: "paper-airplane", name: "Paper Airplane", category: "playful", direction: "Sky-blue paper set with floating paper airplanes, lightweight bandana, curious action pose, clean graphic composition." },
  { id: "toy-box", name: "Toy Box", category: "playful", direction: "Colorful toy studio set, one simple toy prop, energetic but safe pose, polished children's campaign photography." },
  { id: "bubble-pop", name: "Bubble Pop", category: "playful", direction: "Pastel bubble studio, soft translucent bubbles, playful collar or bow, bright clean portrait with shallow depth of field." },
  { id: "comic-frame", name: "Comic Frame", category: "playful", direction: "Graphic primary-color studio panels, simple cape-like clothing, bold editorial framing, no printed words or logos." },
  { id: "disco-soft", name: "Disco Soft", category: "playful", direction: "Soft disco lights, reflective pastel floor, tiny fashion sunglasses only if they do not cover the eyes, joyful portrait." },
  { id: "picnic-camp", name: "Picnic Camp", category: "playful", direction: "Mini picnic set, gingham cloth, small neckerchief, natural sitting pose, warm daylight and a friendly campaign feel." },
  { id: "neon-night", name: "Neon Night", category: "cinematic", direction: "Magenta and cyan neon studio, cinematic contrast, tasteful futuristic jacket, clear eye visibility and strong silhouette." },
  { id: "film-noir", name: "Film Noir", category: "cinematic", direction: "Black-and-cream film-noir set, single soft key light, tailored outfit, dramatic but gentle expression, classic portrait framing." },
  { id: "space-cadet", name: "Space Cadet", category: "cinematic", direction: "Deep indigo space-inspired studio with soft stars, comfortable astronaut-inspired vest, cinematic rim light, grounded pose." },
  { id: "safari-still", name: "Safari Still", category: "cinematic", direction: "Muted olive studio, lightweight explorer vest, controlled warm light, editorial field-journal mood without changing the animal." },
  { id: "retro-cinema", name: "Retro Cinema", category: "cinematic", direction: "Faded red and cream cinema set, small bow tie or scarf, vintage soft focus, elegant poster composition." },
  { id: "glasshouse", name: "Glasshouse", category: "cinematic", direction: "Modern glasshouse set with leafy shadows, clean neutral clothing, natural window light, premium lifestyle portrait." },
  { id: "midnight-cobalt", name: "Midnight Cobalt", category: "cinematic", direction: "Cobalt blue night set, subtle spotlight, refined leather-free fashion styling, bold centered portrait." },
  { id: "cloud-studio", name: "Cloud Studio", category: "cinematic", direction: "Soft white cloud-like studio, pale blue wardrobe, luminous high-key light, dreamy but photorealistic portrait." },
];

const ACTIONS_BY_STYLE: Record<string, string> = {
  "crimson-editorial": "A confident three-quarter step on the pedestal, one front paw lifted toward camera.",
  "rose-sequin": "Sit tall and place one front paw gently on the sequin fabric while looking into camera.",
  "sunset-studio": "Move through the frame mid-step with one paw forward and a playful sideways glance.",
  "monochrome-runway": "Walk naturally toward camera along the runway line with a clear full-body stride.",
  "silver-satin": "Sit in profile and turn the head back over the shoulder toward the camera.",
  "electric-blue": "Make a small natural hop or side-step with the body angled diagonally across frame.",
  "violet-sculpture": "Stand on the pedestal and raise one front paw while looking slightly upward.",
  "cream-luxury": "Hold a relaxed seated pose with one front leg extended into a gentle stretch.",
  "heritage-tailoring": "Sit upright and turn the head toward an imagined off-camera sound.",
  "navy-explorer": "Stand with one paw on the explorer platform and look toward the distant side of the set.",
  "library-scholar": "Peek around the blank books or place one paw on the open page.",
  "royal-portrait": "Sit tall with a naturally raised chin and a composed three-quarter turn.",
  "garden-bloom": "Lean forward to inspect one flower with a curious, gentle neck movement.",
  "autumn-leaves": "Walk through the leaves with one paw lifted at the moment of a step.",
  "winter-scarf": "Stand naturally and look back over one shoulder while keeping the scarf below the face.",
  "summer-poolside": "Reach one paw toward a floating toy or turn playfully toward the camera.",
  "raincoat-day": "Step through the scene with one paw forward as if crossing a shallow puddle.",
  "lantern-night": "Look upward toward one lantern from a relaxed seated or standing posture.",
  "purple-action": "Perform a natural playful pounce or short leap with all paws anatomically correct.",
  "orange-pillow": "Climb onto a pillow, peek over its edge, or lounge with one paw hanging down.",
  "paper-airplane": "Reach upward toward a paper airplane or take a curious step beneath it.",
  "toy-box": "Lean over the toy box and bat one simple toy with one front paw.",
  "bubble-pop": "Turn toward a nearby bubble with one front paw lifted in mid-reach.",
  "comic-frame": "Step through the graphic frame or place one paw on its lower edge.",
  "disco-soft": "Make a playful side-step with a natural head turn and balanced footing.",
  "picnic-camp": "Sit beside the basket, place one paw on it, or look back over the shoulder.",
  "neon-night": "Walk through the neon set in a confident stride or hold a strong three-quarter turn.",
  "film-noir": "Walk gently into the spotlight or look back over one shoulder from the edge of light.",
  "space-cadet": "Stand with one paw on the platform and look toward the circular portal.",
  "safari-still": "Step onto the low crate or turn the head toward the side of the field set.",
  "retro-cinema": "Turn toward an off-camera spotlight or step onto the small chair platform.",
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
