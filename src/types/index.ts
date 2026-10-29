export type TestType = 'all' | 'unit' | 'integration' | 'api' | 'ui_playwright' | 'ml';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'skipped';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  type: TestType;
  priority: Priority;
  steps: string[];
  expectedResult: string;
  codeSnippet: string;
  status: TestStatus;
  durationMs?: number;
  errorMessage?: string;
  stackTrace?: string;
  assertionLog?: string[];
}

export interface MLModelSpec {
  id: string;
  name: string;
  taskType: 'binary_classification' | 'multi_class' | 'regression' | 'nlp_sentiment' | 'custom_api';
  version: string;
  endpointUrl?: string;
  slaMaxLatencyP95Ms: number;
  maxDriftPsi: number;
  minAccuracy: number;
  features: Array<{ name: string; type: 'number' | 'string' | 'category'; range?: [number, number]; defaultVal: number | string }>;
}

export interface MLTestResult {
  id: string;
  testName: string;
  category: 'Adversarial Robustness' | 'Data Drift (PSI)' | 'Latency SLA' | 'Boundary & NaN Sanity' | 'Fairness Parity';
  severity: Priority;
  metricValue: string | number;
  threshold: string;
  passed: boolean;
  details: string;
  codeSnippet: string;
}

export interface MLModelEvaluation {
  modelName: string;
  overallStatus: 'PASSED' | 'FAILED' | 'WARNING';
  robustnessScore: number;
  dataDriftScore: number;
  latencyComplianceScore: number;
  fairnessScore: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  psiDrift: number;
  testedSamplesCount: number;
  tests: MLTestResult[];
}

export interface FailureDiagnosis {
  testName: string;
  category: string;
  rootCause: string;
  explanation: string;
  suggestedFix: string;
  patchCode: string;
  confidence: number;
  modelUsed?: string;
}

export interface ExecutionRunSummary {
  runId: string;
  timestamp: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  avgDurationMs: number;
  environment: string;
}

export interface SystemInfo {
  appUrl: string;
  localhostUrl: string;
  androidEmulatorUrl: string;
  port: number;
  hasApiKey: boolean;
  isCloudRun: boolean;
}
