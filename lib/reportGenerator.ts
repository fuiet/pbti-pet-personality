export interface ReportInput {
 petName:string;
 pbtiType:string;
 personalityName:string;
 traits:string[];
 advice:string[];
}

export interface PetReport {
 summary:string;
 loveLanguage:string;
 relationship:string;
 recommendations:string[];
}

export function generatePetReport(input:ReportInput):PetReport{
 return {
  summary:`${input.petName} is a ${input.personalityName} (${input.pbtiType}).`,
  loveLanguage:"Your pet expresses trust through its unique daily behaviors.",
  relationship:"You are an important and trusted companion in your pet's life.",
  recommendations:input.advice
 };
}
