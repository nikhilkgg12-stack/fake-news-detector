'use client';

import React from 'react';
import { FactCheckItem, NormalizedFactCheckRating } from '@/types';
import { CheckCheck, ExternalLink, AlertTriangle, ShieldCheck, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FactCheckSectionProps {
  factChecks: FactCheckItem[];
}

export function FactCheckSection({ factChecks }: FactCheckSectionProps) {
  const getRatingBadge = (rating: NormalizedFactCheckRating, rawText: string) => {
    switch (rating) {
      case 'false':
        return {
          icon: XCircle,
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        };
      case 'mostly_false':
      case 'misleading':
        return {
          icon: AlertTriangle,
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'mostly_true':
      case 'true':
        return {
          icon: ShieldCheck,
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'unproven':
      case 'mixture':
      default:
        return {
          icon: HelpCircle,
          color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans flex items-center space-x-2">
            <CheckCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span>Verified Fact-Check Evidence</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Matching investigations indexed via Google Fact Check Tools API
          </p>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {factChecks.length} Match{factChecks.length === 1 ? '' : 'es'} Found
        </span>
      </div>

      {factChecks.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
          <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No matching fact-check results were available
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No accredited fact-checking organization has published a verified determination for this exact claim phrasing. VeriLens continues the assessment using cross-source corroboration and linguistic signals.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {factChecks.map((item) => {
            const badge = getRatingBadge(item.normalizedRating, item.ratingText);
            const Icon = badge.icon;

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wide">
                      {item.publisher}
                    </span>
                    {item.reviewDate && (
                      <span className="text-[11px] text-slate-400">
                        • {item.reviewDate}
                      </span>
                    )}
                  </div>

                  {/* Rating Tag */}
                  <div className={cn('inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border', badge.color)}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>Rating: {item.ratingText}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Claim Evaluated:</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    &ldquo;{item.claim}&rdquo;
                  </p>
                  {item.claimant && (
                    <p className="text-xs text-slate-500">
                      Attributed Claimant: <span className="italic">{item.claimant}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    <span>Read Full Investigation on {item.publisher}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
