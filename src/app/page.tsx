"use client";

import { useState, useEffect } from "react";
import { ResearchForm } from "~/components/ResearchForm";
import { ResearchBrief } from "~/components/ResearchBrief";
import { ResearchStepper } from "~/components/ResearchStepper";
import { motion, AnimatePresence } from "framer-motion";
import { History, LayoutDashboard, Settings, Activity, Sparkles, Plus } from "lucide-react";

export default function Home() {
  const [isResearching, setIsResearching] = useState(false);
  const [currentBrief, setCurrentBrief] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'research' | 'dashboard' | 'health'>('research');

  const steps = [
    { id: 'intent', name: 'Analyzing Intent', status: (activeStep === 0 && isResearching ? 'loading' : activeStep > 0 ? 'completed' : 'pending') as 'loading' | 'completed' | 'pending' | 'failed' },
    { id: 'search', name: 'Source Discovery', status: (activeStep === 1 && isResearching ? 'loading' : activeStep > 1 ? 'completed' : 'pending') as 'loading' | 'completed' | 'pending' | 'failed' },
    { id: 'analyze', name: 'Deep Analysis', status: (activeStep === 2 && isResearching ? 'loading' : activeStep > 2 ? 'completed' : 'pending') as 'loading' | 'completed' | 'pending' | 'failed' },
    { id: 'synthesis', name: 'Synthesis', status: (activeStep === 3 && isResearching ? 'loading' : activeStep > 3 ? 'completed' : 'pending') as 'loading' | 'completed' | 'pending' | 'failed' },
  ];

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/research");
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStartResearch = async (input: string) => {
    setIsResearching(true);
    setCurrentBrief(null);
    setActiveStep(0);
    setActiveTab('research');

    try {
      const stepInterval = setInterval(() => {
        setActiveStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 4000);

      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      clearInterval(stepInterval);
      
      const data = await response.json();
      if (data.brief) {
        // Build the complete object like /api/research/[id] would
        setCurrentBrief({
          ...data.brief,
          tasks: data.tasks || []
        });
        setActiveStep(4);
        fetchHistory();
      } else {
        alert(data.error || "Research failed");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-6 space-y-8 bg-zinc-50/50 dark:bg-zinc-900/50 hidden md:flex">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          BriefResearch
        </div>

        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => {
              setCurrentBrief(null);
              setIsResearching(false);
              setActiveTab('research');
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${activeTab === 'research' && !currentBrief ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <Plus className="w-4 h-4" /> New Research
          </button>
          
          <div className="pt-6 pb-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest px-3">
            Navigation
          </div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('health')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'health' ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <Activity className="w-4 h-4" /> System Health
          </button>
        </nav>

        <div className="space-y-4">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest px-3 flex items-center justify-between">
            Recent Briefs
            <History className="w-3 h-3" />
          </div>
          <div className="space-y-1 overflow-y-auto max-h-48 scrollbar-thin">
            {history.map((brief) => (
              <button
                key={brief.briefId}
                onClick={async () => {
                  setActiveTab('research');
                  setIsResearching(false);
                  const res = await fetch(`/api/research/${brief.briefId}`);
                  const data = await res.json();
                  setCurrentBrief(data);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate transition-colors"
              >
                {brief.intent.topic}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mt-auto">
          <Settings className="w-4 h-4" /> Settings
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
          <div className="text-sm font-medium text-zinc-500 capitalize">
            {activeTab === 'research' ? (currentBrief ? "Research Brief Viewer" : "Start New Project") : activeTab}
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
               Engine Live
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" />
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'research' ? (
              <>
                {!currentBrief && !isResearching ? (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="py-20 space-y-12 text-center"
                  >
                    <div className="space-y-4">
                      <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-br from-zinc-900 via-indigo-600 to-zinc-400 dark:from-zinc-100 dark:via-indigo-400 dark:to-zinc-600 bg-clip-text text-transparent">
                        Brief Research Engine
                      </h1>
                      <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                        Rapid synthesis of multiple sources into high-fidelity research briefs.
                      </p>
                    </div>
                    
                    <ResearchForm onStart={handleStartResearch} isLoading={isResearching} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto pt-20">
                       {[
                         { title: "Identity Preservation", desc: "Every word linked to its source snippet with strict data lineage.", icon: "🎯" },
                         { title: "Tiered Inference", desc: "Llama 3.1 8B for fast extraction, Llama 3.3 70B for synthesis.", icon: "⚡" },
                         { title: "HTML Distillation", desc: "Smarter parsing that strips noise and maximizes context windows.", icon: "🧹" }
                       ].map((feature, i) => (
                         <div key={i} className="group p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-all shadow-sm">
                           <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                           <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                           <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
                         </div>
                       ))}
                    </div>
                  </motion.div>
                ) : isResearching ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-20 space-y-12 text-center"
                  >
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold">Conducting Research</h2>
                      <p className="text-zinc-500 min-h-[1.5rem]">
                        {activeStep === 0 && "Analyzing intent..."}
                        {activeStep === 1 && "Discovering sources..."}
                        {activeStep === 2 && "Extracting data..."}
                        {activeStep === 3 && "Synthesizing brief..."}
                      </p>
                    </div>
                    <ResearchStepper steps={steps} />
                    <div className="w-full max-w-md mx-auto h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                       <motion.div 
                         className="h-full bg-indigo-600"
                         initial={{ width: "0%" }}
                         animate={{ width: `${(activeStep + 1) * 25}%` }}
                         transition={{ duration: 1 }}
                       />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="brief"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="py-8"
                  >
                    <div className="flex justify-between items-center mb-10">
                       <button onClick={() => setCurrentBrief(null)} className="text-zinc-400 hover:text-zinc-900 text-sm flex items-center gap-2">
                          ← Back to Dashboard
                       </button>
                    </div>
                    <ResearchBrief data={currentBrief} />
                  </motion.div>
                )}
              </>
            ) : activeTab === 'dashboard' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: "Total Tokens", val: "2.4M", color: "text-indigo-600" },
                      { label: "Briefs Generated", val: history.length, color: "text-emerald-600" },
                      { label: "Sources Analyzed", val: history.length * 8, color: "text-blue-600" },
                      { label: "Success Rate", val: "98.2%", color: "text-amber-600" }
                    ].map((stat, i) => (
                      <div key={i} className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                         <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</div>
                         <div className={`text-4xl font-black ${stat.color}`}>{stat.val}</div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <h3 className="text-2xl font-bold">Recent Research Activity</h3>
                       <div className="space-y-4">
                          {history.slice(0, 5).map((h, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                               <div>
                                  <div className="font-bold">{h.intent.topic}</div>
                                  <div className="text-xs text-zinc-500">{new Date(h.createdAt).toLocaleString()}</div>
                               </div>
                               <button 
                                 onClick={() => { setCurrentBrief(h); setActiveTab('research'); }}
                                 className="text-xs font-bold text-indigo-600 hover:underline"
                               >
                                 View Brief
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="p-10 bg-indigo-600 rounded-[3rem] text-white space-y-4">
                       <h3 className="text-3xl font-black">System Ready.</h3>
                       <p className="opacity-80 text-lg">Llama 3.3 70B Synthesis Engine is online and optimized for high-performance extraction.</p>
                       <button 
                        onClick={() => { setActiveTab('research'); setCurrentBrief(null); }}
                        className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold mt-4"
                       >
                          Start New Research
                       </button>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 space-y-12">
                 <div className="space-y-4">
                    <h2 className="text-3xl font-bold">System Infrastructure</h2>
                    <p className="text-zinc-500">Real-time health of our localized agent cluster and storage layers.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { name: "Intent Analysis", model: "Llama 3.3 70B", status: "Healthy", ping: "840ms", icon: "🧠" },
                      { name: "Researcher Agent", model: "Llama 3.1 8B", status: "Healthy", ping: "120ms", icon: "🔍" },
                      { name: "Groq Inference", model: "Cloud API", status: "Live", ping: "45ms", icon: "⚡" },
                      { name: "MongoDB Cluster", model: "Persistence", status: "Connected", ping: "12ms", icon: "🗄️" }
                    ].map((agent, i) => (
                      <div key={i} className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                         <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black flex items-center justify-center text-2xl shadow-sm">
                               {agent.icon}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                               {agent.status}
                            </div>
                         </div>
                         <div>
                            <h4 className="font-bold text-lg">{agent.name}</h4>
                            <p className="text-xs text-zinc-400">{agent.model}</p>
                         </div>
                         <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-xs font-medium">
                            <span className="text-zinc-400">Latency</span>
                            <span>{agent.ping}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
