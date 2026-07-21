export type PortraitStudioMode = "free" | "duo";
export type PortraitStudioOrientation = "avatar" | "vertical" | "landscape";
export type PortraitStudioCategory = "trending" | "avatars" | "posters" | "landscapes" | "holiday" | "pet-owner";

export type PortraitStudioTemplate = {
  id: string;
  title: { en: string; zh: string };
  subtitle: { en: string; zh: string };
  mode: PortraitStudioMode;
  orientation: PortraitStudioOrientation;
  category: PortraitStudioCategory;
  previewImage: string;
  previewTint: string;
  tags: string[];
  basePrompt: string;
  background: string;
  outfit: string;
  pose: string;
  expression: string;
  composition: string;
};

export const PORTRAIT_STUDIO_TEMPLATES: PortraitStudioTemplate[] = [
  {
    id: "gallery-masterpiece-cat",
    title: { en: "Museum Masterpiece", zh: "名画展厅" },
    subtitle: { en: "A classical portrait staged like a museum painting.", zh: "像博物馆名画一样的古典布景写真。" },
    mode: "free",
    orientation: "vertical",
    category: "posters",
    previewImage: "/assets/portrait-studio/templates/girl-pearl-cat.png",
    previewTint: "from-[#8b6b45] via-[#b18c5c] to-[#dbc79c]",
    tags: ["classic", "museum", "costume"],
    basePrompt: "Recreate the selected museum-style portrait template with the same classical room setting, framed painting backdrop, head scarf styling, rich textile surface, and old-master atmosphere. Replace the example pet completely with the user's real pet while preserving the composition and art-historical mood.",
    background: "warm museum room with framed art",
    outfit: "classical scarf and decorative garment",
    pose: "upright seated portrait pose",
    expression: "regal, calm, painterly, self-possessed",
    composition: "vertical portrait with visible costume and room dressing",
  },
  {
    id: "blue-plush-room",
    title: { en: "Blue Plush Room", zh: "蓝色玩偶房" },
    subtitle: { en: "A saturated blue toy room with plush costume styling.", zh: "蓝色玩偶房间与软萌造型感。" },
    mode: "free",
    orientation: "vertical",
    category: "trending",
    previewImage: "/assets/portrait-studio/templates/blue-cartoon-bed-cat.png",
    previewTint: "from-[#4aa8ff] via-[#287cdc] to-[#164da3]",
    tags: ["blue", "plush", "playful"],
    basePrompt: "Recreate the selected blue toy-room template with the same monochrome blue environment, plush nest bed, playful hood styling, collectible-room structure, and polished toy-display composition. Replace the example pet with the user's real pet.",
    background: "saturated blue toy room",
    outfit: "soft playful character hood",
    pose: "centered seated pose in a nest bed",
    expression: "round-eyed, calm, toy-like, photogenic",
    composition: "vertical centered studio poster with collectible-room symmetry",
  },
  {
    id: "paper-bag-head",
    title: { en: "Paper Bag Portrait", zh: "纸袋头像" },
    subtitle: { en: "A quirky studio concept with a cutout paper-bag mask.", zh: "带有荒诞趣味的纸袋棚拍造型。" },
    mode: "free",
    orientation: "vertical",
    category: "avatars",
    previewImage: "/assets/portrait-studio/templates/paper-bag-cat.png",
    previewTint: "from-[#f7d5dd] via-[#f1b9c7] to-[#fbe8ef]",
    tags: ["quirky", "studio", "internet"],
    basePrompt: "Recreate the selected quirky studio template with the same pastel pink background, oversized paper-bag mask prop with a face cutout, simple cream outfit, and centered absurd-fashion composition. Replace the original pet with the user's real pet while preserving the deadpan humor.",
    background: "clean pink studio backdrop",
    outfit: "simple cream shirt under the prop",
    pose: "front-facing seated pose",
    expression: "deadpan, strange, internet-ready",
    composition: "vertical centered studio portrait with prop-dominant silhouette",
  },
  {
    id: "pink-plush-room",
    title: { en: "Pink Plush Room", zh: "粉色软绵房" },
    subtitle: { en: "A sweet pink room built from plush props and soft shapes.", zh: "软绵粉色房间与玩偶收集感。" },
    mode: "free",
    orientation: "vertical",
    category: "trending",
    previewImage: "/assets/portrait-studio/templates/pink-plush-cat.png",
    previewTint: "from-[#ffd9ec] via-[#ffc3e1] to-[#ff9fce]",
    tags: ["pink", "kawaii", "plush"],
    basePrompt: "Recreate the selected dreamy pink-room template with the same plush bed, pastel character-room styling, oversized soft props, and highly curated cute composition. Replace the example pet with the user's real pet while preserving the room's soft collectible atmosphere.",
    background: "pink toy room with plush props",
    outfit: "small pink accessory or hat",
    pose: "centered seated pose in a plush nest",
    expression: "soft, doll-like, emotionally readable",
    composition: "vertical centered room portrait with visible plush surroundings",
  },
  {
    id: "bridal-red",
    title: { en: "Bridal Red", zh: "婚纱红幕" },
    subtitle: { en: "Formal bridal portrait styling against a vivid red backdrop.", zh: "纯红背景下的正式婚纱造型。" },
    mode: "free",
    orientation: "vertical",
    category: "posters",
    previewImage: "/assets/portrait-studio/templates/bridal-cat.png",
    previewTint: "from-[#ef5252] via-[#c62133] to-[#861526]",
    tags: ["formal", "bridal", "luxury"],
    basePrompt: "Recreate the selected formal bridal-style portrait with the same pure red backdrop, veil, pearl necklace, premium studio restraint, and centered luxury portrait composition. Replace the example pet with the user's real pet while preserving the elegant symmetry.",
    background: "solid red portrait studio",
    outfit: "veil and pearl jewelry styling",
    pose: "formal centered portrait pose",
    expression: "dignified, poised, quietly luxurious",
    composition: "vertical bust portrait with symmetric luxury framing",
  },
  {
    id: "office-headphones",
    title: { en: "Office Headphones", zh: "通勤耳机装" },
    subtitle: { en: "A crisp studio portrait with shirt, tie, and headphones.", zh: "衬衫、领带与耳机结合的清爽棚拍。" },
    mode: "free",
    orientation: "vertical",
    category: "posters",
    previewImage: "/assets/portrait-studio/templates/office-shiba.png",
    previewTint: "from-[#173867] via-[#1f4c8e] to-[#305ea6]",
    tags: ["office", "studio", "smart"],
    basePrompt: "Recreate the selected smart studio template with the same navy backdrop, striped shirt, tie, neck headphones, and polished front-facing commercial portrait structure. Replace the example pet with the user's real pet while preserving the confident office-fashion mood.",
    background: "deep navy seamless studio",
    outfit: "shirt, tie, and headphones",
    pose: "upright seated studio pose",
    expression: "upbeat, clever, highly present",
    composition: "vertical studio portrait with clean full-outfit read",
  },
  {
    id: "pumpkin-pop",
    title: { en: "Pumpkin Pop", zh: "南瓜头顶秀" },
    subtitle: { en: "A clean seasonal set with bright pastel holiday energy.", zh: "轻松明亮的节日舞台式写真。" },
    mode: "free",
    orientation: "vertical",
    category: "holiday",
    previewImage: "/assets/portrait-studio/templates/pumpkin-pomeranian.png",
    previewTint: "from-[#ecffc6] via-[#d2f39a] to-[#bde66c]",
    tags: ["pumpkin", "holiday", "pastel"],
    basePrompt: "Recreate the selected pumpkin-themed pastel template with the same pale-green set, pumpkin head prop, bright crate platform, and centered seasonal commercial composition. Replace the example pet with the user's real pet while preserving the clean festive staging.",
    background: "pastel green holiday studio",
    outfit: "orange holiday bandana or scarf",
    pose: "centered seated pose on a crate",
    expression: "alert, innocent, pop-bright",
    composition: "vertical high-key commercial set with front-facing symmetry",
  },
  {
    id: "mountain-explorer",
    title: { en: "Mountain Explorer", zh: "雪山探险家" },
    subtitle: { en: "An adventure portrait against glowing alpine peaks.", zh: "雪山湖畔与探险服饰结合的旅行片感。" },
    mode: "free",
    orientation: "landscape",
    category: "landscapes",
    previewImage: "/assets/portrait-studio/templates/mountain-corgi.png",
    previewTint: "from-[#ffcb89] via-[#d98843] to-[#5c6b8d]",
    tags: ["mountain", "travel", "explorer"],
    basePrompt: "Recreate the selected mountain-travel template with the same alpine lake, glowing sunset peaks, outdoor jacket, sunglasses, and scenic adventure-poster composition. Replace the example pet with the user's real pet while preserving the expedition mood.",
    background: "golden mountain lake at sunset",
    outfit: "outdoor jacket and sunglasses",
    pose: "seated three-quarter adventure pose",
    expression: "confident, cheerful, adventure-ready",
    composition: "horizontal scenic portrait with large mountain backdrop",
  },
  {
    id: "golden-garden",
    title: { en: "Golden Garden", zh: "日落花园" },
    subtitle: { en: "A golden-hour grass portrait with soft lifestyle styling.", zh: "夕阳草地与轻时装感的暖调写真。" },
    mode: "free",
    orientation: "vertical",
    category: "posters",
    previewImage: "/assets/portrait-studio/templates/sunset-westie.png",
    previewTint: "from-[#ffe8aa] via-[#efc36a] to-[#799f4c]",
    tags: ["sunset", "garden", "lifestyle"],
    basePrompt: "Recreate the selected golden-garden lifestyle template with the same warm sunset backlight, glowing grass, fitted neutral outfit, and airy editorial pet-photography mood. Replace the example pet with the user's real pet while preserving the luminous garden atmosphere.",
    background: "golden sunset garden",
    outfit: "fitted neutral lifestyle shirt",
    pose: "standing in the grass toward camera",
    expression: "happy, glowing, naturally expressive",
    composition: "vertical lifestyle portrait with luminous backlight",
  },
  {
    id: "autumn-knit",
    title: { en: "Autumn Knit", zh: "秋日针织" },
    subtitle: { en: "A maple-forest portrait with knitwear and storybook charm.", zh: "枫叶树林与针织造型的秋日写真。" },
    mode: "free",
    orientation: "vertical",
    category: "holiday",
    previewImage: "/assets/portrait-studio/templates/autumn-corgi.png",
    previewTint: "from-[#ffcd91] via-[#c37235] to-[#7a4521]",
    tags: ["autumn", "knit", "forest"],
    basePrompt: "Recreate the selected autumn-fashion template with the same maple forest, knit sweater, textured hat, lace collar detail, and rich seasonal woodland atmosphere. Replace the example pet with the user's real pet while preserving the cozy editorial composition.",
    background: "orange-red autumn forest",
    outfit: "knit sweater, pom hat, and collar detail",
    pose: "front-facing seated pose among leaves",
    expression: "warm, friendly, seasonally charming",
    composition: "vertical woodland portrait with layered foliage depth",
  },
  {
    id: "owner-cozy-duo",
    title: { en: "Cozy Pet + Owner", zh: "主宠居家合影" },
    subtitle: { en: "A warm dual portrait for relaxed home moments.", zh: "温暖自然的居家双人写真。" },
    mode: "duo",
    orientation: "landscape",
    category: "pet-owner",
    previewImage: "/assets/portrait-studio/templates/girl-pearl-cat.png",
    previewTint: "from-[#f5e7db] via-[#e8c5b2] to-[#d59b7c]",
    tags: ["duo", "home", "warm"],
    basePrompt: "Create a warm owner-and-pet portrait based on the selected duo template. Preserve the home intimacy, body distance, and emotional closeness of the template while replacing the pet and owner with the uploaded real subjects.",
    background: "warm home interior",
    outfit: "soft neutral wardrobe for both subjects",
    pose: "close seated portrait",
    expression: "connected, affectionate, safe",
    composition: "horizontal two-subject portrait with balanced intimacy",
  },
  {
    id: "owner-garden-duo",
    title: { en: "Garden Walk Duo", zh: "草地散步合影" },
    subtitle: { en: "An outdoor pet-owner portrait with air and movement.", zh: "带有空气感与动作关系的户外双人像。" },
    mode: "duo",
    orientation: "vertical",
    category: "pet-owner",
    previewImage: "/assets/portrait-studio/templates/sunset-westie.png",
    previewTint: "from-[#d2f0c5] via-[#a8db7f] to-[#62a64d]",
    tags: ["duo", "outdoor", "walking"],
    basePrompt: "Create a pet-and-owner outdoor portrait based on the selected duo template. Preserve the open-air field mood, shared walking energy, and lifestyle-photography balance while replacing both subjects with the uploaded real pet and owner.",
    background: "sunny garden or field",
    outfit: "light lifestyle wardrobe",
    pose: "walking or kneeling beside the pet",
    expression: "fresh, emotionally easy, connected",
    composition: "vertical lifestyle duo portrait with visible environment",
  },
];

function styleIdPrefixForOrientation(orientation: PortraitStudioOrientation) {
  if (orientation === "avatar") return "white-sketch-avatar";
  if (orientation === "landscape") return "landscape-campaign";
  return "vertical-campaign";
}

export function buildTemplateStyleId(template: PortraitStudioTemplate, version: string) {
  return `${styleIdPrefixForOrientation(template.orientation)}--template-${template.id}--${version}`;
}

export function findPortraitStudioTemplate(templateId: string) {
  return PORTRAIT_STUDIO_TEMPLATES.find((template) => template.id === templateId) || null;
}

export function findPortraitStudioTemplateByStyleId(styleId: string) {
  const match = styleId.match(/--template-([a-z0-9-]+)--/i);
  return match ? findPortraitStudioTemplate(match[1]) : null;
}
