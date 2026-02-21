import questionsData from "../data/questions.json";

export interface Question {
  id: number;
  chapter: string;
  title: string;
  description: string;
  example_output: string;
  constraints: string[];
  starter_code_prompt: string;
}

const questions: Question[] = questionsData.questions as Question[];

export default questions;

export function groupByChapter(qs: Question[]): Record<string, Question[]> {
  return qs.reduce(
    (acc, q) => {
      if (!acc[q.chapter]) acc[q.chapter] = [];
      acc[q.chapter].push(q);
      return acc;
    },
    {} as Record<string, Question[]>,
  );
}
