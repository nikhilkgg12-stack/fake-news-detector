'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, XCircle, AlertOctagon, Gauge } from 'lucide-react';
import { ConfidenceLevel, VerdictType } from '@/types';
import { getVerdictBadgeConfig } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VerdictBannerProps {
  verdict: VerdictType;
  confidence: ConfidenceLevel;
  overallScore: number;
}

export function VerdictBanner({ verdict, confidence, overallScore }: VerdictBannerProps) {
  const config = getVerdictBadgeConfig(verdict);

  const getVerdictIcon = () => {
    switch (verdict) {
      case 'likely_credible':
        return ShieldCheck;
      case 'potentially_misleading':
        return AlertTriangle;
      case 'likely_false':
        return XCircle;
      case 'insufficient_evidence':
      default:
        return HelpCircle;
    }
  };

  const Icon = getVerdictIcon();

  const getConfidenceConfig = () => {
    switch (confidence) {
      case 'high':
        return { label: 'High Confidence', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-300' };
      case 'medium':
        return { label: 'Medium Confidence', color: 'text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 border-amber-300' };
      case 'low':
      default:
        return { label: 'Low Confidence', color: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300' };
    }
  };

  const conf = getConfidenceConfig();

  return (
    <div className="w-full space-y-3 animate-fade-in">
      {/* Primary Verdict Card */}
      <div
        className={cn(
          'p-6 sm:p-8 rounded-2xl border transition-all relative overflow-hidden',
          config.bg,
          config.border
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Automated Forensic Determination
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full border', conf.color)}>
                {conf.label}
              </span>
            </div>

            <div className="flex items-start sm:items-center space-x-3.5">
              <div className={cn('p-2.5 rounded-xl text-white shadow-sm mt-0.5 sm:mt-0', config.dot)}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h1 className={cn('text-2xl sm:text-3xl font-bold tracking-tight font-sans', config.text)}>
                  {config.label}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-normal">
                  {config.description}
                </p>
              </div>
            </div>
          </div>

          {/* Composite Index Score Indicator */}
          <div className="flex sm:flex-row lg:flex-col items-start lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <Gauge className="h-4 w-4" />
              <span>Evidence Composite</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
                {overallScore}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">/100</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-factor weighted index
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Mandatory Universal Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-center space-x-3">
        <AlertOctagon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="leading-snug">
          <strong>Mandatory Epistemic Disclaimer:</strong> This is an automated evidence assessment, not a final determination of truth. Machine algorithms can misinterpret context. Always cross-verify with accredited primary sources before forming conclusions.
        </p>
      </div>
    </div>
  );
}
