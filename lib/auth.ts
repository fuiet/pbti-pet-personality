export interface AuthUser {
 id:string;
 email:string;
}

export async function signIn(email:string,password:string):Promise<AuthUser|null>{
 // Supabase authentication will be connected here.
 // Placeholder for MVP architecture.
 return {
  id:"demo-user",
  email
 };
}

export async function register(email:string,password:string):Promise<AuthUser|null>{
 return {
  id:"demo-user",
  email
 };
}
