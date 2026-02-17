"use client";

import { motion } from "framer-motion";
import { 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Quote,
  ArrowRight
} from "lucide-react";

interface SourceResultsProps {
  tasks: any[];
}

export function SourceResults({ tasks }: SourceResultsProps) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <section className="space-y-8 pt-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Individual Source Deep-Dive</h2>
        <p className="text-zinc-500">Granular extractions and reliability signals for each processed URL.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {tasks.map((task, i) => (
          <motion.div 
            key={task.taskId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300"
          >
            {/* Source Header */}
            <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2 truncate max-w-md">
                    {new URL(task.url).hostname}
                    <a href={task.url} target="_blank" className="text-zinc-400 hover:text-indigo-600">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      task.data.reliability === 'High' ? 'bg-emerald-100 text-emerald-700' :
                      task.data.reliability === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {task.data.reliability} Reliability
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Identity Preserved
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <span className="text-zinc-500">Tokens:</span>
                  <span className="font-mono font-bold text-indigo-500">{task.metadata.tokensUsed}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 md:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-800">
                {/* Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Extracted Summary</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {task.data.summary}
                  </p>
                </div>

                {/* Snippets */}
                {task.data.snippets && task.data.snippets.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                      <Quote className="w-3 h-3" /> Verified Snippets
                    </h4>
                    <div className="space-y-2">
                      {task.data.snippets.map((snippet: string, idx: number) => (
                        <div key={idx} className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border-l-4 border-indigo-400 dark:border-indigo-600 text-[13px] text-zinc-700 dark:text-zinc-300 italic">
                          &quot;{snippet}&quot;
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 space-y-6 bg-zinc-50/30 dark:bg-zinc-900/30">
                {/* Key Points */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Key Takeaways</h4>
                  <div className="space-y-2">
                    {task.data.keyPoints.map((point: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-[13px] text-zinc-600 dark:text-zinc-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Claims */}
                {task.data.claims && task.data.claims.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Specific Claims</h4>
                    <div className="space-y-2">
                      {task.data.claims.map((claim: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-400">
                          <ArrowRight className="w-3 h-3 text-indigo-400" />
                          <span>{claim}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
