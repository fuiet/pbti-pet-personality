export interface MemoryEntry {
 id:string;
 date:string;
 title:string;
 description:string;
 imageUrl?:string;
}

export interface PetMemoryBook {
 petId:string;
 petName:string;
 entries:MemoryEntry[];
 aiStory?:string;
}

export function createMemoryBook(petId:string,petName:string):PetMemoryBook{
 return {
  petId,
  petName,
  entries:[],
  aiStory:"Your pet's journey will be written here."
 };
}
