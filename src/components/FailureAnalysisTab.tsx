import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Wrench, Code2, Check, Copy, Bug, ArrowRight, ShieldAlert } from 'lucide-react';
import { TestCase, FailureDiagnosis } from '../types';

interface FailureAnalysisTabProps {
  initialFailure?: TestCase | null;
  onApplyPatch?: (testId: string, patchedCode: string) => void;
}

export const FailureAnalysisTab: React.FC<FailureAnalysisTabProps> = ({ initialFailure, onApplyPatch }) => {
  const [testName, setTestName] = useState<string>(
    initialFailure?.name || 'test_expired_token_rejection'
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    initialFailure?.errorMessage ||
      'AssertionError: Expected HTTP 401, got HTTP 500 Internal Server Error (jwt.decode unhandled exception)'
  );
  const [stackTrace, setStackTrace] = useState<string>(
    initialFailure?.stackTrace ||
      `Traceback (most recent call last):
  File "tests/test_api.py", line 42, in test_expired_token_rejection
    assert res.status_code == 401
AssertionError: Expected 401, got 500
Server Log:
jwt.exceptions.ExpiredSignatureError: Signature has expired
Uncaught in auth_middleware.py line 84: return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])`
  );
  const [testCode, setTestCode] = useState<string>(
    initialFailure?.codeSnippet ||
      `def test_expired_token_rejection():
    headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired"}
    res = requests.get("https://api.example.com/v1/user/profile", headers=headers)
    assert res.status_code == 401`
  );

  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<FailureDiagnosis | null>({
    testName: 'test_expired_token_rejection',
    category: 'SchemaMismatch / UncaughtException',
    rootCause: 'The server-side auth middleware threw an uncaught ExpiredSignatureError instead of returning HTTP 401.',
    explanation:
      'When an expired token is passed, jwt.decode() raises ExpiredSignatureError. Because this exception is not trapped in a try/except block in the backend middleware, the web framework handles it as an unhandled 500 Internal Server Error rather than an intentional 401 Unauthorized client response.',
    suggestedFix:
      'Wrap jwt.decode in auth_middleware.py with a try/except block for jwt.ExpiredSignatureError and return jsonify({"error": "Token has expired", "code": "TOKEN_EXPIRED"}), 401.',
    patchCode: `# auth_middleware.py (Proposed Backend Patch)
import jwt
from flask import jsonify, request

def require_auth():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Signature has expired", "code": "TOKEN_EXPIRED"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token", "code": "INVALID_TOKEN"}), 401`,
    confidence: 0.96,
    modelUsed: 'gemini-3.8-flash',
  });

  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);
  const [patchApplied, setPatchApplied] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialFailure) {
      setTestName(initialFailure.name);
      if (initialFailure.errorMessage) setErrorMessage(initialFailure.errorMessage);
      if (initialFailure.stackTrace) setStackTrace(initialFailure.stackTrace);
      if (initialFailure.codeSnippet) setTestCode(initialFailure.codeSnippet);
    }
  }, [initialFailure]);

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    try {
      const resp = await fetch('/api/analyze-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName,
          testCode,
          errorMessage,
          stackTrace,
          isMLModel: testName.toLowerCase().includes('ml') || testName.toLowerCase().includes('drift'),
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setDiagnosis({
          testName,
          category: data.category || 'AssertionFailure',
          rootCause: data.rootCause || 'Unexpected exception during execution.',
          explanation: data.explanation || '',
          suggestedFix: data.suggestedFix || '',
          patchCode: data.patchCode || '',
          confidence: data.confidence || 0.94,
          modelUsed: data.modelUsed || 'gemini-3.8-flash',
        });
        setPatchApplied(false);
      }
    } catch (err) {
      console.error('Failure diagnosis error:', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleCopy = () => {
    if (!diagnosis?.patchCode) return;
    navigator.clipboard.writeText(diagnosis.patchCode);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  const handleApply = () => {
    if (initialFailure && onApplyPatch && diagnosis?.patchCode) {
      onApplyPatch(initialFailure.id, diagnosis.patchCode);
      setPatchApplied(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-500/30 shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <Bug className="w-3.5 h-3.5 text-rose-400" /> AI Root Cause Failure Diagnostics
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Gemini AI Test Failure & Bug Analyzer
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Automatically analyze Pytest assertion failures, stack traces, Playwright element timeouts, and ML model drift. Explains the exact failure root cause and writes working Python code patches.
          </p>
        </div>
      </div>

      {/* Grid: Inputs (5 cols) & AI Diagnostics (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Failed Test Input
            </h3>

            {/* Test Name */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Test Function Name</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200"
              />
            </div>

            {/* Error Message */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Error Message / Assertion Failure</label>
              <textarea
                rows={2}
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300"
              />
            </div>

            {/* Stack Trace */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Python Stack Trace (Pytest/Playwright)</label>
              <textarea
                rows={5}
                value={stackTrace}
                onChange={(e) => setStackTrace(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 leading-snug"
              />
            </div>

            {/* Test Code */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Test Code Snippet</label>
              <textarea
                rows={4}
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 leading-snug"
              />
            </div>

            <button
              onClick={handleDiagnose}
              disabled={isDiagnosing}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>{isDiagnosing ? 'Analyzing Root Cause...' : 'Diagnose with Gemini AI'}</span>
            </button>
          </div>
        </div>

        {/* Right Diagnosis (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {diagnosis ? (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
              {/* Category & Confidence Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Failure Category:</span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold">
                    {diagnosis.category}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confidence: {Math.round(diagnosis.confidence * 100)}%</span>
                </div>
              </div>

              {/* Root Cause */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  Root Cause Summary:
                </h4>
                <p className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs font-medium text-rose-200 leading-relaxed">
                  {diagnosis.rootCause}
                </p>
              </div>

              {/* Technical Explanation */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Technical Explanation:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.explanation}
                </p>
              </div>

              {/* Suggested Fix */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                  Suggested Developer Resolution:
                </h4>
                <p className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed">
                  {diagnosis.suggestedFix}
                </p>
              </div>

              {/* Code Patch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    Proposed Python Patch Code:
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 transition-colors"
                    >
                      {copiedPatch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPatch ? 'Copied' : 'Copy Patch'}</span>
                    </button>
                    {initialFailure && onApplyPatch && (
                      <button
                        onClick={handleApply}
                        disabled={patchApplied}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        <span>{patchApplied ? 'Patch Applied!' : 'Apply Patch to Test'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <pre className="p-3 rounded-lg bg-black/70 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
                  {diagnosis.patchCode}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <Bug className="w-10 h-10 text-slate-600" />
              <p className="text-xs text-slate-400">
                Provide an error message or select a failing test in the runner to diagnose its root cause with Gemini AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
