"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  BarChart3,
  Clock,
  Hash,
  GitCompare,
  ArrowRightLeft
} from "lucide-react";
import { SourceResults } from "./SourceResults";

interface ResearchBriefProps {
  data: any;
}

export function ResearchBrief({ data }: ResearchBriefProps) {
  if (!data) return null;

  const { synthesis, metadata, createdAt } = data;

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-500 font-semibold tracking-wide uppercase text-xs">
          <Zap className="w-4 h-4" /> Synthesized Research Brief
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {synthesis.topicTitle}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5 border-r pr-4">
            <Clock className="w-4 h-4" /> {new Date(createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5 border-r pr-4">
            <BarChart3 className="w-4 h-4" /> {metadata.sourceCount} Sources Analyzed
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Groq Synthesis (Llama 3.3 70B)
          </span>
        </div>
        {synthesis.tags && synthesis.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {synthesis.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md text-xs flex items-center gap-1">
                <Hash className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Executive Summary */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" /> Executive Summary
        </h2>
        <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {synthesis.overallSummary}
        </div>
      </section>

      {/* Grid: Key Findings & Conflicts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Key Findings */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Key Insights
          </h2>
          <div className="space-y-4">
            {synthesis.keyPoints.map((item: any, i: number) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">{item.point}</p>
                  {item.citation && (
                    <a 
                      href={item.citation} 
                      target="_blank" 
                      className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
                    >
                      Source <ExternalLink className="w-2 h-2" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verification Checklist */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" /> What to Verify
          </h2>
          <div className="space-y-4">
            {synthesis.verificationChecklist && synthesis.verificationChecklist.length > 0 ? (
              synthesis.verificationChecklist.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                  <input type="checkbox" className="mt-1 rounded border-amber-300 text-amber-600" />
                  <span className="text-sm text-amber-900 dark:text-amber-200">{item}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm italic p-4 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
                No major inconsistencies or verification points flagged.
              </p>
            )}
          </div>
        </section>

        {/* Conflicting Claims */}
        {synthesis.conflictingClaims && synthesis.conflictingClaims.length > 0 && (
          <section className="lg:col-span-2 bg-indigo-50/50 dark:bg-indigo-900/5 border border-indigo-100 dark:border-indigo-900/20 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <GitCompare className="w-48 h-48 text-indigo-500" />
            </div>
            
            <header className="mb-10 relative">
              <h2 className="text-3xl font-black flex items-center gap-4 text-indigo-950 dark:text-indigo-50">
                <ArrowRightLeft className="w-8 h-8 text-indigo-600" /> Compare & Conflict
              </h2>
              <p className="text-indigo-600/60 dark:text-indigo-400/60 text-sm mt-2 font-medium">Cross-source contradiction analysis and claim verification.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {synthesis.conflictingClaims.map((claim: any, i: number) => (
                <div key={`${claim.topic}-${i}`} className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-indigo-100 dark:border-indigo-900/10 space-y-6">
                  <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-widest rounded-full w-fit">
                    Topic: {claim.topic}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> View A
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium capitalize">
                        {claim.claimA}
                      </p>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 relative">
                       <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-white dark:bg-zinc-900 px-2 text-[10px] font-black text-zinc-400">VS</span>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> View B
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium capitalize">
                        {claim.claimB}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800 text-[10px] text-zinc-400 truncate italic">
                    Referenced in: {claim.urls}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Source Audit */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-500" /> Source Audit & Reliability
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {synthesis.sourceUsage.map((source: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase">
                  Reliability: 
                  <span className={`px-2 py-0.5 rounded-full ${
                    source.reliability === 'High' ? 'bg-emerald-100 text-emerald-700' : 
                    source.reliability === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {source.reliability}
                  </span>
                </div>
                <a href={source.url} target="_blank" className="text-zinc-400 hover:text-indigo-500 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1 truncate">{source.url}</p>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic border-l-2 border-indigo-200 dark:border-indigo-900 pl-3">
                   "{source.contribution}"
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Individual Source Deep-Dive */}
      {data.tasks && <SourceResults tasks={data.tasks} />}
      
      {/* Detailed Analysis (Raw Text) */}
      <section className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 md:p-16 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
        
        <header className="relative space-y-4 mb-12">
          <div className="h-1 w-20 bg-indigo-600 rounded-full" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-4">
            <FileText className="w-8 h-8 text-indigo-600" /> Brief Narrative Analysis
          </h2>
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-[0.2em]">
            Synthesized Research Report • {new Date(createdAt).getFullYear()}
          </p>
        </header>

        <div className="relative max-w-none prose prose-indigo dark:prose-invert">
          <div className="text-zinc-700 dark:text-zinc-300 leading-[2.2rem] space-y-10 text-xl tracking-tight font-[450]">
            {synthesis.detailedAnalysis.split('\n\n').map((para: string, idx: number) => (
              <p key={idx} className="first-letter:text-5xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-3 first-letter:float-left first-letter:leading-[1] first-letter:mt-1 drop-shadow-sm">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Tags Footer */}
        {synthesis.tags && synthesis.tags.length > 0 && (
          <div className="relative mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-3">
             {synthesis.tags.map((tag: string) => (
               <span key={tag} className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 rounded-2xl text-sm font-semibold border border-zinc-100 dark:border-zinc-800">
                 #{tag}
               </span>
             ))}
          </div>
        )}
      </section>
    </div>
  );
}
