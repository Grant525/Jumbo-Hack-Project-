import { useParams } from "react-router-dom";
import questionsData from "../data/questions.json";
import CodeEditor from "../components/CodeEditor";
import React from "react";


export interface Question {
  id: number;
  chapter: string;
  title: string;
  description: string;
  example_output: string;
  constraints: string[];
  starter_code_prompt: string;
}

const questions: Question[] = questionsData as unknown as Question[];

export function groupByChapter(qs: Question[]): Record<string, Question[]> {
  return qs.reduce((acc, q) => {
    if (!acc[q.chapter]) acc[q.chapter] = [];
    acc[q.chapter].push(q);
    return acc;
  }, {} as Record<string, Question[]>);
}

export default function QuestionPage() {
  const { id } = useParams();
  const question = questions.find((q) => q.id === Number(id));

  if (!question) return <div>Question not found</div>;

  return (
    <div>
      <h1>{question.title}</h1>
      <p>{question.description}</p>
      <CodeEditor language="python" />
    </div>
  );
}