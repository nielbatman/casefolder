import React, { useState, useRef, useEffect } from 'react';
import type { CaseRecord, CaseStatus, PdfAttachment, SuspectStatus } from '../types/case';
import { CaseService } from '../services/caseService';
import { formatFileSize, generateOfficialCasePdf } from '../utils/pdfGenerator';
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  Check,
  AlertCircle,
  Shield,
  Sparkles,
  Loader2,
  Calendar,
  User,
  UserX,
  PenTool,
  Plus
} from 'lucide-react';

export const PNP_STANDARD_CRIMES = [
  'MURDER',
  'HOMICIDE',
  'PHYSICAL INJURY',
  'RAPE',
  'ROBBERY',
  'THEFT',
  'CARNAPPING MC',
  'CARNAPPING MV',
  'SPECIAL COMPLEX CRIME',
  'OTHERS',
] as const;

export const CCPS_IOC_ROSTER = [
  'PMSg Rodriguez',
  'PSSg Gapiangao',
  'Pat Jomoc',
  'PSSg Laceda',
  'PSSg Gavilan',
  'PCpl Getalado',
  'PSSg Dionaldo',
  'PSSg Albores',
  'PSSg Gamboa',
  'PSSg Ceria',
  'PSSg Olipares',
  'PSSg Viado',
  'PSSg Ramirez',
  'Others',
] as const;

export interface IocFormEntry {
  id: string;
  selectedIoc: string;
  customIoc: string;
}

export const parseIocsFromRecord = (raw?: string): IocFormEntry[] => {
  if (!raw || !raw.trim()) {
    return [{ id: 'ioc-1', selectedIoc: 'PMSg Rodriguez', customIoc: '' }];
  }
  // Split by comma, slash, or semicolon
  const parts = raw.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return [{ id: 'ioc-1', selectedIoc: 'PMSg Rodriguez', customIoc: '' }];
  }
  return parts.map((name, idx) => {
    const matched = CCPS_IOC_ROSTER.find(
      (r) => r !== 'Others' && r.toLowerCase() === name.toLowerCase()
    );
    if (matched) {
      return { id: `ioc-${idx + 1}`, selectedIoc: matched, customIoc: '' };
    }
    return { id: `ioc-${idx + 1}`, selectedIoc: 'Others', customIoc: name };
  });
};

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Partial<CaseRecord>, newPdfs: PdfAttachment[]) => Promise<void>;
  editRecord?: CaseRecord | null;
  nextCaseId: string;
}

