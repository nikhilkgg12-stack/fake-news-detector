'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calculator, CheckCheck, HelpCircle, Shield, Sparkles, UserCheck } from 'lucide-react';
import { CalculationDetails, DimensionScores } from '@/types';
import { cn } from '@/lib/utils';

interface ScoreBreakdownProps {
  dimensionScores: DimensionScores;
  calculationDetails: CalculationDetails;
}

export function ScoreBreakdown({ dimensionScores, calculationDetails }: ScoreBreakdownProps) {
  const [isFormulaExpanded, setIsFormulaExpanded] = useState(false);

  const dimensions = [
    {
      name: 'Fact-Check Consensus',
      score: Math.max(0, Math.min(100, Math.round((dimensionScores.factCheckScore + 100) / 2))),
      rawLabel: dimensionScores.factCheckScore === 0 ? 'Neutral / No Match' : `${dimensionScores.factCheckScore > 0 ? '+' : ''}${dimensionScores.factCheckScore} pts`,
      weight: '45%',
      icon: CheckCheck,
      description: 'Weighted consensus of matching verified fact-checks from accredited IFCN publishers.',
      color: dimensionScores.factCheckScore > 30 ? 'bg-emerald-500' : dimensionScores.factCheckScore < -20 ? 'bg-rose-500' : 'bg-slate-400',
    },
    {
      name: 'Cross-Source Corroboration',
      score: dimensionScores.corroborationScore,
      rawLabel: `${dimensionScores.corroborationScore}/100`,
      weight: '20%',
      icon: HelpCircle,
      description: 'Volume and diversity of independent reporting across global media indexes via GDELT 2.0.',
      color: dimensionScores.corroborationScore >= 70 ? 'bg-emerald-500' : dimensionScores.corroborationScore >= 40 ? 'bg-amber-500' : 'bg-slate-400',
    },
    {
      name: 'Source Technical Profile',
      score: dimensionScores.sourceReputationScore,
      rawLabel: `${dimensionScores.sourceReputationScore}/100`,
      weight: '15%',
      icon: Shield,
      description: 'HTTPS encryption, Google Safe Browsing malware/phishing signals, and domain posture.',
      color: dimensionScores.sourceReputationScore >= 75 ? 'bg-emerald-500' : dimensionScores.sourceReputationScore >= 50 ? 'bg-amber-500' : 'bg-rose-500',
    },
    {
      name: 'Linguistic Tone Restraint',
      score: dimensionScores.manipulativeLanguageScore,
      rawLabel: `${dimensionScores.manipulativeLanguageScore}/100`,
      weight: '10%',
      icon: Sparkles,
      description: 'Absence of sensationalist shock-words, panic urgency, and cognitive manipulation tactics.',
      color: dimensionScores.manipulativeLanguageScore >= 70 ? 'bg-emerald-500' : dimensionScores.manipulativeLanguageScore >= 40 ? 'bg-amber-500' : 'bg-rose-500',
    },
    {
      name: 'Attribution & Transparency',
      score: dimensionScores.transparencyScore,
      rawLabel: `${dimensionScores.transparencyScore}/100`,
      weight: '10%',
      icon: UserCheck,
      description: 'Presence of verifiable author bylines, publication timestamps, and cited outbound links.',
      color: dimensionScores.transparencyScore >= 70 ? 'bg-emerald-500' : dimensionScores.transparencyScore >= 40 ? 'bg-amber-500' : 'bg-slate-400',
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans flex items-center space-x-2">
            <span>Explainable Score Breakdown</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            5 transparent forensic pillars contributing to the composite index
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormulaExpanded(!isFormulaExpanded)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <Calculator className="h-3.5 w-3.5" />
          <span>{isFormulaExpanded ? 'Hide Calculation Math' : 'How This Score Was Calculated'}</span>
          {isFormulaExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* 5 Dimensional Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          return (
            <div key={dim.name} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dim.name}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">({dim.weight})</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {dim.rawLabel}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={cn('h-full transition-all duration-500 rounded-full', dim.color)}
                  style={{ width: `${Math.max(4, dim.score)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {dim.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Expandable Calculation Mathematics Box */}
      {isFormulaExpanded && (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Transparent Mathematical Breakdown
            </h4>
            <span className="text-[11px] font-mono text-slate-500">Config: src/lib/scoring/config.ts</span>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
            {calculationDetails.formulaDescription}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Dimension</th>
                  <th className="py-2 px-3 font-medium">Weight</th>
                  <th className="py-2 px-3 font-medium">Dimension Score</th>
                  <th className="py-2 px-3 font-medium">Weighted Points</th>
                  <th className="py-2 pl-4 font-medium">Forensic Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {calculationDetails.dimensionBreakdowns.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-4 font-semibold text-slate-900 dark:text-white">
                      {item.dimension}
                    </td>
                    <td className="py-2 px-3 font-mono">{Math.round(item.weight * 100)}%</td>
                    <td className="py-2 px-3 font-mono">{item.score}/100</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      +{item.weightedContribution}
                    </td>
                    <td className="py-2 pl-4 text-slate-600 dark:text-slate-400">
                      {item.rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            <strong>Confidence Formulation:</strong> {calculationDetails.confidenceCalculationRationale}
          </div>
        </div>
      )}
    </div>
  );
}
