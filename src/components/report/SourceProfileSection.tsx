'use client';

import React from 'react';
import { SourceProfile } from '@/types';
import { ShieldCheck, Lock, Unlock, ShieldAlert, User, Calendar, LinkIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SourceProfileSectionProps {
  sourceProfile: SourceProfile;
}

export function SourceProfileSection({ sourceProfile }: SourceProfileSectionProps) {
  const isDirectText = sourceProfile.domain === 'direct-submission' || sourceProfile.domain === 'user-claim';

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Source Technical Profile & Transparency</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographic security, malware signals, and editorial transparency markers
          </p>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {isDirectText ? 'Direct Input' : sourceProfile.domain}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Domain Posture */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <LinkIcon className="h-4 w-4 text-slate-400" />
            <span className="font-semibold uppercase tracking-wider">Host Domain</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
            {sourceProfile.domain}
          </p>
          <p className="text-[11px] text-slate-500">
            {isDirectText ? 'Pasted directly into analyzer' : 'Originating web host'}
          </p>
        </div>

        {/* SSL Encryption */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            {sourceProfile.isHttps ? (
              <Lock className="h-4 w-4 text-emerald-500" />
            ) : (
              <Unlock className="h-4 w-4 text-amber-500" />
            )}
            <span className="font-semibold uppercase tracking-wider">HTTPS Protocol</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {sourceProfile.isHttps ? 'Valid SSL / TLS' : 'Unencrypted HTTP'}
          </p>
          <p className="text-[11px] text-slate-500">
            {sourceProfile.isHttps ? 'Traffic is encrypted in transit' : 'Insecure web transfer'}
          </p>
        </div>

        {/* Safe Browsing */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldAlert className="h-4 w-4 text-primary-500" />
            <span className="font-semibold uppercase tracking-wider">Google Safe Browsing</span>
          </div>
          <p
            className={cn(
              'text-sm font-bold capitalize',
              sourceProfile.safeBrowsingStatus === 'safe' && 'text-emerald-600 dark:text-emerald-400',
              sourceProfile.safeBrowsingStatus === 'unsafe' && 'text-rose-600 dark:text-rose-400',
              sourceProfile.safeBrowsingStatus === 'untested' && 'text-slate-600 dark:text-slate-400'
            )}
          >
            {sourceProfile.safeBrowsingStatus}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {sourceProfile.safeBrowsingDetails || 'Evaluates malware and phishing risk'}
          </p>
        </div>

        {/* Author Byline */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <User className="h-4 w-4 text-slate-400" />
            <span className="font-semibold uppercase tracking-wider">Author Attribution</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {sourceProfile.authorName || (sourceProfile.hasAuthor ? 'Byline Present' : 'Anonymous / No Byline')}
          </p>
          <p className="text-[11px] text-slate-500">
            {sourceProfile.hasAuthor ? 'Author is clearly credited' : 'Missing author accountability'}
          </p>
        </div>

        {/* Publication Timestamp */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="font-semibold uppercase tracking-wider">Publication Date</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {sourceProfile.publishDate || (sourceProfile.hasDate ? 'Date Specified' : 'Undated Content')}
          </p>
          <p className="text-[11px] text-slate-500">
            {sourceProfile.hasDate ? 'Temporal context preserved' : 'Missing timestamp'}
          </p>
        </div>

        {/* Outbound Citations */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ExternalLink className="h-4 w-4 text-slate-400" />
            <span className="font-semibold uppercase tracking-wider">Outbound Citations</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            {sourceProfile.citationCount} external link{sourceProfile.citationCount === 1 ? '' : 's'}
          </p>
          <p className="text-[11px] text-slate-500">
            {sourceProfile.citationCount > 0 ? 'References external sources' : 'Zero outbound citations'}
          </p>
        </div>
      </div>
    </div>
  );
}
