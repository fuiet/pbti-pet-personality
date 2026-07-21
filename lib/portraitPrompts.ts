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

export const PORTRAIT_PROMPT_VERSION = "studio-v5";

const IDENTITY_LOCK = `
Create a portrait of the SAME real pet shown in the reference photos. Identity preservation is the highest priority.
The species must remain exactly the same: never turn a cat into a dog or a dog into a cat.
Keep the original coat colors, coat length, markings, pattern, eye color, face shape, ear shape, muzzle or nose shape, body proportions, sex, and age impression.
Do not invent breed-specific features that are not visible in the references. Do not make the pet look younger, older, thinner, larger, fluffier, or more muscular than the references.
The clothing, props, pose, set, lighting, and composition may change, but the pet must remain immediately recognizable.
Use the reference photos as identity references, not as a loose inspiration.
`;

const PHOTOSHOOT_DIRECTION = `
Create a premium commercial pet-fashion photograph inspired by the best contemporary Asian pet studios and glossy social-media campaigns. Follow the aspect ratio and orientation required by the selected style. The result must look like a real professional studio photograph, not AI art, illustration, fantasy cosplay, or an old-fashioned portrait.

COMPOSITION: the single pet is the unmistakable hero and fills roughly 65% to 85% of the frame. Keep the face large, unobstructed, and tack sharp. Use either a tight head-and-chest portrait, a three-quarter portrait with the front paws visible, or a playful full-body floor pose. Do not place the pet far away, tiny in a large set, or centered in excessive empty space. Leave only the clean upper or side margin requested by the selected format for later website typography.

CAMERA AND LIGHT: shoot at pet eye level or slightly below with an 35-50mm editorial perspective; a subtle wide-angle feel is welcome but never distort the nose, eyes, head, or body. Use crisp direct flash balanced with a large soft key light, clean catchlights in both eyes, true coat color, bright facial exposure, detailed fur and whiskers, gentle floor shadow, and polished magazine-level retouching. Keep the background and subject clearly separated.

BACKGROUND: for most styles use one saturated seamless-paper color such as cherry red, tangerine orange, sunflower yellow, cobalt blue, or vivid pink, with a smooth floor-to-wall sweep and no visible room. A botanical style may instead use one controlled, lush floral vignette. Avoid generic living rooms, ornate interiors, fake outdoor scenery, busy patterns, clutter, excessive bokeh, and muddy brown grading.

EXPRESSION AND ACTION: capture a charming split-second expression that feels spontaneous but physically believable: bright direct gaze, gentle head tilt, tongue slightly out, one paw stepping forward, a natural stretch, rolling safely on the back, peeking around one prop, or interacting with a cushion. Preserve correct anatomy, real weight on the floor, and species-appropriate movement. Never force a dramatic leap when a close expressive pose would look better.

STYLING: use exactly one coherent wardrobe idea and at most one supporting prop. Clothing must look custom-fitted, comfortable, contemporary, and editorial: a crisp shirt and tie, soft color-block scarf, modern knit wrap, lightweight personality vest, safe statement glasses, floral collar, or one playful cushion. Never stack multiple outfits, hats, glasses, jewelry, and props together. Wardrobe must not hide the face, eyes, ears, nose, paws, identifying markings, or natural silhouette.

FINAL QUALITY: photorealistic premium pet photography, lively but tasteful, bold color, clean graphic silhouette, accurate paws, natural fabric folds, realistic contact shadows, high micro-detail, no plastic fur, no over-smoothed face, no uncanny expression, and no visual clutter.
`
const NEGATIVE_PROMPT = `
No species change, no coat-color change, no pattern change, no eye-color change, no altered facial proportions, no enlarged cartoon eyes, no shortened muzzle, no changed ears, no changed nose, no changed body type, no gender change, no age change, no invented breed traits, no second animal, no duplicate pet, no extra limbs, no missing limbs, no malformed paws, no floating paws, no twisted joints, no human hands, no human body, no aggressive behavior, no frightened expression, no plastic fur, no waxy face, no beauty-filter blur, no low-resolution fur, no tiny distant subject, no extreme fisheye distortion, no tilted horizon, no cluttered set, no multiple costumes, no unsafe tight clothing, no covered eyes, no watermark, no copied studio logo, no trademarked wordmark, no random letters, no generated text, no vintage look, no retro film, no sepia, no faded colors, no painterly style, no 3D render, no cartoon, no ornate classical set, no royal costume, no dark gloomy grade.
`;

