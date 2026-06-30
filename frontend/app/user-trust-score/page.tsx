"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ShieldAlert, 
  BrainCircuit, 
  TrendingUp,
  Key,
  Smartphone,
  Activity,
  CheckCircle2,
  XCircle,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Mock Data
const trustScore = 84;

const trendData = [
  { date: "Day 1", score: 65 },
  { date: "Day 5", score: 68 },
  { date: "Day 10", score: 72 },
  { date: "Day 15", score: 69 },
  { date: "Day 20", score: 75 },
  { date: "Day 25", score: 80 },
  { date: "Day 30", score: 84 },
];

const positiveFactors = [
  { id: 1, title: "Consistent MFA Usage", desc: "Hardware token used for 100% of authentications.", icon: Key },
  { id: 2, title: "Known Devices Only", desc: "No logins from untrusted or new devices.", icon: Smartphone },
  { id: 3, title: "Stable Access Patterns", desc: "Activity matches historical 9-to-5 baseline.", icon: Activity },
];

const negativeFactors = [
  { id: 1, title: "Impossible Travel", desc: "Minor anomaly: IP from a different state resolved quickly.", icon: ShieldAlert },
  { id: 2, title: "Stale Password", desc: "Password has not been changed in 90 days.", icon: ShieldAlert },
];

export default function UserTrustScoreDashboard() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;
  
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#10b981]"; // Emerald
    if (score >= 60) return "text-[#f59e0b]"; // Amber
    return "text-[#ef4444]"; // Red
  };
  const scoreColor = getScoreColor(trustScore);
  const scoreHex = trustScore >= 80 ? "#10b981" : trustScore >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4 md:px-8 mt-6">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white font-headline-lg flex items-center gap-3">
            <ShieldCheck className="text-primary" />
            User Trust Score
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Dynamic, continuous authentication scoring based on behavioral biometrics, device posture, and access patterns.
          </p>
        </div>
        <div className="hidden sm:block">
           <span className="px-3 py-1 bg-white/5 text-white text-[10px] font-mono-sm uppercase border border-white/10 rounded">
             User: jdoe@company.local
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Gauge Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 glass-panel p-lg rounded-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="w-full flex items-center gap-2 border-b border-white/5 pb-3 mb-6 relative z-10">
            <UserCheck size={18} className="text-primary" />
            <h3 className="font-bold text-white text-sm font-headline-sm">Current Trust Level</h3>
          </div>
          
          <div className="relative w-[280px] h-[280px] flex items-center justify-center">
            {/* SVG Gauge */}
            <svg className="w-full h-full -rotate-90 transform drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {/* Background Circle */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="20"
              />
              {/* Progress Circle */}
              {mounted && (
                <motion.circle
                  cx="140"
                  cy="140"
                  r="120"
                  fill="transparent"
                  stroke={scoreHex}
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              )}
            </svg>
            
            {/* Score Text */}
            <div className="absolute flex flex-col items-center justify-center">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`text-6xl font-black ${scoreColor} drop-shadow-md`}
              >
                {trustScore}
              </motion.span>
              <span className="text-xs text-on-surface-variant font-mono-sm tracking-widest uppercase mt-2">
                {trustScore >= 80 ? "Trusted" : trustScore >= 60 ? "Elevated Risk" : "Untrusted"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Trend Graph Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel p-lg rounded-xl flex flex-col relative overflow-hidden group hover:border-white/20 transition-all duration-500"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4 relative z-10">
            <TrendingUp className="text-primary" />
            <h3 className="font-bold text-white text-md font-headline-sm">30-Day Trust Trend</h3>
          </div>

          <div className="flex-1 w-full min-h-[250px] relative z-10 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={scoreHex} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={scoreHex} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#ffffff20", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: scoreHex }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke={scoreHex} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Factors Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-panel p-lg rounded-xl flex flex-col"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
            <Activity size={18} className="text-primary" />
            <h3 className="font-bold text-white text-sm font-headline-sm">Authentication Factors</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            
            {/* Positive Factors */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#10b981] uppercase tracking-widest flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} /> Score Enhancers
              </h4>
              {positiveFactors.map((factor) => {
                const Icon = factor.icon;
                return (
                  <div key={factor.id} className="p-3 bg-white/5 border border-[#10b981]/20 hover:border-[#10b981]/50 rounded-lg transition-colors flex items-start gap-3">
                    <div className="p-1.5 bg-[#10b981]/10 text-[#10b981] rounded">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white mb-0.5">{factor.title}</h5>
                      <p className="text-[10px] text-on-surface-variant">{factor.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Negative Factors */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest flex items-center gap-2 mb-3">
                <XCircle size={14} /> Risk Identifiers
              </h4>
              {negativeFactors.map((factor) => {
                const Icon = factor.icon;
                return (
                  <div key={factor.id} className="p-3 bg-white/5 border border-[#f59e0b]/20 hover:border-[#f59e0b]/50 rounded-lg transition-colors flex items-start gap-3">
                    <div className="p-1.5 bg-[#f59e0b]/10 text-[#f59e0b] rounded">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white mb-0.5">{factor.title}</h5>
                      <p className="text-[10px] text-on-surface-variant">{factor.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 glass-panel p-lg rounded-xl flex flex-col relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
        >
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4 relative z-10">
            <BrainCircuit size={18} className="text-primary animate-pulse" />
            <h3 className="font-bold text-white text-sm font-headline-sm">AI Recommendation</h3>
          </div>
          
          <div className="flex-1 relative z-10 flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                Score Analysis
              </h4>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                The user maintains a high baseline of trust due to strict adherence to hardware-based MFA and localized access patterns. However, recent impossible travel flags slightly reduced the score.
              </p>
            </div>
            
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-3">
              <ShieldCheck className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-primary uppercase mb-1 tracking-widest">Suggested Actions</h4>
                <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
                  <li>Mandate a password reset policy immediately.</li>
                  <li>Verify the impossible travel event with the user directly.</li>
                  <li>No conditional access restrictions required at this time.</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
