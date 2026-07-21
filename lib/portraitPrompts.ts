import type { PetVisualProfile } from "@/lib/visualProfile";
import { findPortraitStudioTemplateByStyleId, type PortraitStudioTemplate } from "@/lib/portraitStudioTemplates";

export type PortraitStyle = {
  id: string;
  name: string;
  category: "editorial" | "playful" | "classic" | "cinematic" | "seasonal";
  direction: string;
};

export type PortraitRequestContext = {
  petName: string;
  species: "cat" | "dog";
  gender?: "male" | "female" | null;
  pbtiCode: string;
  personalityName: string;
  visualProfile?: PetVisualProfile | null;
  ownerIncluded?: boolean;
  customPrompt?: string | null;
};

type TemplateGender = "male" | "female";
type PromptKind = "avatar" | "vertical" | "landscape";

type PromptTemplate = {
  id: string;
  gender: TemplateGender;
  direction: string;
};

export const PORTRAIT_PROMPT_VERSION = "studio-v7";

const IDENTITY_LOCK = `
Create an image of the SAME real pet shown in the uploaded reference photos. Identity preservation is the highest priority.
The species must remain exactly the same: never turn a cat into a dog or a dog into a cat.
Preserve the original breed impression, face shape, muzzle or nose shape, ear shape, eye color, coat color, coat length, markings, pattern, body proportions, sex, and age impression.
Treat the uploaded photos as identity references, not as a requirement to copy a blank or stiff facial expression exactly.
The pet must remain immediately recognizable, but the final image may improve head angle, gaze focus, facial engagement, and natural liveliness so the portrait feels expressive and alive.
The clothes, props, pose, set, lighting, and composition may change, but the pet must remain immediately recognizable to its owner.
Use the uploaded photos as identity references, not loose inspiration.
`;

const UNIVERSAL_NO_TEXT = `
Do not generate any readable words, random letters, brand logos, studio logos, website names, watermarks, signatures, captions, or trademarks inside the image. The website will add the pet name "__PET_NAME__" and the transparent PBTI logo after generation.
`;

const NEGATIVE_PROMPT = `
Negative prompt: no species change, no breed substitution, no coat-color change, no markings change, no eye-color change, no altered face proportions, no enlarged cartoon eyes unless the selected template is explicitly an illustration, no shortened muzzle, no changed ears, no changed nose, no changed body type, no gender change, no age change, no second animal, no duplicate pet, no extra limbs, no missing limbs, no malformed paws, no floating paws, no twisted joints, no human body, no human face, no aggressive or frightened expression, no blank stare, no vacant eyes, no dull lifeless gaze, no stiff frozen facial expression, no sleepy uninterested look unless the selected template explicitly calls for sleep, no plastic fur, no waxy face, no beauty-filter blur, no low-resolution fur, no tiny distant subject, no extreme fisheye distortion, no cluttered set, no unsafe tight clothing, no covered eyes, no watermark, no copied studio logo, no trademarked wordmark, no random letters, no generated text.
`;

const DUO_NEGATIVE_PROMPT = `
Negative prompt: no species change, no breed substitution, no coat-color change, no markings change, no eye-color change, no altered face proportions, no enlarged cartoon eyes unless the selected template is explicitly an illustration, no shortened muzzle, no changed ears, no changed nose, no changed body type, no gender change, no age change, no duplicate pet, no second pet, no extra limbs, no missing limbs, no malformed paws, no floating paws, no twisted joints, no extra human, no missing human, no swapped subject identities, no distorted hands, no broken fingers, no melted face, no aggressive or frightened expression, no blank stare, no vacant eyes, no dull lifeless gaze, no stiff frozen facial expression, no beauty-filter blur, no low-resolution fur, no low-resolution skin, no tiny distant subjects, no extreme fisheye distortion, no cluttered set, no unsafe tight clothing, no covered eyes, no watermark, no copied studio logo, no trademarked wordmark, no random letters, no generated text.
`;

const PERSONALITY_WARDROBE: Record<string, string> = {
  ASVG: "steady guardian styling: deep navy, warm orange accents, reliable and quietly protective.",
  ISCP: "dreamy gentle styling: cloud tones, soft lavender accents, calm and imaginative.",
  IEVG: "independent creative styling: asymmetrical cobalt details, self-possessed and unconventional.",
  IECG: "minimal scholar styling: clean geometry, small bow or collar accent, observant and precise.",
  AEVG: "confident leader styling: saturated red, clean gold-toned edges, charismatic and decisive.",
  ASCP: "warm companion styling: rounded color-block knit or bandana, friendly and reassuring.",
  ASCG: "comforting healer styling: sage green, cream trim, emotionally attentive and calm.",
  AEVP: "sunny social styling: yellow, playful sporty details, optimistic and energetic.",
  ISCG: "alert watchful styling: charcoal and safety-orange accent, careful and composed.",
  AECP: "active explorer styling: bright color-block sport accents, curious and ready for action.",
  ISVG: "reserved premium styling: ivory and midnight blue, dignified and quietly confident.",
  IEVP: "modern explorer styling: sand, orange, lightweight scarf or vest, curious and quick-minded.",
};