const PERSONALITY_WARDROBE: Record<string, string> = {
  ASVG: "A clean contemporary guardian vest in deep navy with a warm orange accent; dependable, steady, and quietly protective.",
  ISCP: "A soft cloud-toned knit collar or lightweight capelet with a dreamy lavender accent; gentle, imaginative, and calm.",
  IEVG: "A sleek asymmetrical technical vest with bold cobalt details; independent, unconventional, and self-possessed.",
  IECG: "A minimalist scholar-style vest with a small modern bow or geometric collar accent; observant, thoughtful, and precise.",
  AEVG: "A structured statement vest in saturated red with clean gold-toned edging; confident, decisive, and charismatic.",
  ASCP: "A warm color-block companion knit or bandana with rounded graphic details; affectionate, friendly, and reassuring.",
  ASCG: "A soft sage-green comfort vest with cream trim; calm, caring, and emotionally attentive.",
  AEVP: "A sunny yellow varsity-inspired neckerchief or playful cropped vest; optimistic, social, and full of bright energy.",
  ISCG: "A refined charcoal watch vest with one vivid safety-orange accent; alert, careful, and composed.",
  AECP: "A bright color-block play vest with a lightweight sporty neckerchief; energetic, curious, and ready for action.",
  ISVG: "A clean premium knit or lightweight tailored vest in ivory and midnight blue; reserved, dignified, and quietly confident.",
  IEVP: "A lightweight modern explorer vest in sand and orange with a small contemporary scarf and practical graphic details; independent, curious, and quick-minded.",
};

const VERTICAL_CAMPAIGN_TEMPLATES = [
  {
    id: "neon-fashion-cover",
    name: "NEON fashion cover",
    direction: `
Vertical 4:5 or 2:3 NEON.PET-inspired pet fashion poster. Use the uploaded pet as the only identity reference and preserve the real species, face shape, coat color, markings, eye color, nose, ears, body proportions, age impression, and natural expression. Replace every prompt mention of a generic dog or cat with this exact uploaded pet.

Make a trendy high-saturation seamless crimson-red studio poster with direct flash, crisp shadows, slight wide-angle close framing, vivid commercial color grading, sharp fur and whisker detail, and a playful editorial magazine-cover feeling. Style the pet with one comfortable fashion idea such as oversized round glasses, a crisp light-blue striped shirt, a loose dark navy striped tie, a safe scarf, or a stylish collar; choose only what fits the pet's species and personality, and never hide the eyes, nose, ears, face, paws, markings, or silhouette.

Compose the pet in the lower center or lower-left with strong clean negative space near the top for website typography. Do not generate any words, logos, watermarks, random letters, or brand marks in the image itself. The website will add the pet name in bold poster typography and the transparent PBTI logo after generation.
`,
  },
  {
    id: "premium-emotional-studio",
    name: "premium emotional studio",
    direction: `
Vertical premium emotional pet studio portrait. Use the uploaded pet as the exact subject, preserving species, breed impression, face shape, coat color, markings, eye color, ear shape, nose, muzzle, body proportions, age impression, and natural expression. The pet must remain immediately recognizable from the reference photos.

Use a refined seamless muted-purple studio background with soft gradient falloff, a clean centered portrait composition, shallow depth of field, glossy catchlights, soft front-left studio lighting, crisp facial focus, natural fur texture, and a warm companion feeling. Add one bright contrasting foreground prop such as a yellow knitted cushion or soft fabric edge only if it helps the pose; keep it minimal and do not cover the pet's face or identifying markings. The pose should be front-facing or gentle three-quarter, with front paws visible when natural.

Leave elegant negative space above the pet for later website typography. Do not render any text, logo, watermark, random letters, or studio name. The website will add the pet name using refined poster typography and place the PBTI logo after generation.
`,
  },
  {
    id: "neon-sunglasses-closeup",
    name: "NEON sunglasses close-up",
    direction: `
Vertical NEON.PET-inspired close-up fashion poster. Use the uploaded pet as the only identity source and preserve the exact species, coat colors, markings, eye color, face proportions, ear shape, nose, muzzle, fur length, body type, sex, age impression, and natural expression. Do not redesign the pet into a different breed or a generic model.

Create an extreme or very close head-and-chest studio portrait on a high-saturation seamless pastel-pink background. Use direct flash, vivid commercial color grading, crisp fur detail, bright eye catchlights, and a modern social-media fashion cover composition. Add one playful glossy black sunglasses accessory pushed up on the forehead or safely above the eyes, or another small fashion accessory if sunglasses would hide identity. The accessory must never cover the pet's eyes, nose, ears, facial markings, or distinctive silhouette.

Frame the pet large in the lower and middle frame, with bold clean negative space at the top for website-composited typography. Do not generate NEON.PET text, pet name, logo, watermark, random letters, or any typography inside the image. The website will replace the poster headline with the real pet name and add the transparent PBTI logo.
`,
  },
  {
    id: "neon-cute-headwear",
    name: "NEON cute headwear",
    direction: `
Vertical cute NEON.PET-inspired pet fashion poster. Use the uploaded pet as the exact identity reference and preserve species, coat color, markings, face shape, eye color, pink or dark nose as shown, ear shape, fur texture, body proportions, age impression, and natural expression. The generated pet must look like the same pet from the user's photos.

Use a high-saturation seamless pastel-pink studio background with clean cyclorama floor and wall, direct flash lighting, crisp fur and whisker detail, glossy eyes, and a cute premium editorial finish. Pose the pet in a relaxed loaf, seated, or gentle front-facing pose in the lower half of the frame. Add one small playful pet-safe head accessory such as a soft cap, tiny fabric beret, small scarf, or simple heart patch detail; it must feel fashionable and comfortable, not costume-heavy, and it must not cover the eyes, ears, nose, face, markings, or natural silhouette.

Keep generous negative space above the pet for website-composited lettering. Do not render any words, pet name, logo, watermark, random letters, or brand mark inside the model output. The website will add the pet's name with the same poster-style typography and add the transparent PBTI logo.
`,
  },
] as const;

