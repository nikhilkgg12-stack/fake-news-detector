'use client';

import React, { useState } from 'react';
import { FlaggedPhrase, LinguisticSignals } from '@/types';
import { Sparkles, AlertCircle, Info, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinguisticInspectorProps {
  rawText: string;
  linguisticSignals: LinguisticSignals;
}

export function LinguisticInspector({ rawText, linguisticSignals }: LinguisticInspectorProps) {
  const [selectedPhrase, setSelectedPhrase] = useState<FlaggedPhrase | null>(
    linguisticSignals.flaggedPhrases[0] || null
  );

  const { flaggedPhrases, totalWords, flaggedDensityPercentage, sensationalismScore } = linguisticSignals;

  // Build segmented highlighted text
  const renderHighlightedContent = () => {
    if (!flaggedPhrases || flaggedPhrases.length === 0) {
      return (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-serif text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
          {rawText}
        </div>
      );
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort phrases by start index
    const sorted = [...flaggedPhrases].sort((a, b) => a.startIndex - b.startIndex);

    sorted.forEach((item, index) => {
      // Non-highlighted text before this phrase
      if (item.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {rawText.substring(lastIndex, item.startIndex)}
          </span>
        );
      }

      const isSelected = selectedPhrase?.id === item.id;

      // Highlighted phrase span
      elements.push(
        <button
          key={`phrase-${item.id}-${index}`}
          type="button"
          onClick={() => setSelectedPhrase(item)}
          className={cn(
            'inline px-1 py-0.5 mx-0.5 rounded cursor-pointer transition-all border-b-2 font-medium text-left',
            item.category === 'urgency' && 'bg-rose-100 dark:bg-rose-950/70 border-rose-500 text-rose-900 dark:text-rose-200',
            item.category === 'sensationalism' && 'bg-amber-100 dark:bg-amber-950/70 border-amber-500 text-amber-900 dark:text-amber-200',
            item.category === 'emotional_appeal' && 'bg-orange-100 dark:bg-orange-950/70 border-orange-500 text-orange-900 dark:text-orange-200',
            item.category === 'hyperbole' && 'bg-purple-100 dark:bg-purple-950/70 border-purple-500 text-purple-900 dark:text-purple-200',
            item.category === 'absolute_assertion' && 'bg-sky-100 dark:bg-sky-950/70 border-sky-500 text-sky-900 dark:text-sky-200',
            item.category === 'clickbait' && 'bg-teal-100 dark:bg-teal-950/70 border-teal-500 text-teal-900 dark:text-teal-200',
            isSelected && 'ring-2 ring-slate-900 dark:ring-white scale-[1.02]'
          )}
          title={`Click to inspect: "${item.phrase}"`}
        >
          {rawText.substring(item.startIndex, item.endIndex)}
        </button>
      );

      lastIndex = item.endIndex;
    });

    // Remainder text after last highlight
    if (lastIndex < rawText.length) {
      elements.push(
        <span key="text-end">
          {rawText.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950 font-serif text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
        {elements}
      </div>
    );
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Interactive Linguistic & Rhetorical Inspector</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click on highlighted phrases to view forensic NLP reasoning
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {flaggedPhrases.length} flagged phrase{flaggedPhrases.length === 1 ? '' : 's'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {flaggedDensityPercentage}% flagged density
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Highlighted Text View */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Submitted Article Text</span>
            <span>{totalWords} words</span>
          </div>

          {renderHighlightedContent()}

          {flaggedPhrases.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Legend:</span>
              <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">Urgency</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">Sensationalism</span>
              <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-900">Emotional Appeal</span>
              <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900">Hyperbole</span>
              <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900">Absolute Assertion</span>
            </div>
          )}
        </div>

        {/* Right 1 Col: Selected Phrase Detail Panel */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Selected Phrase Analysis
          </h3>

          {selectedPhrase ? (
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 capitalize">
                  <Tag className="h-3 w-3 mr-1" />
                  {selectedPhrase.category.replace('_', ' ')}
                </span>

                <span
                  className={cn(
                    'text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded',
                    selectedPhrase.severity === 'high' && 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                    selectedPhrase.severity === 'medium' && 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                    selectedPhrase.severity === 'low' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  )}
                >
                  {selectedPhrase.severity} Severity
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400">Exact Matched Span:</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono mt-0.5 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                  &ldquo;{selectedPhrase.phrase}&rdquo;
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Forensic Context:</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {selectedPhrase.reason}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
              <Info className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <p>No manipulative language triggers or sensationalist phrasing detected in this content.</p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
            <strong>Methodology Note:</strong> Linguistic signals are weighted as weak secondary warnings (10% weight). Sensationalism alone is never treated as proof of falsehood.
          </div>
        </div>
      </div>
    </div>
  );
}
