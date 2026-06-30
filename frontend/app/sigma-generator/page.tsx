"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SigmaRuleGenerator() {
  const [ruleData, setRuleData] = useState({
    ip_address: "",
    domain: "",
    url: "",
    cve_id: "",
    threat_actor: "",
    attack_description: "",
  });

  const [generatedRule, setGeneratedRule] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRuleData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/generators/sigma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
      });
      if (!response.ok) {
        throw new Error("Failed to generate rule");
      }
      const data = await response.json();
      setGeneratedRule(data.rule);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRuleData({
      ip_address: "",
      domain: "",
      url: "",
      cve_id: "",
      threat_actor: "",
      attack_description: "",
    });
    setGeneratedRule("");
    setError("");
  };

  const handleDownload = () => {
    if (!generatedRule) return;
    const blob = new Blob([generatedRule], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sigma_rule_${Date.now()}.yml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-full flex flex-col gap-6">
      <div className="flex items-center justify-between z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Sigma Rule Generator</h1>
          <p className="text-on-surface-variant max-w-2xl text-sm">
            Generate AI-powered Sigma rules for SIEM platforms from threat intelligence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface-container-low border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/5 pb-2">Threat Information</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">IP Address</label>
                <input 
                  type="text" name="ip_address" value={ruleData.ip_address} onChange={handleInputChange}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., 192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Domain</label>
                <input 
                  type="text" name="domain" value={ruleData.domain} onChange={handleInputChange}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., malicious.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">URL</label>
                <input 
                  type="text" name="url" value={ruleData.url} onChange={handleInputChange}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., http://malicious.com/payload.exe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">CVE ID</label>
                <input 
                  type="text" name="cve_id" value={ruleData.cve_id} onChange={handleInputChange}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., CVE-2023-12345"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Threat Actor</label>
              <input 
                type="text" name="threat_actor" value={ruleData.threat_actor} onChange={handleInputChange}
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., APT29"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Attack Description</label>
              <textarea 
                name="attack_description" value={ruleData.attack_description} onChange={handleInputChange} rows={3}
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                placeholder="Describe the attack vectors and behaviors..."
              />
            </div>

            <div className="pt-4 flex gap-3 border-t border-white/5">
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-surface font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <span className="animate-spin material-symbols-outlined text-sm">sync</span> : <span className="material-symbols-outlined text-sm">generating_tokens</span>}
                {loading ? "Generating..." : "Generate Rule"}
              </button>
              <button 
                onClick={handleClear}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                Clear Form
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">code</span>
              Generated YAML
            </h2>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white rounded transition-colors"
                onClick={() => navigator.clipboard.writeText(generatedRule)}
                disabled={!generatedRule}
              >
                Copy
              </button>
              <button 
                className="px-3 py-1 bg-primary/20 hover:bg-primary/30 text-xs font-semibold text-primary rounded transition-colors disabled:opacity-50"
                onClick={handleDownload}
                disabled={!generatedRule}
              >
                Download .yml
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-transparent overflow-y-auto">
            {error ? (
              <div className="text-red-400 text-sm p-4 bg-red-400/10 rounded-lg border border-red-400/20">
                <p className="font-semibold mb-1">Generation Failed</p>
                <p>{error}</p>
              </div>
            ) : generatedRule ? (
              <pre className="text-sm font-mono text-[#a6e22e] whitespace-pre-wrap leading-relaxed">
                {generatedRule}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant text-sm flex-col gap-3 opacity-50">
                <span className="material-symbols-outlined text-4xl">description</span>
                <p>Fill out the form and click Generate to see the Sigma rule here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