const PERSONALITY_EXPRESSION: Record<string, string> = {
  IEVP: "PBTI expression tone for Explorer: curious, quick-minded, adventurous, bright-eyed, lightly mischievous, eager to discover what is just beyond the frame.",
  ASVG: "PBTI expression tone for Guardian: steady, trustworthy, grounded, quietly protective, observant, warm without being overly performative.",
  ISCP: "PBTI expression tone for Dreamer: gentle, imaginative, soft-hearted, inwardly alive, dreamy but still emotionally readable.",
  IEVG: "PBTI expression tone for Maverick: independent, unconventional, sharp, self-possessed, slightly rebellious, distinctly memorable.",
  IECG: "PBTI expression tone for Scholar: observant, intelligent, measured, thoughtful, calm, precise, with a quietly analytical presence.",
  AEVG: "PBTI expression tone for Leader: confident, charismatic, composed, forward-facing, commanding but natural, clearly aware of the camera.",
  ASCP: "PBTI expression tone for Companion: friendly, affectionate, reassuring, socially open, easy to love, warmly engaged.",
  ASCG: "PBTI expression tone for Healer: soothing, emotionally attentive, tender, safe, calm, comforting, soft but not lifeless.",
  AEVP: "PBTI expression tone for Sunny: upbeat, playful, optimistic, lively, extroverted, cheerful, visibly full of life.",
  ISCG: "PBTI expression tone for Sentinel: vigilant, composed, careful, watchful, cool-headed, highly aware of surroundings.",
  AECP: "PBTI expression tone for Player: energetic, fun, expressive, cheeky, spirited, interactive, naturally entertaining.",
  ISVG: "PBTI expression tone for Noble: dignified, refined, poised, elegant, self-contained, premium, with quiet authority.",
};

