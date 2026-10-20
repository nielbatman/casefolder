import React, { useState } from 'react';
import type { CaseRecord, PdfAttachment } from '../types/case';
import { formatFileSize } from '../utils/pdfGenerator';
import { 
  X, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  User, 
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseRecord: CaseRecord | null;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  caseRecord,
}) => {
  const [activeAttachmentIndex, setActiveAttachmentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen || !caseRecord) return null;

  const attachments = caseRecord.pdf_attachments || [];
  const currentAttachment: PdfAttachment | undefined = attachments[activeAttachmentIndex] || attachments[0];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoomLevel(100);

  const handleDownload = () => {
    if (!currentAttachment) return;
    const link = document.createElement('a');
    link.href = currentAttachment.url;
    link.download = currentAttachment.name || `${caseRecord.case_id}_Dossier.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!currentAttachment) return;
    const printWindow = window.open(currentAttachment.url, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-0 sm:p-4">
      {/* Container */}
      <div 
        className="w-full h-full sm:max-w-6xl sm:h-[92vh] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 gap-3">
          
          {/* File & Case Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-transparent">
                  {caseRecord.case_id}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                  {currentAttachment?.name || 'Case_Folder_Document.pdf'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{currentAttachment ? formatFileSize(currentAttachment.size) : '0 KB'}</span>
                <span>•</span>
                <span>IOC: {caseRecord.ioc_name}</span>
              </div>
            </div>
          </div>

          {/* Viewer Tools & Actions: min 44x44px touch targets */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls (Desktop) */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 p-0.5">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 60}
                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 text-xs font-mono font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                title="Reset Zoom to 100%"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Print Action */}
            <button
              onClick={handlePrint}
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white dark:border-slate-700/80 flex items-center justify-center transition-colors cursor-pointer"
              title="Print Document"
              aria-label="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download Action */}
            <button
              onClick={handleDownload}
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white dark:border-slate-700/80 flex items-center justify-center transition-colors cursor-pointer"
              title="Download PDF File"
              aria-label="Download PDF File"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white dark:border-transparent flex items-center justify-center transition-colors ml-1 cursor-pointer"
              aria-label="Close PDF Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Multi-Attachment Tabs (if multiple attachments exist) */}
        {attachments.length > 1 && (
          <div className="flex items-center gap-1 px-4 sm:px-6 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mr-2 flex-shrink-0">
              Folder Exhibits:
            </span>
            {attachments.map((att, idx) => (
              <button
                key={att.id || idx}
                onClick={() => setActiveAttachmentIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  idx === activeAttachmentIndex
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 dark:border-transparent'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px]">{att.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Document Body / Viewer Frame */}
        <div className="flex-1 bg-slate-100/80 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center p-2 sm:p-4">
          {currentAttachment ? (
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full h-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800/80 transition-transform duration-150 flex flex-col"
            >
              <iframe
                src={`${currentAttachment.url}#toolbar=0`}
                title={currentAttachment.name || 'PDF Preview'}
                className="w-full h-full border-0 bg-slate-100 dark:bg-slate-800"
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No PDF attachment available for this case record.</p>
            </div>
          )}
        </div>

        {/* Bottom Chain-of-Custody Attestation Footer */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">CALOOCAN CITY POLICE STATION (CCPS-SIDMB) • Verified Chain-of-Custody</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-slate-700 dark:text-slate-300">
            <span>Docket: {caseRecord.case_id}</span>
            {caseRecord.barangay && (
              <>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{caseRecord.barangay}</span>
              </>
            )}
            <span>•</span>
            <span>Date: {caseRecord.date_committed}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
