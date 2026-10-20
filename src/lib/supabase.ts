import { createClient } from '@supabase/supabase-js';

// User's Supabase credentials provided
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://grxxknpoppkgushaympn.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeHhrbnBvcHBrZ3VzaGF5bXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNzI4NTIsImV4cCI6MjEwNzk0ODg1Mn0.bwrPjjFcs_AiaFujbgmSBhOJaR1s0SLAjYzSpdDt2dM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- CCPS Case Folder Docket - Supabase Schema & Realtime Setup
-- Caloocan City Police Station (PNP-NPD)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/grxxknpoppkgushaympn/sql
-- ========================================================

-- 1. Create case_folders table (or add columns if existing)
CREATE TABLE IF NOT EXISTS public.case_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT UNIQUE NOT NULL,
    blotter_number TEXT,
    date_committed DATE NOT NULL,
    time_committed TEXT,
    title TEXT NOT NULL,
    victim_name TEXT NOT NULL,
    suspect_name TEXT,
    suspect_status TEXT,
    ioc_name TEXT NOT NULL,
    station TEXT DEFAULT 'Caloocan City Police Station (CCPS)',
    substation_or_section TEXT DEFAULT 'SIDMB',
    barangay TEXT DEFAULT 'Caloocan City',
    incident_location TEXT,
    status TEXT NOT NULL DEFAULT 'Under Investigation' CHECK (status IN ('Under Investigation', 'Cleared', 'Solved')),
    priority TEXT DEFAULT 'Standard',
    category TEXT DEFAULT 'ROBBERY',
    prosecutor_docket_no TEXT,
    summary TEXT,
    pdf_attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Ensure any existing table has all required columns
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS blotter_number TEXT;
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS time_committed TEXT;
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS suspect_name TEXT;
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS suspect_status TEXT;
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS station TEXT DEFAULT 'Caloocan City Police Station (CCPS)';
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS substation_or_section TEXT DEFAULT 'SIDMB';
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS barangay TEXT DEFAULT 'Caloocan City';
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS incident_location TEXT;
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'ROBBERY';
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS prosecutor_docket_no TEXT;
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS pdf_attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.case_folders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Indexes for high-speed search and filtering
CREATE INDEX IF NOT EXISTS idx_case_folders_case_id ON public.case_folders (case_id);
CREATE INDEX IF NOT EXISTS idx_case_folders_status ON public.case_folders (status);
CREATE INDEX IF NOT EXISTS idx_case_folders_ioc ON public.case_folders (ioc_name);
CREATE INDEX IF NOT EXISTS idx_case_folders_date ON public.case_folders (date_committed);
CREATE INDEX IF NOT EXISTS idx_case_folders_deleted ON public.case_folders (deleted_at);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.case_folders ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for public/anon access
DROP POLICY IF EXISTS "Allow anon select case_folders" ON public.case_folders;
CREATE POLICY "Allow anon select case_folders" ON public.case_folders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert case_folders" ON public.case_folders;
CREATE POLICY "Allow anon insert case_folders" ON public.case_folders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update case_folders" ON public.case_folders;
CREATE POLICY "Allow anon update case_folders" ON public.case_folders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete case_folders" ON public.case_folders;
CREATE POLICY "Allow anon delete case_folders" ON public.case_folders FOR DELETE USING (true);

-- 5. Enable Realtime Sync across devices
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.case_folders;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- 6. Create storage bucket for case PDFs if not existing
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-folders', 'case-folders', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Storage bucket policies for public access
DROP POLICY IF EXISTS "Allow public uploads to case-folders" ON storage.objects;
CREATE POLICY "Allow public uploads to case-folders" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'case-folders');

DROP POLICY IF EXISTS "Allow public view from case-folders" ON storage.objects;
CREATE POLICY "Allow public view from case-folders" ON storage.objects
    FOR SELECT USING (bucket_id = 'case-folders');

DROP POLICY IF EXISTS "Allow public update to case-folders" ON storage.objects;
CREATE POLICY "Allow public update to case-folders" ON storage.objects
    FOR UPDATE USING (bucket_id = 'case-folders');

DROP POLICY IF EXISTS "Allow public delete from case-folders" ON storage.objects;
CREATE POLICY "Allow public delete from case-folders" ON storage.objects
    FOR DELETE USING (bucket_id = 'case-folders');
`;

/**
 * Checks whether the Supabase table 'case_folders' exists and is accessible.
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; hasTable: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('case_folders')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "public.case_folders" does not exist')) {
        return { connected: true, hasTable: false, error: 'Table case_folders not yet created in Supabase.' };
      }
      return { connected: false, hasTable: false, error: error.message };
    }

    return { connected: true, hasTable: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { connected: false, hasTable: false, error: message };
  }
}
