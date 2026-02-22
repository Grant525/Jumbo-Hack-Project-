const LANGUAGE_VERSIONS = {
    python: "3.10.0",
    javascript: "18.15.0",
    java: "15.0.2",
    "c++": "10.2.0",
    rust: "1.50.0",
    go: "1.16.2",
    typescript: "5.0.3",
    kotlin: "1.8.20",
  };
  
  export default async function handler(req, res) {
    const { code, language } = req.body;
    const version = LANGUAGE_VERSIONS[language.toLowerCase()];
  
    if (!version) {
      return res.status(400).json({ output: `Unsupported language: ${language}` });
    }
  
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language.toLowerCase(),
          version,
          files: [{ content: code }],
        }),
      });
  
      const data = await response.json();
      const output = data.run.stderr || data.run.output || "(no output)";
      res.status(200).json({ output });
    } catch (err) {
      res.status(500).json({ output: "Error connecting to execution engine." });
    }
  }