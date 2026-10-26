import React from 'react';
import type { CaseRecord } from '../types/case';
import {
  FolderKanban,
  Search,
  Clock,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

interface MetricsProps {
  cases: CaseRecord[];
  onSelectStatusFilter: (status: 'All' | 'Under Investigation' | 'Cleared' | 'Solved') => void;
  activeStatus: string;
}

interface MetricCardItem {
  id: string;
  title: string;
  value: number;
  subtext?: string;
  badge: string;
  icon: React.ElementType;
  filterVal: 'All' | 'Under Investigation' | 'Cleared' | 'Solved';
  accentGradient: string;
  iconBg: string;
  valueColor: string;
  cornerGlow: string;
  badgeBg: string;
  activeRing: string;
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

  const metrics: MetricCardItem[] = [
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 my-3.5">
      {metrics.map((m) => {
        const Icon = m.icon;
        const isSelected = activeStatus === m.filterVal;

        return (
          <button
            key={m.id}
            onClick={() => onSelectStatusFilter(m.filterVal)}
            className={`group relative text-left rounded-xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 transition-all duration-300 cursor-pointer overflow-hidden card-hover-lift shadow-xs hover:shadow-md ${isSelected ? m.activeRing : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
          >
            {/* Top vibrant gradient color bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${m.accentGradient}`} />

            {/* Corner ambient glow sphere */}
            <div
              className={`absolute top-0 right-0 w-20 h-20 rounded-full ${m.cornerGlow} blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="p-3 sm:p-3.5 flex flex-col justify-between relative z-10">
              {/* Header row: Title + Badge + Compact Icon Box */}
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <div className="min-w-0 pr-1">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                    {m.title}
                  </span>
                  <span
                    className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded-md border mt-0.5 ${m.badgeBg}`}
                  >
                    {m.badge}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-xs flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${m.iconBg}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* Number and Arrow */}
              <div className="flex items-baseline justify-between mt-0.5">
                <div className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${m.valueColor}`}>
                  {m.value}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Active status indicator dot */}
              {isSelected && (
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {/* <span>Filtered</span> */}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
