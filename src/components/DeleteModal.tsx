import React from 'react';
import type { CaseRecord } from '../types/case';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  caseRecord: CaseRecord | null;
  isPermanent?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  caseRecord,
}) => {
  if (!isOpen || !caseRecord) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-slide-up"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-2xl flex-shrink-0 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete CCPS Case Folder?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Are you sure you want to delete this CCPS Case Folder? This action will permanently remove the docket and attached PDF exhibits from the system.
            </p>
          </div>
        </div>

        {/* Case Info Preview Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-mono">Docket No:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{caseRecord.case_id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Case / Charge:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[220px] text-right">
              {caseRecord.title}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Assigned IOC:</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{caseRecord.ioc_name}</span>
          </div>
        </div>

        {/* Actions: Min 44x44px touch targets */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:border-transparent dark:text-slate-300 dark:hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white active:scale-95 transition-all shadow-lg bg-rose-600 hover:bg-rose-500 shadow-rose-900/30 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
