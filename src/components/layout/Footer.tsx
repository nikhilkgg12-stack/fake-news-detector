import Link from 'next/link';
import { Shield, ExternalLink, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-12 text-slate-600 dark:text-slate-400 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white font-sans">
                VeriLens
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-md">
              An evidence-first forensic tool built to assist human discernment. VeriLens evaluates verifiable fact-checks, cross-source news corroboration, and linguistic indicators without ever claiming absolute certainty or fabricating consensus.
            </p>
            <div className="flex items-start space-x-2 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 max-w-md">
              <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span>
                <strong>Zero-Certainty Verifiable Standard:</strong> Automated AI tools cannot serve as sole arbiters of truth. Always consult primary documents and accredited journalists.
              </span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/analyze" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Evidence Analyzer
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Audit History & Charts
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Scoring Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Sources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Integrated Data Sources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://toolbox.google.com/factcheck/apis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>Google Fact Check API</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.gdeltproject.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>GDELT 2.0 Global News</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://safebrowsing.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>Google Safe Browsing</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://groq.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>Groq Cloud LPU</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} VeriLens Forensic Intelligence. Built for open information hygiene.</p>
          <p className="text-slate-400 dark:text-slate-500">
            Privacy: Submitted queries are analyzed ephemerally and stored locally in your SQLite instance.
          </p>
        </div>
      </div>
    </footer>
  );
}
