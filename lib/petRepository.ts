export interface PetRecord {
 id:string;
 userId:string;
 name:string;
 species:"cat"|"dog";
 breed?:string;
 photoUrl?:string;
}

export async function savePet(pet:PetRecord){
 // Supabase insert will be implemented here.
 return pet;
}

export async function savePersonalityResult(result:any){
 // Supabase insert will be implemented here.
 return result;
}
