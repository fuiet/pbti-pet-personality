export interface User {
 id:string;
 email:string;
 createdAt:string;
}

export interface Pet {
 id:string;
 userId:string;
 name:string;
 species:"cat"|"dog";
 breed:string;
 photoUrl?:string;
}

export interface PetPersonalityResult {
 id:string;
 petId:string;
 pbtiId:string;
 type:string;
 scores:Record<string,number>;
 report?:string;
 createdAt:string;
}
