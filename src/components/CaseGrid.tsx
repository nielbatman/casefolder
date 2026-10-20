import React, { useState } from 'react';
import type { CaseRecord, CaseStatus } from '../types/case';
import { formatFileSize } from '../utils/pdfGenerator';
import { exportSingleCaseDocket } from '../utils/exportUtils';
import { 
  FileText, 
  Eye, 
  Edit3, 
  Trash2, 
  Download,
  Calendar, 
  User, 
  Shield, 
  FolderKanban,
  AlertTriangle
} from 'lucide-react';

interface CaseCardProps {
  record: CaseRecord;
  onViewPdf: (caseRecord: CaseRecord) => void;
  onEditCase: (caseRecord: CaseRecord) => void;
  onDeleteCase: (caseRecord: CaseRecord) => void;
  onExportCase?: (caseRecord: CaseRecord) => void;
  onRestoreCase?: (caseRecord: CaseRecord) => void;
  isTrashView?: boolean;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  record,
  onViewPdf,
  onEditCase,
  onDeleteCase,
  onExportCase,
}) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    if (diff < 0 && diff > -120) {
      setSwipeOffset(diff);
    } else if (diff >= 0) {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset < -60) {
      setSwipeOffset(-80);
    } else {
      setSwipeOffset(0);
    }
    setTouchStartX(null);
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'Under Investigation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Under Investigation
          </span>
        );
      case 'Cleared':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-300 shadow-xs dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Cleared
          </span>
        );
      case 'Solved':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Solved
          </span>
        );
    }
  };

  const getStatusAccent = (status: CaseStatus) => {
    switch (status) {
      case 'Under Investigation':
        return 'from-amber-400 to-orange-500';
      case 'Cleared':
        return 'from-sky-400 to-blue-500';
      case 'Solved':
      default:
        return 'from-emerald-400 to-teal-500';
    }
  };

  const primaryPdf = record.pdf_attachments && record.pdf_attachments.length > 0 ? record.pdf_attachments[0] : null;

  return (
    <div className="relative overflow-hidden rounded-2xl group card-hover-lift">
      {/* Background reveal action for mobile swipe */}
      <div className="absolute inset-y-0 right-0 w-20 bg-rose-900/60 flex items-center justify-center gap-2 pr-2">
        <button
          onClick={() => onDeleteCase(record)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-rose-300 cursor-pointer"
          aria-label="Delete via swipe"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Card Body */}
      <div
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-blue-400/80 dark:hover:border-blue-600/80 shadow-md hover:shadow-xl overflow-hidden"
      >
        {/* Top vibrant status line */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${getStatusAccent(record.status)}`} />

        <div className="p-4 sm:p-5">
          {/* Top metadata row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 shadow-xs">
              <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
              {record.case_id}
            </span>
            <div>{getStatusBadge(record.status)}</div>
          </div>

          {/* Title & Charge */}
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
            {record.title}
          </h3>

          {/* Category Chip */}
          {record.category && (
            <div className="mb-2.5">
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/90 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
                {record.category}
              </span>
            </div>
          )}

          {/* Incident Details Summary */}
          {record.summary && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
              {record.summary}
            </p>
          )}

          {/* Key Facts list */}
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/60 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Date & Time:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {record.date_committed} {record.time_committed ? `(${record.time_committed})` : ''}
              </span>
            </div>
            {record.barangay && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-bold text-amber-700 dark:text-amber-300 line-clamp-1 max-w-[170px] text-right">
                  {record.barangay}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" /> Victim:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[170px] text-right">
                {record.victim_name}
              </span>
            </div>
            {record.suspect_name && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Suspect:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-300 line-clamp-1 max-w-[170px] text-right">
                  {record.suspect_name}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> CCPS IOC:
              </span>
              <span className="font-bold text-blue-700 dark:text-blue-300 line-clamp-1 max-w-[170px] text-right">
                {record.ioc_name}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:px-5 sm:py-3.5 bg-slate-50/70 dark:bg-slate-950/70 border-t border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-2">
          {/* PDF Viewer Button */}
          {primaryPdf ? (
            <button
              onClick={() => onViewPdf(record)}
              className="flex-1 min-h-[38px] flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/90 hover:border-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-600 dark:text-blue-300 text-xs font-bold active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4" />
              <span>Preview PDF ({formatFileSize(primaryPdf.size)})</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic py-1">No attachments</span>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                exportSingleCaseDocket(record);
                if (typeof onExportCase === 'function') {
                  try { onExportCase(record); } catch { /* ignore */ }
                }
              }}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200/90 hover:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-600 dark:hover:text-white active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Download Case Folder PDF"
              aria-label="Download Case PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditCase(record)}
              className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-200/90 hover:border-amber-500 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-500 dark:hover:text-white active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Edit Case Docket"
              aria-label="Edit Case"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteCase(record)}
              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/90 hover:border-rose-600 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-600 dark:hover:text-white active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Delete Case Docket"
              aria-label="Delete Case"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

interface CaseGridProps {
  cases: CaseRecord[];
  onViewPdf: (caseRecord: CaseRecord) => void;
  onEditCase: (caseRecord: CaseRecord) => void;
  onDeleteCase: (caseRecord: CaseRecord) => void;
  onExportCase?: (caseRecord: CaseRecord) => void;
  onRestoreCase?: (caseRecord: CaseRecord) => void;
  isTrashView?: boolean;
}

export const CaseGrid: React.FC<CaseGridProps> = ({
  cases,
  onViewPdf,
  onEditCase,
  onDeleteCase,
  onExportCase,
}) => {
  if (cases.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-12 text-center shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-1">
          No Case Dossiers Found
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Try adjusting your search queries, clearing status filters, or create a new case folder.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {cases.map((record) => (
        <CaseCard
          key={record.id}
          record={record}
          onViewPdf={onViewPdf}
          onEditCase={onEditCase}
          onDeleteCase={onDeleteCase}
          onExportCase={onExportCase}
        />
      ))}
    </div>
  );
};
