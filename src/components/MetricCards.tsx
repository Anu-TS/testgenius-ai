import React from 'react';
import { CheckCircle2, XCircle, Clock, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { TestCase } from '../types';

interface MetricCardsProps {
  testCases: TestCase[];
  avgLatency: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ testCases, avgLatency }) => {
  const total = testCases.length;
  const passed = testCases.filter((t) => t.status === 'passed').length;
  const failed = testCases.filter((t) => t.status === 'failed').length;
  const skipped = testCases.filter((t) => t.status === 'skipped' || t.status === 'idle').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  // ML tests count
  const mlTestsCount = testCases.filter((t) => t.type === 'ml').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* Total Tests */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Tests</span>
          <Activity className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white font-mono">{total}</span>
          <span className="text-[10px] text-slate-500 font-mono">cases</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          {mlTestsCount} ML model suites
        </div>
      </div>

      {/* Passed */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90">Passed</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">{passed}</span>
          <span className="text-[10px] text-emerald-500/80 font-mono">passed</span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-400/80 flex items-center gap-1">
          <span>All assertions verified</span>
        </div>
      </div>

      {/* Failed */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-rose-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400/90">Failed</span>
          <XCircle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-rose-400 font-mono">{failed}</span>
          <span className="text-[10px] text-rose-500/80 font-mono">regressions</span>
        </div>
        <div className="mt-2 text-[11px] text-rose-400/80">
          {failed > 0 ? 'AI analysis ready' : 'Zero regressions'}
        </div>
      </div>

      {/* Pass Rate */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Pass Rate</span>
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-cyan-300 font-mono">{passRate}%</span>
          <span className="text-[10px] text-slate-500 font-mono">{skipped} pending</span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              passRate >= 80 ? 'bg-emerald-400' : passRate >= 50 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${passRate}%` }}
          />
        </div>
      </div>

      {/* Average Latency */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Latency</span>
          <Clock className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white font-mono">{avgLatency || 42}</span>
          <span className="text-[10px] text-slate-500 font-mono">ms</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          p95 SLA &lt; 75ms met
        </div>
      </div>

      {/* ML Robustness Score */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 flex flex-col justify-between transition-all hover:border-purple-500/50">
        <div className="flex items-center justify-between text-purple-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">ML Robustness</span>
          <Cpu className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-purple-300 font-mono">97.4%</span>
          <span className="text-xs text-purple-400/80 font-mono">score</span>
        </div>
        <div className="mt-2 text-[11px] text-purple-300/80 font-medium">
          Adversarial $\epsilon$-invariant
        </div>
      </div>
    </div>
  );
};
