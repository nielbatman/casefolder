import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userEmail: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  theme = 'light',
  onToggleTheme,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email/badge account and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data && data.user) {
        onLoginSuccess(data.user.email || email.trim());
      }
    } catch (err: unknown) {
      console.error('Authentication error:', err);
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please verify your Supabase account.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0B0F17] aurora-bg-dark' : 'bg-[#F8FAFC] aurora-bg-light'
    }`}>
      {/* Background Ambient Mesh & Rich Glows */}
      <div className="fixed inset-0 bg-mesh-pattern pointer-events-none opacity-40 dark:opacity-20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-blue-500/15 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-400/12 dark:bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top right theme toggle */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Template' : 'Switch to Dark Template'}
            aria-label="Toggle theme mode"
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      )}

      <div className="w-full max-w-md relative z-10 animate-fade-in">

        {/* Terminal Header Card */}
        <div className="bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl">

          {/* Logo & Identity */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3.5 group">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-blue-500 shadow-xl p-3 flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/folder.png"
                  alt="Caloocan Police Case Docket Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-600/40 text-[11px] font-mono uppercase font-bold tracking-wider mb-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>PNP • NORTHERN POLICE DISTRICT</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Caloocan City Police Station
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SIDMB • Investigator-on-Case
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email / Police Account
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ioc.dalisay@pnp.gov.ph"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 transition-all shadow-glow-primary border border-blue-400/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Official Security Footer */}
          <div className="mt-6 pt-3 text-center border-t border-slate-200 dark:border-slate-800/60">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
              OFFICIAL USE ONLY • CCPS SIDMB E-CASE LEDGER
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
export default LoginPage;