export const CaseFormModal: React.FC<CaseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editRecord,
  nextCaseId,
}) => {
  const isEditing = Boolean(editRecord);

  // CCPS IOC Form Fields
  const [caseId, setCaseId] = useState('');
  const [blotterNumber, setBlotterNumber] = useState('');
  const [dateCommitted, setDateCommitted] = useState('');

  // Case / Charge Dropdown + OTHERS pop-out
  const [selectedCrime, setSelectedCrime] = useState<string>('ROBBERY');
  const [customCrimeInput, setCustomCrimeInput] = useState<string>('');

  const [victimName, setVictimName] = useState('');
  const [suspectName, setSuspectName] = useState('');
  const [suspectStatus, setSuspectStatus] = useState<SuspectStatus>('At Large');
  
  // Multiple IOC Support (Investigator-on-Case list)
  const [iocList, setIocList] = useState<IocFormEntry[]>([
    { id: 'ioc-1', selectedIoc: 'PMSg Rodriguez', customIoc: '' },
  ]);

  const [status, setStatus] = useState<CaseStatus>('Under Investigation');
  const [summary, setSummary] = useState('');

  // PDF Attachments State
  const [existingAttachments, setExistingAttachments] = useState<PdfAttachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<PdfAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers for dynamic multiple IOCs
  const handleAddIoc = () => {
    const selectedValues = new Set(iocList.map((item) => item.selectedIoc));
    const nextAvailable =
      CCPS_IOC_ROSTER.find((officer) => officer !== 'Others' && !selectedValues.has(officer)) ||
      'PMSg Rodriguez';
    setIocList((prev) => [
      ...prev,
      {
        id: `ioc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        selectedIoc: nextAvailable,
        customIoc: '',
      },
    ]);
  };

  const handleRemoveIoc = (id: string) => {
    if (iocList.length <= 1) return;
    setIocList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateIoc = (id: string, field: 'selectedIoc' | 'customIoc', value: string) => {
    setIocList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
    if (formErrors.iocName) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy.iocName;
        return copy;
      });
    }
  };

  const getResolvedIocNames = (): string[] => {
    return iocList
      .map((item) => (item.selectedIoc === 'Others' ? item.customIoc.trim() : item.selectedIoc.trim()))
      .filter(Boolean);
  };

  const getFinalIocString = (): string => {
    const names = getResolvedIocNames();
    return names.join(', ');
  };

  useEffect(() => {
    if (isOpen) {
      if (editRecord) {
        setCaseId(editRecord.case_id);
        setBlotterNumber(editRecord.blotter_number || '');
        setDateCommitted(editRecord.date_committed);

        // Determine if title is in PNP_STANDARD_CRIMES or custom
        const matched = PNP_STANDARD_CRIMES.find(
          (c) => c !== 'OTHERS' && c.toLowerCase() === editRecord.title.trim().toLowerCase()
        );
        if (matched) {
          setSelectedCrime(matched);
          setCustomCrimeInput('');
        } else {
          setSelectedCrime('OTHERS');
          setCustomCrimeInput(editRecord.title);
        }

        setVictimName(editRecord.victim_name);
        setSuspectName(editRecord.suspect_name || '');
        setSuspectStatus(editRecord.suspect_status || 'At Large');
        setIocList(parseIocsFromRecord(editRecord.ioc_name));

        setStatus(editRecord.status);
        setSummary(editRecord.summary || '');
        setExistingAttachments(editRecord.pdf_attachments || []);
        setNewAttachments([]);
      } else {
        setCaseId(nextCaseId);
        setBlotterNumber(`IRF-CCPS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
        setDateCommitted(new Date().toISOString().split('T')[0]);
        setSelectedCrime('ROBBERY');
        setCustomCrimeInput('');
        setVictimName('');
        setSuspectName('');
        setSuspectStatus('At Large');
        setIocList([{ id: `ioc-init-${Date.now()}`, selectedIoc: 'PMSg Rodriguez', customIoc: '' }]);
        setStatus('Under Investigation');
        setSummary('');
        setExistingAttachments([]);
        setNewAttachments([]);
      }
      setFormErrors({});
      setUploadError(null);
    }
  }, [isOpen, editRecord, nextCaseId]);

  if (!isOpen) return null;

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    setUploadError(null);
    setIsProcessingPdf(true);

    try {
      const added: PdfAttachment[] = [];
      for (const file of files) {
        if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
          throw new Error(`"${file.name}" is not a valid PDF file.`);
        }
        if (file.size > 25 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 25MB maximum size limit.`);
        }

        const attachment = await CaseService.processUploadedPdf(file, caseId || 'CCPS-TEMP');
        added.push(attachment);
      }

      setNewAttachments((prev) => [...prev, ...added]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(msg);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Generate Official PNP CCPS Case Folder PDF
  const handleGenerateOfficialCcpsPdf = () => {
    const finalTitle = selectedCrime === 'OTHERS' ? (customCrimeInput || 'UNSPECIFIED OFFENSE') : selectedCrime;
    const finalIoc = getFinalIocString() || 'CCPS Investigator';

    const pdfBlob = generateOfficialCasePdf({
      caseId: caseId || 'CCPS-2026-TEMP',
      blotterNumber: blotterNumber || 'IRF-CCPS-PENDING',
      title: finalTitle,
      dateCommitted: dateCommitted || new Date().toISOString().split('T')[0],
      victimName: victimName || 'Complainant / Victim',
      suspectName: suspectName.trim() || undefined,
      suspectStatus: suspectStatus,
      iocName: finalIoc,
      status,
      summary: summary || 'Operatives of Caloocan City Police Station responded to the incident scene and conducted initial investigation.',
    });

    const objectUrl = URL.createObjectURL(pdfBlob);
    const generatedAttachment: PdfAttachment = {
      id: `gen-ccps-pdf-${Date.now()}`,
      name: `${caseId || 'CCPS'}_PNP_Case_Folder_Docket.pdf`,
      size: pdfBlob.size,
      uploaded_at: new Date().toISOString(),
      url: objectUrl,
      page_count: 1,
      mime_type: 'application/pdf',
      document_type: 'General Case Folder',
    };

    setNewAttachments((prev) => [...prev, generatedAttachment]);
  };

  const handleRemoveExistingAttachment = (attId: string) => {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleRemoveNewAttachment = (attId: string) => {
    setNewAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!caseId.trim()) errors.caseId = 'CCPS Docket Number is required';
    if (!dateCommitted) errors.dateCommitted = 'Date Committed is required';

    if (selectedCrime === 'OTHERS') {
      if (!customCrimeInput.trim()) {
        errors.customCrime = 'Please manually enter the specific case / charge name';
      }
    }

    if (!victimName.trim()) errors.victimName = 'Name of Complainant / Victim is required';
    
    // Validate IOCs
    const emptyCustomIoc = iocList.some((item) => item.selectedIoc === 'Others' && !item.customIoc.trim());
    if (emptyCustomIoc) {
      errors.iocName = 'Please enter the Rank and Name of each custom IOC';
    } else if (getResolvedIocNames().length === 0) {
      errors.iocName = 'Please select or enter at least one Investigator-on-Case';
    }

    // PDF is optional; if none is attached, official CCPS docket PDF will be auto-generated upon save

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const finalTitle = selectedCrime === 'OTHERS'
        ? customCrimeInput.trim().toUpperCase()
        : selectedCrime;

      const finalIoc = getFinalIocString();

      let allAttachments = [...existingAttachments, ...newAttachments];
      let newPdfsToUpload = [...newAttachments];

      // Auto-generate official docket PDF if case has no attachments yet
      if (allAttachments.length === 0) {
        const generatedBlob = generateOfficialCasePdf({
          caseId: caseId || 'CCPS-TEMP',
          blotterNumber: blotterNumber || 'IRF-CCPS-PENDING',
          title: finalTitle,
          dateCommitted: dateCommitted || new Date().toISOString().split('T')[0],
          victimName: victimName || 'Complainant / Victim',
          suspectName: suspectName.trim() || undefined,
          suspectStatus: suspectStatus,
          iocName: finalIoc || 'CCPS Investigator',
          status,
          summary: summary || 'Official case docket recorded at Caloocan City Police Station (CCPS).',
        });
        const objectUrl = URL.createObjectURL(generatedBlob);
        const autoAttachment: PdfAttachment = {
          id: `gen-auto-pdf-${Date.now()}`,
          name: `${caseId || 'CCPS'}_PNP_Case_Folder_Docket.pdf`,
          size: generatedBlob.size,
          uploaded_at: new Date().toISOString(),
          url: objectUrl,
          page_count: 1,
          mime_type: 'application/pdf',
          document_type: 'General Case Folder',
        };
        allAttachments = [autoAttachment];
        newPdfsToUpload = [autoAttachment];
      }

      await onSave(
        {
          case_id: caseId.trim(),
          blotter_number: blotterNumber.trim(),
          title: finalTitle,
          date_committed: dateCommitted,
          victim_name: victimName.trim(),
          suspect_name: suspectName.trim() || undefined,
          suspect_status: suspectStatus,
          ioc_name: finalIoc,
          station: 'Caloocan City Police Station (CCPS)',
          status,
          category: selectedCrime,
          summary: summary.trim(),
          pdf_attachments: allAttachments,
        },
        newPdfsToUpload
      );
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAttachments = existingAttachments.length + newAttachments.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[11px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold">
                CALOOCAN CITY POLICE STATION • SIDMB
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              {isEditing ? `Edit Case Docket: ${editRecord?.case_id}` : 'Encode New CCPS Case Folder (IOC Entry)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">

          {/* Row 1: CCPS Docket No & PNP IRF/Blotter Entry No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                CCPS Case Docket No. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="e.g. CCPS-2026-001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
              />
              {formErrors.caseId && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.caseId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                PNP Blotter / IRF Entry No.
              </label>
              <input
                type="text"
                value={blotterNumber}
                onChange={(e) => setBlotterNumber(e.target.value)}
                placeholder="e.g. IRF-CCPS-2026-10-0492"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
              />
            </div>
          </div>

          {/* Row 2: Date Committed */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Date Committed</span> <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dateCommitted}
              onChange={(e) => setDateCommitted(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
            />
            {formErrors.dateCommitted && (
              <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {formErrors.dateCommitted}
              </p>
            )}
          </div>

          {/* Row 3: Case Title / Charge (Dropdown + OTHERS pop-out) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Case <span className="text-rose-500">*</span>
            </label>

            <select
              value={selectedCrime}
              onChange={(e) => {
                setSelectedCrime(e.target.value);
                if (e.target.value !== 'OTHERS') {
                  setCustomCrimeInput('');
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
            >
              {PNP_STANDARD_CRIMES.map((crime) => (
                <option key={crime} value={crime} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">
                  {crime}
                </option>
              ))}
            </select>

            {/* Pop-out Box when OTHERS is selected */}
            {selectedCrime === 'OTHERS' && (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/40 shadow-sm animate-slide-down space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  <PenTool className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Manual Case Entry (Pop-out Box)</span>
                </div>
                <input
                  type="text"
                  autoFocus
                  value={customCrimeInput}
                  onChange={(e) => setCustomCrimeInput(e.target.value)}
                  placeholder="Enter specific offense or charge (e.g. VIOLATION OF RA 9165, ESTAFA, VAWC)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-blue-300 dark:border-blue-400/60 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                />
                {formErrors.customCrime && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formErrors.customCrime}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Row 4: Name of Victim, Suspect & Name of IOC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Left Column: Victim & Suspect (placed exactly where user indicated) */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Name of Victim / Complainant</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  placeholder="e.g. Clarissa Tan y Mendoza, People of the Philippines"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
                />
                {formErrors.victimName && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.victimName}
                  </p>
                )}
              </div>

              {/* Name of Suspect / Respondent (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-slate-400" />
                  <span>Name of Suspect / Respondent</span> <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={suspectName}
                    onChange={(e) => setSuspectName(e.target.value)}
                    placeholder="e.g. Danilo Santos y Castro @ 'Danny', Unidentified"
                    className="sm:col-span-2 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
                  />
                  <select
                    value={suspectStatus}
                    onChange={(e) => setSuspectStatus(e.target.value as SuspectStatus)}
                    className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 cursor-pointer shadow-xs"
                    title="Suspect Status"
                  >
                    <option value="At Large">At Large</option>
                    <option value="Arrested / Inquested">Arrested</option>
                    <option value="Detained at CCPS">Detained</option>
                    <option value="Referred to Prosecutor">Referred</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Name of IOC (Investigator-on-Case)</span> <span className="text-rose-500">*</span>
              </label>

              {/* Clean stacked IOC dropdowns */}
              <div className="space-y-2">
                {iocList.map((iocItem) => (
                  <div key={iocItem.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={iocItem.selectedIoc}
                        onChange={(e) => handleUpdateIoc(iocItem.id, 'selectedIoc', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 shadow-xs cursor-pointer"
                      >
                        {CCPS_IOC_ROSTER.map((officer) => (
                          <option
                            key={officer}
                            value={officer}
                            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium py-1"
                          >
                            {officer}
                          </option>
                        ))}
                      </select>

                      {iocList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIoc(iocItem.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                          title="Remove this IOC"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Pop-out manual input box when "Others" is selected */}
                    {iocItem.selectedIoc === 'Others' && (
                      <input
                        type="text"
                        value={iocItem.customIoc}
                        onChange={(e) => handleUpdateIoc(iocItem.id, 'customIoc', e.target.value)}
                        placeholder="Enter Rank and Name of IOC (e.g. PCpl Juan Dela Cruz)..."
                        className="w-full px-3.5 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 shadow-inner"
                        autoFocus
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Single, simple Add IOC button */}
              <button
                type="button"
                onClick={handleAddIoc}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add IOC</span>
              </button>

              {formErrors.iocName && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.iocName}
                </p>
              )}
            </div>
          </div>

          {/* Row 5: Case Status Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Case Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CaseStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
            >
              <option value="Solved" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Solved</option>
              <option value="Cleared" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Cleared</option>
              <option value="Under Investigation" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Under Investigation</option>
            </select>
          </div>

          {/* Row 6: Summary / Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Investigative Summary & Notes
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Initial details, evidence seized, or actions taken by Caloocan CPS operatives..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 resize-none"
            />
          </div>

          {/* Row 7: PDF Attachment Drag & Drop Dropzone */}
          <div className="pt-1">
            <div className="mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                PDF Case Folder Attachment <span className="text-slate-400 font-normal lowercase">(optional - auto-generated if empty)</span>
              </label>
            </div>

            {/* Dropzone container */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-[1.01]'
                  : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500 bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-950/40 dark:hover:bg-slate-950/70'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                  {isProcessingPdf ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {isDragging ? 'Drop CCPS Case Folder PDF here...' : 'Drag & drop Case Folder PDF or click to browse'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Single or multi-page PDF documents (max 25MB per file)
                  </p>
                </div>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </p>
            )}

            {formErrors.pdf && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{formErrors.pdf}</span>
              </p>
            )}

            {/* List of Attached PDF Files */}
            {totalAttachments > 0 && (
              <div className="mt-3 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Attached Case Exhibits ({totalAttachments}):
                </span>

                {existingAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{att.name}</p>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {formatFileSize(att.size)} • Verified CCPS Exhibit
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingAttachment(att.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {newAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-600/30"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-200 truncate">{att.name}</p>
                        <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400/80">
                          {formatFileSize(att.size)} • Ready to upload
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewAttachment(att.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </form>

        {/* Modal Footer Actions: Min 44px tap targets */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[44px] px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isProcessingPdf}
            className="min-h-[44px] flex items-center gap-2 px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-glow-primary border border-blue-400/30 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to CCPS Ledger...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save CCPS Docket Changes' : 'Submit CCPS Case Folder'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
