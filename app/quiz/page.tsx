"use client";

import { useState } from "react";
import QuizCard from "@/components/QuizCard";
import { catQuestions } from "@/data/catQuestions";

export default function QuizPage(){
 const [current,setCurrent]=useState(0);
 const [answers,setAnswers]=useState<string[]>([]);
 const questions=catQuestions;

 const select=(value:string)=>{
   const next=[...answers,value];
   setAnswers(next);
   if(current < questions.length-1){
    setCurrent(current+1);
   } else {
    localStorage.setItem("pbti_answers",JSON.stringify(next));
    window.location.href="/result";
   }
 };

 return (
  <main className="min-h-screen bg-[#faf7f2] p-8">
   <div className="max-w-xl mx-auto">
    <div className="mb-6 text-sm">
      Question {current+1} / {questions.length}
    </div>
    <QuizCard
      question={questions[current].question}
      options={questions[current].options}
      onSelect={select}
    />
   </div>
  </main>
 );
}
