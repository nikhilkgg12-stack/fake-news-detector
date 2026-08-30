import { notFound } from 'next/navigation';
import { getAnalysisById } from '@/lib/db/analysis';
import { VerdictBanner } from '@/components/report/VerdictBanner';
import { ScoreBreakdown } from '@/components/report/ScoreBreakdown';
import { LinguisticInspector } from '@/components/report/LinguisticInspector';
import { ClaimsList } from '@/components/report/ClaimsList';
import { FactCheckSection } from '@/components/report/FactCheckSection';
import { RelatedCoverageSection } from '@/components/report/RelatedCoverageSection';
import { SourceProfileSection } from '@/components/report/SourceProfileSection';
import { AISynthesisSection } from '@/components/report/AISynthesisSection';
import { ExportActions } from '@/components/report/ExportActions';
import { Calendar, Clock, Globe, Hash, LinkIcon } from 'lucide-react';

interface ReportPageProps {
  params: {
    id: string;
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const analysis = await getAnalysisById(params.id);

  if (!analysis) {
    notFound();
  }

  const formattedDate = new Date(analysis.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header Metadata Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
            <Hash className="h-3.5 w-3.5 text-slate-400" />
            <span>DOSSIER #{analysis.id}</span>
            <span>•</span>
            <span className="uppercase font-semibold text-slate-700 dark:text-slate-300">
              {analysis.inputType} INPUT
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            {analysis.title || `Forensic Evidence Assessment`}
          </h1>

          {analysis.domain && (
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>Target Domain: <strong>{analysis.domain}</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Primary Verdict & Mandatory Epistemic Banner */}
      <VerdictBanner
        verdict={analysis.verdict}
        confidence={analysis.confidence}
        overallScore={analysis.overallScore}
      />

      {/* 5-Dimension Scorecard Breakdown */}
      <ScoreBreakdown
        dimensionScores={analysis.dimensionScores}
        calculationDetails={analysis.calculationDetails}
      />

      {/* AI Forensic Synthesis */}
      <AISynthesisSection synthesis={analysis.aiSynthesis} />

      {/* Interactive Highlightable Linguistic Inspector */}
      <LinguisticInspector
        rawText={analysis.inputContent}
        linguisticSignals={analysis.linguisticSignals}
      />

      {/* Extracted Core Claims */}
      <ClaimsList claims={analysis.extractedClaims} />

      {/* Fact-Check Evidence & Cross-Source Coverage Grid */}
      <div className="grid grid-cols-1 gap-8">
        <FactCheckSection factChecks={analysis.factChecks} />
        <RelatedCoverageSection relatedCoverage={analysis.relatedCoverage} />
      </div>

      {/* Source Technical Profile & Transparency */}
      <SourceProfileSection sourceProfile={analysis.sourceProfile} />

      {/* Export, Print, Share Actions */}
      <ExportActions analysis={analysis} />
    </div>
  );
}
