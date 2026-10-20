import React, { useState } from 'react';
import { SUPABASE_URL, SUPABASE_SQL_SCHEMA, checkSupabaseConnection } from '../lib/supabase';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Cloud, 
  HardDrive,
  Terminal
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCloudConnected: boolean;
  onRecheckConnection: () => Promise<void>;
  onSeedSampleData: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  isCloudConnected,
  onRecheckConnection,
  onSeedSampleData,
}) => {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await checkSupabaseConnection();
      if (res.connected && res.hasTable) {
        setTestResult('Success: Connected to Supabase and case_folders table is ready!');
      } else if (res.connected && !res.hasTable) {
        setTestResult('Connected to Supabase endpoint, but table "case_folders" is not created yet. Run the SQL script below.');
      } else {
        setTestResult(`Connection failed: ${res.error || 'Network error'}`);
      }
      await onRecheckConnection();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult(`Error: ${msg}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Caloocan CPS • Cloud Database & Storage</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">PNP Project Endpoint: {SUPABASE_URL}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isCloudConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-600/40 text-emerald-800 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600/40 text-amber-800 dark:text-amber-200'
          }`}>
            {isCloudConnected ? (
              <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <HardDrive className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-xs uppercase tracking-wide">
                {isCloudConnected ? 'Cloud Mode Active' : 'Local Safe Mode Active (Zero Disruption)'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {isCloudConnected
                  ? 'Your case records and PDF documents are actively syncing with Supabase PostgreSQL and storage bucket.'
                  : 'The application is running with Local Safe Storage. All created cases and PDFs are stored locally so you can test everything immediately. To sync to Supabase Cloud, run the SQL script below.'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing Endpoint...' : 'Test Supabase Connection'}</span>
            </button>

            <a
              href="https://supabase.com/dashboard/project/grxxknpoppkgushaympn/sql"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Supabase SQL Editor</span>
            </a>

            <button
              onClick={onSeedSampleData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 dark:text-blue-300 dark:border-blue-500/30 text-xs font-semibold transition-colors ml-auto cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Reset & Seed Sample Dossiers</span>
            </button>
          </div>

          {testResult && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-300">
              {testResult}
            </div>
          )}

          {/* SQL Migration Script Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                1-Click Supabase SQL Setup Script
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed scrollbar-thin">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Paste into your Supabase Dashboard SQL editor and click "Run". It creates the <code>case_folders</code> table, RLS policies, and the <code>case-folders</code> storage bucket.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-200 dark:text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
