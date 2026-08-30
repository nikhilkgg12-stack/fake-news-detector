'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Calendar,
  Layers,
  AlertTriangle,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { AnalysisResult, VerdictType } from '@/types';
import { getVerdictBadgeConfig, cn } from '@/lib/utils';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<{
    verdictCounts: Record<VerdictType, number>;
    timeline: Array<{ date: string; count: number }>;
  }>({
    verdictCounts: {
      likely_credible: 0,
      potentially_misleading: 0,
      insufficient_evidence: 0,
      likely_false: 0,
    },
    timeline: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('all');
  const [selectedInputType, setSelectedInputType] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedVerdict !== 'all') params.set('verdict', selectedVerdict);
      if (selectedInputType !== 'all') params.set('inputType', selectedInputType);
      if (searchQuery.trim()) params.set('searchQuery', searchQuery.trim());

      const res = await fetch(`/api/history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data.items || []);
        setTotalCount(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedVerdict, selectedInputType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnalyses((prev) => prev.filter((item) => item.id !== id));
        fetchHistory();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/history?action=clearAll', { method: 'DELETE' });
      if (res.ok) {
        setAnalyses([]);
        setShowClearConfirm(false);
        fetchHistory();
      }
    } catch (err) {
      console.error('Clear all error:', err);
    } finally {
      setIsClearing(false);
    }
  };

  // Prepare chart data
  const pieData = [
    { name: 'Likely Credible', value: stats.verdictCounts.likely_credible || 0, color: '#10B981' },
    { name: 'Potentially Misleading', value: stats.verdictCounts.potentially_misleading || 0, color: '#F59E0B' },
    { name: 'Likely False', value: stats.verdictCounts.likely_false || 0, color: '#F43F5E' },
    { name: 'Insufficient Evidence', value: stats.verdictCounts.insufficient_evidence || 0, color: '#64748B' },
  ].filter((d) => d.value > 0);

  const timelineData = stats.timeline.length > 0 ? stats.timeline : [{ date: 'Today', count: analyses.length }];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <History className="h-3.5 w-3.5" />
            <span>Local Database Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            Audit History & Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Persistently stored local analyses, verdict distributions, and verification activity
          </p>
        </div>

        {analyses.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Analytics Charts Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Verdict Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <PieChartIcon className="h-4 w-4 text-primary-500" />
              <span>Verdict Distribution</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: {totalCount}</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No data points to display yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px]">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-200">({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Activity Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-teal-500" />
              <span>Verifications Over Time</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Daily Frequency</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {timelineData.length === 0 ? (
              <p className="text-xs text-slate-400">No activity logged yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="text-[11px] text-center text-slate-400 pt-2">
            Historical log of all content analyzed within this local workspace
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headline, text, or domain..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Verdict Filter */}
          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Verdicts</option>
            <option value="likely_credible">Likely Credible</option>
            <option value="potentially_misleading">Potentially Misleading</option>
            <option value="likely_false">Likely False</option>
            <option value="insufficient_evidence">Insufficient Evidence</option>
          </select>

          {/* Input Type Filter */}
          <select
            value={selectedInputType}
            onChange={(e) => setSelectedInputType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Input Types</option>
            <option value="text">Article / Text</option>
            <option value="url">Web URL</option>
            <option value="claim">Short Claim</option>
          </select>

          <button
            type="button"
            onClick={fetchHistory}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Analysis Records Table / List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary-500" />
          <p className="text-xs">Loading records from SQLite database...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No analysis records found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run your first news verification to view saved forensic reports and metrics here.
            </p>
          </div>
          <div>
            <Link
              href="/analyze"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>Verify an Article Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((record) => {
            const verdictInfo = getVerdictBadgeConfig(record.verdict);
            const dateStr = new Date(record.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Link
                key={record.id}
                href={`/report/${record.id}`}
                className="group block p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all hover:shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={cn('px-2.5 py-0.5 rounded-full font-semibold border text-[11px]', verdictInfo.bg, verdictInfo.text, verdictInfo.border)}>
                        {verdictInfo.label}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="font-mono uppercase text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {record.inputType}
                      </span>
                      {record.domain && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="font-mono text-slate-500 text-[11px] truncate max-w-[150px]">
                            {record.domain}
                          </span>
                        </>
                      )}
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{dateStr}</span>
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug line-clamp-1">
                      {record.title || record.inputContent.slice(0, 90)}
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-serif">
                      {record.inputContent}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 border-t lg:border-t-0 pt-3 lg:pt-0 justify-between lg:justify-end">
                    <div className="text-right">
                      <div className="flex items-baseline space-x-1 justify-end">
                        <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                          {record.overallScore}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">/100</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">
                        {record.confidence} conf.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(record.id, e)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal to Clear All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clear All Audit History?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This will permanently delete all saved analyses and statistical trends from your local SQLite database. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isClearing}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                {isClearing ? 'Clearing...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
