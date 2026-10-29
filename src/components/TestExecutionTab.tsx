import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, XCircle, Clock, AlertTriangle, Terminal, Code2, Sparkles, Filter, ChevronDown, ChevronRight, Send, Check } from 'lucide-react';
import { TestCase, TestStatus, TestType } from '../types';

interface TestExecutionTabProps {
  testCases: TestCase[];
  onUpdateTestCase: (updatedCase: TestCase) => void;
  onRunAll: () => void;
  onResetAll: () => void;
  isRunningAll: boolean;
  onDiagnoseFailure: (testCase: TestCase) => void;
  onNavigateToSandbox: () => void;
  onOpenAddTest?: () => void;
}

export const TestExecutionTab: React.FC<TestExecutionTabProps> = ({
  testCases,
  onUpdateTestCase,
  onRunAll,
  onResetAll,
  isRunningAll,
  onDiagnoseFailure,
  onNavigateToSandbox,
  onOpenAddTest,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<TestType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(testCases[0]?.id || null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'pytest tests/ -v --tb=short',
    'platform linux -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0',
    'rootdir: /app/testgenius, configfile: pytest.ini',
    'plugins: playwright-1.42.0, html-4.1.0, benchmark-4.0.0',
    'collected 11 items',
    'tests/test_login.py::test_valid_user_login PASSED [  9%]',
    'tests/test_login.py::test_invalid_password_feedback PASSED [ 18%]',
    'tests/test_login.py::test_html5_validation PASSED [ 27%]',
    'tests/test_api.py::test_verify_auth_token PASSED [ 36%]',
    'tests/test_api.py::test_expired_token_rejection FAILED [ 45%]',
    'tests/test_api.py::test_payment_idempotency PASSED [ 54%]',
    'tests/test_ml_models.py::test_ml_adversarial_noise PASSED [ 63%]',
    'tests/test_ml_models.py::test_feature_data_drift PASSED [ 72%]',
    'tests/test_ml_models.py::test_inference_latency_sla PASSED [ 81%]',
    'tests/test_ml_models.py::test_corrupted_and_nan_inputs PASSED [ 90%]',
    'tests/test_security.py::test_login_rate_limiting PASSED [100%]',
    '================ 10 passed, 1 failed in 0.44s ================',
  ]);
  const [isPingingApi, setIsPingingApi] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<any>(null);

  const filteredCases = testCases.filter((tc) => {
    if (selectedFilter === 'passed' && tc.status !== 'passed') return false;
    if (selectedFilter === 'failed' && tc.status !== 'failed') return false;
    if (selectedFilter === 'pending' && tc.status !== 'idle' && tc.status !== 'skipped') return false;
    if (typeFilter !== 'all' && tc.type !== typeFilter) return false;
    return true;
  });

  const runSingleTest = (testCase: TestCase) => {
    // Set to running
    onUpdateTestCase({ ...testCase, status: 'running' });

    setTimeout(() => {
      // Simulate realistic execution
      const willPass = testCase.id !== 'API-002' && testCase.id !== 'TC-004';
      const duration = Math.floor(Math.random() * 45) + 25;
      const updated: TestCase = {
        ...testCase,
        status: willPass ? 'passed' : 'failed',
        durationMs: duration,
        assertionLog: willPass
          ? [
              `✓ Setup test fixtures and environment`,
              `✓ Executed ${testCase.name} (${duration}ms)`,
              `✓ All ${testCase.steps.length} assertion steps passed without regression`,
            ]
          : [
              `✓ Setup test fixtures and environment`,
              `✗ Assertion failed at step 2: Expected HTTP 401, got HTTP 500`,
            ],
      };
      onUpdateTestCase(updated);

      setTerminalLogs((prev) => [
        ...prev.slice(-30),
        `[${new Date().toLocaleTimeString()}] ${testCase.id}::${testCase.name} -> ${willPass ? 'PASSED' : 'FAILED'} (${duration}ms)`,
      ]);
    }, 700);
  };

  const handleLiveApiPing = async (url: string = 'https://httpbin.org/get') => {
    setIsPingingApi(true);
    setPingResult(null);
    try {
      const resp = await fetch('/api/run-live-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          method: 'GET',
        }),
      });
      const data = await resp.json();
      setPingResult(data);
    } catch (err: any) {
      setPingResult({ success: false, error: err.message });
    } finally {
      setIsPingingApi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          {(['all', 'passed', 'failed', 'pending'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TestType)}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-slate-300 font-medium"
          >
            <option value="all">All Test Types</option>
            <option value="ui_playwright">Playwright UI</option>
            <option value="api">Requests API</option>
            <option value="ml">Custom ML Models</option>
            <option value="unit">Pytest Unit</option>
            <option value="integration">Integration</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {onOpenAddTest && (
            <button
              onClick={onOpenAddTest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>+ Add Test</span>
            </button>
          )}

          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={onRunAll}
            disabled={isRunningAll}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isRunningAll ? 'animate-spin' : ''}`} />
            <span>{isRunningAll ? 'Running Pytest...' : 'Execute All Tests'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Test Cases on Left (7 cols), Live Terminal Console on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test Cases List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredCases.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 space-y-2">
              <p className="text-xs">No test cases match the active filter.</p>
            </div>
          ) : (
            filteredCases.map((tc) => {
              const isExpanded = expandedId === tc.id;
              const isPassed = tc.status === 'passed';
              const isFailed = tc.status === 'failed';
              const isRunning = tc.status === 'running';

              return (
                <div
                  key={tc.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isFailed
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : isPassed
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : tc.id)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {/* Status Icon */}
                      {isRunning ? (
                        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      ) : isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : isFailed ? (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">{tc.id}</span>
                          <span className="text-xs font-bold text-white">{tc.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase ${
                              tc.type === 'ml'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : tc.type === 'ui_playwright'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : tc.type === 'api'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {tc.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{tc.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {tc.durationMs && (
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {tc.durationMs}ms
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runSingleTest(tc);
                        }}
                        disabled={isRunning}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Run this test"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs">
                      {/* Steps */}
                      <div>
                        <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                          Execution Steps:
                        </h4>
                        <div className="space-y-1 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 font-mono text-slate-300 text-[11px]">
                          {tc.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assertion Log */}
                      {tc.assertionLog && tc.assertionLog.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                            Assertion Trace:
                          </h4>
                          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
                            {tc.assertionLog.map((log, idx) => (
                              <div
                                key={idx}
                                className={log.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}
                              >
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error & Diagnostics CTA */}
                      {isFailed && (
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-300 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-rose-400" /> Failure Detected
                            </span>
                            <button
                              onClick={() => onDiagnoseFailure(tc)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Diagnose with Gemini AI</span>
                            </button>
                          </div>
                          <p className="text-rose-200 font-mono text-[11px]">{tc.errorMessage}</p>
                          {tc.stackTrace && (
                            <pre className="p-2.5 rounded bg-black/60 font-mono text-[10px] text-rose-300 overflow-x-auto whitespace-pre">
                              {tc.stackTrace}
                            </pre>
                          )}
                        </div>
                      )}

                      {/* Code Snippet */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Pytest / Playwright Code:
                          </h4>
                          {tc.type === 'ui_playwright' && (
                            <button
                              onClick={onNavigateToSandbox}
                              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                            >
                              Launch in Playwright Sandbox &rarr;
                            </button>
                          )}
                        </div>
                        <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
                          {tc.codeSnippet}
                        </pre>
                      </div>

                      {/* If API test, option to trigger live ping */}
                      {tc.type === 'api' && (
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-slate-400">Test live network request:</span>
                          <button
                            onClick={() => handleLiveApiPing('https://httpbin.org/status/200')}
                            disabled={isPingingApi}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 font-semibold text-xs transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            {isPingingApi ? 'Pinging...' : 'Ping Live HTTP Endpoint'}
                          </button>
                        </div>
                      )}

                      {pingResult && tc.type === 'api' && (
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                          <div className="flex items-center justify-between text-slate-400 mb-1">
                            <span>Status: {pingResult.status || 'Success'}</span>
                            <span>Latency: {pingResult.latencyMs}ms</span>
                          </div>
                          <pre className="text-[10px] text-emerald-400 overflow-x-auto">
                            {JSON.stringify(pingResult.data || pingResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Live Pytest Console Terminal (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="rounded-xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col h-[580px] overflow-hidden">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">pytest runner --console</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {/* Terminal Logs Stream */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 bg-black/60 text-slate-300">
              {terminalLogs.map((log, idx) => {
                const isPassed = log.includes('PASSED');
                const isFailed = log.includes('FAILED');
                const isCommand = log.startsWith('pytest') || log.startsWith('platform');

                return (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      isPassed
                        ? 'text-emerald-400 font-semibold'
                        : isFailed
                        ? 'text-rose-400 font-bold'
                        : isCommand
                        ? 'text-indigo-300 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
            </div>

            {/* Terminal Footer */}
            <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Playwright + Pytest Daemon listening
              </span>
              <button
                onClick={() => setTerminalLogs(['pytest tests/ -v', 'Console cleared.'])}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
