export interface ReportInput {
 petName:string;
 pbtiType:string;
 personalityName:string;
 traits:string[];
 advice:string[];
 appearance?:{
  expression:string;
  eyes:string;
  posture:string;
  aura:string;
 };
}

export interface PetReport {
 summary:string;
 loveLanguage:string;
 relationship:string;
 appearance:string;
 recommendations:string[];
}

export function generatePetReport(input:ReportInput):PetReport{
 return {
  summary:`${input.petName} is a ${input.personalityName} (${input.pbtiType}).`,
  loveLanguage:"Your pet expresses trust through its unique daily behaviors.",
  relationship:"You are an important and trusted companion in your pet's life.",
  appearance: input.appearance
   ? `${input.appearance.aura}. Expression: ${input.appearance.expression}. Eyes: ${input.appearance.eyes}.`
   : "Appearance analysis pending.",
  recommendations:input.advice
 };
}
