import { useState } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGES = [
  { label: "Python", value: "python", version: "3.10.0" },
  { label: "JavaScript", value: "javascript", version: "18.15.0" },
  { label: "Java", value: "java", version: "15.0.2" },
  { label: "C++", value: "cpp", version: "10.2.0" },
];

export default function CodeEditor({ language: initialLanguage }) {
  const initial = LANGUAGES.find((l) => l.value === initialLanguage)
    || LANGUAGES[0];

  const [language, setLanguage] = useState(initial);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(false);

  const handleLanguageChange = (e) => {
    const selected = LANGUAGES.find((l) => l.value === e.target.value);
    setLanguage(selected);
    setOutput("");
  };

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    setError(false);
    try {
      const response = await fetch(
        "https://emkc.org/api/v2/piston/execute",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: language.value,
            version: language.version,
            files: [{ content: code }],
          }),
        }
      );
      const data = await response.json();
      if (data.run.stderr) {
        setOutput(data.run.stderr);
        setError(true);
      } else {
        setOutput(data.run.output || "(no output)");
      }
    } catch (err) {
      setOutput("Error connecting to execution engine.");
      setError(true);
    }
    setRunning(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Code Editor</span>
        <select
          style={styles.select}
          value={language.value}
          onChange={handleLanguageChange}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <button
          style={running ? styles.buttonDisabled : styles.button}
          onClick={runCode}
          disabled={running}
        >
          {running ? "Running..." : "▶ Run"}
        </button>
      </div>

      <div style={styles.editorWrapper}>
        <Editor
          height="400px"
          language={language.value}
          value={code}
          onChange={(val) => setCode(val)}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      <div style={styles.outputHeader}>Output</div>
      <div style={{ ...styles.output, color: error ? "#f87171" : "#4ade80" }}>
        {output || "Run your code to see output here..."}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "monospace",
    background: "#1e1e1e",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #333",
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "#252526",
    borderBottom: "1px solid #333",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: "14px",
    marginRight: "auto",
  },
  select: {
    background: "#3c3c3c",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "4px",
    padding: "6px 10px",
    fontSize: "13px",
    cursor: "pointer",
  },
  button: {
    background: "#007acc",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "6px 16px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  buttonDisabled: {
    background: "#555",
    color: "#aaa",
    border: "none",
    borderRadius: "4px",
    padding: "6px 16px",
    fontSize: "13px",
    cursor: "not-allowed",
    fontWeight: "bold",
  },
  editorWrapper: {
    borderBottom: "1px solid #333",
  },
  outputHeader: {
    background: "#252526",
    color: "#aaa",
    fontSize: "12px",
    padding: "6px 16px",
    borderBottom: "1px solid #333",
  },
  output: {
    background: "#1e1e1e",
    padding: "16px",
    minHeight: "80px",
    fontSize: "13px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
};
