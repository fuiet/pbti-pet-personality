export function createPetIdentity(){
 const id=`PBTI-${Date.now().toString(36).toUpperCase()}`;
 return id;
}