const AVATAR_TEMPLATES: PromptTemplate[] = [
  {
    id: "moon-dream",
    gender: "male",
    direction:
      "Square magical avatar portrait. Place the same pet resting or curling on top of a glowing full-moon sphere at night, deep blue sky, distant horizon, cinematic moonlight, dreamy surreal but still realistic, calm introspective mood, clean centered composition.",
  },
  {
    id: "ink-cyan-glasses",
    gender: "male",
    direction:
      "Square handmade ink-and-watercolor avatar on textured white paper. Draw the same pet as a loose expressive sketch with energetic black fur strokes, minimal gray shading, oversized bright cyan round glasses, a simple white bib or shirt with cyan trim, boutique custom portrait mood.",
  },
  {
    id: "snow-selfie-gray",
    gender: "male",
    direction:
      "Square adventure selfie avatar. The same pet appears in snowy mountains under a vivid blue sky, wearing yellow or orange sunglasses, white earmuffs, a bright scarf, one paw near the lens as if taking a selfie, playful travel influencer energy, crisp sunlight.",
  },
  {
    id: "snow-hiker-tabby",
    gender: "male",
    direction:
      "Square snowy mountain close-up avatar. The same pet faces camera in yellow sunglasses, fluffy white earmuffs, colorful knitted scarf, and small backpack straps, alpine peaks behind, sharp winter sunlight, confident explorer mood.",
  },
  {
    id: "sleeping-plush-hug",
    gender: "female",
    direction:
      "Square cozy bedtime avatar. The same pet sleeps peacefully while hugging a soft pink plush toy, warm indoor bedding, soft heart stickers or gentle dreamy details, intimate close-up, tender healing mood, shallow depth of field.",
  },
  {
    id: "panda-hood-smile",
    gender: "female",
    direction:
      "Square ultra-cute close-up avatar. The same pet wears a fluffy white panda-style hood with black ears, smiling with mouth open, soft bedding or neutral cozy background, big glossy eyes, plush texture, sweet social-media pet mood.",
  },
  {
    id: "tiny-scholar-laptop",
    gender: "male",
    direction:
      "Square cozy scholar avatar. The same pet sits on a bed in round glasses and a delicate blouse or neat collar, small clean laptop in front with no visible brand, warm bedroom light, thoughtful little-professor personality, realistic cute photography.",
  },
  {
    id: "beach-sunset-wave",
    gender: "male",
    direction:
      "Square golden-hour beach avatar. The same pet stands on sand near the ocean at sunset, glowing backlight around fur, one paw raised in a friendly wave, soft lens flare, warm cinematic vacation feeling, cute and optimistic.",
  },
  {
    id: "alpine-sunset-profile",
    gender: "male",
    direction:
      "Square cinematic mountain avatar. The same pet sits in side profile on snowy peaks at sunset, orange rim light outlining the fur, dramatic clouds, majestic landscape, quiet brave explorer mood, premium fantasy-realistic photography.",
  },
  {
    id: "iced-drink-comedy",
    gender: "male",
    direction:
      "Square funny lifestyle avatar. The same pet sits on a sofa sipping a dark iced drink through a clean blue straw from a plain glass with no label, wide curious eyes, cozy home background, humorous candid realism.",
  },
  {
    id: "cow-hood-blue-sky",
    gender: "female",
    direction:
      "Square bright cute avatar. The same pet wears a plush cow hood with black ears and tiny horns against a clear saturated blue sky, centered close-up face, glossy eyes, clean daylight, soft toy-like charm without becoming cartoon.",
  },
  {
    id: "bubble-duck-bath",
    gender: "female",
    direction:
      "Square playful bath avatar. The same pet peeks from white sparkling bubble foam in a bathtub with a small yellow rubber duck balanced on the head, tiled bathroom background, close face focus, funny innocent expression.",
  },
  {
    id: "hamburger-hood",
    gender: "female",
    direction:
      "Square food-costume avatar. The same pet wears a plush hamburger hood framing the face with soft bun, lettuce, and tomato colors, plain light background, centered close-up, adorable round-eyed expression, clean soft studio light.",
  },
  {
    id: "pink-tote-peek",
    gender: "female",
    direction:
      "Square pastel fashion avatar. The same pet peeks from a soft pastel pink tote bag wearing a pink plush hood, tongue slightly out when natural, cute shopping-bag composition, all bag text removed, playful feminine sweetness.",
  },
  {
    id: "yellow-plush-hood",
    gender: "female",
    direction:
      "Square soft plush avatar. The same pet wears a fuzzy pale-yellow hood and rests near a pillow with no readable text, front-facing face, simple cozy background, gentle sleepy cuteness, soft indoor light.",
  },
  {
    id: "plush-doll-doodle",
    gender: "female",
    direction:
      "Square kawaii close-up avatar. The same pet holds a small white plush doll wearing black glasses, with a few simple white doodle stickers such as ear outlines, whisker lines, stars, and arrows, black or dark background, cute handcrafted internet aesthetic.",
  },
  {
    id: "black-sunglasses-sweater",
    gender: "male",
    direction:
      "Square cool indoor fashion avatar. The same pet wears oversized black rectangular sunglasses and a fitted black ribbed turtleneck sweater, close head-and-chest crop, cozy white bedding and pillows blurred behind, stylish aloof celebrity attitude.",
  },
  {
    id: "blue-plush-cape",
    gender: "female",
    direction:
      "Square clean studio avatar. The same pet sits front-facing on a white floor against a royal blue background, wearing a fluffy white hooded cape with green trim, small colorful pom-pom decorations, and red drawstrings, calm innocent expression.",
  },
  {
    id: "watercolor-happy-name",
    gender: "female",
    direction:
      "Square minimalist watercolor avatar on pure white background. Draw only the same pet's happy head portrait with soft cream and beige brush strokes, glossy eyes, open-mouth smile when natural, and elegant handwritten pet-name typography below added later by website.",
  },
  {
    id: "soft-sketch-glasses",
    gender: "male",
    direction:
      "Square refined hand-drawn pet head avatar on white paper. The same pet is simplified into loose ink lines and pale watercolor shadows, wearing tasteful oversized glasses, charming curious expression, airy custom illustration, no signature or random text.",
  },
];

