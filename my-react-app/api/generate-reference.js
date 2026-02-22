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
            content: `Generate a complete, clean, and well-commented solution for the following problem in ${knownLanguage}. Only output the code block, nothing else.\n\nProblem: ${problem}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const code = data.content[0].text;
    res.status(200).json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}