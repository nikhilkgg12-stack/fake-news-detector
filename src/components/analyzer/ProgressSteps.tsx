'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, Database, Globe, ShieldAlert, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  {
    id: 1,
    label: 'Extracting core claims',
    sublabel: 'Isolating declarative statements and verifiable propositions',
    icon: Sparkles,
  },
  {
    id: 2,
    label: 'Searching verified fact-checks',
    sublabel: 'Querying Google Fact Check Tools database across accredited publishers',
    icon: Database,
  },
  {
    id: 3,
    label: 'Finding related reporting',
    sublabel: 'Cross-referencing global news coverage via GDELT 2.0',
    icon: Globe,
  },
  {
    id: 4,
    label: 'Evaluating language & source signals',
    sublabel: 'Scanning for emotional manipulation, sensationalism, and attribution signals',
    icon: ShieldAlert,
  },
  {
    id: 5,
    label: 'Preparing the evidence report',
    sublabel: 'Synthesizing forensic findings into an explainable dossier',
    icon: FileText,
  },
];

interface ProgressStepsProps {
  isAnalyzing: boolean;
}

export function ProgressSteps({ isAnalyzing }: ProgressStepsProps) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(1);
      return;
    }

    // Step through each phase smoothly
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-spin" />
          <span className="font-semibold text-sm text-slate-900 dark:text-white">
            Running Layered Verification Pipeline...
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500">
          Step {Math.min(currentStep, 5)} of 5
        </span>
      </div>

      <div className="space-y-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-start space-x-3.5 p-3 rounded-lg transition-all duration-300',
                isCurrent && 'bg-primary-50/60 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 scale-[1.01]',
                isDone && 'opacity-85',
                isPending && 'opacity-40'
              )}
            >
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                    {step.id}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isCurrent
                        ? 'text-primary-600 dark:text-primary-400'
                        : isDone
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                    )}
                  />
                  <p
                    className={cn(
                      'text-sm font-medium leading-none',
                      isCurrent
                        ? 'text-primary-950 dark:text-primary-100 font-semibold'
                        : isDone
                        ? 'text-slate-900 dark:text-slate-200'
                        : 'text-slate-500'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
