import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API routes FIRST
  app.post("/api/sentiment-analysis", async (req: any, res: any) => {
    try {
      const { name, officeStatus, checkedIn, weeklyHours, targetHours, officePresence, engagements, currentStats } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      }

      // Initialize GoogleGenAI SDK correctly
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a high-end corporate fintech HR coach and sentiment analysis system for CrystalHR.
Analyze the following employee activity and metrics, and provide a premium executive sentiment report.

Employee: ${name}
Office Status: ${officeStatus}
Current Session: ${checkedIn ? "Checked In" : "Checked Out"}
Weekly Hours Worked: ${weeklyHours} out of ${targetHours} hours
Office Presence Score: ${officePresence}%
Next Engagements:
${JSON.stringify(engagements, null, 2)}
Additional Current Statistics:
${JSON.stringify(currentStats, null, 2)}

Please write a highly polished, analytical, and professional analysis in markdown.
Focus on:
1. Productivity & Time Management: Evaluate their weekly hours (${weeklyHours}/${targetHours} hrs) and office presence (${officePresence}%).
2. Cognitive Load & Engagement: Review their upcoming meetings/engagements and suggest focus structures.
3. Sentiment & Well-being: Suggest a sophisticated, executive well-being score or dynamic advisory note (e.g. "Optimal Equilibrium", "High Velocity Focus").
Keep the response structured, clear, and elegant. Write 2-3 short, highly impactful paragraphs or a structured executive memo. Do not use top-level markdown headers like # or ##. Do not use bullet points unless necessary. No greeting or signoff. Start directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze sentiment." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
