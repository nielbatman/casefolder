import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { 
  CaseRecord, 
  CaseFilter, 
  ViewMode, 
  SortField, 
  SortOrder, 
  ToastMessage,
  PdfAttachment 
} from './types/case';
import { CaseService } from './services/caseService';
import { exportSingleCaseDocket } from './utils/exportUtils';
import { Navbar } from './components/Navbar';
import { MetricsCards } from './components/MetricsCards';
import { FilterBar } from './components/FilterBar';
import { FilterDrawer } from './components/FilterDrawer';
import { CaseTable } from './components/CaseTable';
import { CaseGrid } from './components/CaseGrid';
import { CaseFormModal } from './components/CaseFormModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { DeleteModal } from './components/DeleteModal';
import { SupabaseModal } from './components/SupabaseModal';
import { ToastContainer } from './components/Toast';
import { LoginPage } from './components/LoginPage';
import { supabase } from './lib/supabase';
import { 
  Plus, 
  FolderKanban, 
  SlidersHorizontal, 
  Database, 
  Loader2
} from 'lucide-react';

export const App: React.FC = () => {
  // Auth State
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Cases State
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Filter & Layout State
  const [filters, setFilters] = useState<CaseFilter>({
    searchQuery: '',
    status: 'All',
    category: 'All',
    barangay: 'All',
    dateFrom: '',
    dateTo: '',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('date_committed');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modal Triggers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CaseRecord | null>(null);
  const [viewingPdfRecord, setViewingPdfRecord] = useState<CaseRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CaseRecord | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Theme State (defaults to light mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('ccps_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Supabase Auth Session listener
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data && data.session && data.session.user) {
          setCurrentUserEmail(data.session.user.email || 'IOC Operative');
        } else {
          const localUser = localStorage.getItem('ccps_station_user_email');
          if (localUser) {
            setCurrentUserEmail(localUser);
          }
        }
      } catch (err) {
        console.warn('Session check error:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserEmail(session.user.email || 'IOC Operative');
      } else {
        const localUser = localStorage.getItem('ccps_station_user_email');
        if (!localUser) {
          setCurrentUserEmail(null);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem('ccps_station_user_email');
    setCurrentUserEmail(null);
    showToast('Signed Out', 'You have been signed out of the CCPS Terminal.', 'info');
  };

  // Initialize data and check connection
  const loadCases = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear legacy storage key if exists to ensure Caloocan CCPS data shows immediately
      if (localStorage.getItem('lexis_case_dossiers_v1')) {
        localStorage.removeItem('lexis_case_dossiers_v1');
      }

      const conn = await CaseService.initConnection();
      setIsCloudConnected(conn.isCloud);

      const res = await CaseService.getCases(true);
      setCases(res.cases);
    } catch (err: unknown) {
      console.error(err);
      showToast('Data Error', 'Failed to load case records from Caloocan CPS storage.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCases();

    // Cross-device Realtime Sync: reload docket automatically when any device creates or edits a case
    const unsubscribe = CaseService.subscribeToChanges(() => {
      loadCases();
    });

    return () => {
      unsubscribe();
    };
  }, [loadCases]);

  // Theme Toggle Effect with LocalStorage persistence
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('ccps_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard shortcut: Press 'N' to open new CCPS case docket
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingRecord(null);
        setIsFormOpen(true);
      }
      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('case-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // CRUD Operations Handlers
  const handleCreateOrUpdateCase = async (
    caseData: Partial<CaseRecord>,
    _newPdfs: PdfAttachment[]
  ) => {
    try {
      if (editingRecord) {
        const updated = await CaseService.updateCase(editingRecord.id, caseData);
        setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        showToast('CCPS Docket Updated', `Case ${updated.case_id} was successfully updated.`, 'success');
      } else {
        const created = await CaseService.createCase(
          caseData as Omit<CaseRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
        );
        setCases((prev) => [created, ...prev]);
        showToast('CCPS Case Registered', `Docket ${created.case_id} recorded in SIDMB ledger.`, 'success');

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        } catch {
          // ignore
        }
      }
      setIsFormOpen(false);
      setEditingRecord(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('Save Failed', msg, 'error');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await CaseService.hardDeleteCase(deleteTarget.id);
      setCases((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast('Case Docket Deleted', `Case ${deleteTarget.case_id} has been permanently deleted.`, 'warning');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('Deletion Failed', msg, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleResetData = async () => {
    const initial = await CaseService.resetToSampleData();
    setCases(initial);
    showToast('CCPS Ledger Reset', 'Loaded official Caloocan City Police Station cases.', 'info');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Download single case folder uploaded PDF
  const handleExportCase = async (c: CaseRecord) => {
    const ok = await exportSingleCaseDocket(c);
    if (ok) {
      showToast('PDF Docket Downloaded', `Downloaded PDF Case Folder for ${c.case_id}.`, 'success');
    } else {
      showToast('Download Failed', 'Unable to download PDF file for this case.', 'error');
    }
  };

  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => {
        if (c.deleted_at) return false;

        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matches =
            c.case_id.toLowerCase().includes(q) ||
            (c.blotter_number && c.blotter_number.toLowerCase().includes(q)) ||
            c.title.toLowerCase().includes(q) ||
            c.victim_name.toLowerCase().includes(q) ||
            (c.suspect_name && c.suspect_name.toLowerCase().includes(q)) ||
            c.ioc_name.toLowerCase().includes(q) ||
            (c.barangay && c.barangay.toLowerCase().includes(q)) ||
            (c.summary && c.summary.toLowerCase().includes(q));
          if (!matches) return false;
        }

        if (filters.status !== 'All' && c.status !== filters.status) {
          return false;
        }

        if (filters.category && filters.category !== 'All') {
          if (filters.category === 'OTHERS') {
            const isStandard = ['MURDER', 'HOMICIDE', 'PHYSICAL INJURY', 'RAPE', 'ROBBERY', 'THEFT', 'CARNAPPING MC', 'CARNAPPING MV', 'SPECIAL COMPLEX CRIME'].includes((c.title || '').toUpperCase());
            if (isStandard) return false;
          } else {
            const target = filters.category.toUpperCase();
            const matchesCategory = (c.category || '').toUpperCase().includes(target);
            const matchesTitle = (c.title || '').toUpperCase().includes(target);
            if (!matchesCategory && !matchesTitle) return false;
          }
        }

        if (filters.dateFrom && c.date_committed < filters.dateFrom) {
          return false;
        }
        if (filters.dateTo && c.date_committed > filters.dateTo) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: string = (a[sortField] || '').toString();
        let valB: string = (b[sortField] || '').toString();

        if (sortOrder === 'asc') {
          return valA.localeCompare(valB);
        } else {
          return valB.localeCompare(valA);
        }
      });
  }, [cases, filters, sortField, sortOrder]);

  const nextCaseId = useMemo(() => CaseService.getNextCaseId(cases), [cases]);

  // Loading Screen while verifying session
  if (isAuthChecking) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#0B0F17] text-white' : 'bg-[#F8FAFC] text-slate-800'
      }`}>
        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-blue-500 p-2.5 shadow-xl animate-pulse flex items-center justify-center mb-4">
          <img src="/folder.png" alt="CCPS Logo" className="w-full h-full object-contain" />
        </div>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Initializing Caloocan City Police Station Terminal...</p>
      </div>
    );
  }

  // Login Gate if not authenticated
  if (!currentUserEmail) {
    return (
      <>
        <LoginPage
          theme={theme}
          onToggleTheme={toggleTheme}
          onLoginSuccess={(email) => {
            localStorage.setItem('ccps_station_user_email', email);
            setCurrentUserEmail(email);
            showToast('Access Granted', `Welcome to CCPS Terminal, ${email}.`, 'success');
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 relative overflow-x-hidden ${
      theme === 'dark' ? 'bg-[#0B0F17] text-slate-100 aurora-bg-dark' : 'bg-[#F8FAFC] text-slate-900 aurora-bg-light'
    }`}>
      {/* Subtle micro-dot pattern for tactical depth */}
      <div className="fixed inset-0 bg-mesh-pattern pointer-events-none opacity-40 dark:opacity-20" />

      {/* Ambient glowing light spheres for rich depth and executive presence */}
      <div className="fixed -top-24 -left-20 w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed top-[20%] -right-20 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-[130px] pointer-events-none" />
      <div className="fixed -bottom-24 left-[20%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[140px] pointer-events-none" />

      {/* Top CCPS Police Header */}
      <Navbar
        onNewCase={() => {
          setEditingRecord(null);
          setIsFormOpen(true);
        }}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onResetData={handleResetData}
        isCloudConnected={isCloudConnected}
        theme={theme}
        onToggleTheme={toggleTheme}
        totalCases={cases.length}
        userEmail={currentUserEmail}
        onLogout={handleLogout}
      />

      {/* Main CCPS Command Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10 pb-24 sm:pb-12">
        
        {/* Caloocan City Police Station Official Command Header Card */}
        <div className="rounded-3xl p-5 sm:p-6 bg-white/90 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden mb-6">
          {/* Decorative vibrant police gradient top edge */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />
          
          {/* Ambient subtle badge watermark */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-5 dark:opacity-10 pointer-events-none">
            <img src="/folder.png" alt="" className="w-full h-full object-contain" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60 font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  PHILIPPINE NATIONAL POLICE
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Northern Police District • Caloocan HQ
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span className="text-gradient-police">Caloocan City Police Station</span>
                <span className="text-xs sm:text-sm font-extrabold px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800 shadow-xs">
                  IOC Case Folders
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
                Electronic Case Folder for Investigators-on-Case (IOC) • Station Investigation &amp; Detective Management Branch (SIDMB).
              </p>
            </div>

            {/* Station Quick Status & Hotkey Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-xs shadow-inner">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block">CCPS SIDMB: Online</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">E-Case Folder System</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 font-medium">
                <span>New Case:</span>
                <kbd className="text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-blue-300 dark:border-blue-700 font-mono font-bold shadow-xs">
                  Press N
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* CCPS KPI Metrics Summary Cards */}
        <MetricsCards
          cases={cases}
          activeStatus={filters.status}
          onSelectStatusFilter={(status) => setFilters((prev) => ({ ...prev, status }))}
        />

        {/* Filter & Search Controls */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenMobileDrawer={() => setIsFilterDrawerOpen(true)}
          statusCounts={{
            all: cases.filter((c) => !c.deleted_at).length,
            solved: cases.filter((c) => !c.deleted_at && c.status === 'Solved').length,
            cleared: cases.filter((c) => !c.deleted_at && c.status === 'Cleared').length,
            underInvestigation: cases.filter((c) => !c.deleted_at && c.status === 'Under Investigation').length,
          }}
        />

        {/* Cases Presentation (Table or Grid View) */}
        {isLoading ? (
          <div className="p-16 text-center rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading Caloocan City Police Station Case Ledger...</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="hidden sm:block">
            <CaseTable
              cases={filteredCases}
              onViewPdf={(c) => setViewingPdfRecord(c)}
              onEditCase={(c) => {
                setEditingRecord(c);
                setIsFormOpen(true);
              }}
              onDeleteCase={(c) => setDeleteTarget(c)}
              onExportCase={handleExportCase}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
        ) : null}

        {/* Mobile View or Card Grid View */}
        {(!isLoading && (viewMode === 'grid' || window.innerWidth < 640)) && (
          <div className={viewMode === 'table' ? 'sm:hidden' : ''}>
            <CaseGrid
              cases={filteredCases}
              onViewPdf={(c) => setViewingPdfRecord(c)}
              onEditCase={(c) => {
                setEditingRecord(c);
                setIsFormOpen(true);
              }}
              onDeleteCase={(c) => setDeleteTarget(c)}
              onExportCase={handleExportCase}
            />
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 px-6 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setFilters((prev) => ({ ...prev, status: 'All' }));
          }}
          className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center text-xs text-blue-600 dark:text-blue-400 font-semibold cursor-pointer"
        >
          <FolderKanban className="w-5 h-5" />
          <span className="text-[10px]">Dockets</span>
        </button>

        <button
          onClick={() => {
            setEditingRecord(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 -mt-5 border-2 border-white dark:border-slate-950 cursor-pointer"
          aria-label="New CCPS Case"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px]">Filters</span>
        </button>

        {/* Cloud DB button commented out on mobile view as requested */}
        {/*
        <button
          onClick={() => setIsSupabaseModalOpen(true)}
          className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center text-xs text-slate-400 hover:text-white"
        >
          <Database className="w-5 h-5" />
          <span className="text-[10px]">Cloud DB</span>
        </button>
        */}
      </div>

      {/* Case Form Modal (Create / Edit) */}
      <CaseFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleCreateOrUpdateCase}
        editRecord={editingRecord}
        nextCaseId={nextCaseId}
      />

      {/* PDF Viewer Side-Drawer / Modal */}
      <PdfViewerModal
        isOpen={Boolean(viewingPdfRecord)}
        onClose={() => setViewingPdfRecord(null)}
        caseRecord={viewingPdfRecord}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        caseRecord={deleteTarget}
        isPermanent={filters.showDeleted}
      />

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Supabase Connection & SQL Setup Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isCloudConnected={isCloudConnected}
        onRecheckConnection={loadCases}
        onSeedSampleData={handleResetData}
      />

      {/* Stackable Animated Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
};
export default App;
