'use client';

import React from 'react';
import { ExtractedClaim } from '@/types';
import { Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

interface ClaimsListProps {
  claims: ExtractedClaim[];
}

export function ClaimsList({ claims }: ClaimsListProps) {
  if (!claims || claims.length === 0) return null;

  const getCategoryBadge = (category: ExtractedClaim['category']) => {
    switch (category) {
      case 'health':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'scientific':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'political':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'economic':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary-500" />
            <span>Extracted Verifiable Claims</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key testable propositions isolated from the input text for fact-checking
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {claims.length} claim{claims.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {claims.map((claim, idx) => (
          <div
            key={claim.id || idx}
            className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  CLAIM #{idx + 1}
                </span>
                <span
                  className={`text-[10px] uppercase font-mono font-medium px-2 py-0.5 rounded-full border ${getCategoryBadge(
                    claim.category
                  )}`}
                >
                  {claim.category}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                &ldquo;{claim.text}&rdquo;
              </p>
            </div>

            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Search Vector: {claim.searchQuery}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
