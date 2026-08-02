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
  const PORT = parseInt(process.env.PORT || "3000", 10);
  const HOST = process.env.HOST || "127.0.0.1";
  app.use(import_express.default.json());
  app.get("/api/version", (req, res) => {
    res.json({
      app: "BeatAttend HR Enterprise Gateway",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
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
    const frontendDistPath = import_path.default.join(process.cwd(), "frontend-dist");
    app.use(import_express.default.static(frontendDistPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(frontendDistPath, "index.html"));
    });
  }
  app.listen(PORT, HOST, () => {
    console.log(`BeatAttend API Gateway running on http://${HOST}:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