function pickVerticalCampaignDirection() {
  const index = Math.floor(Math.random() * VERTICAL_CAMPAIGN_TEMPLATES.length);
  return VERTICAL_CAMPAIGN_TEMPLATES[index] || VERTICAL_CAMPAIGN_TEMPLATES[0];
}

export const PORTRAIT_STYLES: PortraitStyle[] = [
  { id: "white-sketch-avatar", name: "Pet Avatar", category: "classic", direction: "Pure white background, hand-drawn pet character bust in delicate graphite and colored-pencil lines, sparse soft pastel accents sampled from the real coat, expressive half-lidded eyes or a subtle knowing expression, centered head-and-chest composition, generous white space, no clothing and no props." },
  { id: "landscape-campaign", name: "Landscape Portrait", category: "editorial", direction: "Horizontal 3:2 commercial pet-fashion photograph, saturated seamless-paper studio, pet placed prominently in one side or center-third while filling most of the frame, crisp direct flash, a natural playful action, one contemporary personality outfit, and clean negative space suitable for a social banner." },
  { id: "vertical-campaign", name: "Vertical Portrait", category: "editorial", direction: "Vertical 4:5 commercial pet-fashion poster, saturated seamless-paper studio, close eye-level camera, pet filling 70-85 percent of the frame, bright catchlights, one personality outfit, one charming spontaneous gesture, and a clean upper margin for later brand compositing." },
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

const PORTRAIT_STYLE_NAMES_ZH: Record<string, string> = {
  "white-sketch-avatar": "爱宠头像",
  "landscape-campaign": "横屏写真",
  "vertical-campaign": "竖屏写真",
  "crimson-editorial": "樱桃闪光",
  "rose-sequin": "粉红潮拍",
  "sunset-studio": "橘色跃动",
  "monochrome-runway": "黑白几何",
  "silver-satin": "银色潮流",
  "electric-blue": "钴蓝街拍",
  "violet-sculpture": "紫色切面",
  "cream-luxury": "香草清新",
  "heritage-tailoring": "青柠俱乐部",
  "navy-explorer": "深蓝机能",
  "library-scholar": "聪明曲奇",
  "royal-portrait": "紫色明星",
  "garden-bloom": "花园绽放",
  "autumn-leaves": "橙色彩纸",
  "winter-scarf": "冬日围巾",
  "summer-poolside": "夏日泳池",
  "raincoat-day": "雨衣日记",
  "lantern-night": "夜色闪光",
  "purple-action": "紫色行动",
  "orange-pillow": "橙色软垫",
  "paper-airplane": "纸飞机",
  "toy-box": "玩具盒",
  "bubble-pop": "泡泡乐园",
  "comic-frame": "漫画画框",
  "disco-soft": "柔光迪斯科",
  "picnic-camp": "零食俱乐部",
  "neon-night": "霓虹夜色",
  "film-noir": "白色闪光",
  "space-cadet": "太空萌宠",
  "safari-still": "绿色影棚",
  "retro-cinema": "珊瑚特写",
  "glasshouse": "玻璃花房",
  "midnight-cobalt": "午夜钴蓝",
  "cloud-studio": "云朵影棚",
};

export function getPortraitStyleDisplayName(styleId: string, language: string, fallback?: string) {
  const baseStyleId = styleId.split("--")[0];
  const isFixedFormat = ["white-sketch-avatar", "vertical-campaign", "landscape-campaign"].includes(baseStyleId);
  if (language === "zh-CN") return isFixedFormat ? PORTRAIT_STYLE_NAMES_ZH[baseStyleId] : "写真作品";
  return isFixedFormat ? (PORTRAIT_STYLES.find((style) => style.id === baseStyleId)?.name || fallback || "Portrait") : "Portrait";
}

const ACTIONS_BY_STYLE: Record<string, string> = {
  "landscape-campaign": "Use a natural horizontal action: walking across the frame, leaning toward one side, playing beside one soft prop, or looking back over the shoulder, while keeping the face prominent.",
  "vertical-campaign": "Use a vertical-cover gesture: a close head tilt, tongue slightly out, one paw stepping toward camera, or a safe playful floor pose with the eyes and face clearly visible.",
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
  const personalityWardrobe = PERSONALITY_WARDROBE[context.pbtiCode] || "A safe contemporary pet-fashion accessory that visually expresses the assigned personality while keeping the pet comfortable and recognizable.";
  const baseStyleId = style.id.split("--")[0];
  const verticalTemplate = baseStyleId === "vertical-campaign" ? pickVerticalCampaignDirection() : null;
  if (style.id.split("--")[0] === "white-sketch-avatar") {
    return [
      IDENTITY_LOCK,
      appearanceLock(context.visualProfile),
      `Draw the SAME real ${context.species} from the reference photos as a refined hand-drawn character portrait on a perfectly pure white background. This is a square 1:1 centered head-and-upper-chest avatar, not a photograph. Preserve the real pet's exact species, coat colors, markings, eye color, ear shape, muzzle, face proportions, fur length, and distinctive silhouette so the owner immediately recognizes the pet.`,
      "STYLE: elegant loose graphite pencil sketch with many fine, slightly imperfect wispy fur strokes; restrained colored-pencil shading sampled from the pet's real coat; tiny pale cyan, warm yellow, peach, or lavender accent strokes; subtle pink inside the ears and a very light cheek blush only when natural. Keep most of the paper white and unpainted. Use crisp black detail only for eyes, nose, mouth, and a few defining fur edges.",
      "EXPRESSION: give the portrait a quiet, witty, slightly proud personality through a subtle head tilt, half-lidded or gently narrowed eyes, and a tiny closed mouth. Keep it affectionate rather than angry. For a dog, the chest or front paws may form a simple self-assured pose; for a cat, use an elegant upright bust or neatly tucked paws. Anatomy must remain natural and species-correct.",
      "COMPOSITION: one pet only, centered, occupying about 55-70 percent of the square canvas, with generous clean white space on every side. No ground line, no scenery, no frame, no shadow box, no clothing, no accessories, no props, no text, no logo, no watermark.",
      "Avoid photorealism, oil paint, watercolor wash, thick marker outlines, vector icon style, flat emoji style, chibi proportions, oversized eyes, human eyebrows, human hands, generic breed substitution, extra limbs, malformed paws, dense background marks, gray paper, cream paper, colored background, paper texture, random letters, signature, or watermark.",
    ].join("\n\n");
  }
  return [
    IDENTITY_LOCK,
    appearanceLock(context.visualProfile),
    "Art direction: " + (verticalTemplate ? `${verticalTemplate.name}: ${verticalTemplate.direction}` : style.direction),
    `Personality wardrobe for ${context.pbtiCode} / ${context.personalityName}: ${personalityWardrobe} This wardrobe direction is required and should be clearly visible, but it must never cover identifying facial or coat features.`,
    PHOTOSHOOT_DIRECTION,
    "Required action variation: " + (ACTIONS_BY_STYLE[baseStyleId] || "Use a natural, species-appropriate action that differs from the reference pose."),
    "The selected style is the primary art direction. Do not blend it into a generic portrait. Make the requested pose, action, background, prop relationship, camera angle, lighting, and poster composition visibly present in the final frame. The pose may differ from every reference photo while the pet's anatomy and identity remain consistent.",
    "The wardrobe and props are styling only. They must fit the species safely and must not hide the face, eyes, ears, nose, coat pattern, or identifying markings. Keep the eyes visible and preserve the real eye color even under colored lighting.",
    `Leave a clean area for website compositing. Do not render any words, pet name, website name, logo, watermark, or brand mark inside the image; the website will add the pet name "${context.petName}" in poster typography and the transparent PBTI logo after generation.`,
    `Pet name for website typography: ${context.petName}. PBTI type for metadata only: ${context.pbtiCode}, ${context.personalityName}.`,
    verticalTemplate ? `Selected vertical template id for metadata: ${verticalTemplate.id}.` : "",
    NEGATIVE_PROMPT,
  ].filter(Boolean).join("\n\n");
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
  void petId;
  const fixedIds = ["white-sketch-avatar", "vertical-campaign", "landscape-campaign"];
  return fixedIds
    .map((id) => PORTRAIT_STYLES.find((style) => style.id === id))
    .filter((style): style is PortraitStyle => Boolean(style))
    .slice(0, count);
}
