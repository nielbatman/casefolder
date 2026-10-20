import React from 'react';
import {
  Plus,
  BadgeCheck,
  LogOut,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  onNewCase: () => void;
  onOpenSupabaseModal: () => void;
  onResetData: () => void;
  isCloudConnected: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  totalCases: number;
  userEmail?: string | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewCase,
  theme,
  onToggleTheme,
  userEmail,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2.5 gap-3">

          {/* PNP Caloocan City Police Station Official Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white border-2 border-amber-400 dark:border-amber-500/80 shadow-md shadow-amber-500/10 p-1.5 overflow-hidden">
              <img 
                src="/folder.png" 
                alt="CCPS Case Folder Icon" 
                className="w-full h-full object-contain" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  CALOOCAN CITY POLICE STATION
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-300 dark:from-amber-950/60 dark:to-orange-950/60 dark:text-amber-300 dark:border-amber-700/60 font-bold shadow-xs">
                  <BadgeCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  PNP-NPD • IOC
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Station Investigation and Detective Management Branch (SIDMB) • E-Case Folder
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* User Account / Sign Out */}
            {userEmail && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold shadow-xs">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 max-w-[140px] truncate" title={userEmail}>
                  {userEmail}
                </span>
              </div>
            )}

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme mode"
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/90 border border-slate-200/90 dark:text-slate-400 dark:hover:text-amber-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Create Case Button with Vibrant Gradient */}
            <button
              onClick={onNewCase}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-lg shadow-blue-500/25 border border-blue-400/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Case Folder</span>
              <span className="sm:hidden">New Case</span>
              <kbd className="hidden lg:inline-flex text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono ml-0.5">N</kbd>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out of CCPS Terminal"
                aria-label="Sign Out"
                className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 dark:border-slate-800 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
