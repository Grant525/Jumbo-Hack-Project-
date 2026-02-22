import { useState } from "react";
import { useParams } from "react-router-dom";
import { questions } from "../data/questions.json";
import React from "react";
import CodeEditor from "../components/CodeEditor";

export default function QuestionPage() {
  const { id } = useParams();
  const question = questions.find((q) => q.id === Number(id));

  const [knownLanguage, setKnownLanguage] = useState("Python");
  const [targetLanguage, setTargetLanguage] = useState("Rust");
  const [referenceCode, setReferenceCode] = useState("");
  const [starterCode, setStarterCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!question) return <div>Question not found</div>;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const [refRes, starterRes] = await Promise.all([
        fetch("/api/generate-reference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem: question.starter_code_prompt, knownLanguage }),
        }),
        fetch("/api/generate-starter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem: question.starter_code_prompt, targetLanguage }),
        }),
      ]);

      const { code: refCode } = await refRes.json();
      const { code: startCode } = await starterRes.json();

      setReferenceCode(refCode);
      setStarterCode(startCode);
    } catch (err) {
      console.error("Error generating code:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{question.title}</h1>
      <p>{question.description}</p>

      <div>
        <label>Known Language: </label>
        <select value={knownLanguage} onChange={e => setKnownLanguage(e.target.value)}>
          <option>Python</option>
          <option>JavaScript</option>
          <option>Java</option>
          <option>C++</option>
        </select>

        <label> Target Language: </label>
        <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}>
          <option>Rust</option>
          <option>Go</option>
          <option>TypeScript</option>
          <option>Kotlin</option>
        </select>
      </div>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Code"}
      </button>

      {referenceCode && (
        <div>
          <h2>Reference Code ({knownLanguage})</h2>
          <pre><code>{referenceCode}</code></pre>
        </div>
      )}

      <CodeEditor language={targetLanguage.toLowerCase()} starterCode={starterCode} />
    </div>
  );
}
