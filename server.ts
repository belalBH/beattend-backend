import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);
  const HOST = process.env.HOST || "127.0.0.1";

  // JSON parsing middleware
  app.use(express.json());

  // Health Check Endpoint
  app.get("/api/version", (req, res) => {
    res.json({
      app: "BeatAttend HR Enterprise Gateway",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    });
  });

  // Sentiment Analysis API endpoint
  app.post("/api/sentiment-analysis", async (req: any, res: any) => {
    try {
      const { name, officeStatus, checkedIn, weeklyHours, targetHours, officePresence, engagements, currentStats } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a high-end corporate fintech HR coach and sentiment analysis system for BeatAttend HR Enterprise.
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

Please write a highly polished, analytical, and professional analysis in markdown.`;

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

  // Vite middleware for development vs static frontend-dist for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const frontendDistPath = path.join(process.cwd(), 'frontend-dist');
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`BeatAttend API Gateway running on http://${HOST}:${PORT}`);
  });
}

startServer();
