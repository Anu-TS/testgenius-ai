import React, { useState } from 'react';
import { Plus, Sparkles, X, Code2, Layers, CheckCircle2, AlertCircle, FileCode, Play } from 'lucide-react';
import { TestCase, TestType, Priority } from '../types';
import { PRESET_REQUIREMENTS } from '../data/defaultData';

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTestCase: (newTest: TestCase) => void;
  onAddMultipleTests: (newTests: TestCase[]) => void;
}

export const AddTestModal: React.FC<AddTestModalProps> = ({
  isOpen,
  onClose,
  onAddTestCase,
  onAddMultipleTests,
}) => {
  const [creationMode, setCreationMode] = useState<'ai' | 'manual' | 'presets'>('ai');

  // AI Prompt State
  const [aiRequirement, setAiRequirement] = useState<string>(
    'Create an automated test for a user registration flow with password strength requirements, duplicate email verification, and welcoming email dispatch.'
  );
  const [aiTestType, setAiTestType] = useState<TestType>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Manual Form State
  const [manualName, setManualName] = useState<string>('');
  const [manualDescription, setManualDescription] = useState<string>('');
  const [manualType, setManualType] = useState<TestType>('ui_playwright');
  const [manualPriority, setManualPriority] = useState<Priority>('High');
  const [manualSteps, setManualSteps] = useState<string>(
    '1. Navigate to target endpoint\n2. Supply test input vector\n3. Verify response status and output schema'
  );
  const [manualExpected, setManualExpected] = useState<string>('Response code 200 with valid schema.');
  const [manualCode, setManualCode] = useState<string>(
    'def test_custom_scenario():\n    assert True'
  );

  if (!isOpen) return null;

  const handleAIGenerate = async () => {
    if (!aiRequirement.trim()) return;
    setIsGenerating(true);
    try {
      const resp = await fetch('/api/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirement: aiRequirement,
          testType: aiTestType,
          framework: 'pytest',
          edgeCases: true,
        }),
      });
      const data = await resp.json();
      if (data.success && data.testCases && data.testCases.length > 0) {
        onAddMultipleTests(data.testCases);
        onClose();
      }
    } catch (err) {
      console.error('Failed to generate test cases:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const stepsArray = manualSteps
      .split('\n')
      .map((s) => s.trim().replace(/^\d+\.\s*/, ''))
      .filter(Boolean);

    const newTest: TestCase = {
      id: `TC-${Date.now().toString().slice(-4)}`,
      name: manualName,
      description: manualDescription || manualName,
      type: manualType,
      priority: manualPriority,
      steps: stepsArray.length > 0 ? stepsArray : ['Execute test actions', 'Assert criteria'],
      expectedResult: manualExpected || 'Expected result criteria met.',
      codeSnippet: manualCode,
      status: 'idle',
      durationMs: 35,
    };

    onAddTestCase(newTest);
    onClose();
  };

  const handleLoadPreset = (preset: typeof PRESET_REQUIREMENTS[0]) => {
    setAiRequirement(preset.prompt);
    setAiTestType(preset.type as TestType);
    setCreationMode('ai');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Add New Testing Content
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  Suite Authoring
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Author custom test cases, generate with Gemini AI, or import curated domain testing templates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Mode Switcher */}
        <div className="flex border-b border-slate-800 px-6 gap-2 bg-slate-950/40">
          <button
            onClick={() => setCreationMode('ai')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              creationMode === 'ai'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with AI (Gemini)</span>
          </button>

          <button
            onClick={() => setCreationMode('manual')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              creationMode === 'manual'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Visual Test Builder</span>
          </button>

          <button
            onClick={() => setCreationMode('presets')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              creationMode === 'presets'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Domain Templates</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm text-slate-300">
          {/* 1. AI GENERATION MODE */}
          {creationMode === 'ai' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Describe the feature, test scenario, or ML model requirement:</span>
                  <span className="text-[11px] text-slate-500 font-mono">Gemini AI</span>
                </label>
                <textarea
                  rows={4}
                  value={aiRequirement}
                  onChange={(e) => setAiRequirement(e.target.value)}
                  placeholder="e.g. Generate 5 tests for a user login form, validating email regex, password strength, lockout on 5 bad attempts, and session cookie presence..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Target Category</label>
                  <select
                    value={aiTestType}
                    onChange={(e) => setAiTestType(e.target.value as TestType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="all">Comprehensive (Unit + API + Playwright + ML)</option>
                    <option value="ui_playwright">UI Browser (Playwright)</option>
                    <option value="api">REST API (Requests)</option>
                    <option value="ml">Custom ML Model (Drift & Robustness)</option>
                    <option value="unit">Unit Tests (Pytest)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Target Framework</label>
                  <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
                    Pytest + Playwright + Scikit
                  </div>
                </div>
              </div>

              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiRequirement.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'AI Generating Test Matrix...' : 'Generate and Add to Active Suite'}</span>
              </button>
            </div>
          )}

          {/* 2. MANUAL BUILDER MODE */}
          {creationMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-200">Test Case Title *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Verify Stripe Webhook Signature & Order Idempotency"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Test Category</label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value as TestType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ui_playwright">UI Browser (Playwright)</option>
                    <option value="api">REST API (Requests)</option>
                    <option value="ml">Custom ML Model QA</option>
                    <option value="unit">Unit Test</option>
                    <option value="integration">Integration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Priority Level</label>
                  <select
                    value={manualPriority}
                    onChange={(e) => setManualPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Description</label>
                <input
                  type="text"
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Detailed explanation of what this test verifies..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Execution Steps (one per line)</label>
                  <textarea
                    rows={3}
                    value={manualSteps}
                    onChange={(e) => setManualSteps(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Expected Result</label>
                  <textarea
                    rows={3}
                    value={manualExpected}
                    onChange={(e) => setManualExpected(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Python / Playwright Code Snippet:</span>
                  <span className="text-[10px] text-slate-500 font-mono">pytest syntax</span>
                </label>
                <textarea
                  rows={4}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Add Test Case to Suite
              </button>
            </form>
          )}

          {/* 3. PRESET DOMAINS */}
          {creationMode === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Choose a pre-configured domain template to instantly load requirements into the AI test generator:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_REQUIREMENTS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleLoadPreset(preset)}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{preset.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-900 text-slate-400">
                        {preset.domain}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{preset.prompt}</p>
                    <div className="pt-1 text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                      <span>Load into AI Generator</span> &rarr;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400">
          <span>TestGenius AI Authoring Studio</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
