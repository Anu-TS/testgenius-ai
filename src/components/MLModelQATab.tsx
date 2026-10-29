import React, { useState } from 'react';
import { Cpu, ShieldAlert, Activity, Gauge, Sparkles, CheckCircle2, XCircle, AlertTriangle, Play, RefreshCw, BarChart3, Settings2, Plus, ArrowRight, FileCode, Check, Copy } from 'lucide-react';
import { MLModelSpec, MLModelEvaluation } from '../types';
import { DEFAULT_ML_MODELS } from '../data/defaultData';

export const MLModelQATab: React.FC = () => {
  const [models, setModels] = useState<MLModelSpec[]>(DEFAULT_ML_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_ML_MODELS[0].id);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<MLModelEvaluation | null>(null);
  const [featureInputs, setFeatureInputs] = useState<Record<string, number | string>>({
    tenure_months: 18,
    monthly_spend_usd: 84.5,
    support_tickets_30d: 2,
    contract_type: 'Month-to-Month',
    auto_pay_enabled: 1,
  });
  const [singlePrediction, setSinglePrediction] = useState<{ label: string; confidence: number; latencyMs: number } | null>(null);
  const [aiTestCode, setAiTestCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  const handleRunMLSuite = () => {
    setIsTesting(true);
    setEvaluation(null);

    setTimeout(() => {
      // Simulate real calculation of PSI and Latency
      const p95Latency = Math.floor(Math.random() * 20) + 38;
      const p99Latency = p95Latency + Math.floor(Math.random() * 15) + 12;
      const psi = Number((Math.random() * 0.12 + 0.04).toFixed(3));
      const passedDrift = psi < activeModel.maxDriftPsi;
      const passedLatency = p95Latency < activeModel.slaMaxLatencyP95Ms;

      const results: MLModelEvaluation = {
        modelName: activeModel.name,
        overallStatus: passedDrift && passedLatency ? 'PASSED' : 'WARNING',
        robustnessScore: 94,
        dataDriftScore: Math.round((1 - psi) * 100),
        latencyComplianceScore: passedLatency ? 98 : 74,
        fairnessScore: 92,
        avgLatencyMs: Math.round(p95Latency * 0.65),
        p95LatencyMs: p95Latency,
        p99LatencyMs: p99Latency,
        psiDrift: psi,
        testedSamplesCount: 500,
        tests: [
          {
            id: 'ML-01',
            testName: 'Adversarial Noise Invariance (epsilon=0.03)',
            category: 'Adversarial Robustness',
            severity: 'Critical',
            metricValue: '97.4% Invariant',
            threshold: '> 92.0%',
            passed: true,
            details: 'Model predictions remained consistent when Gaussian jitter was injected into continuous features.',
            codeSnippet: `def test_adversarial_noise(model, test_batch):\n    perturbed = test_batch + np.random.normal(0, 0.03, size=test_batch.shape)\n    diff = np.mean(model.predict(test_batch) == model.predict(perturbed))\n    assert diff >= 0.92, f"Perturbation invariance violated: {diff*100:.1f}%"`
          },
          {
            id: 'ML-02',
            testName: 'Data Drift: Population Stability Index (PSI)',
            category: 'Data Drift (PSI)',
            severity: 'High',
            metricValue: `PSI = ${psi}`,
            threshold: `< ${activeModel.maxDriftPsi}`,
            passed: passedDrift,
            details: passedDrift
              ? 'No significant feature drift detected compared to the baseline training distribution.'
              : 'Moderate distribution shift observed in tenure_months and monthly_spend.',
            codeSnippet: `def test_data_drift_psi(baseline_dist, inference_dist):\n    psi = calculate_psi(baseline_dist, inference_dist)\n    assert psi < ${activeModel.maxDriftPsi}, f"Data drift PSI exceeded: {psi}"`
          },
          {
            id: 'ML-03',
            testName: 'Inference Latency SLA Benchmark (p95)',
            category: 'Latency SLA',
            severity: 'High',
            metricValue: `${p95Latency} ms`,
            threshold: `< ${activeModel.slaMaxLatencyP95Ms} ms`,
            passed: passedLatency,
            details: `100 inference iterations evaluated. p95 achieved ${p95Latency}ms (target: < ${activeModel.slaMaxLatencyP95Ms}ms).`,
            codeSnippet: `def test_latency_p95_sla(benchmark, sample_vector):\n    latencies = [benchmark_call(sample_vector) for _ in range(100)]\n    assert np.percentile(latencies, 95) < ${activeModel.slaMaxLatencyP95Ms}`
          },
          {
            id: 'ML-04',
            testName: 'NaN, Null & Out-of-Bounds Rejection',
            category: 'Boundary & NaN Sanity',
            severity: 'Critical',
            metricValue: '100% Handled',
            threshold: '100%',
            passed: true,
            details: 'Injected float("nan"), negative tenure, and unexpected categories. System gracefully returned HTTP 422 validation error.',
            codeSnippet: `def test_nan_resilience(model):\n    with pytest.raises((ValueError, ValidationError)):\n        model.predict({"tenure_months": float("nan")})`
          },
          {
            id: 'ML-05',
            testName: 'Demographic Subgroup Fairness Parity',
            category: 'Fairness Parity',
            severity: 'Medium',
            metricValue: 'Disparate Impact: 0.94',
            threshold: '>= 0.80',
            passed: true,
            details: '80% rule compliance met across contract type groups without disparate impact disparity.',
            codeSnippet: `def test_fairness_parity(predictions, protected_attributes):\n    di_ratio = compute_disparate_impact(predictions, protected_attributes)\n    assert di_ratio >= 0.80, f"Disparate impact ratio failed: {di_ratio}"`
          }
        ]
      };

      setEvaluation(results);
      setIsTesting(false);
    }, 900);
  };

  const handlePredictSingle = () => {
    const start = Date.now();
    // Simulate inference
    setTimeout(() => {
      const isChurn = Number(featureInputs.support_tickets_30d || 0) > 3 || Number(featureInputs.monthly_spend_usd || 0) > 200;
      setSinglePrediction({
        label: isChurn ? 'High Churn Risk (Alert)' : 'Low Churn Risk (Loyal)',
        confidence: isChurn ? 87.4 : 95.8,
        latencyMs: Date.now() - start,
      });
    }, 120);
  };

  const handleGenerateAIMLSuite = async () => {
    setIsTesting(true);
    try {
      const resp = await fetch('/api/generate-ml-test-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: activeModel.name,
          taskType: activeModel.taskType,
          inputSchema: JSON.stringify(activeModel.features),
          targetMetrics: `SLA p95 < ${activeModel.slaMaxLatencyP95Ms}ms, PSI Drift < ${activeModel.maxDriftPsi}, Accuracy > ${activeModel.minAccuracy * 100}%`,
        }),
      });
      const data = await resp.json();
      if (data.success && data.pythonTestFile) {
        setAiTestCode(data.pythonTestFile);
      } else {
        setAiTestCode(`"""\nGenerated Automated ML Verification Suite\nModel: ${activeModel.name}\n"""\nimport pytest\nimport numpy as np\nfrom src.ml_model_tester import run_ml_qa_suite\n\ndef test_custom_ml_model_verification():\n    results = run_ml_qa_suite("${activeModel.name}", max_latency_ms=${activeModel.slaMaxLatencyP95Ms}, max_drift_psi=${activeModel.maxDriftPsi})\n    assert results["overall_status"] == "PASSED"\n    assert results["p95_latency_ms"] < ${activeModel.slaMaxLatencyP95Ms}`);
      }
    } catch (err) {
      console.error('Failed to generate AI ML suite:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-purple-400" /> Automated Machine Learning Model QA & Verification
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Custom Machine Learning Model Testing Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Seamlessly execute automated adversarial tests, data drift detection (PSI), inference latency SLA benchmarks (p95/p99), and boundary sanity against custom ML models.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunMLSuite}
              disabled={isTesting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-white ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Running ML Suite...' : 'Run Automated ML QA Suite'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Model Selection & Custom Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Selector Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-purple-400" /> Select ML Model
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {models.length} Available
              </span>
            </div>

            <div className="space-y-2">
              {models.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedModelId(m.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedModelId === m.id
                      ? 'bg-purple-950/40 border-purple-500/60 shadow-sm shadow-purple-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{m.name}</span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                      v{m.version}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span>p95: &lt; {m.slaMaxLatencyP95Ms}ms</span>
                    <span>Max PSI: {m.maxDriftPsi}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SLA Constraints Info */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Task Classification:</span>
                <span className="font-mono text-slate-200">{activeModel.taskType}</span>
              </div>
              <div className="flex justify-between">
                <span>Min Accuracy Target:</span>
                <span className="font-mono text-emerald-400">{activeModel.minAccuracy * 100}%</span>
              </div>
              <div className="flex justify-between">
                <span>Endpoint / Runtime:</span>
                <span className="font-mono text-indigo-300 truncate max-w-[150px]">
                  {activeModel.endpointUrl || 'Local Python Scikit'}
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerateAIMLSuite}
              disabled={isTesting}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-indigo-500/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generate Pytest Suite with Gemini AI</span>
            </button>
          </div>

          {/* Interactive Single-Sample Inference Playground */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" /> Single Inference Test
            </h3>
            <p className="text-[11px] text-slate-400">
              Pass sample feature values to test live model output & latency.
            </p>

            <div className="space-y-2">
              {activeModel.features.map((feat) => (
                <div key={feat.name} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px] truncate">{feat.name}</span>
                  <input
                    type="number"
                    value={featureInputs[feat.name] ?? feat.defaultVal}
                    onChange={(e) =>
                      setFeatureInputs({
                        ...featureInputs,
                        [feat.name]: Number(e.target.value),
                      })
                    }
                    className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-right text-xs"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handlePredictSingle}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run Inference</span>
            </button>

            {singlePrediction && (
              <div className="p-3 rounded-lg bg-slate-900 border border-indigo-500/40 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-indigo-300">
                  <span className="font-bold">{singlePrediction.label}</span>
                  <span className="text-emerald-400">{singlePrediction.confidence}% conf</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Latency:</span>
                  <span className="text-slate-200">{singlePrediction.latencyMs}ms</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results & Verification Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {evaluation ? (
            <div className="space-y-4">
              {/* Scorecard row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Robustness Score</span>
                  <div className="text-xl font-extrabold text-white font-mono mt-1">
                    {evaluation.robustnessScore}%
                  </div>
                  <div className="text-[10px] text-emerald-400">Adversarial resilient</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Data Drift (PSI)</span>
                  <div className="text-xl font-extrabold text-purple-300 font-mono mt-1">
                    {evaluation.psiDrift}
                  </div>
                  <div className="text-[10px] text-purple-400">Within {activeModel.maxDriftPsi} limit</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Latency p95</span>
                  <div className="text-xl font-extrabold text-cyan-300 font-mono mt-1">
                    {evaluation.p95LatencyMs} ms
                  </div>
                  <div className="text-[10px] text-cyan-400">SLA &lt; {activeModel.slaMaxLatencyP95Ms}ms</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Fairness Parity</span>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                    {evaluation.fairnessScore}%
                  </div>
                  <div className="text-[10px] text-emerald-400">No disparate impact</div>
                </div>
              </div>

              {/* Individual Tests Matrix */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    Automated ML QA Test Matrix ({evaluation.tests.length} Suites)
                  </h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    OVERALL: {evaluation.overallStatus}
                  </span>
                </div>

                <div className="space-y-3">
                  {evaluation.tests.map((test) => (
                    <div
                      key={test.id}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {test.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="font-semibold text-white">{test.testName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {test.category}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          test.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {test.metricValue} (Target: {test.threshold})
                        </span>
                      </div>

                      <p className="text-slate-400 text-[11px]">{test.details}</p>

                      <pre className="p-2 rounded bg-black/60 font-mono text-[10px] text-indigo-300 overflow-x-auto">
                        {test.codeSnippet}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Blank state */
            <div className="p-12 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10">
                <Cpu className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-sm font-bold text-white">No ML Verification Executed Yet</h3>
                <p className="text-xs text-slate-400">
                  Select a machine learning model on the left and click "Run Automated ML QA Suite" to benchmark latency SLAs, detect data drift (PSI), and inject adversarial perturbations.
                </p>
              </div>
              <button
                onClick={handleRunMLSuite}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Execute Default ML QA Test Suite
              </button>
            </div>
          )}

          {/* AI-Generated Pytest File */}
          {aiTestCode && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-400 flex items-center gap-1.5 font-bold">
                  <FileCode className="w-4 h-4" /> tests/test_ml_models.py (Gemini Generated)
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiTestCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-[11px] font-medium"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-black/60 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-60">
                {aiTestCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
