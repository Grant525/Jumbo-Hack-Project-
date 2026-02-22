// Judge0 language IDs
const LANGUAGE_IDS = {
  python:     71,
  javascript: 63,
  java:       62,
  cpp:        54,
  rust:       73,
  go:         60,
  typescript: 74,
  kotlin:     78,
};

export default async function handler(req, res) {
  const { language, code } = req.body;

  const languageId = LANGUAGE_IDS[language?.toLowerCase()];
  if (!languageId) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  // Submit the code
  const submitRes = await fetch(
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.a94a833eeamsh606fcfcd9a2b28bp1fbb68jsn4f8593f1adf9,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
      }),
    }
  );

  if (!submitRes.ok) {
    const text = await submitRes.text();
    return res.status(submitRes.status).json({ error: text });
  }

  const data = await submitRes.json();

  res.status(200).json({
    stdout: data.stdout ?? "",
    stderr: data.stderr ?? data.compile_output ?? "",
  });
}
