'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Link2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { InputType, SamplePreset, AnalysisResult } from '@/types';
import { SAMPLE_PRESETS } from '@/lib/mock/samples';
import { ProgressSteps } from './ProgressSteps';
import { cn } from '@/lib/utils';

interface InputTabsProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
  initialPresetId?: string;
}

export function InputTabs({ onAnalysisComplete, initialPresetId }: InputTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InputType>('text');

  // Input states
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [claimContent, setClaimContent] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(initialPresetId || null);

  // Status & error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-load preset if provided
  React.useEffect(() => {
    if (initialPresetId) {
      const preset = SAMPLE_PRESETS.find((p) => p.id === initialPresetId);
      if (preset) {
        applyPreset(preset);
      }
    }
  }, [initialPresetId]);

  const applyPreset = (preset: SamplePreset) => {
    setSelectedPreset(preset.id);
    setActiveTab(preset.inputType);
    setErrorMessage(null);

    if (preset.inputType === 'text') {
      setTextContent(preset.content);
    } else if (preset.inputType === 'url') {
      setUrlContent(preset.content);
    } else {
      setClaimContent(preset.content);
    }
  };

  const getCurrentContent = () => {
    if (activeTab === 'text') return textContent;
    if (activeTab === 'url') return urlContent;
    return claimContent;
  };

  const getCharCount = () => getCurrentContent().length;
  const getWordCount = () => {
    const text = getCurrentContent().trim();
    return text ? text.split(/\s+/).length : 0;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const content = getCurrentContent().trim();
    if (!content) {
      setErrorMessage('Please enter some text, a valid URL, or a claim to analyze.');
      return;
    }

    if (activeTab === 'text' && content.length < 20) {
      setErrorMessage('Article text must be at least 20 characters for meaningful analysis.');
      return;
    }

    if (activeTab === 'url') {
      try {
        const u = content.startsWith('http') ? content : 'https://' + content;
        new URL(u);
      } catch {
        setErrorMessage('Please enter a valid web URL format (e.g. https://example.com/article).');
        return;
      }
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputType: activeTab,
          content,
          presetId: selectedPreset || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis service temporarily encountered an error.');
      }

      // Small delay to allow the 5-step animation to conclude nicely
      setTimeout(() => {
        setIsAnalyzing(false);
        if (onAnalysisComplete) {
          onAnalysisComplete(data);
        } else {
          router.push(`/report/${data.id}`);
        }
      }, 1200);
    } catch (err: unknown) {
      setIsAnalyzing(false);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during verification.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Sample Presets Quick Bar */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Try Sample Scenarios (One-Click Test)
            </span>
          </div>
          <span className="text-xs text-slate-500">Includes realistic data signals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  'text-left p-2.5 rounded-lg text-xs transition-all border',
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-slate-900 dark:border-white shadow-sm ring-1 ring-slate-900 dark:ring-white font-medium'
                    : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                )}
              >
                <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{preset.name}</span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analyzer Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              setSelectedPreset(null);
              setErrorMessage(null);
            }}
            className={cn(
              'flex-1 py-3.5 px-4 text-sm font-medium text-center flex items-center justify-center space-x-2 border-b-2 transition-colors',
              activeTab === 'text'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Paste Article / Text</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setSelectedPreset(null);
              setErrorMessage(null);
            }}
            className={cn(
              'flex-1 py-3.5 px-4 text-sm font-medium text-center flex items-center justify-center space-x-2 border-b-2 transition-colors',
              activeTab === 'url'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Link2 className="h-4 w-4" />
            <span>Enter Web URL</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('claim');
              setSelectedPreset(null);
              setErrorMessage(null);
            }}
            className={cn(
              'flex-1 py-3.5 px-4 text-sm font-medium text-center flex items-center justify-center space-x-2 border-b-2 transition-colors',
              activeTab === 'claim'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>Short Claim / Quote</span>
          </button>
        </div>

        {/* Input Form Area */}
        <form onSubmit={handleAnalyze} className="p-6 space-y-4">
          {activeTab === 'text' && (
            <div className="space-y-2">
              <label htmlFor="text-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Pasted Article Content or Social Media Post
              </label>
              <textarea
                id="text-input"
                rows={8}
                value={textContent}
                onChange={(e) => {
                  setTextContent(e.target.value);
                  setSelectedPreset(null);
                  setErrorMessage(null);
                }}
                disabled={isAnalyzing}
                placeholder="Paste the full text of a news article, viral forward, or blog post here to examine claims, language signals, and verified fact-checks..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-sm leading-relaxed transition-all font-sans resize-y"
              />
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-3">
              <label htmlFor="url-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                News Article or Story URL
              </label>
              <div className="relative">
                <input
                  id="url-input"
                  type="url"
                  value={urlContent}
                  onChange={(e) => {
                    setUrlContent(e.target.value);
                    setSelectedPreset(null);
                    setErrorMessage(null);
                  }}
                  disabled={isAnalyzing}
                  placeholder="https://www.example.com/news/article-title"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-sm transition-all"
                />
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Server-side SSRF protected: internal IPs, localhost, and non-http(s) protocols are blocked.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'claim' && (
            <div className="space-y-2">
              <label htmlFor="claim-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Specific Claim, Viral Quote, or Headline
              </label>
              <textarea
                id="claim-input"
                rows={4}
                value={claimContent}
                onChange={(e) => {
                  setClaimContent(e.target.value);
                  setSelectedPreset(null);
                  setErrorMessage(null);
                }}
                disabled={isAnalyzing}
                placeholder="e.g. 'Government announces 50% tax increase on all foreign remittances starting Monday'..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-sm leading-relaxed transition-all font-sans"
              />
            </div>
          )}

          {/* Character / Word count & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                <strong>{getCharCount()}</strong> characters
              </span>
              <span>•</span>
              <span>
                <strong>{getWordCount()}</strong> words
              </span>
              {getWordCount() > 0 && (
                <>
                  <span>•</span>
                  <span>~{Math.max(1, Math.ceil(getWordCount() / 200))} min read</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {(textContent || urlContent || claimContent) && (
                <button
                  type="button"
                  onClick={() => {
                    setTextContent('');
                    setUrlContent('');
                    setClaimContent('');
                    setSelectedPreset(null);
                    setErrorMessage(null);
                  }}
                  disabled={isAnalyzing}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
              )}

              <button
                type="submit"
                disabled={isAnalyzing || getCharCount() === 0}
                className={cn(
                  'inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm',
                  isAnalyzing || getCharCount() === 0
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 hover:shadow'
                )}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Evidence...</span>
                  </>
                ) : (
                  <>
                    <span>Run Forensic Verification</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mx-6 mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start space-x-2.5 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis Notice</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Animated 5-Step Pipeline Indicator */}
      <ProgressSteps isAnalyzing={isAnalyzing} />
    </div>
  );
}
