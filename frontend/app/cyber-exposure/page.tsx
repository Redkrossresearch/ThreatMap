"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CyberExposurePage() {
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const [levelInfo, setLevelInfo] = useState({ text: "Low", color: "text-green-500", shadow: "shadow-green-500/50" });
  const [breakdown, setBreakdown] = useState({ publicIps: 0, openPorts: 0, leakedCreds: 0, vulnServices: 0 });
  const [systems, setSystems] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch summary and assets
      const summaryRes = await fetch("http://localhost:8000/api/v1/cyber-exposure/summary");
      const summary = await summaryRes.json();
      
      const assetsRes = await fetch("http://localhost:8000/api/v1/cyber-exposure");
      const assets = await assetsRes.json();

      setTargetScore(summary.overall_score);
      setScore(0);
      setTimeout(() => setScore(summary.overall_score), 500);

      const getExposureLevel = (val: number) => {
        if (val <= 30) return { text: "Critical", color: "text-red-500", shadow: "shadow-red-500/50" };
        if (val <= 70) return { text: "Medium", color: "text-yellow-500", shadow: "shadow-yellow-500/50" };
        if (val <= 90) return { text: "High", color: "text-orange-500", shadow: "shadow-orange-500/50" };
        return { text: "Low", color: "text-green-500", shadow: "shadow-green-500/50" };
      };
      setLevelInfo(getExposureLevel(summary.overall_score));

      setBreakdown({
        publicIps: summary.breakdown?.public_ips || 0,
        openPorts: summary.breakdown?.open_ports || 0,
        leakedCreds: summary.breakdown?.leaked_credentials || 0,
        vulnServices: summary.breakdown?.vulnerable_services || 0
      });

      // Parse assets for Top Exposed Systems and Recommendations
      const sysList = assets.slice(0, 4).map((a: any) => ({
        ip: a.ip_address || "N/A",
        name: a.asset_name,
        risk: a.exposure_level,
        ports: a.open_ports ? a.open_ports.join(", ") : "None"
      }));
      setSystems(sysList);

      const recList = assets.filter((a: any) => a.vulnerability_count > 0).slice(0, 3).map((a: any) => ({
        title: `Patch ${a.asset_name}`,
        desc: a.ai_recommendation,
        icon: a.exposure_level === "Critical" ? "lock_open" : "security_update_warning",
        color: a.exposure_level === "Critical" ? "text-red-400" : "text-orange-400"
      }));
      if (recList.length === 0) {
        recList.push({ title: "All Secure", desc: "No critical vulnerabilities found.", icon: "check_circle", color: "text-green-400" });
      }
      setRecs(recList);

    } catch (err) {
      console.error("Failed to fetch exposure data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Level info and data fetched from backend

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const mockTrendData = [45, 52, 61, 58, 65, 72, 68, 75, 72];
  const maxTrend = Math.max(...mockTrendData);

  return (
    <div className="min-h-screen text-on-surface p-4 sm:p-8 space-y-8 font-body-md overflow-hidden relative">
      {/* Background glowing orb */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-error/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black font-headline-lg tracking-tight text-white mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[32px]">admin_panel_settings</span>
              Cyber Exposure Index
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-sm">
              Real-time analysis of your organization's digital footprint, exposed assets, and potential attack vectors.
            </p>
          </div>
          <button onClick={fetchDashboardData} disabled={loading} className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold">
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            Rescan Now
          </button>
        </motion.div>

        {/* Top Row: Score & Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Score Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-surface-container/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">speed</span>
              Index Score
            </h2>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-white/10" strokeWidth="8" fill="none" />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    className={`stroke-current ${levelInfo.color} drop-shadow-[0_0_8px_currentColor]`}
                    strokeWidth="8" fill="none"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">{score}</span>
                  <span className="text-xs text-on-surface-variant mt-1">/ 100</span>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm ${levelInfo.color} font-bold text-sm uppercase tracking-wider`}>
                {levelInfo.text} Exposure
              </div>
            </div>
          </motion.div>

          {/* Trend Graph */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-surface-container/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-colors">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">trending_up</span>
              30-Day Exposure Trend
            </h2>
            <div className="h-48 flex items-end justify-between gap-2 mt-4 px-2">
              {mockTrendData.map((val, idx) => (
                <div key={idx} className="w-full flex flex-col items-center group relative cursor-pointer">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-surface border border-white/10 text-white text-xs px-2 py-1 rounded transition-opacity">
                    {val}
                  </div>
                  <motion.div 
                    className="w-full bg-primary/20 hover:bg-primary/50 rounded-t-sm transition-colors border-t border-primary/30"
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxTrend) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-on-surface-variant px-2 border-t border-white/10 pt-4">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </motion.div>
        </div>

        {/* Middle Row: Asset Breakdown & Top Systems */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Asset Breakdown */}
          <motion.div variants={itemVariants} className="bg-surface-container/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-colors">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">pie_chart</span>
              Asset Exposure Breakdown
            </h2>
            <div className="space-y-4">
              {[
                { label: "Public IPs", val: breakdown.publicIps, max: 100, color: "bg-blue-500" },
                { label: "Open Ports", val: breakdown.openPorts, max: 200, color: "bg-purple-500" },
                { label: "Leaked Credentials", val: breakdown.leakedCreds, max: 50, color: "bg-red-500" },
                { label: "Vulnerable Services", val: breakdown.vulnServices, max: 20, color: "bg-orange-500" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">{item.label}</span>
                    <span className="text-white font-mono">{item.val}</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className={`h-full ${item.color} shadow-[0_0_10px_currentColor]`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.val / item.max) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Exposed Systems */}
          <motion.div variants={itemVariants} className="bg-surface-container/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-colors">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">dns</span>
              Top Exposed Systems
            </h2>
            <div className="space-y-3">
              {systems.length > 0 ? systems.map((sys, idx) => (
                <div key={idx} className="group p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all flex justify-between items-center cursor-pointer">
                  <div>
                    <div className="text-white text-sm font-semibold mb-1 group-hover:text-primary transition-colors">{sys.name}</div>
                    <div className="text-xs text-on-surface-variant font-mono">{sys.ip} • Ports: {sys.ports}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded border border-white/10 ${sys.risk === 'Critical' ? 'bg-red-500/20 text-red-400' : sys.risk === 'High' ? 'bg-orange-500/20 text-orange-400' : sys.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {sys.risk}
                  </div>
                </div>
              )) : (
                <div className="text-on-surface-variant text-sm">No exposed systems detected.</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: AI Recommendations */}
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/10 to-surface-container/50 backdrop-blur-md border border-primary/20 rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(77,142,255,0.15)] transition-all">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary animate-pulse">smart_toy</span>
            AI-Generated Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recs.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface/50 border border-white/5 hover:border-primary/30 transition-colors">
                <span className={`material-symbols-outlined mb-3 ${rec.color}`}>{rec.icon}</span>
                <h3 className="text-sm font-semibold text-white mb-2">{rec.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
