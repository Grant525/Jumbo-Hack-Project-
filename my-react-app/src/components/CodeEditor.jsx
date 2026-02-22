import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGE_CONFIG = {
  python:     { value: "python",     version: "3.10.0" },
  javascript: { value: "javascript", version: "18.15.0" },
  java:       { value: "java",       version: "15.0.2" },
  cpp:        { value: "cpp",        version: "10.2.0" },
  rust:       { value: "rust",       version: "1.68.2" },
  go:         { value: "go",         version: "1.20.2" },
  typescript: { value: "typescript", version: "5.0.3" },
  kotlin:     { value: "kotlin",     version: "1.8.20" },
};

export default function CodeEditor({ language, starterCode = "", onChange, fillHeight = false }) {
  const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.python;
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setCode(starterCode);
  }, [starterCode]);

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    setError(false);
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: config.value,
          version: config.version,
          files: [{ content: code }],
        }),
      });
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

  // When fillHeight=true (used in question page), render editor only — no run button/output
  // The parent handles running. When false (standalone), show full controls.
  if (fillHeight) {
    return (
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={config.value}
          value={code}
          onChange={(val) => {
            const v = val || "";
            setCode(v);
            if (onChange) onChange(v);
          }}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbersMinChars: 3,
            padding: { top: 14, bottom: 14 },
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
            },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            renderLineHighlight: "gutter",
          }}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>{config.value.toUpperCase()} Editor</span>
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
            const v = val || "";
            setCode(v);
            if (onChange) onChange(v);
          }}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
      <div style={styles.outputHeader}>Output</div>
      <div style={{ ...styles.output, color: error ? "#e05c5c" : "#3ab87a" }}>
        {output || "Run your code to see output here..."}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "monospace",
    background: "#0f0e0d",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,.07)",
  },
  header: {
    display: "flex", alignItems: "center",
    padding: "10px 16px",
    background: "#1e1a17",
    borderBottom: "1px solid rgba(255,255,255,.07)",
  },
  title: { color: "#f0e8df", fontWeight: "bold", fontSize: "13px", marginRight: "auto" },
  button: {
    background: "#c0633a", color: "#fff", border: "none",
    borderRadius: "6px", padding: "5px 14px",
    fontSize: "12px", cursor: "pointer", fontWeight: "bold",
  },
  buttonDisabled: {
    background: "#3a3330", color: "#5a4f47", border: "none",
    borderRadius: "6px", padding: "5px 14px",
    fontSize: "12px", cursor: "not-allowed", fontWeight: "bold",
  },
  editorWrapper: { borderBottom: "1px solid rgba(255,255,255,.07)" },
  outputHeader: {
    background: "#1e1a17", color: "#5a4f47",
    fontSize: "11px", padding: "5px 16px",
    borderBottom: "1px solid rgba(255,255,255,.07)",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: ".08em", textTransform: "uppercase",
  },
  output: {
    background: "#0f0e0d", padding: "14px 16px",
    minHeight: "72px", fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
    whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6,
  },
};;
