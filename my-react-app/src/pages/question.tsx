import { useParams } from "react-router-dom";
import { questions } from "../data/questions.json";
import CodeEditor from "../components/CodeEditor";
import React from "react";

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
