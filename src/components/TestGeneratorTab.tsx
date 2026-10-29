import React, { useState } from 'react';
import { Sparkles, Play, Code, CheckCircle2, ChevronRight, Layers, FileCode, Check, Copy, AlertCircle } from 'lucide-react';
import { TestCase, TestType } from '../types';
import { PRESET_REQUIREMENTS } from '../data/defaultData';

interface TestGeneratorTabProps {
  onAddTestCases: (newCases: TestCase[]) => void;
  onNavigateToRunner: () => void;
}

export const TestGeneratorTab: React.FC<TestGeneratorTabProps> = ({ onAddTestCases, onNavigateToRunner }) => {
  const [requirement, setRequirement] = useState<string>(
    'Create comprehensive automated test cases for a user login form with email and password fields, HTML5 form validation, error message for incorrect credentials, and brute force lockout protection after 5 failed attempts.'
  );
  const [testType, setTestType] = useState<TestType>('all');
  const [framework, setFramework] = useState<string>('pytest');
  const [targetEndpoint, setTargetEndpoint] = useState<string>('http://localhost:3000/login');
  const [includeEdgeCases, setIncludeEdgeCases] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCases, setGeneratedCases] = useState<TestCase[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!requirement.trim()) return;
    setIsGenerating(true);
    try {
      const resp = await fetch('/api/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirement,
          testType,
          framework,
          targetEndpoint,
          edgeCases: includeEdgeCases,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setGeneratedCases(data.testCases || []);
        setGeneratedCode(data.generatedCode || '');
        setSummary(data.summary || '');
        setModelUsed(data.modelUsed || 'AI Engine');
      }
    } catch (err) {
      console.error('Failed to generate tests:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToRunner = () => {
    if (generatedCases.length > 0) {
      onAddTestCases(generatedCases);
      onNavigateToRunner();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900/90 border border-indigo-500/30 shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Powered by Google Gemini AI
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            AI Automated Test Case & Suite Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Turn natural-language software specifications, user stories, or ML model requirements into executable Pytest, Playwright UI, and API test suites with complete assertions and edge-case coverage.
          </p>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Quick Requirement Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_REQUIREMENTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setRequirement(preset.prompt);
                    setTestType(preset.type as TestType);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Requirement Text Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Software Requirement or User Story:</span>
              <span className="text-[11px] text-slate-500">Natural language prompt</span>
            </label>
            <textarea
              rows={4}
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="e.g. Test a custom ML classification model with 10 features, asserting p95 latency under 75ms and data drift PSI under 0.20..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-slate-100 placeholder-slate-600 transition-all font-sans leading-relaxed"
            />
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Test Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Test Category</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as TestType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500"
              >
                <option value="all">All (Unit + API + Playwright + ML)</option>
                <option value="ui_playwright">UI Browser Testing (Playwright)</option>
                <option value="api">API Endpoint Testing (Requests)</option>
                <option value="ml">Custom ML Model QA (Drift & Robustness)</option>
                <option value="unit">Unit Testing (Pytest)</option>
                <option value="integration">Integration Testing</option>
              </select>
            </div>

            {/* Framework */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Framework</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500"
              >
                <option value="pytest">Pytest (Standard Python QA)</option>
                <option value="playwright_python">Playwright + Pytest (UI Automation)</option>
                <option value="requests_pytest">Requests + Pytest (API Suite)</option>
                <option value="scikit_learn_ml">Scikit-Learn & NumPy (ML Verification)</option>
              </select>
            </div>
          </div>

          {/* Target Endpoint & Toggles */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Target Endpoint or Host URL (Optional):</span>
                <span className="text-[10px] text-slate-500 font-mono">http://localhost:3000 or API</span>
              </label>
              <input
                type="text"
                value={targetEndpoint}
                onChange={(e) => setTargetEndpoint(e.target.value)}
                placeholder="http://localhost:3000/api/predict"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includeEdgeCases}
                  onChange={(e) => setIncludeEdgeCases(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Rigorous Edge Cases, Invariance & Boundary Tests</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !requirement.trim()}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'AI Generating Test Matrix...' : 'Generate Automated Test Cases'}
          </button>
        </div>

        {/* Right Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Generated Suite Preview
                </h3>
              </div>
              {generatedCases.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {generatedCases.length} Test Cases Ready
                </span>
              )}
            </div>

            {/* Body */}
            {generatedCases.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">No test cases generated yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                    Click "Generate Automated Test Cases" to craft unit, UI, API, or custom ML model test suites using Gemini AI.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
                {summary && (
                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                    <p className="font-semibold text-indigo-300 mb-0.5">Strategy Summary:</p>
                    {summary}
                  </div>
                )}

                <div className="space-y-2">
                  {generatedCases.map((tc, idx) => (
                    <div
                      key={tc.id || idx}
                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-indigo-400 font-bold">{tc.id || `TC-${idx+1}`}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                          tc.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300' :
                          tc.priority === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {tc.priority}
                        </span>
                      </div>
                      <h4 className="font-semibold text-white">{tc.name}</h4>
                      <p className="text-slate-400 text-[11px] line-clamp-2">{tc.description}</p>
                      
                      {tc.steps && tc.steps.length > 0 && (
                        <div className="pt-1 text-[11px] text-slate-500 space-y-0.5">
                          {tc.steps.slice(0, 2).map((s, sidx) => (
                            <div key={sidx} className="flex items-center gap-1.5 truncate">
                              <span className="text-indigo-400">•</span>
                              <span className="truncate">{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            {generatedCases.length > 0 && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 mt-auto">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={handleApplyToRunner}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Send to Runner ({generatedCases.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
