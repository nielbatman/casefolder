import { supabase, checkSupabaseConnection } from '../lib/supabase';
import type { CaseRecord, PdfAttachment } from '../types/case';
import { getInitialCaseDossiers } from '../utils/mockData';
import { blobToDataUrl } from '../utils/pdfGenerator';

const STORAGE_KEY = 'ccps_caloocan_case_dossiers_v2';

export class CaseService {
  private static isSupabaseActive = false;
  private static hasCheckedConnection = false;

  public static async initConnection(): Promise<{ isCloud: boolean; message: string }> {
    const status = await checkSupabaseConnection();
    this.hasCheckedConnection = true;
    this.isSupabaseActive = status.connected && status.hasTable;

    if (this.isSupabaseActive) {
      return { isCloud: true, message: 'Connected to CCPS Supabase PostgreSQL (Cloud Mode Active)' };
    } else if (status.connected && !status.hasTable) {
      return { isCloud: false, message: 'Supabase reachable, but CCPS table is pending migration. Using Local Safe Storage.' };
    } else {
      return { isCloud: false, message: 'Using Caloocan CPS Local Safe Storage.' };
    }
  }

  public static async getCases(includeDeleted = false): Promise<{ cases: CaseRecord[]; source: 'cloud' | 'local' }> {
    if (!this.hasCheckedConnection) {
      await this.initConnection();
    }

    if (this.isSupabaseActive) {
      try {
        let query = supabase
          .from('case_folders')
          .select('*')
          .order('date_committed', { ascending: false });

        if (!includeDeleted) {
          query = query.is('deleted_at', null);
        }

        const { data, error } = await query;
        if (!error && data) {
          const cases: CaseRecord[] = data.map((item) => ({
            ...item,
            pdf_attachments: Array.isArray(item.pdf_attachments) ? item.pdf_attachments : [],
          }));
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
          } catch {
            // ignore
          }
          return { cases, source: 'cloud' };
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local CCPS ledger:', err);
      }
    }

    // Local Storage Fallback
    const local = localStorage.getItem(STORAGE_KEY);
    if (!local) {
      const initial = getInitialCaseDossiers();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return {
        cases: includeDeleted ? initial : initial.filter((c) => !c.deleted_at),
        source: 'local',
      };
    }

    try {
      const parsed: CaseRecord[] = JSON.parse(local);
      return {
        cases: includeDeleted ? parsed : parsed.filter((c) => !c.deleted_at),
        source: 'local',
      };
    } catch {
      const initial = getInitialCaseDossiers();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return {
        cases: includeDeleted ? initial : initial.filter((c) => !c.deleted_at),
        source: 'local',
      };
    }
  }

