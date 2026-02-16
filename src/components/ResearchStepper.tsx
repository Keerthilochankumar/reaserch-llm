"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

interface Step {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'completed' | 'failed';
}

interface ResearchStepperProps {
  steps: Step[];
}

export function ResearchStepper({ steps }: ResearchStepperProps) {
  return (
    <div className="w-full max-w-xl mx-auto py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 dark:bg-zinc-800 -translate-y-1/2 -z-10" />
        
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-black px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
              step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
              step.status === 'loading' ? 'bg-indigo-600 border-indigo-600 text-white' :
              'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}>
              {step.status === 'completed' ? (
                <Check className="w-5 h-5" />
              ) : step.status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-sm font-bold">{i + 1}</span>
              )}
            </div>
            <span className={`text-xs font-medium ${
              step.status === 'loading' ? 'text-indigo-600 dark:text-indigo-400' : 
              step.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 
              'text-zinc-500'
            }`}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
