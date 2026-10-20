import React from 'react';
import type { CaseFilter, CaseStatus } from '../types/case';
import { X, Check } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CaseFilter;
  onFilterChange: (filters: CaseFilter) => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet on Mobile / Slide-in on Tablet */}
      <div className="fixed inset-x-0 bottom-0 max-h-[85vh] sm:max-w-md sm:right-0 sm:left-auto sm:inset-y-0 sm:max-h-full w-full bg-white dark:bg-slate-900 border-t sm:border-l sm:border-t-0 border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-none p-6 shadow-2xl flex flex-col z-10 animate-slide-up sm:animate-none overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filter Dossiers</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Refine search criteria & parameters</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close filter drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-5 flex-1">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
              Investigation Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['All', 'Solved', 'Cleared', 'Under Investigation'] as (CaseStatus | 'All')[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onFilterChange({ ...filters, status: st })}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors cursor-pointer ${
                    filters.status === st
                      ? 'bg-blue-600 text-white border-blue-500 shadow-glow-primary font-semibold'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>


          {/* Date Committed Range */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
              Date Committed Range
            </label>
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 block">From:</span>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 block">To:</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
          <button
            onClick={() => {
              onFilterChange({
                ...filters,
                status: 'All',
                category: 'All',
                dateFrom: '',
                dateTo: '',
                searchQuery: '',
              });
            }}
            className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white text-xs font-semibold cursor-pointer"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-glow-primary cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>

      </div>
    </div>
  );
};