  public static getNextCaseId(existingCases: CaseRecord[]): string {
    const yearShort = new Date().getFullYear().toString().slice(-2);
    const prefix = `XV-02-INQ-${yearShort}A-`;
    const sequenceNumbers = existingCases
      .map((c) => {
        if (c.case_id.startsWith(prefix)) {
          const numPart = parseInt(c.case_id.replace(prefix, ''), 10);
          return isNaN(numPart) ? 0 : numPart;
        }
        return 0;
      })
      .filter((n) => n > 0);

    const maxSeq = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) : existingCases.length;
    const nextSeq = maxSeq + 1;
    return `${prefix}${String(nextSeq).padStart(5, '0')}`;
  }

  public static async createCase(caseData: Omit<CaseRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<CaseRecord> {
    const now = new Date().toISOString();
    const newRecord: CaseRecord = {
      ...caseData,
      id: crypto.randomUUID ? crypto.randomUUID() : `ccps-${Date.now()}`,
      station: 'Caloocan City Police Station (CCPS)',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    if (this.isSupabaseActive) {
      try {
        const { error } = await supabase.from('case_folders').insert([
          {
            id: newRecord.id,
            case_id: newRecord.case_id,
            blotter_number: newRecord.blotter_number || '',
            date_committed: newRecord.date_committed,
            time_committed: newRecord.time_committed || '',
            title: newRecord.title,
            victim_name: newRecord.victim_name,
            suspect_name: newRecord.suspect_name || '',
            suspect_status: newRecord.suspect_status || 'Unknown',
            ioc_name: newRecord.ioc_name,
            station: newRecord.station,
            substation_or_section: newRecord.substation_or_section || 'SIDMB',
            barangay: newRecord.barangay || 'Caloocan City',
            incident_location: newRecord.incident_location || '',
            status: newRecord.status,
            priority: newRecord.priority || 'Standard',
            category: newRecord.category || 'General Offense',
            prosecutor_docket_no: newRecord.prosecutor_docket_no || '',
            summary: newRecord.summary || '',
            pdf_attachments: newRecord.pdf_attachments,
            created_at: newRecord.created_at,
            updated_at: newRecord.updated_at,
            deleted_at: null,
          },
        ]);
        if (error) {
          console.error('Supabase insert error, saving locally:', error);
        }
      } catch (err) {
        console.error('Failed to insert into Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEY);
    const existing: CaseRecord[] = local ? JSON.parse(local) : [];
    existing.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    return newRecord;
  }

  public static async updateCase(id: string, updates: Partial<CaseRecord>): Promise<CaseRecord> {
    const now = new Date().toISOString();

    if (this.isSupabaseActive) {
      try {
        const { error } = await supabase
          .from('case_folders')
          .update({
            ...updates,
            updated_at: now,
          })
          .eq('id', id);

        if (error && updates.case_id) {
          await supabase
            .from('case_folders')
            .update({
              ...updates,
              updated_at: now,
            })
            .eq('case_id', updates.case_id);
        }
      } catch (err) {
        console.error('Failed to update in Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEY);
    const existing: CaseRecord[] = local ? JSON.parse(local) : getInitialCaseDossiers();
    
    // Match by id OR by case_id
    let index = existing.findIndex((c) => c.id === id);
    if (index === -1 && updates.case_id) {
      index = existing.findIndex((c) => c.case_id === updates.case_id);
    }
    if (index === -1 && id) {
      index = existing.findIndex((c) => c.case_id === id);
    }

    let updated: CaseRecord;
    if (index !== -1) {
      updated = {
        ...existing[index],
        ...updates,
        updated_at: now,
      };
      existing[index] = updated;
    } else {
      // Upsert: Create or update safely without throwing error
      updated = {
        id: id || (updates.case_id ? `case-${updates.case_id}` : `ccps-${Date.now()}`),
        case_id: updates.case_id || 'CCPS-RECORD',
        blotter_number: updates.blotter_number || '',
        date_committed: updates.date_committed || now.split('T')[0],
        title: updates.title || 'Official Case Record',
        victim_name: updates.victim_name || 'Complainant',
        ioc_name: updates.ioc_name || 'CCPS Investigator',
        station: updates.station || 'Caloocan City Police Station (CCPS)',
        status: updates.status || 'Under Investigation',
        pdf_attachments: updates.pdf_attachments || [],
        created_at: now,
        ...updates,
        updated_at: now,
      } as CaseRecord;
      existing.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return updated;
  }

  public static async softDeleteCase(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.updateCase(id, { deleted_at: now });
  }

  public static async restoreCase(id: string): Promise<void> {
    await this.updateCase(id, { deleted_at: null });
  }

  public static async hardDeleteCase(id: string): Promise<void> {
    if (this.isSupabaseActive) {
      try {
        await supabase.from('case_folders').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete from Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const existing: CaseRecord[] = JSON.parse(local);
      const filtered = existing.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  }

  public static async processUploadedPdf(file: File, caseId: string): Promise<PdfAttachment> {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      throw new Error('Invalid file format. Only PDF documents are allowed.');
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File exceeds the 25MB maximum size limit.');
    }

    let cloudUrl: string | undefined;
    let storagePath: string | undefined;

    if (this.isSupabaseActive) {
      try {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        storagePath = `ccps/${caseId}/${Date.now()}_${cleanFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('case-folders')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('case-folders')
            .getPublicUrl(storagePath);

          cloudUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload skipped/failed, using local blob:', err);
      }
    }

    const dataUrl = await blobToDataUrl(file);

    return {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      size: file.size,
      uploaded_at: new Date().toISOString(),
      url: cloudUrl || dataUrl,
      storage_path: storagePath,
      page_count: 1,
      mime_type: 'application/pdf',
      document_type: 'General Case Folder',
    };
  }

  public static async seedToSupabase(cases: CaseRecord[]): Promise<boolean> {
    try {
      const recordsToInsert = cases.map((c) => ({
        id: c.id,
        case_id: c.case_id,
        blotter_number: c.blotter_number || '',
        date_committed: c.date_committed,
        time_committed: c.time_committed || '',
        title: c.title,
        victim_name: c.victim_name,
        suspect_name: c.suspect_name || '',
        suspect_status: c.suspect_status || 'Unknown',
        ioc_name: c.ioc_name,
        station: c.station || 'Caloocan City Police Station (CCPS)',
        substation_or_section: c.substation_or_section || 'SIDMB',
        barangay: c.barangay || 'Caloocan City',
        incident_location: c.incident_location || '',
        status: c.status,
        priority: c.priority || 'Standard',
        category: c.category || 'ROBBERY',
        prosecutor_docket_no: c.prosecutor_docket_no || '',
        summary: c.summary || '',
        pdf_attachments: c.pdf_attachments || [],
        created_at: c.created_at || new Date().toISOString(),
        updated_at: c.updated_at || new Date().toISOString(),
        deleted_at: c.deleted_at || null,
      }));

      const { error } = await supabase
        .from('case_folders')
        .upsert(recordsToInsert, { onConflict: 'case_id' });

      if (error) {
        console.error('Supabase seed error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to seed to Supabase:', err);
      return false;
    }
  }

  public static async resetToSampleData(): Promise<CaseRecord[]> {
    const initial = getInitialCaseDossiers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    if (this.isSupabaseActive) {
      await this.seedToSupabase(initial);
    }
    return initial;
  }

  public static subscribeToChanges(onUpdate: () => void): () => void {
    const channel = supabase
      .channel('case_folders_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'case_folders' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
