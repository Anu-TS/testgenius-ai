/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TestExecutionTab } from './components/TestExecutionTab';
import { TestGeneratorTab } from './components/TestGeneratorTab';
import { MLModelQATab } from './components/MLModelQATab';
import { PlaywrightSandboxTab } from './components/PlaywrightSandboxTab';
import { FailureAnalysisTab } from './components/FailureAnalysisTab';
import { ReportsTab } from './components/ReportsTab';
import { AddTestModal } from './components/AddTestModal';
import { GeminiQAChatbot } from './components/GeminiQAChatbot';
import { TestCase } from './types';
import { INITIAL_TEST_CASES } from './data/defaultData';
import { Sparkles, MessageSquare } from 'lucide-react';

export default function App() {
  const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TEST_CASES);
  const [activeTab, setActiveTab] = useState<string>('runner');
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [isAddTestModalOpen, setIsAddTestModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [activeFailure, setActiveFailure] = useState<TestCase | null>(null);

  const avgLatency = Math.round(
    testCases.reduce((acc, t) => acc + (t.durationMs || 35), 0) / (testCases.length || 1)
  );

  const handleRunAllTests = () => {
    setIsRunningAll(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index >= testCases.length) {
        clearInterval(interval);
        setIsRunningAll(false);
        return;
      }

      setTestCases((prev) => {
        const next = [...prev];
        const current = next[index];
        const willPass = current.id !== 'API-002';
        const duration = Math.floor(Math.random() * 40) + 20;

        next[index] = {
          ...current,
          status: willPass ? 'passed' : 'failed',
          durationMs: duration,
          assertionLog: willPass
            ? [
                `✓ Setup fixtures & environment parameters`,
                `✓ Executed ${current.name} (${duration}ms)`,
                `✓ All assertion criteria passed without regressions`,
              ]
            : [
                `✓ Setup fixtures & environment parameters`,
                `✗ Assertion failed: Expected HTTP 401, got HTTP 500 Internal Server Error`,
              ],
        };
        return next;
      });

      index++;
    }, 450);
  };

  const handleResetAll = () => {
    setTestCases((prev) =>
      prev.map((tc) => ({
        ...tc,
        status: tc.id === 'API-002' ? 'failed' : 'passed',
      }))
    );
  };

  const handleAddTestCase = (newCase: TestCase) => {
    setTestCases((prev) => [newCase, ...prev]);
  };

  const handleAddMultipleTests = (newCases: TestCase[]) => {
    setTestCases((prev) => [...newCases, ...prev]);
  };

  const handleUpdateTestCase = (updated: TestCase) => {
    setTestCases((prev) => prev.map((tc) => (tc.id === updated.id ? updated : tc)));
  };

  const handleDiagnoseFailure = (testCase: TestCase) => {
    setActiveFailure(testCase);
    setActiveTab('failure_analysis');
  };

  const handleApplyPatch = (testId: string, patchedCode: string) => {
    setTestCases((prev) =>
      prev.map((tc) =>
        tc.id === testId
          ? {
              ...tc,
              codeSnippet: patchedCode,
              status: 'passed',
              errorMessage: undefined,
              stackTrace: undefined,
              assertionLog: [
                '✓ Setup fixtures & environment parameters',
                '✓ Executed patched logic with exception handling',
                '✓ Asserted HTTP 401 on expired signature: PASSED',
              ],
            }
          : tc
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTestModal={() => setIsAddTestModalOpen(true)}
        onOpenCopilot={() => setIsChatbotOpen(true)}
        onRunAllTests={handleRunAllTests}
        isRunningAll={isRunningAll}
        totalTestsCount={testCases.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time Metric Cards Strip */}
        <MetricCards testCases={testCases} avgLatency={avgLatency} />

        {/* Active Tab View */}
        {activeTab === 'runner' && (
          <TestExecutionTab
            testCases={testCases}
            onUpdateTestCase={handleUpdateTestCase}
            onRunAll={handleRunAllTests}
            onResetAll={handleResetAll}
            isRunningAll={isRunningAll}
            onDiagnoseFailure={handleDiagnoseFailure}
            onNavigateToSandbox={() => setActiveTab('sandbox')}
            onOpenAddTest={() => setIsAddTestModalOpen(true)}
          />
        )}

        {activeTab === 'generator' && (
          <TestGeneratorTab
            onAddTestCases={handleAddMultipleTests}
            onNavigateToRunner={() => setActiveTab('runner')}
          />
        )}

        {activeTab === 'ml_qa' && <MLModelQATab />}

        {activeTab === 'sandbox' && <PlaywrightSandboxTab />}

        {activeTab === 'failure_analysis' && (
          <FailureAnalysisTab
            initialFailure={activeFailure}
            onApplyPatch={handleApplyPatch}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            testCases={testCases}
            avgLatency={avgLatency}
            onOpenCopilot={() => setIsChatbotOpen(true)}
          />
        )}
      </main>

      {/* Floating AI QA Copilot Launcher */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition-all hover:scale-105 cursor-pointer"
        title="Open Gemini AI QA Copilot"
      >
        <Sparkles className="w-4 h-4 fill-white" />
        <span>Ask QA Copilot (AI)</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
      </button>

      {/* Clean Enterprise Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">TestGenius AI</span>
            <span>• Automated Software QA & Machine Learning Verification Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Pytest 8.1.1</span>
            <span>Playwright 1.42</span>
            <span>MLOps PSI Drift</span>
            <span>Gemini AI Diagnostics</span>
          </div>
        </div>
      </footer>

      {/* Add Test Content Modal */}
      <AddTestModal
        isOpen={isAddTestModalOpen}
        onClose={() => setIsAddTestModalOpen(false)}
        onAddTestCase={handleAddTestCase}
        onAddMultipleTests={handleAddMultipleTests}
      />

      {/* Gemini Multi-Turn QA Chatbot */}
      <GeminiQAChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        failingTestContext={
          activeFailure
            ? `Test ID: ${activeFailure.id}\nTest Name: ${activeFailure.name}\nError: ${activeFailure.errorMessage || 'AssertionError'}\nStack Trace: ${activeFailure.stackTrace || ''}`
            : undefined
        }
      />
    </div>
  );
}
