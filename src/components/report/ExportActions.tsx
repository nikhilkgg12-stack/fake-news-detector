'use client';

import React, { useState } from 'react';
import { Copy, Check, Printer, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AnalysisResult } from '@/types';
import { getVerdictBadgeConfig } from '@/lib/utils';

interface ExportActionsProps {
  analysis: AnalysisResult;
}

export function ExportActions({ analysis }: ExportActionsProps) {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const generateMarkdownReport = () => {
    const verdictInfo = getVerdictBadgeConfig(analysis.verdict);
    const date = new Date(analysis.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `# VeriLens Forensic Evidence Report

**Generated Date:** ${date}
**Input Type:** ${analysis.inputType.toUpperCase()}
${analysis.title ? `**Headline / Title:** ${analysis.title}` : ''}
${analysis.domain ? `**Host Domain:** ${analysis.domain}` : ''}

---

## Overall Assessment
- **Verdict:** ${verdictInfo.label}
- **Confidence Level:** ${analysis.confidence.toUpperCase()}
- **Composite Score Index:** ${analysis.overallScore}/100

> **Mandatory Epistemic Disclaimer:** This is an automated evidence assessment, not a final determination of truth. Machine algorithms can misinterpret context. Always cross-verify with accredited primary sources before forming conclusions.

---

## 5-Dimension Score Breakdown
- **Fact-Check Consensus:** ${analysis.dimensionScores.factCheckScore > 0 ? '+' : ''}${analysis.dimensionScores.factCheckScore} pts (Weight: 45%)
- **Cross-Source Corroboration (GDELT):** ${analysis.dimensionScores.corroborationScore}/100 (Weight: 20%)
- **Source Security & Posture:** ${analysis.dimensionScores.sourceReputationScore}/100 (Weight: 15%)
- **Linguistic Tone Restraint:** ${analysis.dimensionScores.manipulativeLanguageScore}/100 (Weight: 10%)
- **Attribution & Transparency:** ${analysis.dimensionScores.transparencyScore}/100 (Weight: 10%)

---

## Forensic Evidence Synthesis
**Executive Summary:**
${analysis.aiSynthesis.summary}

**Key Findings:**
${analysis.aiSynthesis.key_findings.map((f) => `- ${f}`).join('\n')}

**Limitations:**
${analysis.aiSynthesis.limitations.map((l) => `- ${l}`).join('\n')}

**Recommended Next Steps:**
${analysis.aiSynthesis.recommended_next_steps.map((s) => `- ${s}`).join('\n')}

---

## Verified Fact-Check Evidence (${analysis.factChecks.length} Matches)
${
  analysis.factChecks.length === 0
    ? 'No matching fact-checks found in public databases.'
    : analysis.factChecks
        .map(
          (fc) =>
            `- **Publisher:** ${fc.publisher}\n  **Rating:** ${fc.ratingText}\n  **Claim Checked:** "${fc.claim}"\n  **Link:** ${fc.url}`
        )
        .join('\n\n')
}

---
*Report generated via VeriLens Forensic Intelligence (https://verilens.app)*
`;
  };

  const handleCopyMarkdown = async () => {
    try {
      const markdown = generateMarkdownReport();
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 no-print">
      <Link
        href="/analyze"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Verify Another Article</span>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopyMarkdown}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>Copied Markdown!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              <span>Copy Report (Markdown)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleShareLink}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          {shareCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Share Dossier</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / Export PDF</span>
        </button>
      </div>
    </div>
  );
}
