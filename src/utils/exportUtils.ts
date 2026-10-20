import type { CaseRecord } from '../types/case';
import { generateOfficialCasePdf } from './pdfGenerator';

/**
 * Downloads the actual uploaded PDF case folder (or generates the official PDF docket)
 * for the specified case record.
 */
export async function downloadCaseFolderPdf(caseRecord: CaseRecord): Promise<boolean> {
  try {
    const attachment = caseRecord.pdf_attachments && caseRecord.pdf_attachments.length > 0
      ? caseRecord.pdf_attachments[0]
      : null;

    let filename = attachment?.name || `${caseRecord.case_id}_PNP_CCPS_Case_Folder.pdf`;
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }

    if (attachment && attachment.url) {
      const url = attachment.url;

      // 1. If it's a blob: or data: URL, download directly via a link
      if (url.startsWith('blob:') || url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
        }, 200);
        return true;
      }

      // 2. If it's a remote URL (e.g. Supabase storage public URL), fetch as blob to avoid cross-origin issues
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            if (document.body.contains(link)) document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }, 200);
          return true;
        }
      } catch {
        // Fallback: direct window or link navigation
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
        }, 200);
        return true;
      }
    }

    // 3. Fallback: Generate the official PNP CCPS Case Folder PDF dynamically
    const pdfBlob = generateOfficialCasePdf({
      caseId: caseRecord.case_id,
      blotterNumber: caseRecord.blotter_number,
      title: caseRecord.title,
      dateCommitted: caseRecord.date_committed,
      timeCommitted: caseRecord.time_committed,
      victimName: caseRecord.victim_name,
      suspectName: caseRecord.suspect_name,
      suspectStatus: caseRecord.suspect_status,
      iocName: caseRecord.ioc_name,
      barangay: caseRecord.barangay,
      location: caseRecord.incident_location,
      status: caseRecord.status,
      priority: caseRecord.priority,
      prosecutorDocketNo: caseRecord.prosecutor_docket_no,
      summary: caseRecord.summary,
    });

    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 200);

    return true;
  } catch (error) {
    console.error('Failed to download case folder PDF:', error);
    return false;
  }
}

// Alias for backwards compatibility with existing callers
export const exportSingleCaseDocket = downloadCaseFolderPdf;

