import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { questions } from "./questions.ts";
import { useProfile } from "../user/useProfile";
import { useLessonProgress } from "../user/useLessonProgress";
import CodeEditor from "../components/CodeEditor";
import "./question.css";

const LANGUAGE_VERSIONS: Record<string, string> = {
  python:     "3.10.0",
  java:       "15.0.2",
  cpp:        "10.2.0",
  rust:       "1.68.2",
  go:         "1.20.2",
  ruby:       "4.0.1",
};

async function runWithPiston(language: string, code: string) {
  const lang = language.toLowerCase();
  const res = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: lang,
      version: LANGUAGE_VERSIONS[lang] ?? "latest",
      files: [{ content: code }],
    }),
  });
  const data = await res.json();
  return {
    stdout: data.run?.output ?? "",
    stderr: data.run?.stderr ?? "",
  };
}

function normalize(s: string) {
  return s.trim().replace(/\r\n/g, "\n");
}

export default function QuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { completeLesson, isCompleted } = useLessonProgress();

  const question = questions.find((q) => q.id === Number(id));

  const sourceLang = profile?.source_language ?? "Python";
  const targetLang = profile?.target_language ?? "Rust";

  const [referenceCode, setReferenceCode] = useState("");
  const [targetCode, setTargetCode]       = useState("");

  const [referenceOutput, setReferenceOutput] = useState("");
  const [targetOutput, setTargetOutput]       = useState("");
  const [refError, setRefError]               = useState(false);
  const [targetError, setTargetError]         = useState(false);

  const [loadingRef, setLoadingRef] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [running, setRunning]       = useState(false);
  const [result, setResult]         = useState<"pass" | "fail" | null>(null);
  const [genError, setGenError]     = useState("");

  const alreadyDone = question ? isCompleted(String(question.id)) : false;

  useEffect(() => {
    if (!question) return;
    setLoadingRef(true);
    setReferenceCode("");
    fetch("/api/generate-reference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problem: question.description,
        knownLanguage: sourceLang,
      }),
    })
      .then(res => res.json())
      .then(({ code }) => setReferenceCode(code))
      .catch(err => console.error("Error loading reference:", err))
      .finally(() => setLoadingRef(false));
  }, [question?.id, sourceLang]);

  if (!question) return (
    <div className="qp-notfound">
      <p>Question not found</p>
      <button onClick={() => navigate("/lessons")}>Back to lessons</button>
    </div>
  );

  const handleGenerate = async () => {
    setLoading(true);
    setGenError("");
    try {
      const res = await fetch("/api/generate-starter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: question.starter_code_prompt.replace("{language}", targetLang),
          targetLanguage: targetLang,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const { code } = await res.json();
      setTargetCode(code);
    } catch (err: any) {
      setGenError(err.message ?? "Failed to generate starter code");
      console.error("Error generating starter code:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBoth = async () => {
    if (!referenceCode.trim() || !targetCode.trim()) return;
    setRunning(true);
    setResult(null);
    setReferenceOutput("");
    setTargetOutput("");
    setRefError(false);
    setTargetError(false);

    try {
      const [ref, target] = await Promise.all([
        runWithPiston(sourceLang, referenceCode),
        runWithPiston(targetLang, targetCode),
      ]);

      setReferenceOutput(ref.stderr || ref.stdout);
      setTargetOutput(target.stderr || target.stdout);
      setRefError(!!ref.stderr);
      setTargetError(!!target.stderr);

      if (!ref.stderr && !target.stderr) {
        const pass = normalize(ref.stdout) === normalize(target.stdout);
        setResult(pass ? "pass" : "fail");
        if (pass) await completeLesson(String(question.id));
      }
    } catch {
      setReferenceOutput("Error connecting to execution engine.");
      setTargetOutput("Error connecting to execution engine.");
      setRefError(true);
      setTargetError(true);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="qp-root">
      <div className="qp-bg-grid" />

      <header className="qp-header">
        <button className="qp-back" onClick={() => navigate("/lessons")}>Back to Lessons</button>
        <div className="qp-header-center">
          <span className="qp-chapter">{question.chapter}</span>
          <span className="qp-sep">›</span>
          <span className="qp-title">{question.title}</span>
        </div>
        <div className="qp-header-right">
          {alreadyDone && <span className="qp-done-pill">Complete</span>}
          <div className="qp-avatar" onClick={() => navigate("/settings")}>
            {(profile?.username ?? "?").slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="qp-body">
        <aside className="qp-sidebar">
          <div className="qp-problem-card">
            <p className="qp-problem-label">Problem</p>
            <h2 className="qp-problem-title">{question.title}</h2>
            <p className="qp-problem-desc">{question.description}</p>

            {question.example_output && (
              <div className="qp-expected">
                <p className="qp-expected-label">Expected output</p>
                <pre className="qp-expected-code">{question.example_output}</pre>
              </div>
            )}

            {question.constraints?.length > 0 && (
              <div className="qp-constraints">
                <p className="qp-expected-label">Constraints</p>
                <ul>{question.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
              </div>
            )}
          </div>

          <div className="qp-generate-section">
            <button
              className="qp-generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Code"}
            </button>
            {genError && <p className="qp-gen-error">{genError}</p>}
            <p className="qp-generate-hint">
              {loadingRef
                ? `Loading ${sourceLang} reference...`
                : `Fills the ${targetLang} editor with starter code (boilerplate only - no solution)`}
            </p>
          </div>

          {result === "pass" && (
            <div className="qp-result pass">
              <span>Correct!</span>
              <div>
                <p className="qp-result-title">Both outputs match. Lesson complete.</p>
              </div>
            </div>
          )}
          {result === "fail" && (
            <div className="qp-result fail">
              <span>Not quite</span>
              <div>
                <p className="qp-result-title">Outputs don{"'"}t match - check both sides.</p>
              </div>
            </div>
          )}
        </aside>

        <main className="qp-editors">
          <div className="qp-editor-col">
            <div className="qp-editor-header">
              <span className="qp-editor-lang">{sourceLang}</span>
              <span className="qp-editor-role">Reference</span>
              {loadingRef && <span className="qp-loading-hint">Loading...</span>}
            </div>
            <CodeEditor
              language={sourceLang.toLowerCase()}
              starterCode={referenceCode}
              onChange={setReferenceCode}
              fillHeight
            />
            {referenceOutput && (
              <div className={`qp-output ${refError ? "error" : "ok"}`}>
                <span className="qp-output-label">Output</span>
                <pre>{referenceOutput}</pre>
              </div>
            )}
          </div>

          <div className="qp-editor-col">
            <div className="qp-editor-header">
              <span className="qp-editor-lang">{targetLang}</span>
              <span className="qp-editor-role">Your translation</span>
              <button
                className="qp-run-btn"
                onClick={handleRunBoth}
                disabled={running || !referenceCode.trim() || !targetCode.trim()}
              >
                {running ? "Running..." : "Run both"}
              </button>
            </div>
            <CodeEditor
              language={targetLang.toLowerCase()}
              starterCode={targetCode}
              onChange={setTargetCode}
              fillHeight
            />
            {targetOutput && (
              <div className={`qp-output ${targetError ? "error" : "ok"}`}>
                <span className="qp-output-label">Output</span>
                <pre>{targetOutput}</pre>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}