import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VerdictType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getVerdictBadgeConfig(verdict: VerdictType) {
  switch (verdict) {
    case 'likely_credible':
      return {
        label: 'Likely Credible',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        description: 'Strong corroboration with multiple independent sources and no verified debunking records.',
      };
    case 'potentially_misleading':
      return {
        label: 'Potentially Misleading',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
        description: 'Contains out-of-context claims, sensationalized framing, or partial fact-check warnings.',
      };
    case 'likely_false':
      return {
        label: 'Likely False Based on Available Fact-Checks',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
        description: 'Directly contradicts verified determinations from independent fact-checking organizations.',
      };
    case 'insufficient_evidence':
    default:
      return {
        label: 'Insufficient Evidence',
        bg: 'bg-slate-50 dark:bg-slate-900/50',
        text: 'text-slate-700 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-800',
        dot: 'bg-slate-400',
        description: 'No verified fact-checks and limited independent corroboration exist for this claim.',
      };
  }
}
