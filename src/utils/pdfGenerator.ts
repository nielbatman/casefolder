/**
 * Official Philippine National Police (PNP) Case Folder PDF Generator
 * Caloocan City Police Station (CCPS) - Northern Police District (NPD)
 * Station Investigation and Detective Management Branch (SIDMB)
 */

export interface CcpsPdfDossierData {
  caseId: string;
  blotterNumber?: string;
  title: string;
  dateCommitted: string;
  timeCommitted?: string;
  victimName: string;
  suspectName?: string;
  suspectStatus?: string;
  iocName: string;
  barangay?: string;
  location?: string;
  status: string;
  priority?: string;
  prosecutorDocketNo?: string;
  summary?: string;
}

export function generateOfficialCasePdf(data: CcpsPdfDossierData): Blob {
  const sanitize = (str: string) => (str || '').replace(/[()\\]/g, ' ');
  const caseId = sanitize(data.caseId);
  const irfNo = sanitize(data.blotterNumber || 'IRF-CCPS-2026-PENDING');
  const title = sanitize(data.title);
  const date = sanitize(data.dateCommitted);
  const time = sanitize(data.timeCommitted || '14:00H');
  const victim = sanitize(data.victimName);
  const suspect = sanitize(data.suspectName || 'Unidentified / At-Large');
  const suspectStatus = sanitize(data.suspectStatus || 'Under Investigation');
  const ioc = sanitize(data.iocName);
  const barangay = sanitize(data.barangay || 'Caloocan City');
  const location = sanitize(data.location || 'Samson Road, Caloocan City');
  const status = sanitize(data.status).toUpperCase();
  const summary = sanitize(data.summary || 'Initial spot report and investigative facts gathered at the scene of the crime.');
  const prosDocket = sanitize(data.prosecutorDocketNo || 'For Inquest / Preliminary Investigation');

  const streamContent = `
q
0.08 0.16 0.32 rg
0 735 612 57 re f

1 1 1 rg
BT
/F1 10 Tf
170 772 Td
(Republic of the Philippines) Tj
0 -12 Td
(PHILIPPINE NATIONAL POLICE - NORTHERN POLICE DISTRICT) Tj
/F1 12 Tf
0 -14 Td
(CALOOCAN CITY POLICE STATION) Tj
/F2 8.5 Tf
0 -11 Td
(Station Investigation and Detective Management Branch [SIDMB]) Tj
0 -9 Td
(Samson Road, Caloocan City, Metro Manila | Hotline: 8288-8811) Tj
ET

0.85 0.7 0.15 rg
0 732 612 3 re f

0.1 0.1 0.1 rg
BT
/F1 13 Tf
40 705 Td
(OFFICIAL POLICE CASE FOLDER & IOC INVESTIGATION DOCKET) Tj
/F2 9.5 Tf
0 -15 Td
(CCPS DOCKET NO: ${caseId}   |   PNP BLOTTER / IRF NO: ${irfNo}) Tj
0 -13 Td
(STATUS: [${status}]   |   CALOOCAN CITY POLICE STATION DOCKET) Tj
ET

0.95 0.96 0.98 rg
40 500 532 165 re f
0.75 0.8 0.88 RG
1 w
40 500 532 165 re S

0.12 0.2 0.35 rg
BT
/F1 10 Tf
55 645 Td
(I. CASE PARTICULARS & JURISDICTION) Tj
/F2 9 Tf
0 -16 Td
(Offense / Specific Charge:  ${title}) Tj
0 -15 Td
(Date & Time Committed:      ${date} at ${time}) Tj
0 -15 Td
(Place of Occurrence:        ${location}, ${barangay}, Caloocan City) Tj
0 -15 Td
(Victim / Complainant:       ${victim}) Tj
0 -15 Td
(Suspect / Respondent:       ${suspect} [Status: ${suspectStatus}]) Tj
0 -15 Td
(Investigator-on-Case (IOC): ${ioc}) Tj
0 -15 Td
(Prosecutor Transmittal Ref: ${prosDocket}) Tj
ET

0.12 0.2 0.35 rg
BT
/F1 10 Tf
40 475 Td
(II. INVESTIGATIVE SYNOPSIS & AFFIDAVIT OF PROBABLE CAUSE) Tj
/F2 8.5 Tf
0 -16 Td
(${summary}) Tj
0 -14 Td
(Operatives of Caloocan City Police Station responded and secured the crime scene in accordance with) Tj
0 -12 Td
(PNP Operational Procedures. Evidence gathered has been placed under standard Chain of Custody.) Tj
0 -12 Td
(Sworn statements, spot reports, and forensic laboratory transmittals are cataloged in this folder.) Tj
ET

0.85 0.88 0.92 rg
40 375 532 1 re f

0.1 0.15 0.25 rg
BT
/F1 9.5 Tf
40 355 Td
(III. EXHIBITS & CASE ATTACHMENT INVENTORY CHECKLIST) Tj
/F2 8 Tf
0 -14 Td
([X] 1. Incident Record Form (IRF) / Police Blotter Extract) Tj
0 -12 Td
([X] 2. Sworn Statement / Sinumpaang Salaysay of Complainant & Witnesses) Tj
0 -12 Td
([X] 3. Initial Investigation & Progress Report of the Investigator-on-Case) Tj
0 -12 Td
([X] 4. PNP Custodial Booking Sheet & Arrest Report (if suspect arrested)) Tj
0 -12 Td
([X] 5. Receipt of Physical Evidence / Inventory of Seized Properties) Tj
0 -12 Td
([X] 6. Endorsement / Referral Letter to Office of the City Prosecutor - Caloocan) Tj
ET

0.7 0.7 0.7 RG
50 170 170 1 re S
220 170 170 1 re S
400 170 160 1 re S

0.2 0.25 0.3 rg
BT
/F2 8 Tf
50 156 Td
(PREPARED BY:) Tj
/F1 8.5 Tf
0 -12 Td
(${ioc}) Tj
/F2 7.5 Tf
0 -10 Td
(Investigator-on-Case [IOC]) Tj
0 -9 Td
(Caloocan CPS - SIDMB) Tj

170 31 Td
(NOTED BY:) Tj
/F1 8.5 Tf
0 -12 Td
(PMAJ EDUARDO C. VALENZUELA) Tj
/F2 7.5 Tf
0 -10 Td
(Chief, SIDMB) Tj
0 -9 Td
(Caloocan City Police Station) Tj

180 31 Td
(APPROVED BY:) Tj
/F1 8.5 Tf
0 -12 Td
(PCOL REYNALDO S. REYES) Tj
/F2 7.5 Tf
0 -10 Td
(Chief of Police) Tj
0 -9 Td
(Caloocan City Police Station) Tj
ET

0.85 0.88 0.92 RG
40 60 532 1 re S
0.4 0.45 0.5 rg
BT
/F2 7 Tf
40 45 Td
(CALOOCAN CITY POLICE STATION * STATION INVESTIGATION AND DETECTIVE MANAGEMENT BRANCH * DOCKET: ${caseId}) Tj
ET
Q
`;

  const streamLength = streamContent.length;

  const pdfParts = [
    '%PDF-1.4\n',
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    'xref\n0 7\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000244 00000 n \n',
    'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n500\n%%EOF',
  ];

  return new Blob(pdfParts, { type: 'application/pdf' });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const CALOOCAN_BARANGAYS = [
  'Bagong Silang (Brgy. 176)',
  'Camarin (Brgy. 175)',
  'Camarin (Brgy. 178)',
  'Bagumbong (Brgy. 171)',
  'Deparo (Brgy. 168)',
  'Tala (Brgy. 180)',
  'Tala (Brgy. 185)',
  'Grace Park West (Brgy. 54)',
  'Grace Park East (Brgy. 60)',
  'Monumento / Rizal Ave (Brgy. 81)',
  'Sangandaan (Brgy. 8)',
  'Maypajo (Brgy. 31)',
  'Kaunlaran Village (Brgy. 22)',
  'Morning Breeze (Brgy. 84)',
  'Caloocan Poblacion (Brgy. 1)',
  'Other Caloocan Barangay',
];
