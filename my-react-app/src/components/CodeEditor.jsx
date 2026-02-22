import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGE_CONFIG = {
  python: { value: "python", version: "3.10.0" },
  javascript: { value: "javascript", version: "18.15.0" },
  java: { value: "java", version: "15.0.2" },
  cpp: { value: "cpp", version: "10.2.0" },
  rust: { value: "rust", version: "1.68.2" },
  go: { value: "go", version: "1.20.2" },
  typescript: { value: "typescript", version: "5.0.3" },
  kotlin: { value: "kotlin", version: "1.8.20" },
};

export default function CodeEditor({
  language,
  starterCode = "",
  onChange,
}) {
  const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.python;

  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(false);

  // Sync when parent updates starterCode
  useEffect(() => {
    setCode(starterCode);
  }, [starterCode]);

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
            language: config.value,
            version: config.version,
            files: [{ content: code }],
          }),
        }
      );

      const data = await response.json();

      if (data.run?.stderr) {
        setOutput(data.run.stderr);
        setError(true);
      } else {
        setOutput(data.run?.output || "(no output)");
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
        <span style={styles.title}>
          {config.value.toUpperCase()} Editor
        </span>

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
          language={config.value}
          value={code}
          onChange={(val) => {
            const newValue = val || "";
            setCode(newValue);
            if (onChange) onChange(newValue);
          }}
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
      <div
        style={{
          ...styles.output,
          color: error ? "#f87171" : "#4ade80",
        }}
      >
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
  },
  header: {
    display: "flex",
    alignItems: "center",
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