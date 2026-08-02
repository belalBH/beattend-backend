var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/sentiment-analysis", async (req, res) => {
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
            "User-Agent": "aistudio-build"
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
        contents: prompt
      });
      res.json({ analysis: response.text });
    } catch (error) {
      console.error("Gemini analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze sentiment." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
