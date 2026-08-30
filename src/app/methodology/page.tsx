import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ShieldCheck,
  Database,
  Globe,
  Lock,
  Sparkles,
  AlertTriangle,
  Scale,
  CheckCircle2,
  FileCheck,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { SCORING_CONFIG } from '@/lib/scoring/config';

export default function MethodologyPage() {
  const { weights, thresholds } = SCORING_CONFIG;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Epistemic Architecture & Methodology</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          How VeriLens Analyzes Evidence
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Our mathematical scoring system, data integrations, and explicit boundaries for automated misinformation detection.
        </p>
      </div>

      {/* Core Epistemic Philosophy */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-slate-900 dark:text-white">
          <Scale className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold font-sans">Zero-Certainty Verifiable Standard</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Misinformation cannot be reliably detected by evaluating writing style alone or asking a black-box AI model whether a statement is &ldquo;true&rdquo;. Language patterns can mislead: factual journalism may use vivid language, while sophisticated disinformation frequently mimics clinical editorial prose.
        </p>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          VeriLens adheres to a strict <strong>layered evidence model</strong>. We require external verification consensus, multi-source corroboration, and cryptographic source security before assigning credibility labels, and we calibrated every output to reflect uncertainty rather than artificial certainty.
        </p>
      </div>

      {/* Configurable Mathematical Scoring Weights */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span>Weighting Configuration & Formulas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured in <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">src/lib/scoring/config.ts</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 pr-4 font-semibold">Forensic Dimension</th>
                <th className="py-3 px-3 font-semibold">Weight</th>
                <th className="py-3 pl-4 font-semibold">Forensic Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">
                  Fact-Check Consensus
                </td>
                <td className="py-3 px-3 font-mono font-bold text-primary-600 dark:text-primary-400">
                  {Math.round(weights.factCheck * 100)}%
                </td>
                <td className="py-3 pl-4 text-slate-600 dark:text-slate-400">
                  Primary signal. Measures matching determinations from accredited fact-checkers (Reuters, AFP, PolitiFact, Snopes).
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">
                  Cross-Source Corroboration
                </td>
                <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                  {Math.round(weights.corroboration * 100)}%
                </td>
                <td className="py-3 pl-4 text-slate-600 dark:text-slate-400">
                  Measures whether independent media outlets indexed in GDELT 2.0 are concurrently reporting on the same event.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">
                  Source Security & Profile
                </td>
                <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(weights.sourceReputation * 100)}%
                </td>
                <td className="py-3 pl-4 text-slate-600 dark:text-slate-400">
                  Evaluates HTTPS validity, Google Safe Browsing malware/phishing indicators, and registered domain posture.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">
                  Linguistic Tone Restraint
                </td>
                <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                  {Math.round(weights.manipulativeLanguage * 100)}%
                </td>
                <td className="py-3 pl-4 text-slate-600 dark:text-slate-400">
                  Weak secondary warning. Detects sensationalist shock-words, panic urgency, and manipulative emotional triggers.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">
                  Attribution & Transparency
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-400">
                  {Math.round(weights.transparency * 100)}%
                </td>
                <td className="py-3 pl-4 text-slate-600 dark:text-slate-400">
                  Verifies the presence of author bylines, explicit timestamps, and primary outbound source citations.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Verdict Threshold Ranges */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
            Calibrated Verdict Thresholds (0 - 100 Index)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Likely Credible</span>
              <span className="text-slate-600 dark:text-slate-400">Composite Score ≥ {thresholds.likelyCredibleMin} & no false checks</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="font-bold text-amber-800 dark:text-amber-300 block">Potentially Misleading</span>
              <span className="text-slate-600 dark:text-slate-400">Composite Score ≤ {thresholds.potentiallyMisleadingMax} or mixed checks</span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="font-bold text-rose-800 dark:text-rose-300 block">Likely False</span>
              <span className="text-slate-600 dark:text-slate-400">Debunked fact-check or Composite ≤ {thresholds.likelyFalseMax}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Data Sources */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
          Integrated Data Sources & Technologies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
              <Database className="h-4 w-4 text-primary-500" />
              <span>Google Fact Check Tools API</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Provides structured access to ClaimReview schema data published by accredited news and fact-checking organizations worldwide that adhere to the International Fact-Checking Network (IFCN) code of principles.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
              <Globe className="h-4 w-4 text-teal-500" />
              <span>GDELT 2.0 Global News Project</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitors the world&apos;s broadcast, print, and web news in over 100 languages. Used to discover independent coverage across global media organizations without treating sheer volume as proof.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
              <Lock className="h-4 w-4 text-indigo-500" />
              <span>Google Safe Browsing API v4</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Examines submitted URLs against Google&apos;s constantly updated lists of suspected phishing, malware, and deceptive software domains. Measures website safety, not article factual truth.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Groq Cloud & Structured Synthesis</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Processes structured evidence vectors through low-temperature open-source models with strict JSON schema constraints. The AI is barred from inventing external facts or declaring absolute truth.
            </p>
          </div>
        </div>
      </div>

      {/* Limitations & Ethical Use Statement */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-4">
        <div className="flex items-center space-x-2.5 text-amber-900 dark:text-amber-300 font-bold text-base">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <span>Responsible Use & Limitations Statement</span>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-amber-950/90 dark:text-amber-200/90 leading-relaxed">
          <p>
            1. <strong>Automated tools make errors:</strong> An article may be accurate even if unindexed by fact-checkers, or may be misleading even if written in neutral language.
          </p>
          <p>
            2. <strong>Breaking News Lag:</strong> When major unexpected world events unfold, fact-checking investigations take hours or days to complete. In such cases, VeriLens will indicate &ldquo;Insufficient Evidence&rdquo; to reflect healthy epistemic uncertainty.
          </p>
          <p>
            3. <strong>Primary Source Imperative:</strong> Readers should always follow the provided links to review primary documentation, scientific peer-reviewed papers, or accredited journalistic investigations.
          </p>
        </div>
      </div>

      {/* Start CTA */}
      <div className="text-center pt-4">
        <Link
          href="/analyze"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all shadow-sm"
        >
          <span>Try VeriLens Verification</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
