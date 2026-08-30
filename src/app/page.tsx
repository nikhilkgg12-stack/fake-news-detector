import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  Database,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
  BookOpen,
  FileCheck,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { SAMPLE_PRESETS } from '@/lib/mock/samples';

export default function LandingPage() {
  return (
    <div className="w-full space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-20 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-slate-100/50 to-transparent dark:from-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>AI-Assisted Misinformation Forensics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight font-sans max-w-4xl mx-auto leading-[1.12]">
            Verify before you share.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            An evidence-first verification engine that evaluates claims against verified fact-check databases, global cross-source reporting, and forensic language signals.
          </p>

          {/* Direct CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all shadow-md hover:shadow-lg"
            >
              <Search className="h-4 w-4" />
              <span>Start Free Analysis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/methodology"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span>How It Works</span>
            </Link>
          </div>

          {/* Privacy Reassurance Note */}
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
            <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Privacy Guaranteed:</strong> Submitted content is never sold, publicly shared, or used to train public models.
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Quick Tryout Scenarios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                Explore Real-World Verification Presets
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Click any scenario below to see how VeriLens processes multi-layered evidence
              </p>
            </div>
            <Link
              href="/analyze"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              <span>Custom Input</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_PRESETS.map((preset) => (
              <Link
                key={preset.id}
                href={`/analyze?preset=${preset.id}`}
                className="group p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600 transition-all flex flex-col justify-between space-y-4 hover:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {preset.category}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  Run forensic check →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What VeriLens CAN and CANNOT Determine */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Can Determine */}
          <div className="p-8 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-4">
            <div className="flex items-center space-x-2.5 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="text-lg font-bold font-sans">What VeriLens Can Determine</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-emerald-900/90 dark:text-emerald-200/90">
              <li className="flex items-start space-x-2">
                <span className="font-bold">•</span>
                <span>Direct matches against accredited fact-checking archives (Reuters, AFP, PolitiFact, Snopes).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">•</span>
                <span>Volume and diversity of independent cross-source coverage in global news indexes (GDELT).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">•</span>
                <span>Linguistic manipulation patterns: sensationalist shock-framing, panic urgency, and cognitive bias cues.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">•</span>
                <span>Technical source transparency: HTTPS encryption, Google Safe Browsing flags, and author attribution.</span>
              </li>
            </ul>
          </div>

          {/* Cannot Determine */}
          <div className="p-8 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-4">
            <div className="flex items-center space-x-2.5 text-rose-800 dark:text-rose-300">
              <XCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold font-sans">What Automated Tools Cannot Do</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-rose-900/90 dark:text-rose-200/90">
              <li className="flex items-start space-x-2">
                <span className="font-bold">•</span>
                <span>Declare absolute 100% judicial certainty on developing breaking news without indexed evidence.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">•</span>
                <span>Replace investigative field journalism or primary eyewitness document verification.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">•</span>
                <span>Condemn an article as fake based exclusively on writing style or grammatical errors.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">•</span>
                <span>Discern highly subtle irony, satire, or private non-indexed archives automatically.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
            Layered Forensic Architecture
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A multi-dimensional scoring pipeline designed for intellectual honesty
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Fact-Check Consensus
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Direct verification against Google Fact Check Tools API, matching extracted claims against accredited IFCN journalists.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Global Corroboration
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              GDELT 2.0 cross-source synthesis identifying whether multiple independent worldwide media outlets corroborate the report.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Linguistic Forensics
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Rule-based NLP scanning for emotional manipulation, artificial urgency, uppercase yelling, and hyperbole without false penalties.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Explainable Dossier
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Every score displays the exact mathematical formula, raw component metrics, confidence rationale, and Groq AI synthesis.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 dark:bg-slate-900 text-white border border-slate-800 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans max-w-2xl mx-auto">
            Ready to verify a news story or viral rumor?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            Test any article, claim, or URL in seconds. Free, transparent, and built for responsible media consumption.
          </p>
          <div>
            <Link
              href="/analyze"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-md"
            >
              <Search className="h-4 w-4" />
              <span>Launch VeriLens Analyzer</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
