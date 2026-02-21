export default async function handler(req, res) {
    const { problem, targetLanguage } = req.body;
  
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 20000,
        temperature: 1,
        system: "You are a programming language tutor helping users learn new languages through coding problems.",
        messages: [
          {
            role: "user",
            content: `Generate starter code in ${targetLanguage} for the following problem. Do NOT solve the problem.\nOnly output the code block, nothing else.\n\nProblem: ${problem}`
          }
        ]
      })
    });
  
    const data = await response.json();
    const code = data.content[0].text;
    res.status(200).json({ code });
  }