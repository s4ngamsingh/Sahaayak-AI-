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
  Activity
} from 'lucide-react';

export const CityAnalyticsView: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        setAnalyticsData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching analytics:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !analyticsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-sm">Loading City Redressal Metrics & Hotspot Intelligence...</p>
      </div>
    );
  }

  const { summary, byDepartment, wardHotspots } = analyticsData;

  const languageStats = [
    { name: 'Hindi / Hinglish (हिन्दी)', percent: 46, count: 184 },
    { name: 'English', percent: 24, count: 96 },
    { name: 'Bengali (বাংলা)', percent: 12, count: 48 },
    { name: 'Tamil (தமிழ்)', percent: 8, count: 32 },
    { name: 'Bhojpuri (भोजपुरी)', percent: 6, count: 24 },
    { name: 'Kannada / Telugu / Marathi', percent: 4, count: 16 },
  ];

  return (
    <div id="city-analytics-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            <span>Civic Intelligence & Redressal Analytics</span>
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 backdrop-blur-md">
            Live Administrative Data
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Real-time performance across municipal departments, SLA compliance rates, migrant multilingual adoption, and ward-level grievance clusters.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Overall Resolution Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{summary.overallResolutionRate}%</span>
            <span className="text-xs text-emerald-300 font-semibold">+4.2% this month</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Target SLA: 90%</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Average Redressal Time</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-300">{summary.avgRedressalTimeHours}h</span>
            <span className="text-xs text-indigo-200">from 48h (legacy)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">62% reduction via Voice AI triage</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Regional Languages Handled</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">{summary.languagesSupported}</span>
            <span className="text-xs text-blue-300">Dialects supported</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero language barriers for migrants</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Critical Emergency Interventions</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">{summary.criticalCount}</span>
            <span className="text-xs text-rose-300">Live hazards</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Prioritized to 4-hour SLA</p>
        </div>
      </div>

      {/* Grid: Department Performance vs Ward Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Department SLA Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Department SLA Compliance & Volume</h3>
            </div>
            <span className="text-xs text-slate-400">Resolution %</span>
          </div>

          <div className="space-y-4">
            {(byDepartment || []).map((dept: any) => (
              <div key={dept.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{dept.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{dept.resolved}/{dept.total} resolved</span>
                    <span className="font-bold text-emerald-400">{dept.resolutionRate}%</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden backdrop-blur-md">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.max(dept.resolutionRate, 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multilingual Adoption Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Languages className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Citizen Dictation by Language</h3>
          </div>

          <div className="space-y-3">
            {languageStats.map((item, idx) => (
              <div key={idx} className="bg-white/[0.02] p-2.5 rounded-xl border border-white/10 text-xs backdrop-blur-md">
                <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
                  <span>{item.name}</span>
                  <span className="text-indigo-300 font-mono">{item.percent}%</span>
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
      </div>

      {/* Ward Hotspots & AI Root Cause Cluster */}
      <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-base">Geographic Ward Hotspots & AI Root Cause Analysis</h3>
          </div>
          <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Cluster Intelligence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(wardHotspots || []).map((wh: any, widx: number) => (
            <div key={widx} className="p-4 bg-white/[0.02] rounded-xl border border-white/10 text-xs flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-slate-100">{wh.ward}</span>
                  {wh.critical > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30 backdrop-blur-md">
                      {wh.critical} Critical
                    </span>
                  )}
                </div>
                <span className="text-slate-400 block">Primary Issue Category:</span>
                <p className="font-semibold text-indigo-300 mt-0.5">{wh.topIssue}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 text-slate-400 flex items-center justify-between">
                <span>Total Active Complaints:</span>
                <span className="font-mono text-white font-bold">{wh.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
