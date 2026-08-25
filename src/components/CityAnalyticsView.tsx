import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Sparkles, 
  RefreshCw,
  Languages,
  Activity,
  ShieldAlert,
  BrainCircuit,
  Zap,
  ArrowUpRight,
  Send,
  HelpCircle,
  Gauge,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { AIInsightsData } from '../types';

export const CityAnalyticsView: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AIInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReauditing, setIsReauditing] = useState(false);

  // Ask AI Strategy Query state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  const fetchAnalytics = async (showReauditAnim = false) => {
    if (showReauditAnim) setIsReauditing(true);
    else setIsLoading(true);

    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data: AIInsightsData = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Error fetching AI analytics:', err);
    } finally {
      setIsLoading(false);
      setIsReauditing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleAskAi = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || aiQuestion;
    if (!query.trim() || isAskingAi) return;

    setIsAskingAi(true);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/analytics/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnswer(data.answer);
      } else {
        setAiAnswer('Could not process AI analytics query. Please try again.');
      }
    } catch (err) {
      console.error('Ask AI error:', err);
      setAiAnswer('Network connection error while contacting AI analytics engine.');
    } finally {
      setIsAskingAi(false);
    }
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-slate-400">
        <div className="relative mb-4">
          <BrainCircuit className="w-12 h-12 text-indigo-400 animate-pulse" />
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400 absolute -bottom-1 -right-1" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Synthesizing City-Wide AI Intelligence...</h3>
        <p className="text-xs text-slate-400 max-w-md text-center">
          Analyzing live grievance telemetry, reverse geo-clusters, and predictive SLA risk models using Gemini AI.
        </p>
      </div>
    );
  }

  const {
    summary,
    executiveSummary,
    systemicAnomalies,
    predictiveSlaRisks,
    preventiveRecommendations,
    wardHotspots,
    byDepartment,
    languageStats,
    citizenSentimentPulse,
    auditGeneratedAt,
    isAiSynthesized,
  } = analyticsData;

  const quickAiQuestions = [
    'Which ward has the most urgent infrastructure hazard?',
    'What is causing recurring PWD road potholes and water leaks?',
    'How can we reduce SLA breach probability across all departments?',
  ];

  return (
    <div id="city-analytics-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header & Live AI Engine Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <BrainCircuit className="w-8 h-8 text-indigo-400" />
              <span>AI Civic Intelligence & Predictive Urban Analytics</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {isAiSynthesized ? 'Gemini 3.7 Neural Synthesis' : 'Live Dynamic Telemetry'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Autonomous anomaly discovery, cross-departmental root-cause diagnosis, and predictive SLA risk management derived entirely from live citizen grievances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            disabled={isReauditing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold backdrop-blur-md transition-all shadow-lg hover:shadow-indigo-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReauditing ? 'animate-spin text-amber-300' : ''}`} />
            <span>{isReauditing ? 'Re-Running AI Deep Audit...' : 'Re-Run AI Deep Audit'}</span>
          </button>
        </div>
      </div>

      {/* 1. Executive AI Diagnosis & Civic Health Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Civic Health Index Meter (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950/80 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-400" />
                City Civic Health Score
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                executiveSummary.statusRating === 'OPTIMAL_FLOW'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {executiveSummary.statusRating.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-300">
                {executiveSummary.civicHealthScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100 Index</span>
            </div>

            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden my-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${executiveSummary.civicHealthScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed mt-2">
              {executiveSummary.keyDiagnosis}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] text-slate-400 block">Active Complaints</span>
              <span className="font-bold text-white text-base">{summary.total} Registered</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] text-slate-400 block">Avg AI SLA Velocity</span>
              <span className="font-bold text-indigo-300 text-base">{summary.avgRedressalTimeHours}h</span>
            </div>
          </div>
        </div>

        {/* Strategic Executive AI Commentary (8 cols) */}
        <div className="lg:col-span-8 bg-white/[0.04] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Strategic Municipal Executive Commentary</h3>
              <span className="ml-auto text-[11px] text-slate-400 font-mono">
                Audit: {new Date(auditGeneratedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
              <p>{executiveSummary.executiveCommentary}</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <span className="text-slate-400 block text-[10px]">Resolution Efficiency</span>
              <span className="font-bold text-emerald-400 text-lg">{summary.overallResolutionRate}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
              <span className="text-slate-400 block text-[10px]">Critical Emergency Nodes</span>
              <span className="font-bold text-rose-400 text-lg">{summary.criticalCount} Hazards</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
              <span className="text-slate-400 block text-[10px]">Multilingual Dialects</span>
              <span className="font-bold text-indigo-300 text-lg">{languageStats.length} Active</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="text-slate-400 block text-[10px]">Citizen Sentiment</span>
              <span className="font-bold text-amber-300 text-lg">{citizenSentimentPulse.statusLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive "Ask AI Civic Intelligence" Query Console */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Ask AI Civic Intelligence (Real-Time Telemetry Query)</h3>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Query the Gemini AI engine to analyze live municipal bottlenecks, correlate cross-ward failure trends, or draft resource allocation strategies.
        </p>

        <form onSubmit={(e) => handleAskAi(e)} className="flex gap-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ask AI e.g., 'What is causing road failures in Ward 42?' or 'Which department needs urgent reinforcement?'"
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-all"
          />
          <button
            type="submit"
            disabled={isAskingAi || !aiQuestion.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 ${isAskingAi ? 'animate-spin' : ''}`} />
            <span>{isAskingAi ? 'Analyzing...' : 'Ask AI'}</span>
          </button>
        </form>

        {/* Suggested Quick Prompt Chips */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <span className="text-[11px] text-slate-400">Quick AI prompts:</span>
          {quickAiQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAiQuestion(q);
                handleAskAi(undefined, q);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-indigo-300 transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* AI Answer Display */}
        {aiAnswer && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-950/50 border border-indigo-500/40 text-xs sm:text-sm text-slate-200 leading-relaxed backdrop-blur-md animate-fadeIn">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Municipal Analyst Response:</span>
            </div>
            <div className="whitespace-pre-line">{aiAnswer}</div>
          </div>
        )}
      </div>

      {/* 3. Systemic Root-Cause Anomalies Discovered by AI */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-base">Systemic Root-Cause Anomalies Discovered by AI</h3>
          </div>
          <span className="text-xs text-indigo-300 font-mono">Cross-Departmental Synergy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(systemicAnomalies || []).map((anom) => (
            <div
              key={anom.id}
              className="p-4 rounded-xl bg-gradient-to-b from-white/[0.04] to-black/20 border border-white/10 text-xs flex flex-col justify-between backdrop-blur-md space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white/10 text-slate-300 border border-white/10">
                    {anom.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    anom.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {anom.severity} SEVERITY
                  </span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm">{anom.title}</h4>
                <p className="text-[11px] text-indigo-300 font-semibold mt-0.5">
                  {anom.departmentName} • Impacting: {anom.impactedWards.join(', ')}
                </p>

                <div className="mt-3 p-3 rounded-lg bg-black/30 border border-white/5 space-y-2">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">AI Root-Cause Mechanism:</span>
                    <p className="text-slate-300 text-xs mt-0.5">{anom.rootCauseAnalysis}</p>
                  </div>
                  <div>
                    <span className="text-emerald-400 block font-semibold text-[10px] uppercase">Recommended Permanent Engineering Fix:</span>
                    <p className="text-emerald-200/90 text-xs mt-0.5">{anom.permanentFixRecommendation}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Target Remediation SLA:</span>
                <span className="font-mono text-white font-bold">{anom.estimatedTurnaround}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Predictive SLA Risks & Preventive Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Predictive SLA Breach Forecasts (6 cols) */}
        <div className="lg:col-span-6 bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Predictive SLA Risk & Bottleneck Forecast</h3>
          </div>

          <div className="space-y-4">
            {(predictiveSlaRisks || []).map((risk, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{risk.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    risk.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {risk.breachRiskPercent}% Breach Risk
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      risk.riskLevel === 'HIGH' ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${risk.breachRiskPercent}%` }}
                  />
                </div>

                <div className="space-y-1 pt-1 text-[11px]">
                  <p className="text-slate-400">
                    <strong className="text-slate-300">Projected Bottleneck:</strong> {risk.projectedBottleneck}
                  </p>
                  <p className="text-emerald-300">
                    <strong className="text-emerald-400">Preventive Mitigation:</strong> {risk.preventiveMitigation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preventive Municipal Directives (6 cols) */}
        <div className="lg:col-span-6 bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Prioritized Preventive Directives</h3>
          </div>

          <div className="space-y-3">
            {(preventiveRecommendations || []).map((rec) => (
              <div key={rec.priority} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 font-mono text-[10px] flex items-center justify-center font-bold">
                      #{rec.priority}
                    </span>
                    {rec.actionTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{rec.targetWard}</span>
                </div>

                <p className="text-slate-300 text-[11px]">{rec.rationale}</p>

                <div className="mt-1 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                  <strong>Anticipated Impact:</strong> {rec.anticipatedImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Dynamic Ward Hotspots & Cluster Intelligence */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-base">Dynamic Ward Hotspots & Field Squad Allocations</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Live Geographic Triage</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(wardHotspots || []).map((wh, widx) => (
            <div key={widx} className="p-4 bg-white/[0.02] rounded-xl border border-white/10 text-xs flex flex-col justify-between backdrop-blur-md space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-slate-100 text-sm">{wh.ward}</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                    wh.aiRiskScore > 70
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    Risk: {wh.aiRiskScore}/100
                  </span>
                </div>

                <span className="text-slate-400 block text-[10px] uppercase">Primary Clustering Issue:</span>
                <p className="font-semibold text-indigo-300 mt-0.5">{wh.topIssue}</p>

                <p className="text-slate-300 text-[11px] mt-2 leading-relaxed">
                  {wh.clusterDiagnosis}
                </p>

                <div className="mt-2.5 p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200">
                  <strong className="text-indigo-300 block text-[10px]">AI Squad Directive:</strong>
                  {wh.recommendedSquadDeployment}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-slate-400 flex items-center justify-between">
                <span>Active Ward Load:</span>
                <span className="font-mono text-white font-bold">{wh.total} Tickets ({wh.critical} Critical)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Department Performance & Language Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department SLA & Efficacy Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Department Operational Efficacy & AI Grade</h3>
            </div>
            <span className="text-xs text-slate-400">Resolution %</span>
          </div>

          <div className="space-y-4">
            {(byDepartment || []).map((dept) => (
              <div key={dept.id} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{dept.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Grade: {dept.aiEfficacyGrade}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{dept.resolved}/{dept.total} resolved</span>
                    <span className="font-bold text-emerald-400">{dept.resolutionRate}%</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden backdrop-blur-md">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.max(dept.resolutionRate, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multilingual Voice Ingestion & Sentiment Pulse (5 cols) */}
        <div className="lg:col-span-5 bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <Languages className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Multilingual Ingestion Telemetry</h3>
            </div>

            <div className="space-y-2.5">
              {(languageStats || []).map((item, idx) => (
                <div key={idx} className="bg-white/[0.02] p-2.5 rounded-xl border border-white/10 text-xs backdrop-blur-md">
                  <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
                    <span>{item.name}</span>
                    <span className="text-indigo-300 font-mono">{item.percent}% ({item.count} complaints)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-400"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Pulse */}
          <div className="mt-4 pt-3 border-t border-white/10 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                Citizen Sentiment Tone:
              </span>
              <span className="text-amber-300 font-bold">{citizenSentimentPulse.statusLabel}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {citizenSentimentPulse.keyFrictionPoint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
