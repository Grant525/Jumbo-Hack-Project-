import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { questions } from "./questions.ts";
import { useProfile } from "../user/useProfile";
import { useUser } from "../user/useUser";
import { useLessonProgress } from "../user/useLessonProgress";
import CodeEditor from "../components/CodeEditor";
import "./question.css";

async function runWithJudge0(language: string, code: string) {
  const res = await fetch("/api/run-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: language.toLowerCase(), code }),
  });
  const data = await res.json();
  return {
    stdout: data.stdout ?? "",
    stderr: data.stderr ?? "",
  };
}

function normalize(s: string) {
  return s.trim().replace(/\r\n/g, "\n");
}

export default function QuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { profile, updateStreak } = useProfile();
  const { completeLesson, isCompleted } = useLessonProgress(
    profile?.source_language ?? "Python",
    profile?.target_language ?? "Rust"
  );

  const question = questions.find((q) => q.id === Number(id));

  const sourceLang = profile?.source_language ?? null;
  const targetLang = profile?.target_language ?? "Rust";

  const [referenceCode, setReferenceCode] = useState("");
  const [targetCode, setTargetCode] = useState("");

  const [referenceOutput, setReferenceOutput] = useState("");
  const [targetOutput, setTargetOutput] = useState("");
  const [refError, setRefError] = useState(false);
  const [targetError, setTargetError] = useState(false);

  const [loadingRef, setLoadingRef] = useState(false);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<"pass" | "fail" | null>(null);
  const [genError, setGenError] = useState("");

  // Practice problem state
  const [practiceQuestion, setPracticeQuestion] = useState<{
    title: string;
    description: string;
    example_output: string;
    starter_code_prompt: string;
    constraints?: string[];
  } | null>(null);
  const [loadingPractice, setLoadingPractice] = useState(false);

  const fetchedFor = useRef<string | null>(null);

  const alreadyDone = question ? isCompleted(String(question.id)) : false;

  // Use practice question if one has been generated, otherwise use the real question
  const activeQuestion = practiceQuestion
    ? { ...question!, ...practiceQuestion }
    : question;

  useEffect(() => {
    if (!question || !sourceLang) return;

    const key = `${question.id}-${sourceLang}`;
    if (fetchedFor.current === key) return;
    fetchedFor.current = key;

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
      .then((res) => res.json())
      .then(({ code }) => setReferenceCode(code))
      .catch((err) => console.error("Error loading reference:", err))
      .finally(() => setLoadingRef(false));
  }, [question?.id, sourceLang]);

  if (!question)
    return (
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
          problem: activeQuestion!.starter_code_prompt.replace("{language}", targetLang),
          targetLanguage: targetLang,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const { code } = await res.json();
      setTargetCode(code);
    } catch (err: any) {
      setGenError(err.message ?? "Failed to generate starter code");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePractice = async () => {
    setLoadingPractice(true);
    setGenError("");
    try {
      const res = await fetch("/api/generate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeQuestion!.title,
          description: activeQuestion!.description,
          chapter: question.chapter,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const { practice } = await res.json();
      setPracticeQuestion(practice);
      // Reset both editors and outputs for the new problem
      setTargetCode("");
      setReferenceCode("");
      setReferenceOutput("");
      setTargetOutput("");
      setResult(null);
      setRefError(false);
      setTargetError(false);
      fetchedFor.current = null;
      // Re-generate reference code for the new problem
      setLoadingRef(true);
      fetch("/api/generate-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: practice.description,
          knownLanguage: sourceLang,
        }),
      })
        .then((r) => r.json())
        .then(({ code }) => setReferenceCode(code))
        .catch((err) => console.error("Error loading reference:", err))
        .finally(() => setLoadingRef(false));
    } catch (err: any) {
      setGenError(err.message ?? "Failed to generate practice problem");
    } finally {
      setLoadingPractice(false);
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
        runWithJudge0(sourceLang ?? "python", referenceCode),
        runWithJudge0(targetLang, targetCode),
      ]);

      setReferenceOutput(ref.stderr || ref.stdout || "(no output)");
      setTargetOutput(target.stderr || target.stdout || "(no output)");
      setRefError(!!ref.stderr);
      setTargetError(!!target.stderr);

      if (!ref.stderr && !target.stderr) {
        const pass = normalize(ref.stdout) === normalize(target.stdout);
        setResult(pass ? "pass" : "fail");
        if (pass && !practiceQuestion) {
          // Only mark the real question complete, not practice variants
          await completeLesson(String(question.id));
          await updateStreak();
        }
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
        <button className="qp-back" onClick={() => navigate("/lessons")}>
          Back to Lessons
        </button>
        <div className="qp-header-center">
          <span className="qp-chapter">{question.chapter}</span>
          <span className="qp-sep">›</span>
          <span className="qp-title">
            {practiceQuestion ? practiceQuestion.title : question.title}
            {practiceQuestion && (
              <span className="qp-practice-badge"> Practice</span>
            )}
          </span>
        </div>
        <div className="qp-header-right">
          {alreadyDone && !practiceQuestion && (
            <span className="qp-done-pill">Complete</span>
          )}
        <div className="lessons-header-right">
          <span className="question-username">
            {profile?.username ?? user?.email ?? ""}
          </span>
        </div>
        </div>
      </header>

      <div className="qp-body">
        <aside className="qp-sidebar">
          <div className="qp-problem-card">
            <p className="qp-problem-label">
              {practiceQuestion ? "Practice Problem" : "Problem"}
            </p>
            <h2 className="qp-problem-title">{activeQuestion!.title}</h2>
            <p className="qp-problem-desc">{activeQuestion!.description}</p>

            {activeQuestion!.example_output && (
              <div className="qp-expected">
                <p className="qp-expected-label">Expected output</p>
                <pre className="qp-expected-code">
                  {activeQuestion!.example_output}
                </pre>
              </div>
            )}

            {activeQuestion!.constraints?.length > 0 && (
              <div className="qp-constraints">
                <p className="qp-expected-label">Constraints</p>
                <ul>
                  {activeQuestion!.constraints.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="qp-generate-section">
            <button
              className="qp-generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Starter Code"}
            </button>
            <button
              className="qp-generate-btn"
              onClick={handleGeneratePractice}
              disabled={loadingPractice}
              style={{ marginTop: "8px", opacity: 0.85 }}
            >
              {loadingPractice ? "Generating..." : "Generate Similar Problem"}
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
                <p className="qp-result-title">
                  Both outputs match.{" "}
                  {practiceQuestion ? "Great practice!" : "Lesson complete."}
                </p>
              </div>
            </div>
          )}
          {result === "fail" && (
            <div className="qp-result fail">
              <span>Not quite</span>
              <div>
                <p className="qp-result-title">
                  Outputs don{"'"}t match - check both sides.
                </p>
              </div>
            </div>
          )}
        </aside>

        <main className="qp-editors">
          <div className="qp-editor-col">
            <div className="qp-editor-header">
              <span className="qp-editor-lang">{sourceLang ?? "..."}</span>
              <span className="qp-editor-role">Reference</span>
              {loadingRef && <span className="qp-loading-hint">Loading...</span>}
            </div>
            <CodeEditor
              language={(sourceLang ?? "python").toLowerCase()}
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
