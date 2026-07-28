import { useState } from "react";
import { Profile, Engagement, SentimentReport } from "../types";
import { Cpu, BrainCircuit, Sparkles, Loader2, BarChart2, TrendingUp, AlertTriangle } from "lucide-react";

interface TeamSentimentCardProps {
  profile: Profile;
  engagements: Engagement[];
  checkedIn: boolean;
}

export default function TeamSentimentCard({
  profile,
  engagements,
  checkedIn,
}: TeamSentimentCardProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [report, setReport] = useState<SentimentReport | null>(null);
  const [isDemoCache, setIsDemoCache] = useState(false);

  const loadingStages = [
    "Synthesizing biometric access logs...",
    "Evaluating daily presence density...",
    "Querying agenda engagement matrices...",
    "Contacting server-side Gemini 3.5 engine...",
    "Formulating executive advisory report..."
  ];

  const triggerAnalysis = async () => {
    setShowAnalysis(true);
    setLoading(true);
    setReport(null);
    setIsDemoCache(false);

    // Simulate stepping through loader stages for high-fidelity fintech feel
    for (let i = 0; i < loadingStages.length; i++) {
      setLoadingStage(i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      const response = await fetch("/api/sentiment-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          officeStatus: checkedIn ? "ACTIVE" : "STANDBY",
          checkedIn,
          weeklyHours: profile.completedHours,
          targetHours: profile.weeklyTargetHours,
          officePresence: 94,
          engagements,
          currentStats: {
            productivityIncrease: "12%",
            weeksStreak: 4,
            overtimeTrend: "+2.4 hrs vs Last Week"
          }
        }),
      });

      if (!response.ok) {
        throw new Error("API server responded with error code " + response.status);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setReport({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: 94,
        status: "Optimal Equilibrium",
        analysis: data.analysis,
      });
    } catch (err: any) {
      console.warn("API Error. Falling back to local high-fidelity mock analysis.", err);
      // Fallback secure local demo report in case GEMINI_API_KEY is not defined or server is offline
      setIsDemoCache(true);
      setReport({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: 92,
        status: "High-Velocity Flow",
        analysis: `### Executive Security & Output Synthesis

Your telemetry parameters indicate a state of **High-Velocity Flow** with a focus accuracy score of **92/100**. 

1. **Velocity Equilibrium**: With **${profile.completedHours.toFixed(1)} hrs** logged out of **${profile.weeklyTargetHours} hrs**, you have hit the optimal velocity corridor. Your overtime load is balanced, protecting cognitive margin.
2. **Presence Alignment**: Your **94% office presence** reflects a robust local collaborative imprint. Your attendance peaks on Tuesday and Wednesday correspond directly to team milestones.
3. **Agenda Density**: Upcoming meetings represent strategic alignment. Your Q4 Portfolio Review will require high peak cognitive load. It is advised to block **60 minutes of deep focus** preceding this meeting.

*Summary*: Maintain current momentum. No critical exhaustion warnings are active in your segment.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Light-weight custom Markdown-to-HTML parser to display bullets and paragraphs beautifully without bundle errors
  const parseMarkdown = (markdown: string) => {
    if (!markdown) return null;
    const lines = markdown.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Header H3
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-white mt-4 mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      }

      // Bold formatting replacing **text**
      const parseBolds = (text: string) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-brand-secondary font-bold">{part}</strong> : part));
      };

      // Bullet items
      if (trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\.\s/.test(trimmed)) {
        const clean = trimmed.replace(/^[-*\d.]+\s*/, "");
        return (
          <li key={idx} className="text-xs text-neutral-300 ml-4 list-disc pl-1 mb-2 leading-relaxed">
            {parseBolds(clean)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-neutral-400 leading-relaxed mb-3">
          {parseBolds(trimmed)}
        </p>
      );
    });
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/20 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-brand-secondary">psychology</span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest font-mono">
              AI Analytics segment
            </span>
          </div>
          <h3 className="font-sans text-xl font-bold text-white mb-2">
            Team Sentiment
          </h3>
          <p className="font-sans text-sm text-neutral-300">
            Overall productivity is up <span className="text-brand-secondary font-bold font-mono">12%</span> this week.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-4 bg-white/5 border border-white/5 p-3.5 rounded-2xl">
          <div className="p-2 bg-brand-secondary/15 rounded-xl text-brand-secondary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Velocity Forecast</p>
            <p className="text-xs text-neutral-200 font-sans font-medium mt-0.5">
              Target completion pacing is perfectly green. No bottlenecks.
            </p>
          </div>
        </div>

        <button
          onClick={triggerAnalysis}
          className="w-full mt-6 py-3 bg-white/5 hover:bg-brand-secondary hover:text-[#121414] border border-white/10 hover:border-brand-secondary rounded-2xl font-sans text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-widest"
        >
          <BrainCircuit className="w-4 h-4" />
          View Analysis
        </button>
      </div>

      {/* Sentiment Analysis Modal Sheet */}
      {showAnalysis && (
        <div className="absolute inset-0 bg-[#0a0e1a]/95 backdrop-blur-xl z-20 p-6 flex flex-col justify-between rounded-3xl animate-in fade-in duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-secondary animate-spin" />
              <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider">
                HR Cognitive Center
              </h4>
            </div>
            {!loading && (
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
              <Loader2 className="w-10 h-10 text-brand-secondary animate-spin" />
              <div className="text-center">
                <p className="text-xs font-bold text-neutral-200 tracking-wide transition-all">
                  {loadingStages[loadingStage]}
                </p>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest font-mono">
                  Stage {loadingStage + 1} of {loadingStages.length}
                </p>
              </div>
            </div>
          ) : (
            report && (
              <div className="flex-1 my-4 overflow-y-auto pr-1 flex flex-col justify-between">
                {isDemoCache && (
                  <div className="mb-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-amber-400 text-[10px] font-medium leading-normal animate-pulse">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Secure offline cache active. Configure <strong>GEMINI_API_KEY</strong> secret for live telemetry.</span>
                  </div>
                )}

                {/* Cognitive score ring and status banner */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl mb-4">
                  <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-neutral-900 border border-brand-secondary/30">
                    <div className="absolute inset-1 rounded-full border border-dashed border-brand-secondary/20 animate-spin" style={{ animationDuration: "12s" }} />
                    <span className="font-mono text-sm font-black text-brand-secondary">{report.score}</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Biometric Sentiment Index</p>
                    <h5 className="text-xs font-extrabold text-white uppercase tracking-wide mt-0.5">
                      {report.status}
                    </h5>
                    <p className="text-[9px] text-neutral-400 mt-0.5">Computed Today at {report.timestamp}</p>
                  </div>
                </div>

                <div className="space-y-1 text-left flex-1 select-text">
                  {parseMarkdown(report.analysis)}
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-2">
                  <button
                    onClick={triggerAnalysis}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-neutral-300 font-semibold transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Recalibrate
                  </button>
                  <button
                    onClick={() => setShowAnalysis(false)}
                    className="flex-1 py-2 bg-brand-secondary text-[#121414] font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