const VERTICAL_TEMPLATES: PromptTemplate[] = [
  { id: "neon-shirt-tie", gender: "male", direction: "Vertical NEON.PET-style fashion poster, high-saturation crimson or rose seamless studio, direct flash, close slight wide-angle crop. Dress the same pet in oversized glasses, a crisp light-blue striped shirt, and a loose dark tie or smart collar. Bold clean top negative space for later pet-name typography." },
  { id: "purple-emotional", gender: "male", direction: "Vertical premium emotional studio portrait, muted purple seamless background, soft gradient falloff, centered close portrait, bright catchlights, one yellow knitted cushion or clean foreground fabric edge, calm loyal companion feeling, no generated text." },
  { id: "pink-sunglasses-close", gender: "female", direction: "Vertical NEON.PET close-up on pastel-pink seamless paper, direct flash, glossy black sunglasses pushed above the eyes, close head-and-chest crop, fashionable cute expression, vivid magazine cover finish, clean top margin." },
  { id: "pink-cute-headwear", gender: "female", direction: "Vertical cute NEON.PET studio poster on pastel-pink seamless background. Add one small pet-safe cap, beret, heart patch, or soft scarf, relaxed loaf or seated pose, crisp fur detail, sweet premium editorial mood." },
  { id: "crimson-streetwear", gender: "male", direction: "Vertical cool streetwear poster, deep crimson seamless background, extreme close-up, glossy black triangular sunglasses or dark harness, direct flash, sharp fur, confident side angle, social-media fashion cover energy." },
  { id: "pink-plush-hood", gender: "female", direction: "Vertical cute plush-hood poster, hot-pink seamless studio, soft duck, chick, bear, or bunny-inspired hood framing the same pet's face, direct flash, glossy eyes, soft plush texture, adorable premium campaign." },
  { id: "sequin-runway", gender: "female", direction: "Vertical glamorous runway poster, seamless pink studio, same pet with organza bow or iridescent sequin fabric train spreading toward the foreground, direct flash sparkle, luxury playful editorial, face unobstructed." },
  { id: "sunny-botanical", gender: "female", direction: "Vertical sunflower-yellow studio poster, same pet with white flower wreath, green leaf collar, tropical shirt, or floral neck accessory, direct flash, bright summer editorial color, close face-forward crop." },
  { id: "newspaper-smart", gender: "male", direction: "Vertical humorous smart poster, pastel-pink or magenta seamless studio, folded newspaper, magazine, book, or graphic paper prop angled in the foreground, optional sunglasses above eyes, direct flash, clever editorial attitude." },
  { id: "red-hood-yellow", gender: "male", direction: "Vertical bold color-block poster, sunflower-yellow seamless studio, bright red knitted hood, chunky scarf, soft cape, or color-block sweater, crisp direct flash, strong red-yellow fashion campaign mood." },
  { id: "pink-soft-prop", gender: "female", direction: "Vertical sweet soft-prop poster, seamless pink studio, same pet leaning over or resting inside a pastel cushion, pet bag, plush basket, or fabric block, small bow or collar charm, cute social-media cover look." },
  { id: "oversized-bow", gender: "female", direction: "Vertical theatrical cute poster, seamless pink studio, oversized soft fabric bow, ribbon backdrop, puffy textile shape, or gift prop framing the same pet, direct flash, sweet dramatic fashion composition." },
  { id: "teal-flower-toy", gender: "female", direction: "Vertical cheerful toy-flower poster, saturated teal-blue studio, oversized plush sunflower or smiling flower behind the same pet, pastel capelet, bib, scarf, or bow, bright direct flash, playful children's editorial." },
  { id: "teal-sport-ball", gender: "male", direction: "Vertical sporty toy-prop poster, saturated teal-blue studio, oversized soft soccer ball, tennis ball, basketball, or toy trophy near the same pet, sporty vest or scarf, athletic playful editorial energy." },
  { id: "hotpink-sport-sunglasses", gender: "male", direction: "Vertical energetic streetwear poster, hot-pink studio close-up, red sunglasses, athletic goggles above eyes, sporty scarf, or lightweight vest, lively side angle, tongue-out smile or playful head tilt." },
  { id: "yellow-tote", gender: "male", direction: "Vertical playful urban shopping poster, sunflower-yellow seamless studio, same pet safely peeking from a plain soft fabric tote, basket bag, or oversized pouch, optional small charm, direct flash, no human hand if possible." },
  { id: "birthday-pink", gender: "female", direction: "Vertical birthday party poster, raspberry-pink studio, small party hat, pom-pom headpiece, pastel bow, ruffled collar, or satin skirt, cute head tilt, direct flash, sweet festive editorial." },
  { id: "orange-rebel", gender: "male", direction: "Vertical rebellious streetwear poster, orange seamless studio, black vest, houndstooth panel, chain detail, or glossy sunglasses, confident paw-near-glasses pose, direct flash, luxury street-fashion mood." },
  { id: "magenta-newspaper-frame", gender: "male", direction: "Vertical funny newspaper-frame poster, deep magenta studio, folded newspaper or magazine close to camera framing the same pet's face, slight wide-angle humor without identity distortion, crisp flash." },
  { id: "festive-new-year", gender: "female", direction: "Vertical festive New Year poster, deep pink or magenta studio, red knitted sweater, soft scarf, gold-trimmed collar, floral branch, blank scroll, or ribbon, warm celebratory editorial, no readable characters." },
];

