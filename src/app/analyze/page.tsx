'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InputTabs } from '@/components/analyzer/InputTabs';
import { ShieldCheck, Info, Loader2 } from 'lucide-react';

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get('preset') || undefined;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
          <span>Forensic Evidence Engine</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          Verify Before You Share
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Submit an article text, web URL, or viral claim to generate an explainable evidence dossier synthesising verified fact-checks, global coverage, and rhetorical signals.
        </p>
      </div>

      {/* Input Tabs & Multi-Step Verification Form */}
      <InputTabs initialPresetId={presetId} />

      {/* Epistemic Transparency Callout */}
      <div className="max-w-3xl mx-auto p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-3">
        <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            How VeriLens Analyzes Submissions
          </p>
          <p className="leading-relaxed">
            VeriLens does not rely solely on linguistic style or AI hunches. It extracts declarative claims, queries the Google Fact Check Tools API across accredited fact-checkers (Reuters, AFP, PolitiFact, Snopes), correlates independent reporting via GDELT 2.0, inspects security protocols, and evaluates rhetorical sensationalism.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
