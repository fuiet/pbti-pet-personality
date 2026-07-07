export interface MemoryStoryInput {
 petName:string;
 personality:string;
 memories:{
  date:string;
  title:string;
  description:string;
 }[];
}

export interface MemoryStory {
 title:string;
 chapters:string[];
 summary:string;
}

export function generateMemoryStory(input:MemoryStoryInput):MemoryStory{
 return {
  title:`${input.petName}'s Journey`,
  chapters:input.memories.map(item=>`${item.title}: ${item.description}`),
  summary:`A beautiful story about ${input.petName}, a ${input.personality}.`
 };
}
