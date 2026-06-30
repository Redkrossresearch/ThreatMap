"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Radar as RadarIcon, 
  AlertTriangle, 
  BrainCircuit, 
  History,
  Target,
  ShieldAlert,
  Zap,
  Loader2
} from "lucide-react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";

export default function InsiderMotivationDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
        const res = await fetch(`${baseUrl}/api/insider-motivation`);
        if (!res.ok) throw new Error("Failed to fetch insider motivation data");
        const json = await res.json();
        if (json && json.length > 0) {
          setData(json[0]); // Using the first user (Alice Smith) for the dashboard
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-error">
        Error loading dashboard: {error || "No data found"}
      </div>
    );
  }

  const motivationData = [
    { subject: 'Financial', score: data.score_financial, fullMark: 100 },
    { subject: 'Revenge', score: data.score_revenge, fullMark: 100 },
    { subject: 'Negligence', score: data.score_negligence, fullMark: 100 },
    { subject: 'Curiosity', score: data.score_curiosity, fullMark: 100 },
    { subject: 'Ext. Influence', score: data.score_external_influence, fullMark: 100 },
  ];

  const timelineEvents = data.suspicious_events || [];
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 px-4 md:px-8 mt-6">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white font-headline-lg flex items-center gap-3">
            <Target className="text-primary" />
            Insider Motivation Analysis
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            AI-driven behavioral profiling to estimate primary drivers behind anomalous user activity.
          </p>
        </div>
        <div className="hidden sm:block">
           <span className="px-3 py-1 bg-error/20 text-error text-[10px] font-mono-sm uppercase border border-error/30 rounded shadow-[0_0_10px_rgba(239,68,68,0.3)]">
             Subject: {data.employee_id} ({data.department})
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 glass-panel p-lg rounded-xl flex flex-col relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4 relative z-10">
            <RadarIcon size={18} className="text-primary animate-[spin_4s_linear_infinite]" />
            <h3 className="font-bold text-white text-sm font-headline-sm">Motivation Matrix</h3>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={motivationData}>
                <PolarGrid stroke="#ffffff20" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#ffffff20", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Radar 
                  name="Probability" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.4} 
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-2 text-center relative z-10">
            <span className="text-xs font-mono-sm text-on-surface-variant">Primary Driver: <strong className="text-error tracking-wider uppercase">{data.primary_motivation} ({motivationData.find((d: any) => d.subject.startsWith(data.primary_motivation.substring(0,3)))?.score || 0}%)</strong></span>
          </div>
        </motion.div>

        {/* AI Recommendations & Explanation Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel p-lg rounded-xl flex flex-col relative overflow-hidden group hover:border-error/30 transition-all duration-500"
        >
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-error to-transparent opacity-50" />
          
          <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4 relative z-10">
            <BrainCircuit className="text-error animate-pulse" />
            <h3 className="font-bold text-white text-md font-headline-sm">Behavioral Assessment</h3>
            <span className="ml-auto text-[10px] bg-error/20 text-error px-2 py-0.5 rounded border border-error/30 font-mono-sm">98% CONFIDENCE</span>
          </div>

          <div className="flex-1 relative z-10 flex flex-col justify-center space-y-5">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                Risk Explanation
              </h4>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {data.ai_recommendation?.split('Recommended Action:')[0] || "Analysis processing..."}
              </p>
            </div>
            
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
              <ShieldAlert className="text-error shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-error uppercase mb-1 tracking-widest">Immediate AI Recommendations</h4>
                <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
                  <li>{data.ai_recommendation?.split('Recommended Action:')[1] || "No recommendations generated."}</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline & Behavioral Indicators Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeline */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-lg rounded-xl"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-5">
            <History size={18} className="text-primary" />
            <h3 className="font-bold text-white text-sm font-headline-sm">Suspicious Events Timeline</h3>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {timelineEvents.map((event) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-surface shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                  event.severity === 'critical' ? 'bg-error shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                  event.severity === 'high' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                  'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                }`}>
                </div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">{event.time}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                       event.severity === 'critical' ? 'text-error bg-error/10' :
                       event.severity === 'high' ? 'text-amber-500 bg-amber-500/10' :
                       'text-primary bg-primary/10'
                    }`}>
                      {event.severity}
                    </span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">{event.event}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Behavioral Indicators */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-lg rounded-xl flex flex-col"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-bold text-white text-sm font-headline-sm">Behavioral Indicators</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-lg transition-colors flex items-start gap-3">
              <div className="p-1.5 bg-amber-500/20 text-amber-500 rounded">
                <span className="material-symbols-outlined text-[16px]">visibility_off</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Evasion Tactics</h4>
                <p className="text-[10px] text-on-surface-variant">Attempts to use personal VPNs, Tor browsers, or incognito modes to hide network traffic.</p>
              </div>
            </div>
            
            <div className="p-3 bg-white/5 border border-white/10 hover:border-error/30 rounded-lg transition-colors flex items-start gap-3">
              <div className="p-1.5 bg-error/20 text-error rounded">
                <span className="material-symbols-outlined text-[16px]">folder_copy</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Data Hoarding</h4>
                <p className="text-[10px] text-on-surface-variant">Unusual aggregation of sensitive files into single archive files (.zip, .tar) not required for daily tasks.</p>
              </div>
            </div>
            
            <div className="p-3 bg-white/5 border border-white/10 hover:border-primary/30 rounded-lg transition-colors flex items-start gap-3">
              <div className="p-1.5 bg-primary/20 text-primary rounded">
                <span className="material-symbols-outlined text-[16px]">lock_open</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Privilege Escalation Exploring</h4>
                <p className="text-[10px] text-on-surface-variant">Running unauthorized enumeration scripts or attempting to access restricted admin panels.</p>
              </div>
            </div>
            
            <div className="p-3 bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-lg transition-colors flex items-start gap-3">
              <div className="p-1.5 bg-amber-500/20 text-amber-500 rounded">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Time Anomalies</h4>
                <p className="text-[10px] text-on-surface-variant">Consistent bursts of high-volume data transfers immediately before or after standard working hours.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
