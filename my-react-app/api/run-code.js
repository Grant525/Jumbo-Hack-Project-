export default async function handler(req, res) {
  const { language, version, code } = req.body;

  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language,
      version,
      files: [{ content: code }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return res.status(response.status).json({ error: text });
  }

  const data = await response.json();
  res.status(200).json({
    stdout: data.run?.output ?? "",
    stderr: data.run?.stderr ?? "",
  });
}
