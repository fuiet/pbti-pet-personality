export type PetSpecies = "cat" | "dog";

export type PersonalityAsset = {
  code: string;
  name: string;
  cat: string;
  dog: string;
};

export const personalityAssets: PersonalityAsset[] = [
  { code: "IEVP", name: "Explorer", cat: "/assets/personalities/cats/01-explorer-cat.webp", dog: "/assets/personalities/dogs/01-explorer-dog.png" },
  { code: "ASVG", name: "Guardian", cat: "/assets/personalities/cats/02-guardian-cat.webp", dog: "/assets/personalities/dogs/02-guardian-dog.png" },
  { code: "ISCP", name: "Dreamer", cat: "/assets/personalities/cats/03-dreamer-cat.webp", dog: "/assets/personalities/dogs/03-dreamer-dog.png" },
  { code: "IEVG", name: "Maverick", cat: "/assets/personalities/cats/04-maverick-cat.webp", dog: "/assets/personalities/dogs/04-maverick-dog.png" },
  { code: "IECG", name: "Scholar", cat: "/assets/personalities/cats/05-scholar-cat.webp", dog: "/assets/personalities/dogs/05-scholar-dog.png" },
  { code: "AEVG", name: "Leader", cat: "/assets/personalities/cats/06-leader-cat.webp", dog: "/assets/personalities/dogs/06-leader-dog.png" },
  { code: "ASCP", name: "Companion", cat: "/assets/personalities/cats/07-companion-cat.webp", dog: "/assets/personalities/dogs/07-companion-dog.png" },
  { code: "ASCG", name: "Healer", cat: "/assets/personalities/cats/08-healer-cat.webp", dog: "/assets/personalities/dogs/08-healer-dog.png" },
  { code: "AEVP", name: "Sunny", cat: "/assets/personalities/cats/09-sunny-cat.webp", dog: "/assets/personalities/dogs/09-sunny-dog.png" },
  { code: "ISCG", name: "Sentinel", cat: "/assets/personalities/cats/10-sentinel-cat.webp", dog: "/assets/personalities/dogs/10-sentinel-dog.png" },
  { code: "AECP", name: "Player", cat: "/assets/personalities/cats/11-player-cat.webp", dog: "/assets/personalities/dogs/11-player-dog.png" },
  { code: "ISVG", name: "Noble", cat: "/assets/personalities/cats/12-noble-cat.webp", dog: "/assets/personalities/dogs/12-noble-dog.png" },
];

export function getPersonalityAsset(code: string, species: PetSpecies) {
  const asset = personalityAssets.find((item) => item.code === code);
  return asset?.[species] || personalityAssets[0][species];
}