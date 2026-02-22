import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { questions } from "./questions.ts";
import React from "react";
import CodeEditor from "../components/CodeEditor";

export default function QuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const question = questions.find((q) => q.id === Number(id));

  const [knownLanguage, setKnownLanguage] = useState("Python");
  const [targetLanguage, setTargetLanguage] = useState("Rust");

  const [referenceCode, setReferenceCode] = useState("");
  const [targetCode, setTargetCode] = useState("");

  const [referenceOutput, setReferenceOutput] = useState("");
  const [targetOutput, setTargetOutput] = useState("");

  const [loading, setLoading] = useState(false);
  const [runningRef, setRunningRef] = useState(false);
  const [runningTarget, setRunningTarget] = useState(false);

  if (!question) return <div>Question not found</div>;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const [refRes, starterRes] = await Promise.all([
        fetch("/api/generate-reference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem: question.starter_code_prompt.replace(
              "{language}",
              knownLanguage,
            ),
            knownLanguage,
          }),
        }),
        fetch("/api/generate-starter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem: question.starter_code_prompt.replace(
              "{language}",
              targetLanguage,
            ),
            targetLanguage,
          }),
        }),
      ]);

      const { code: refCode } = await refRes.json();
      const { code: startCode } = await starterRes.json();

      setReferenceCode(refCode);
      setTargetCode(startCode);
    } catch (err) {
      console.error("Error generating code:", err);
    } finally {
      setLoading(false);
    }
  };

  const runReference = async () => {
    setRunningRef(true);
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referenceCode, language: knownLanguage }),
      });
      const { output } = await res.json();
      setReferenceOutput(output);
    } catch (err) {
      console.error("Error running reference code:", err);
    } finally {
      setRunningRef(false);
    }
  };

  const runTarget = async () => {
    setRunningTarget(true);
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: targetCode, language: targetLanguage }),
      });
      const { output } = await res.json();
      setTargetOutput(output);
    } catch (err) {
      console.error("Error running target code:", err);
    } finally {
      setRunningTarget(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "20px",
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h1>{question.title}</h1>
      <p>{question.description}</p>

      <div style={{ marginBottom: "20px" }}>
        <label>Known Language: </label>
        <select
          value={knownLanguage}
          onChange={(e) => setKnownLanguage(e.target.value)}
        >
          <option>Python</option>
          <option>JavaScript</option>
          <option>Java</option>
          <option>C++</option>
        </select>

        {/* <label style={{ marginLeft: "20px" }}>Target Language: </label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          <option>Rust</option>
          <option>Go</option>
          <option>TypeScript</option>
          <option>Kotlin</option>
        </select> */}

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ marginLeft: "20px" }}
        >
          {loading ? "Generating..." : "Generate Code"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* LEFT SIDE */}
        <div style={{ flex: 1 }}>
          <h2>{knownLanguage}</h2>
          <CodeEditor
            language={knownLanguage.toLowerCase()}
            starterCode={referenceCode}
            onChange={setReferenceCode}
          />
          {/* <button
            onClick={runReference}
            disabled={runningRef}
            style={{ marginTop: "10px" }}
          >
            {runningRef ? "Running..." : `Run ${knownLanguage}`}
          </button> */}
          {referenceOutput && (
            <pre
              style={{
                marginTop: "10px",
                background: "#111",
                color: "#0f0",
                padding: "10px",
              }}
            >
              {referenceOutput}
            </pre>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div style={{ flex: 1 }}>
          <h2>{targetLanguage}</h2>
          <CodeEditor
            language={targetLanguage.toLowerCase()}
            starterCode={targetCode}
            onChange={setTargetCode}
          />
          {/* <button
            onClick={runTarget}
            disabled={runningTarget}
            style={{ marginTop: "10px" }}
          >
            {runningTarget ? "Running..." : `Run ${targetLanguage}`}
          </button> */}
          {targetOutput && (
            <pre
              style={{
                marginTop: "10px",
                background: "#111",
                color: "#0f0",
                padding: "10px",
              }}
            >
              {targetOutput}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
