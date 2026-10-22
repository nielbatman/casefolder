import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/85 dark:border-slate-800/85 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md py-2.5 sm:py-3 relative z-10 transition-colors mb-16 sm:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        
        {/* Left: Station Identity */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
            <Shield className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            Caloocan City Police Station
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
            SIDMB • Investigator-on-Case (IOC) Docket
          </span>
        </div>

        {/* Right: Operational Status & District */}
        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">CCPS E-Docket Active</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>Northern Police District (NPD)</span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
          <span className="text-slate-400 dark:text-slate-500 hidden md:inline">
            © {new Date().getFullYear()} PNP
          </span>
        </div>

      </div>
    </footer>
  );
};
