import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="mt-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl p-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md shadow-slate-200/50 dark:shadow-none">
      
      {/* Left: Summary text */}
      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
        Showing <span className="font-extrabold text-slate-900 dark:text-white font-mono">{startItem}</span> to{' '}
        <span className="font-extrabold text-slate-900 dark:text-white font-mono">{endItem}</span> of{' '}
        <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">{totalItems}</span> case dockets
      </div>

      {/* Right: Controls (Page size + Page navigation) */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        
        {/* Rows per page selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="Rows per page"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First Page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-1 text-xs text-slate-400 select-none font-mono"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = Number(page);
              const isActive = currentPage === pageNum;

              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-transparent'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next Page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Last Page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