const LANDSCAPE_TEMPLATES: PromptTemplate[] = [
  { id: "toy-clothesline-box", gender: "male", direction: "Horizontal pet studio scene on a clean white background. The same pet sits on a cardboard box wearing a tan hoodie, plush animal toys clipped to a clothesline behind, soft rug with scattered pet toys and treats, bright airy commercial photography." },
  { id: "butterbear-chair", gender: "female", direction: "Horizontal cozy vintage toy-room scene. The same pet lounges on a fluffy cream armchair wearing a yellow gingham shirt, teddy bear beside it, warm butter-yellow bear posters on the wall with no readable text, soft nostalgic indoor light." },
  { id: "red-cartoon-room", gender: "male", direction: "Horizontal bright red cartoon-inspired room. The same pet wears a red-and-black playful outfit and round-ear bow headband, plush toy cave and character-like toys around it, cheerful theme-room energy, avoid all copyrighted characters and logos." },
  { id: "autumn-run", gender: "male", direction: "Horizontal autumn forest action photo. The same pet runs toward camera through golden leaves, warm backlight, shallow depth of field, crisp fur, joyful open-mouth expression, clean white editorial text area left blank for website compositing." },
  { id: "autumn-picnic", gender: "male", direction: "Horizontal outdoor autumn picnic portrait. The same pet sits beside a folding chair, books, small vase, white fabric, and golden forest background, warm sunlight, refined lifestyle photography, calm happy profile." },
  { id: "halloween-cat", gender: "female", direction: "Horizontal Halloween studio scene. The same pet sits on a wooden crate wearing a black cape with white collar, orange and black props, pumpkins, broom-like decor, spooky but cute atmosphere, no readable Halloween words." },
  { id: "blue-business-portrait", gender: "male", direction: "Horizontal formal studio portrait on textured blue background. The same pet wears a neat white collar and black tie or smart business accessory, mouth open or alert expression, premium studio lighting, professional pet portrait mood." },
  { id: "blue-draped-glasses", gender: "male", direction: "Horizontal blue artistic studio. The same pet lies or sits on a textured blue floor wearing round glasses and a dark draped fabric or coat, editorial fashion lighting, polished dramatic composition." },
  { id: "yellow-cushion-studio", gender: "male", direction: "Horizontal pale-yellow studio with oversized rounded red and yellow cushions around the same pet. Relaxed pose, playful commercial set, bright clean lighting, bold soft-shape composition." },
  { id: "new-year-sofa", gender: "female", direction: "Horizontal deep red festive New Year scene. The same pet sits on a brown leather sofa with blank red decorative papers and abstract calligraphy-like marks, warm celebratory lighting, no readable Chinese text." },
  { id: "christmas-fireplace", gender: "male", direction: "Horizontal cozy holiday fireplace portrait. The same pet rests on a red plaid blanket near a glowing fireplace, gift boxes and festive decor in dim background, warm firelight, intimate cinematic mood." },
  { id: "autumn-cat-low", gender: "male", direction: "Horizontal low-angle autumn forest portrait. The same pet lies among golden leaves near tree trunks, looking upward toward warm sunlight, shallow foreground blur, glowing backlight, quiet cinematic nature mood." },
  { id: "black-lowkey-paw", gender: "male", direction: "Horizontal low-key black studio portrait. The same pet reaches one paw toward the camera, dramatic rim light outlining whiskers and fur, black background, sharp face detail, elegant mysterious mood." },
  { id: "pastel-nursery", gender: "female", direction: "Horizontal pastel nursery bed scene. The same pet rests on white bedding with plush toys around and hanging stuffed animals above, pale blue wall, gentle soft light, dreamy cute bedroom atmosphere." },
  { id: "birthday-cake", gender: "female", direction: "Horizontal bright birthday scene. The same pet sits beside a small pet-safe cake, colorful handmade banner and simple decorations in the background, pearl or cute collar, clean daylight, festive but tasteful." },
  { id: "urban-red-bench", gender: "male", direction: "Horizontal urban lifestyle photo. The same pet stands on a vivid red bench near a chain-link fence, brick building background with bokeh, pastel outfit or harness, shallow depth of field, cheerful city-pet mood." },
  { id: "urban-ledge", gender: "male", direction: "Horizontal clean architecture portrait. The same pet stands on a stone ledge in front of a dark modern panel and brick wall, simple striped sweater, confident smile, clean urban editorial photography." },
  { id: "retro-red-drink", gender: "male", direction: "Horizontal bold red summer studio. The same pet lounges in a striped deck chair wearing mint shirt and tie, plain red coolers and glass soda bottles with all labels removed, high-saturation commercial set." },
  { id: "blue-cartoon-room", gender: "female", direction: "Horizontal bright blue playful room. The same pet lies on a plush rug wearing a blue-and-white outfit and cap, matching plush bed and toys around, cartoonish but realistic, avoid copyrighted characters and logos." },
  { id: "wizard-library", gender: "male", direction: "Horizontal magical academy library scene. The same pet wears a black pointed wizard hat and cape, old bookshelves, potion bottles, red wall, warm fantasy studio lighting, avoid copyrighted posters, school names, or readable text." },
];

export const PORTRAIT_STYLES: PortraitStyle[] = [
  { id: "white-sketch-avatar", name: "Pet Avatar", category: "classic", direction: "Square 1:1 generated pet avatar selected randomly from the avatar template pool." },
  { id: "vertical-campaign", name: "Vertical Portrait", category: "editorial", direction: "Vertical generated pet fashion portrait selected randomly from the vertical template pool." },
  { id: "landscape-campaign", name: "Landscape Portrait", category: "editorial", direction: "Horizontal generated pet scene selected randomly from the landscape template pool." },
];

