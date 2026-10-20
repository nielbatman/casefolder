import React from 'react';
import type { CaseRecord } from '../types/case';
import {
  FolderKanban,
  Search,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface MetricsProps {
  cases: CaseRecord[];
  onSelectStatusFilter: (status: 'All' | 'Under Investigation' | 'Cleared' | 'Solved') => void;
  activeStatus: string;
}

export const MetricsCards: React.FC<MetricsProps> = ({
  cases,
  onSelectStatusFilter,
  activeStatus,
}) => {
  const activeCases = cases.filter((c) => !c.deleted_at);

  const total = activeCases.length;
  const underInvestigation = activeCases.filter((c) => c.status === 'Under Investigation').length;
  const cleared = activeCases.filter((c) => c.status === 'Cleared').length;
  const solved = activeCases.filter((c) => c.status === 'Solved').length;

  const metrics = [
    {
      id: 'all',
      title: 'Total Case Folders',
      value: total,
      // subtext: 'Active CCPS Dockets',
      badge: 'Master Ledger',
      icon: FolderKanban,
      filterVal: 'All' as const,
      accentGradient: 'from-blue-600 to-indigo-600',
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/30 text-white',
      valueColor: 'text-blue-700 dark:text-blue-400',
      cornerGlow: 'bg-blue-500/10 dark:bg-blue-500/15',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
      activeRing: 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/15 border-blue-400 dark:border-blue-500',
    },
    {
      id: 'solved',
      title: 'Solved Cases',
      value: solved,
      // subtext: 'Court Filed / Inquest Resolved',
      badge: 'Prosecution',
      icon: CheckCircle2,
      filterVal: 'Solved' as const,
      accentGradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30 text-white',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      cornerGlow: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
      activeRing: 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/15 border-emerald-400 dark:border-emerald-500',
    },
    {
      id: 'cleared',
      title: 'Cleared Cases',
      value: cleared,
      // subtext: 'Identified / Warrant Issued',
      badge: 'At-Large Suspect',
      icon: Clock,
      filterVal: 'Cleared' as const,
      accentGradient: 'from-sky-500 to-blue-600',
      iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/30 text-white',
      valueColor: 'text-sky-600 dark:text-sky-400',
      cornerGlow: 'bg-sky-500/10 dark:bg-sky-500/15',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
      activeRing: 'ring-2 ring-sky-500 shadow-lg shadow-sky-500/15 border-sky-400 dark:border-sky-500',
    },
    {
      id: 'investigation',
      title: 'Under Investigation',
      value: underInvestigation,
      // subtext: 'Active IOC Inquiry',
      badge: 'Priority Tracking',
      icon: Search,
      filterVal: 'Under Investigation' as const,
      accentGradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30 text-white',
      valueColor: 'text-amber-600 dark:text-amber-400',
      cornerGlow: 'bg-amber-500/10 dark:bg-amber-500/15',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
      activeRing: 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/15 border-amber-400 dark:border-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        const isSelected = activeStatus === m.filterVal;

        return (
          <button
            key={m.id}
            onClick={() => onSelectStatusFilter(m.filterVal)}
            className={`group relative text-left rounded-2xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 transition-all duration-300 cursor-pointer overflow-hidden card-hover-lift shadow-sm hover:shadow-xl ${isSelected ? m.activeRing : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
          >
            {/* Top vibrant gradient color bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${m.accentGradient}`} />

            {/* Corner ambient glow sphere */}
            <div
              className={`absolute top-0 right-0 w-28 h-28 rounded-full ${m.cornerGlow} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="p-4 sm:p-5 flex flex-col justify-between h-full relative z-10">
              {/* Header row: Title + Glowing Icon Box */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                    {m.title}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.badgeBg}`}
                  >
                    {m.badge}
                  </span>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 ${m.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Number and Subtext */}
              <div className="mt-2">
                <div className="flex items-baseline justify-between">
                  <div className={`text-3xl sm:text-4xl font-black tracking-tight ${m.valueColor}`}>
                    {m.value}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                {m.subtext && (
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {m.subtext}
                  </div>
                )}
              </div>

              {/* Bottom active status indicator pill */}
              {isSelected && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    Currently Filtering
                  </span>
                  <span className="text-[10px] text-slate-400">Click to reset</span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
