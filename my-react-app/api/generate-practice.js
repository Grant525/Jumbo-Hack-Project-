export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { title, description, chapter } = req.body;
  
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: "You are generating coding practice problems. Always respond with only a valid JSON object, no markdown, no code fences, no explanation.",
          messages: [
            {
              role: "user",
              content: `Generate a new coding problem similar to this one but with different specifics:
  
  Title: ${title}
  Chapter: ${chapter}
  Description: ${description}
  
  Return ONLY this JSON structure:
  {
    "title": "...",
    "description": "...",
    "example_output": "...",
    "constraints": [],
    "starter_code_prompt": "Generate a minimal {language} program for a question titled '...'. Describe the skeleton needed. Return only raw code, no markdown, no code fences."
  }`
            }
          ]
        })
      });
  
      const text = await response.text();
  
      if (!response.ok) {
        return res.status(500).json({ error: text });
      }
  
      const data = JSON.parse(text);
      const raw = data.content[0].text;
      const practice = JSON.parse(raw);
      res.status(200).json({ practice });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }