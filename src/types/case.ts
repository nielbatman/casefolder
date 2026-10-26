export type CaseStatus = 'Under Investigation' | 'Cleared' | 'Solved';
export type CasePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type SuspectStatus = 'Arrested / Inquested' | 'At Large' | 'Detained at CCPS' | 'Referred to Prosecutor' | 'Unknown';

export interface PdfAttachment {
  id: string;
  name: string;
  size: number; // in bytes
  uploaded_at: string;
  url: string; // Blob URL, Base64 data URL, or Supabase public URL
  storage_path?: string;
  page_count?: number;
  mime_type?: string;
  document_type?: 'Spot Report' | 'IRF Blotter' | 'Sworn Statement' | 'Booking Sheet' | 'Evidence Inventory' | 'Inquest Transmittal' | 'General Case Folder';
}

export interface CaseRecord {
  id: string;
  case_id: string; // e.g., 'XV-02-INQ-26A-00001'
  blotter_number?: string; // PNP IRF / Blotter Entry (e.g., '2026-01-001')
  date_committed: string; // YYYY-MM-DD
  time_committed?: string; // e.g., '21:30H'
  title: string; // Case Title / Charge (e.g., 'Robbery with Homicide (RPC Art. 294)')
  victim_name: string; // Name of Victim / Complainant
  suspect_name?: string; // Name of Suspect / Respondent
  suspect_status?: SuspectStatus;
  ioc_name: string; // Investigator-on-Case (e.g., 'PMSg Ricardo Dalisay')
  station: string; // e.g., 'Caloocan City Police Station (CCPS)'
  substation_or_section?: string; // e.g., 'SIDMB / General Investigation Section'
  barangay?: string; // e.g., 'Brgy. 176 Bagong Silang', 'Brgy. 81 Monumento'
  incident_location?: string;
  status: CaseStatus;
  priority?: CasePriority;
  category?: string; // e.g. 'Robbery', 'RA 9165 (Illegal Drugs)', 'RA 10591 (Firearms)', etc.
  prosecutor_docket_no?: string; // e.g., 'IS-CC-2026-0812' (Office of the City Prosecutor - Caloocan City)
  summary?: string;
  pdf_attachments: PdfAttachment[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null; // For soft-delete
}

export interface CaseFilter {
  searchQuery: string;
  status: CaseStatus | 'All';
  priority?: CasePriority | 'All';
  category: string | 'All';
  barangay: string | 'All';
  dateFrom: string;
  dateTo: string;
  showDeleted?: boolean;
}

export type ViewMode = 'table' | 'grid';
export type SortField = 'date_committed' | 'case_id' | 'title' | 'status' | 'updated_at' | 'barangay';
export type SortOrder = 'asc' | 'desc';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
