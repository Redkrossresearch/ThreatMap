"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  BrainCircuit, 
  Calendar,
  History
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from "recharts";

// --- MOCK DATA ---
const weeklyActivity = [
  { day: "Mon", hours: 8.5, afterHours: 0.5 },
  { day: "Tue", hours: 9.2, afterHours: 1.2 },
  { day: "Wed", hours: 11.5, afterHours: 3.5 },
  { day: "Thu", hours: 10.8, afterHours: 2.8 },
  { day: "Fri", hours: 12.1, afterHours: 4.1 },
  { day: "Sat", hours: 4.5, afterHours: 4.5 },
  { day: "Sun", hours: 2.0, afterHours: 2.0 },
];

const timelineData = [
  { time: "08:00", activity: 20 },
  { time: "10:00", activity: 85 },
  { time: "12:00", activity: 60 },
  { time: "14:00", activity: 90 },
  { time: "16:00", activity: 75 },
  { time: "18:00", activity: 95 }, // Start of unusual overtime
  { time: "20:00", activity: 80 },
  { time: "22:00", activity: 65 },
  { time: "00:00", activity: 40 },
  { time: "02:00", activity: 15 },
];

const abnormalEvents = [
  { id: 1, type: "after_hours", label: "After-hours VPN Access", time: "23:45 PM", severity: "high" },
  { id: 2, type: "failed_login", label: "Multiple Failed Logins", time: "01:12 AM", severity: "medium" },
  { id: 3, type: "excessive_hours", label: "Consecutive 12h+ shifts", time: "3 Days", severity: "high" },
  { id: 4, type: "weekend_access", label: "Unusual Weekend DB Query", time: "Sat, 14:30", severity: "low" },
];

// --- COMPONENTS ---

// Animated Circular Progress for Risk Score
const RiskScoreCircle = ({ score }: { score: number }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(score), 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getRiskColor = (s: number) => {
    if (s < 40) return "#10b981"; // emerald-500
    if (s < 75) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  const getRiskGlow = (s: number) => {
    if (s < 40) return "drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]";
    if (s < 75) return "drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]";
    return "drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]";
  };

  const color = getRiskColor(score);
  const glow = getRiskGlow(score);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#ffffff10"
          strokeWidth="12"
          fill="transparent"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className={glow}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black text-white">{progress}</span>
        <span className="text-[10px] text-on-surface-variant font-mono-sm">/ 100</span>
      </div>
    </div>
  );
};

export default function BurnoutRiskDashboard() {
  const currentRiskScore = 78;
  const riskLevel = currentRiskScore >= 75 ? "HIGH" : currentRiskScore >= 40 ? "MEDIUM" : "LOW";
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 px-4 md:px-8 mt-6">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white font-headline-lg flex items-center gap-3">
            <Activity className="text-primary" />
            Employee Burnout Risk Detection
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Behavioral analysis of work patterns, access times, and anomalies to prevent burnout and insider threats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-lg rounded-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-error/30 transition-all duration-500"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-error to-transparent opacity-50" />
          
          <h3 className="font-bold text-white text-sm font-headline-sm uppercase tracking-widest mb-6">Aggregate Risk Score</h3>
          
          <RiskScoreCircle score={currentRiskScore} />
          
          <div className="mt-8 text-center">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono-sm uppercase border tracking-widest ${
                riskLevel === 'HIGH' ? 'bg-error/20 text-error border-error/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 
                riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : 
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {riskLevel} RISK LEVEL
            </span>
          </div>
        </motion.div>

        {/* AI Recommendation Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel p-lg rounded-xl flex flex-col relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700" />
          
          <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4 relative z-10">
            <BrainCircuit className="text-primary animate-pulse" />
            <h3 className="font-bold text-white text-md font-headline-sm">AI Recommendation Engine</h3>
            <span className="ml-auto text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 font-mono-sm">ACTIVE</span>
          </div>

          <div className="flex-1 relative z-10 flex flex-col justify-center space-y-4">
            <p className="text-sm leading-relaxed text-on-surface">
              <span className="text-white font-bold">Analysis:</span> The system has detected a consistent pattern of after-hours logins extending past 10:00 PM for the last 3 consecutive days, combined with a 45% increase in weekend VPN activity. This behavioral signature strongly correlates with high burnout risk and potential security oversight due to fatigue.
            </p>
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
              <ShieldAlert className="text-error shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-error uppercase mb-1">Recommended Action</h4>
                <p className="text-xs text-on-surface-variant">Enforce mandatory cool-down period. Temporarily revoke non-essential VPN access outside of core business hours (9AM-6PM). Schedule a mandatory check-in with the employee's line manager.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Activity Graph */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-lg rounded-xl h-[350px] flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <h3 className="font-bold text-white text-sm font-headline-sm">Weekly Working Hours</h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/80"></span> Core</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error/80"></span> Overtime</span>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: "#ffffff05" }}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#ffffff20", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="hours" stackId="a" fill="#3b82f6" fillOpacity={0.8} radius={[0, 0, 4, 4]} name="Core Hours" />
                <Bar dataKey="afterHours" stackId="a" fill="#ef4444" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="After Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Working Hours Timeline */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-lg rounded-xl h-[350px] flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <h3 className="font-bold text-white text-sm font-headline-sm">24H Activity Timeline</h3>
            </div>
            <span className="text-[10px] text-on-surface-variant font-mono-sm uppercase">Last 24 Hours</span>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#ffffff20", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="activity" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorActivity)" 
                  name="Activity Volume"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Abnormal Activity List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-lg rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-primary" />
            <h3 className="font-bold text-white text-sm font-headline-sm">Recent Abnormal Activity</h3>
          </div>
        </div>

        <div className="space-y-3">
          {abnormalEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  event.severity === 'high' ? 'bg-error/20 text-error' :
                  event.severity === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-primary/20 text-primary'
                }`}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{event.label}</h4>
                  <p className="text-xs text-on-surface-variant font-mono-sm mt-0.5">{event.time}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono-sm uppercase border ${
                event.severity === 'high' ? 'bg-error/10 text-error border-error/20' :
                event.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                'bg-primary/10 text-primary border-primary/20'
              }`}>
                {event.severity}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
