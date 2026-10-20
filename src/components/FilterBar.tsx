import React from 'react';
import type { CaseFilter, ViewMode, CaseStatus } from '../types/case';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutList, 
  LayoutGrid, 
  X,
  Calendar,
  Filter,
  RotateCcw
} from 'lucide-react';

interface StatusCounts {
  all?: number;
  solved?: number;
  cleared?: number;
  underInvestigation?: number;
}

interface FilterBarProps {
  filters: CaseFilter;
  onFilterChange: (filters: CaseFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenMobileDrawer: () => void;
  deletedCount?: number;
  statusCounts?: StatusCounts;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onOpenMobileDrawer,
  statusCounts = {},
}) => {
  const statusOptions: { label: string; value: CaseStatus | 'All'; count?: number; activeClass: string }[] = [
    { 
      label: 'All Dockets', 
      value: 'All', 
      count: statusCounts.all,
      activeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border-transparent' 
    },
    { 
      label: 'Solved', 
      value: 'Solved', 
      count: statusCounts.solved,
      activeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 border-transparent' 
    },
    { 
      label: 'Cleared', 
      value: 'Cleared', 
      count: statusCounts.cleared,
      activeClass: 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25 border-transparent' 
    },
    { 
      label: 'Under Investigation', 
      value: 'Under Investigation', 
      count: statusCounts.underInvestigation,
      activeClass: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25 border-transparent' 
    },
  ];

  const hasActiveFilters = 
    filters.searchQuery !== '' || 
    filters.status !== 'All' || 
    (filters.category && filters.category !== 'All') ||
    filters.dateFrom !== '' || 
    filters.dateTo !== '';

  const clearAllFilters = () => {
    onFilterChange({
      ...filters,
      searchQuery: '',
      status: 'All',
      category: 'All',
      barangay: 'All',
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <div className="flex flex-col gap-3.5 mb-6">
      
      {/* Top Filter Container */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-blue-400" />
          <input
            type="text"
            id="case-search-input"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search CCPS Docket, IRF No., Charge, Victim, Suspect, IOC..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all shadow-inner"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls & Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Mobile Filter Button */}
          <button
            onClick={onOpenMobileDrawer}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>

          {/* Crime Category Selector (Desktop) */}
          <div className="hidden lg:flex items-center bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs shadow-inner">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
            <select
              value={filters.category || 'All'}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="bg-transparent border-0 text-slate-800 dark:text-slate-200 focus:outline-none text-xs font-bold cursor-pointer"
              aria-label="Filter by Crime Category"
            >
              <option value="All" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">All Crimes / Charges</option>
              <option value="MURDER" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">MURDER</option>
              <option value="HOMICIDE" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">HOMICIDE</option>
              <option value="PHYSICAL INJURY" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">PHYSICAL INJURY</option>
              <option value="RAPE" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">RAPE</option>
              <option value="ROBBERY" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">ROBBERY</option>
              <option value="THEFT" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">THEFT</option>
              <option value="CARNAPPING MC" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">CARNAPPING MC</option>
              <option value="CARNAPPING MV" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">CARNAPPING MV</option>
              <option value="SPECIAL COMPLEX CRIME" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">SPECIAL COMPLEX CRIME</option>
              <option value="OTHERS" className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">OTHERS</option>
            </select>
          </div>

          {/* Date Range Quick Filter (Desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
              className="bg-transparent border-0 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              title="Filter from date"
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
              className="bg-transparent border-0 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              title="Filter to date"
            />
          </div>

          {/* View Mode Switcher (Table vs Grid) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Table View (Desktop optimal)"
              aria-label="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Card Grid View (Visual optimal)"
              aria-label="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Horizontal Status Chips & Filter Pill Reset */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {statusOptions.map((opt) => {
            const isSelected = filters.status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ ...filters, status: opt.value })}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? opt.activeClass
                    : 'bg-white/85 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-800 shadow-sm'
                }`}
              >
                <span>{opt.label}</span>
                {typeof opt.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 whitespace-nowrap px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

    </div>
  );
};
