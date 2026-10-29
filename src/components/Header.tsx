import React from 'react';
import { Sparkles, Terminal, Play, Cpu, CheckCircle2, Plus, Layers, BarChart2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddTestModal: () => void;
  onOpenCopilot: () => void;
  onRunAllTests: () => void;
  isRunningAll: boolean;
  totalTestsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddTestModal,
  onOpenCopilot,
  onRunAllTests,
  isRunningAll,
  totalTestsCount,
}) => {
  const tabs = [
    { id: 'runner', label: 'Test Suites & Runner', icon: Play },
    { id: 'generator', label: 'AI Test Generator', icon: Sparkles },
    { id: 'ml_qa', label: 'Custom ML Model QA', icon: Cpu },
    { id: 'sandbox', label: 'Playwright Sandbox', icon: Terminal },
    { id: 'failure_analysis', label: 'Failure Diagnostics', icon: Sparkles },
    { id: 'reports', label: 'Testing Reports', icon: CheckCircle2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  TestGenius <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">AI</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
                  Automated QA Platform
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  ML Model Verification
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI Automated Testing Engine • Pytest • Playwright Browser • Custom ML Model QA
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI QA Copilot Chatbot Button */}
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI QA Copilot</span>
              <span className="sm:hidden">Copilot</span>
            </button>

            {/* Add Test Content Button */}
            <button
              onClick={onOpenAddTestModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 text-indigo-300 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Add Test Content</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Run All Tests Button */}
            <button
              onClick={onRunAllTests}
              disabled={isRunningAll}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-white ${isRunningAll ? 'animate-spin' : ''}`} />
              <span>{isRunningAll ? 'Executing...' : `Execute All (${totalTestsCount})`}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
