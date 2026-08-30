'use client';

import React from 'react';
import { AISynthesisReport } from '@/types';
import { Bot, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AISynthesisSectionProps {
  synthesis: AISynthesisReport;
}

export function AISynthesisSection({ synthesis }: AISynthesisSectionProps) {
  const { summary, key_findings, limitations, recommended_next_steps, isAIGenerated, modelUsed } = synthesis;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span>Forensic Evidence Synthesis</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Objective, plain-language breakdown grounded strictly on structured forensic findings
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 flex items-center space-x-1.5">
            <Sparkles className="h-3 w-3" />
            <span>{modelUsed || (isAIGenerated ? 'Groq Llama-3.1' : 'Deterministic Forensic Model')}</span>
          </span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Executive Evidence Summary
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-normal">
          {summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Findings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Key Evidence Findings</span>
          </h3>
          <ul className="space-y-2.5">
            {key_findings.map((finding, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/70 flex items-start space-x-2.5 leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Next Steps */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
            <ArrowRight className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span>Recommended Next Steps For Reader</span>
          </h3>
          <ul className="space-y-2.5">
            {recommended_next_steps.map((step, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/70 flex items-start space-x-2.5 leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Limitations of Analysis */}
      <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Known Limitations of This Assessment</span>
        </h3>
        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
          {limitations.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