const PORTRAIT_STYLE_NAMES_ZH: Record<string, string> = {
  "white-sketch-avatar": "爱宠头像",
  "vertical-campaign": "竖屏写真",
  "landscape-campaign": "横屏写真",
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

function speciesExpressionBase(species: "cat" | "dog") {
  if (species === "dog") {
    return [
      "Species expression base: preserve the dog's exact identity while making the portrait feel socially alive, warm, emotionally engaged, and naturally charismatic.",
      "Dogs may vary across friendly, joyful, loyal, alert, playful, sporty, thoughtful, or brave moods depending on the scene, but should never feel emotionally flat.",
      "Prefer bright focused eyes, responsive ears, healthy facial energy, and a believable sense of connection with the camera or environment.",
      "If natural for the pose, allow a soft open-mouth smile, gentle panting expression, or relaxed cheerful mouth shape, but never force a cartoon grin.",
      "Avoid a vacant, heavy, disengaged, or stiff dog face.",
    ].join(" ");
  }

  return [
    "Species expression base: preserve the cat's exact identity while making the portrait feel vivid, elegant, self-possessed, and visually magnetic.",
    "Cats may vary across curious, refined, mischievous, dreamy, regal, playful, watchful, or quietly affectionate moods depending on the scene, but should never feel blank.",
    "Prefer focused eyes, refined facial tension, subtle alertness, controlled poise, and species-natural emotional readability without humanizing the face too much.",
    "Allow subtle head-angle refinement, gaze control, and eye engagement so the cat feels alive, premium, and intentional.",
    "Avoid a vacant, dull, frozen, or emotionally drained cat face.",
  ].join(" ");
}

function kindExpressionBase(kind: PromptKind) {
  if (kind === "avatar") {
    return [
      "Format expression goal: because this is an avatar, the face must read instantly at small size.",
      "Favor crisp eye contact or a clearly readable face angle, strong facial presence, and compact emotional clarity.",
      "Avoid weak distant expression, sleepy ambiguity, or a face hidden by pose or prop.",
    ].join(" ");
  }

  if (kind === "vertical") {
    return [
      "Format expression goal: because this is a vertical poster, the portrait should feel editorial, camera-aware, and stylish.",
      "Favor intentional gaze, strong facial rhythm, confident pose energy, and an expression that supports fashion or campaign storytelling.",
      "Avoid passive, limp, or uninterested poster energy.",
    ].join(" ");
  }

  return [
    "Format expression goal: because this is a horizontal scene portrait, the expression should connect naturally to the environment and feel cinematic.",
    "Favor lived-in scene awareness, believable action or situational emotion, and a face that still reads clearly within the wider composition.",
    "Avoid a disconnected face that looks pasted into the scene.",
  ].join(" ");
}

function templateExpressionDirection(templateId: string, species: "cat" | "dog") {
  const moodMap: Record<string, string> = {
    "moon-dream": "calm, introspective, poetic, quietly luminous",
    "ink-cyan-glasses": "curious, witty, boutique, handcrafted",
    "snow-selfie-gray": "playful, adventurous, cheeky, travel-ready",
    "snow-hiker-tabby": "confident, resilient, explorer-like, bright-eyed",
    "sleeping-plush-hug": "peaceful, soothed, tender, deeply relaxed",
    "panda-hood-smile": "sweet, soft, social, irresistibly charming",
    "tiny-scholar-laptop": "observant, intelligent, composed, endearing",
    "beach-sunset-wave": "friendly, sunny, affectionate, open-hearted",
    "alpine-sunset-profile": "majestic, brave, serene, cinematic",
    "iced-drink-comedy": "funny, candid, amused, expressive",
    "cow-hood-blue-sky": "bright, innocent, playful, photogenic",
    "bubble-duck-bath": "innocent, amused, surprised, adorable",
    "hamburger-hood": "cute, round-eyed, quirky, toy-like",
    "pink-tote-peek": "curious, sweet, fashionable, playful",
    "yellow-plush-hood": "gentle, cozy, comforted, sleepy-soft",
    "plush-doll-doodle": "mischievous, cute, internet-savvy, expressive",
    "black-sunglasses-sweater": "cool, aloof, stylish, self-possessed",
    "blue-plush-cape": "calm, innocent, polished, soft-eyed",
    "watercolor-happy-name": "light, happy, warm, portrait-friendly",
    "soft-sketch-glasses": "charming, intelligent, refined, gentle",
    "neon-shirt-tie": "bold, smart, fashion-forward, high-attitude",
    "purple-emotional": "soulful, loyal, intimate, emotionally present",
    "pink-sunglasses-close": "confident, glossy, playful, trendy",
    "pink-cute-headwear": "cute, sweet, approachable, polished",
    "crimson-streetwear": "sharp, daring, urban, fearless",
    "pink-plush-hood": "adorable, plush, innocent, high-cuteness",
    "sequin-runway": "glamorous, radiant, theatrical, camera-loving",
    "sunny-botanical": "fresh, bright, optimistic, blooming",
    "newspaper-smart": "clever, knowing, witty, composed",
    "red-hood-yellow": "bold, energetic, spirited, graphic",
    "pink-soft-prop": "gentle, cozy, affectionate, cuddly",
    "oversized-bow": "dramatic, darling, sweet, extra-cute",
    "teal-flower-toy": "joyful, toy-like, youthful, bubbly",
    "teal-sport-ball": "active, competitive, energetic, engaged",
    "hotpink-sport-sunglasses": "athletic, lively, cheeky, high-energy",
    "yellow-tote": "urban, curious, upbeat, stylishly playful",
    "birthday-pink": "festive, delighted, celebratory, charming",
    "orange-rebel": "rebellious, swaggering, edgy, self-assured",
    "magenta-newspaper-frame": "humorous, editorial, expressive, sharp",
    "festive-new-year": "celebratory, glowing, warm, delighted",
    "toy-clothesline-box": "friendly, commercial, approachable, bright",
    "butterbear-chair": "nostalgic, cozy, dreamy, soothed",
    "red-cartoon-room": "cheeky, playful, bold, lively",
    "autumn-run": "joyful, kinetic, exhilarated, outdoorsy",
    "autumn-picnic": "content, refined, relaxed, companionable",
    "halloween-cat": "spooky-cute, alert, mischievous, theatrical",
    "blue-business-portrait": "professional, attentive, trustworthy, poised",
    "blue-draped-glasses": "artistic, cool, composed, editorial",
    "yellow-cushion-studio": "playful, soft, commercially cheerful, bright",
    "new-year-sofa": "festive, proud, elegant, cozy-luxury",
    "christmas-fireplace": "warm, intimate, nostalgic, content",
    "autumn-cat-low": "quiet, watchful, cinematic, nature-aware",
    "black-lowkey-paw": "mysterious, intense, elegant, high-drama",
    "pastel-nursery": "dreamy, gentle, sweet, nursery-soft",
    "birthday-cake": "celebratory, cute, delighted, polished",
    "urban-red-bench": "cheerful, city-smart, outgoing, lively",
    "urban-ledge": "confident, architectural, clean, modern",
    "retro-red-drink": "summer-cool, amused, stylish, vibrant",
    "blue-cartoon-room": "playful, toy-room energetic, animated, bright",
    "wizard-library": "magical, wise, curious, storybook-dramatic",
  };

  const mood = moodMap[templateId] || "alive, expressive, emotionally readable, scene-appropriate";
  const speciesGuard = species === "dog"
    ? "Keep the emotional styling canine-natural: warm, alert, expressive, but not human-faced."
    : "Keep the emotional styling feline-natural: elegant, intentional, readable, but not human-faced.";

  return [
    `Template-specific expression target: ${mood}.`,
    speciesGuard,
    "Let the eyes, brow area, muzzle tension, ear set, and head angle work together so the emotional tone is readable even before any text is added.",
  ].join(" ");
}

function personalityExpressionDirection(pbtiCode: string, personalityName: string) {
  const tone = PERSONALITY_EXPRESSION[pbtiCode];
  if (tone) {
    return [
      tone,
      "This personality cue should influence gaze, confidence, softness, playfulness, and overall emotional presence without changing the pet's identity or turning the image into a cartoon stereotype.",
      "The viewer should feel the assigned PBTI type through the portrait's emotional energy before reading the label.",
    ].join(" ");
  }

  return [
    `PBTI expression tone for ${pbtiCode} / ${personalityName}: make the portrait feel personality-led, emotionally readable, and aligned with the assigned type rather than emotionally generic.`,
    "Use gaze, facial engagement, posture tension, and subtle emotional styling to suggest the type naturally.",
  ].join(" ");
}

function expressionEnhancement(kind: PromptKind, templateId: string, species: "cat" | "dog", pbtiCode: string, personalityName: string, profile?: PetVisualProfile | null) {
  const profileHint = profile
    ? `Use the visible face cues from the references as the identity anchor: eyes ${profile.face.eyeExpression}, ears ${profile.face.earPosition}, muzzle ${profile.face.muzzleShape}.`
    : "Use the visible face cues from the uploaded photos as the identity anchor.";

  return [
    speciesExpressionBase(species),
    kindExpressionBase(kind),
    templateExpressionDirection(templateId, species),
    personalityExpressionDirection(pbtiCode, personalityName),
    profileHint,
  ].join(" ");
}

function pickTemplate(kind: PromptKind, gender?: "male" | "female" | null) {
  const source = kind === "avatar" ? AVATAR_TEMPLATES : kind === "vertical" ? VERTICAL_TEMPLATES : LANDSCAPE_TEMPLATES;
  const pool = gender ? source.filter((template) => template.gender === gender) : source;
  const candidates = pool.length ? pool : source;
  return candidates[Math.floor(Math.random() * candidates.length)] || candidates[0];
}

function promptTemplateFromStudioTemplate(template: PortraitStudioTemplate): PromptTemplate {
  return {
    id: template.id,
    gender: "male",
    direction: [
      template.basePrompt,
      `Template background lock: ${template.background}.`,
      `Template outfit lock: ${template.outfit}.`,
      `Template pose lock: ${template.pose}.`,
      `Template expression goal: ${template.expression}.`,
      `Template composition lock: ${template.composition}.`,
    ].join(" "),
  };
}

function duoIdentityLock(species: "cat" | "dog") {
  return [
    "Create an image of the SAME real pet and the SAME real owner shown in the uploaded reference photos.",
    "Identity preservation is the highest priority for both subjects.",
    `The ${species} must remain exactly the same animal from the uploaded pet reference photos.`,
    "The owner must remain the same person from the uploaded owner reference photos, with natural facial structure, body proportions, and recognizable likeness preserved.",
    "Use the uploaded owner photos as identity references, not loose inspiration.",
    "The pet and owner may be re-posed inside the selected template scene, but both must remain immediately recognizable.",
  ].join(" ");
}

function kindFromStyleId(styleId: string): PromptKind {
  const baseStyleId = styleId.split("--")[0];
  if (baseStyleId === "white-sketch-avatar") return "avatar";
  if (baseStyleId === "landscape-campaign") return "landscape";
  return "vertical";
}

function compositionRules(kind: PromptKind) {
  if (kind === "avatar") {
    return "Final format: square 1:1 avatar image, single pet only, face prominent, social-media-ready, clean readable silhouette, suitable as one of the three generated portrait assets.";
  }
  if (kind === "landscape") {
    return "Final format: horizontal landscape image, preferably 16:9 or 3:2, single pet as the hero, face clearly visible, enough clean visual space for website share-card use.";
  }
  return "Final format: vertical portrait poster, preferably 2:3 or 4:5, single pet as the hero, close fashionable framing, clean upper space for website-composited typography.";
}

export function getPortraitStyleDisplayName(styleId: string, language: string, fallback?: string) {
  const baseStyleId = styleId.split("--")[0];
  if (language === "zh-CN") return PORTRAIT_STYLE_NAMES_ZH[baseStyleId] || "写真作品";
  return PORTRAIT_STYLES.find((style) => style.id === baseStyleId)?.name || fallback || "Portrait";
}

export function buildPortraitPrompt(style: PortraitStyle, context: PortraitRequestContext) {
  const kind = kindFromStyleId(style.id);
  const studioTemplate = findPortraitStudioTemplateByStyleId(style.id);
  const template = studioTemplate ? promptTemplateFromStudioTemplate(studioTemplate) : pickTemplate(kind, context.gender);
  const personalityWardrobe = PERSONALITY_WARDROBE[context.pbtiCode] || "safe contemporary pet styling matched to the assigned personality while keeping the pet comfortable and recognizable.";
  const ownerIncluded = Boolean(context.ownerIncluded || studioTemplate?.mode === "duo");
  const customPrompt = typeof context.customPrompt === "string" ? context.customPrompt.trim() : "";

  return [
    ownerIncluded ? duoIdentityLock(context.species) : IDENTITY_LOCK,
    appearanceLock(context.visualProfile),
    expressionEnhancement(kind, template.id, context.species, context.pbtiCode, context.personalityName, context.visualProfile),
    `Selected output kind: ${kind}. Selected template id: ${template.id}.`,
    ownerIncluded
      ? "This selected template requires a two-subject portrait: exactly one pet and exactly one owner in the same frame. Preserve believable scale, safe contact, and warm interaction between them."
      : "This selected template is for a single-pet portrait only.",
    studioTemplate
      ? `Use the selected built-in template as the direct generation target. Recreate its exact scene logic, camera distance, composition, wardrobe language, prop logic, and emotional mood, but replace the original example pet completely with the uploaded ${context.species}. ${template.direction}`
      : `Use this art direction exactly, replacing any generic pet with the uploaded ${context.species}: ${template.direction}`,
    `Personality reference for styling: ${context.pbtiCode} / ${context.personalityName}. If the template allows wardrobe choice, prefer ${personalityWardrobe}`,
    customPrompt ? `Additional user refinements to honor when they do not conflict with identity lock or template structure: ${customPrompt}` : "",
    compositionRules(kind),
    UNIVERSAL_NO_TEXT.replace("__PET_NAME__", context.petName),
    `Pet name for website typography only: ${context.petName}.`,
    ownerIncluded ? DUO_NEGATIVE_PROMPT : NEGATIVE_PROMPT,
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
  void petId;
  const fixedIds = ["white-sketch-avatar", "vertical-campaign", "landscape-campaign"];
  return fixedIds
    .map((id) => PORTRAIT_STYLES.find((style) => style.id === id))
    .filter((style): style is PortraitStyle => Boolean(style))
    .slice(0, count);
}
