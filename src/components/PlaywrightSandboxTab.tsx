import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, XCircle, Terminal, Globe, MousePointer, ShieldCheck, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export const PlaywrightSandboxTab: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [highlightSelector, setHighlightSelector] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isAutomating, setIsAutomating] = useState<boolean>(false);
  const [actionLogs, setActionLogs] = useState<string[]>([
    'Playwright browser session initialized: Chromium 124.0.6367.60',
    'Ready for automated UI test execution...',
  ]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setHighlightSelector(null);
    setCurrentStepIndex(-1);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) {
      setErrorMessage('Account locked out due to 5 consecutive failed attempts. Retry after 60s.');
      return;
    }

    if (!email || !password) {
      setErrorMessage('Both email and password are required.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Invalid email address format.');
      return;
    }

    if (password === 'SecureP@ssword2026') {
      setErrorMessage(null);
      setSuccessMessage('Authentication successful! Redirecting to /dashboard...');
      setAttempts(0);
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setIsLockedOut(true);
        setErrorMessage('Brute-force limit reached (5 failed attempts). Account temporarily locked.');
      } else {
        setErrorMessage(`Invalid credentials. Attempt ${nextAttempts}/5.`);
      }
    }
  };

  const runPlaywrightScript = (scenario: 'valid' | 'invalid' | 'empty' | 'lockout') => {
    setIsAutomating(true);
    resetForm();

    const addLog = (msg: string) => {
      setActionLogs((prev) => [...prev.slice(-25), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    if (scenario === 'valid') {
      addLog('EXEC: test_valid_login(page)');
      setTimeout(() => {
        addLog('page.goto("http://localhost:3000/login") -> 200 OK');
        setHighlightSelector('input[type="email"]');
        setCurrentStepIndex(1);
      }, 400);

      setTimeout(() => {
        addLog('page.fill(\'input[type="email"]\', "tester@testgenius.ai")');
        setEmail('tester@testgenius.ai');
        setHighlightSelector('input[type="password"]');
        setCurrentStepIndex(2);
      }, 1000);

      setTimeout(() => {
        addLog('page.fill(\'input[type="password"]\', "SecureP@ssword2026")');
        setPassword('SecureP@ssword2026');
        setHighlightSelector('button[type="submit"]');
        setCurrentStepIndex(3);
      }, 1600);

      setTimeout(() => {
        addLog('page.click(\'button[type="submit"]\')');
        setHighlightSelector(null);
        setSuccessMessage('Authentication successful! Redirecting to /dashboard...');
        addLog('expect(page).to_have_url("/dashboard") -> PASSED');
        setIsAutomating(false);
        setCurrentStepIndex(4);
      }, 2300);
    } else if (scenario === 'invalid') {
      addLog('EXEC: test_invalid_password(page)');
      setTimeout(() => {
        setHighlightSelector('input[type="email"]');
        setEmail('tester@testgenius.ai');
        addLog('page.fill(\'input[type="email"]\', "tester@testgenius.ai")');
      }, 500);

      setTimeout(() => {
        setHighlightSelector('input[type="password"]');
        setPassword('WrongPassword999');
        addLog('page.fill(\'input[type="password"]\', "WrongPassword999")');
      }, 1100);

      setTimeout(() => {
        setHighlightSelector('button[type="submit"]');
        addLog('page.click(\'button[type="submit"]\')');
      }, 1700);

      setTimeout(() => {
        setHighlightSelector(null);
        setErrorMessage('Invalid credentials. Attempt 1/5.');
        addLog('expect(page.locator(".error-banner")).to_be_visible() -> PASSED');
        setIsAutomating(false);
      }, 2300);
    } else if (scenario === 'empty') {
      addLog('EXEC: test_empty_form_validation(page)');
      setTimeout(() => {
        setHighlightSelector('button[type="submit"]');
        addLog('page.click(\'button[type="submit"]\') without filling inputs');
      }, 500);

      setTimeout(() => {
        setHighlightSelector(null);
        setErrorMessage('Both email and password are required.');
        addLog('assert checkValidity() == False -> PASSED');
        setIsAutomating(false);
      }, 1100);
    } else if (scenario === 'lockout') {
      addLog('EXEC: test_brute_force_lockout(page) [5 failed attempts]');
      setIsLockedOut(true);
      setAttempts(5);
      setErrorMessage('Brute-force limit reached (5 failed attempts). Account temporarily locked.');
      addLog('HTTP 429 Too Many Requests -> Assertion PASSED');
      setIsAutomating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Playwright Browser Automation Arena
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Interactive Web Application & UI Testing
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Watch Playwright execute automated browser tests against real web forms, inspect CSS selectors in real time, and verify assertions without leaving the dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => runPlaywrightScript('valid')}
              disabled={isAutomating}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Play: Valid Login
            </button>
            <button
              onClick={() => runPlaywrightScript('invalid')}
              disabled={isAutomating}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Play: Bad Password
            </button>
            <button
              onClick={() => runPlaywrightScript('empty')}
              disabled={isAutomating}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Play: Empty Form
            </button>
            <button
              onClick={() => runPlaywrightScript('lockout')}
              disabled={isAutomating}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Play: Lockout (429)
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Virtual Browser on Left (7 cols), Playwright Script on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Virtual Browser Window (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          {/* Browser Address Bar */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
            </div>

            <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>http://localhost:3000/auth/login</span>
            </div>

            <button
              onClick={resetForm}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Reload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Browser Viewport Content */}
          <div className="p-8 sm:p-12 flex-1 flex flex-col items-center justify-center bg-slate-950/60">
            <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Secure Portal Login</h3>
                <p className="text-xs text-slate-400">Target App under Playwright test suite</p>
              </div>

              {/* Status messages */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleManualSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <div
                    className={`relative rounded-lg transition-all ${
                      highlightSelector === 'input[type="email"]'
                        ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
                        : ''
                    }`}
                  >
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tester@testgenius.ai"
                      disabled={isLockedOut}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <div
                    className={`relative rounded-lg transition-all ${
                      highlightSelector === 'input[type="password"]'
                        ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
                        : ''
                    }`}
                  >
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      disabled={isLockedOut}
                      className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLockedOut}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-md transition-all cursor-pointer ${
                    highlightSelector === 'button[type="submit"]'
                      ? 'bg-cyan-500 ring-4 ring-cyan-400/30'
                      : 'bg-indigo-600 hover:bg-indigo-500'
                  } disabled:opacity-50`}
                >
                  {isLockedOut ? 'Account Locked' : 'Sign In'}
                </button>
              </form>

              <div className="pt-2 text-center text-[10px] text-slate-500">
                Playwright Selector Locator: <code className="text-cyan-400 font-mono">data-testid="login-form"</code>
              </div>
            </div>
          </div>
        </div>

        {/* Playwright Python Code & Live Console (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Python Code Block */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4" /> tests/test_login.py
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Playwright Sync
              </span>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
{`from playwright.sync_api import Page, expect

def test_login_flow(page: Page):
    page.goto("http://localhost:3000/login")
    page.fill('input[type="email"]', "tester@testgenius.ai")
    page.fill('input[type="password"]', "SecureP@ssword2026")
    page.click('button[type="submit"]')
    expect(page).to_have_url("/dashboard")
`}
            </pre>
          </div>

          {/* Action Log Stream */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col h-64 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
              <span>Playwright Driver Log</span>
              <span className="text-[10px] font-mono text-emerald-400">Headless Engine</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-300 pt-2">
              {actionLogs.map((log, idx) => (
                <div key={idx} className="leading-snug">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
