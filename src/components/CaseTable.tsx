import React from 'react';
import type { CaseRecord, CaseStatus, SortField, SortOrder } from '../types/case';
import { exportSingleCaseDocket } from '../utils/exportUtils';
import {
  FileText,
  Eye,
  Edit3,
  Trash2,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  Shield,
  FolderKanban,
  AlertTriangle
} from 'lucide-react';

interface CaseTableProps {
  cases: CaseRecord[];
  onViewPdf: (caseRecord: CaseRecord) => void;
  onEditCase: (caseRecord: CaseRecord) => void;
  onDeleteCase: (caseRecord: CaseRecord) => void;
  onExportCase?: (caseRecord: CaseRecord) => void;
  onRestoreCase?: (caseRecord: CaseRecord) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  isTrashView?: boolean;
}

export const CaseTable: React.FC<CaseTableProps> = ({
  cases,
  onViewPdf,
  onEditCase,
  onDeleteCase,
  onExportCase,
  sortField,
  sortOrder,
  onSort,
}) => {
  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'Under Investigation':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300/90 shadow-sm dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Under Investigation
          </span>
        );
      case 'Cleared':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-300/90 shadow-sm dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Cleared
          </span>
        );
      case 'Solved':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300/90 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Solved
          </span>
        );
    }
  };

  const getSuspectBadge = (status?: string) => {
    if (!status) return null;
    if (status.includes('Arrested') || status.includes('Detained')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          {status}
        </span>
      );
    }
    if (status.includes('At Large')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
          At Large
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-transparent">
        {status}
      </span>
    );
  };

  const getInitials = (name: string) => {
    if (!name) return 'V';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  if (cases.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-12 text-center shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-1">
          No CCPS Case Dockets Found
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          No matching Caloocan City Police Station cases. Clear filters or create a new case docket using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-none transition-all">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200/90 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">

              <th scope="col" className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">
                <button
                  onClick={() => onSort('case_id')}
                  className="flex items-center gap-1.5 group text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-bold"
                >
                  <span>CCPS Docket / IRF</span>
                  {renderSortIcon('case_id')}
                </button>
              </th>

              <th scope="col" className="py-3.5 px-4 min-w-[200px]">
                <button
                  onClick={() => onSort('title')}
                  className="flex items-center gap-1.5 group text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-bold"
                >
                  <span>Offense / Charge</span>
                  {renderSortIcon('title')}
                </button>
              </th>

              <th scope="col" className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
                <button
                  onClick={() => onSort('date_committed')}
                  className="flex items-center gap-1.5 group text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-bold"
                >
                  <span>Date Committed</span>
                  {renderSortIcon('date_committed')}
                </button>
              </th>

              <th scope="col" className="py-3.5 px-4 min-w-[170px]">
                <span>Complainant</span>
              </th>

              <th scope="col" className="py-3.5 px-4 min-w-[170px]">
                <span>Suspect</span>
              </th>

              <th scope="col" className="py-3.5 px-4 min-w-[190px]">
                <span>IOC</span>
              </th>

              <th scope="col" className="py-3.5 px-4 min-w-[140px]">
                <button
                  onClick={() => onSort('status')}
                  className="flex items-center gap-1.5 group text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer font-bold"
                >
                  <span>Status</span>
                  {renderSortIcon('status')}
                </button>
              </th>

              {/* Actions Column (Sticky on right to never get clipped) */}
              <th
                scope="col"
                className="py-3.5 px-4 text-center min-w-[165px] sticky right-0 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-md z-20 shadow-[-10px_0_15px_-4px_rgba(15,23,42,0.06)] border-l border-slate-200/80 dark:border-slate-800"
              >
                <span>Actions</span>
              </th>

            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {cases.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                {/* Case Docket No. & IRF No. */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs shadow-xs">
                    <FolderKanban className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{record.case_id}</span>
                  </div>
                  {record.blotter_number && (
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 pl-1">
                      {record.blotter_number}
                    </div>
                  )}
                </td>

                {/* Charge / Offense */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {record.title}
                  </div>
                  {record.category && (
                    <div className="mt-1">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/90 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
                        {record.category}
                      </span>
                    </div>
                  )}
                </td>

                {/* Date Committed */}
                <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-200 whitespace-nowrap font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span className="font-mono">{record.date_committed}</span>
                  </div>
                </td>

                {/* Complainant / Victim */}
                <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-xs">
                      {getInitials(record.victim_name)}
                    </div>
                    <span className="line-clamp-1 font-semibold text-slate-800 dark:text-slate-200">
                      {record.victim_name}
                    </span>
                  </div>
                </td>

                {/* Suspect / Respondent */}
                <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-200">
                  <div>
                    <span className="line-clamp-1 font-semibold text-slate-800 dark:text-slate-200">
                      {record.suspect_name || 'Unidentified'}
                    </span>
                    {record.suspect_status && (
                      <div className="mt-1">
                        {getSuspectBadge(record.suspect_status)}
                      </div>
                    )}
                  </div>
                </td>

                {/* Assigned IOC */}
                <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-blue-700 dark:text-blue-300 block line-clamp-1">
                        {record.ioc_name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        CCPS Investigator
                      </span>
                    </div>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(record.status)}
                </td>

                {/* Actions Column (Sticky on right to guarantee no clipping) */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap sticky right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 shadow-[-10px_0_15px_-4px_rgba(15,23,42,0.06)] border-l border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* View PDF */}
                    <button
                      onClick={() => onViewPdf(record)}
                      className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/90 hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-xs hover:shadow-md hover:scale-105 cursor-pointer active:scale-95"
                      title="Open PDF Docket Viewer"
                      aria-label="View PDF Docket"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Export Single Case Docket */}
                    <button
                      onClick={() => {
                        exportSingleCaseDocket(record);
                        if (typeof onExportCase === 'function') {
                          try { onExportCase(record); } catch { /* ignore */ }
                        }
                      }}
                      className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/90 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-600 dark:hover:text-white transition-all shadow-xs hover:shadow-md hover:scale-105 cursor-pointer active:scale-95"
                      title="Download Uploaded PDF Case Folder"
                      aria-label="Download Case PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditCase(record)}
                      className="p-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/90 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-500 dark:hover:text-white transition-all shadow-xs hover:shadow-md hover:scale-105 cursor-pointer active:scale-95"
                      title="Edit Case Docket"
                      aria-label="Edit Case"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteCase(record)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/90 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-600 dark:hover:text-white transition-all shadow-xs hover:shadow-md hover:scale-105 cursor-pointer active:scale-95"
                      title="Delete Case Folder"
                      aria-label="Delete Case"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
