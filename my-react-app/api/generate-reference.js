export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { problem, knownLanguage } = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: "You are a programming language tutor helping users learn new languages through coding problems.",
        messages: [
          {
            role: "user",
            content: `Write a complete, working solution in ${knownLanguage} that solves this problem. Include a main function with test cases. Do NOT leave TODOs or placeholder comments — write the full working code.\n\nProblem: ${problem}`,
          },
        ],
      }),
    });

    const text = await response.text();
    console.log("Raw Claude response:", text);

    if (!response.ok) {
      return res.status(500).json({ error: text });
    }

    const data = JSON.parse(text);
    const raw = data.content[0].text;
    const code = raw.replace(/^```[\w]*\n/gm, "").replace(/\n?```$/gm, "").trim();
    res.status(200).json({ code });
  } catch (err) {
    console.log("Caught error:", err.message);
    res.status(500).json({ error: err.message });
  }
}