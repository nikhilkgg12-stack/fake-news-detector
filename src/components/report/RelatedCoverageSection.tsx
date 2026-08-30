'use client';

import React from 'react';
import { RelatedCoverageArticle } from '@/types';
import { Globe, ExternalLink, Newspaper, Clock } from 'lucide-react';

interface RelatedCoverageSectionProps {
  relatedCoverage: RelatedCoverageArticle[];
}

export function RelatedCoverageSection({ relatedCoverage }: RelatedCoverageSectionProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans flex items-center space-x-2">
            <Globe className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <span>Related Global Coverage</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-source reporting indexed across international news databases via GDELT 2.0
          </p>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {relatedCoverage.length} Related Article{relatedCoverage.length === 1 ? '' : 's'}
        </span>
      </div>

      {relatedCoverage.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
          <Newspaper className="h-8 w-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No independent news coverage detected
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Major news organizations have not reported on this specific topic or event in the global news registry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {relatedCoverage.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600 transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    {article.source}
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{article.date}</span>
                  </span>
                </div>
                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-mono truncate max-w-[200px]">
                  {article.domain}
                </span>
                <div className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 font-medium">
                  <span>Visit Article</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-[11px] text-slate-500">
        <strong>Important Media Literacy Rule:</strong> Article volume does not equal truth. We display related coverage to help you evaluate if independent news outlets have investigated and verified the topic.
      </div>
    </div>
  );
}
