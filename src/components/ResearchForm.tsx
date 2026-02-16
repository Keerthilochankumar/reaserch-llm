"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Link as LinkIcon, Sparkles } from "lucide-react";

interface ResearchFormProps {
  onStart: (input: string) => void;
  isLoading: boolean;
}

export function ResearchForm({ onStart, isLoading }: ResearchFormProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onStart(input);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col p-4 shadow-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Tell me what you want to research... paste 5-10 URLs or just ask a question."
            className="w-full h-32 bg-transparent border-none focus:ring-0 text-lg resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2 text-zinc-500 text-sm">
              <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                <LinkIcon className="w-3 h-3" /> 5-10 URLs
              </span>
              <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                <Sparkles className="w-3 h-3" /> Groq Tiered
              </span>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Start Research
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
