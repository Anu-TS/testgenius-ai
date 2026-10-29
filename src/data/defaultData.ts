import { TestCase, MLModelSpec } from '../types';

export const INITIAL_TEST_CASES: TestCase[] = [
  // --- 1. WEB UI & PLAYWRIGHT TESTS ---
  {
    id: 'UI-001',
    name: 'User Authentication Flow with Valid Credentials',
    description: 'Verify login form validates email and password, redirects to /dashboard, and establishes secure session cookie.',
    type: 'ui_playwright',
    priority: 'Critical',
    steps: [
      'Navigate to login portal /auth/login',
      'Fill input[type="email"] with tester@testgenius.ai',
      'Fill input[type="password"] with SecureP@ssword2026',
      'Click button[type="submit"]',
      'Wait for navigation to /dashboard',
      'Assert user session token cookie is set and greeting is visible'
    ],
    expectedResult: 'HTTP redirect to /dashboard within 500ms, user profile avatar rendered, cookie Secure & HttpOnly.',
    codeSnippet: `from playwright.sync_api import Page, expect

def test_valid_user_login(page: Page):
    page.goto("http://localhost:3000/auth/login")
    page.fill('input[type="email"]', "tester@testgenius.ai")
    page.fill('input[type="password"]', "SecureP@ssword2026")
    page.click('button[type="submit"]')
    expect(page).to_have_url("http://localhost:3000/dashboard")
    expect(page.locator('[data-testid="user-greeting"]')).to_be_visible()`,
    status: 'passed',
    durationMs: 42,
    assertionLog: [
      '✓ Page navigated to /auth/login (18ms)',
      '✓ Email & password inputs populated correctly',
      '✓ Form submission succeeded without console errors',
      '✓ Page URL matches /dashboard',
      '✓ Session token verified in storage'
    ]
  },
  {
    id: 'UI-002',
    name: 'Form Rejection on Incorrect Password & Field Clearing',
    description: 'Ensure providing incorrect password displays error banner, clears password input, and keeps email filled.',
    type: 'ui_playwright',
    priority: 'High',
    steps: [
      'Navigate to /auth/login',
      'Enter valid email tester@testgenius.ai with wrong password BadSecret999',
      'Click submit button',
      'Verify error banner element is visible with text "Invalid credentials"',
      'Verify password field is cleared and email remains intact'
    ],
    expectedResult: 'Error banner visible with 401 message. Email preserved in input. No session cookie set.',
    codeSnippet: `from playwright.sync_api import Page, expect

def test_invalid_password_feedback(page: Page):
    page.goto("http://localhost:3000/auth/login")
    page.fill('input[type="email"]', "tester@testgenius.ai")
    page.fill('input[type="password"]', "BadSecret999")
    page.click('button[type="submit"]')
    error_box = page.locator('[data-testid="error-message"]')
    expect(error_box).to_be_visible()
    expect(error_box).to_contain_text("Invalid credentials")
    expect(page.locator('input[type="password"]')).to_have_value("")`,
    status: 'passed',
    durationMs: 35,
    assertionLog: [
      '✓ Navigated to /auth/login',
      '✓ Attempted login with invalid credentials',
      '✓ Error container locator rendered with expected text',
      '✓ Password field reset to empty string'
    ]
  },
  {
    id: 'UI-003',
    name: 'Client-Side HTML5 Empty Input & Format Validation',
    description: 'Verify form prevents network dispatch when fields are empty or when email pattern is malformed.',
    type: 'ui_playwright',
    priority: 'Medium',
    steps: [
      'Navigate to login page',
      'Click Submit button without entering values',
      'Assert browser validity state is false and preventDefault fired',
      'Fill "invalid-email-pattern" without @ domain',
      'Assert email input pattern fails validation'
    ],
    expectedResult: 'Browser blocks form submission, input:invalid pseudo-class triggered, 0 network requests dispatched.',
    codeSnippet: `from playwright.sync_api import Page

def test_html5_validation(page: Page):
    page.goto("http://localhost:3000/auth/login")
    page.click('button[type="submit"]')
    is_valid = page.evaluate("el => el.checkValidity()", page.locator('input[type="email"]').element_handle())
    assert is_valid is False`,
    status: 'passed',
    durationMs: 22,
    assertionLog: [
      '✓ Form elements inspected',
      '✓ HTML5 checkValidity() returned False',
      '✓ Network request blocked'
    ]
  },

  // --- 2. REST API & BACKEND TESTS ---
  {
    id: 'API-001',
    name: 'REST API Authentication Token Validation & Claims Check',
    description: 'Verify GET /api/v1/auth/verify returns 200 OK and valid user payload for active JWT tokens.',
    type: 'api',
    priority: 'Critical',
    steps: [
      'Obtain valid bearer token fixture',
      'Dispatch GET request to /api/v1/auth/verify with Authorization header',
      'Assert response status code is 200 OK',
      'Verify JSON schema contains user_id, role, and expiration timestamp',
      'Ensure response latency is under 100ms'
    ],
    expectedResult: 'HTTP Status 200 OK with valid user object and latency < 100ms.',
    codeSnippet: `import requests

def test_verify_auth_token():
    headers = {"Authorization": "Bearer valid_test_token_eyJhbGciOi..."}
    res = requests.get("https://api.testgenius.internal/v1/auth/verify", headers=headers, timeout=3)
    assert res.status_code == 200
    data = res.json()
    assert "user_id" in data
    assert data["role"] in ["admin", "tester", "developer"]
    assert res.elapsed.total_seconds() < 0.100`,
    status: 'passed',
    durationMs: 48,
    assertionLog: [
      '✓ Dispatched GET /api/v1/auth/verify',
      '✓ Status code 200 OK verified',
      '✓ JSON schema schema validation passed',
      '✓ Latency: 48ms (SLA target < 100ms)'
    ]
  },
  {
    id: 'API-002',
    name: 'REST API Rejection on Expired Token Signature',
    description: 'Verify /api/v1/user/profile correctly traps expired signatures and returns HTTP 401 Unauthorized instead of unhandled 500.',
    type: 'api',
    priority: 'Critical',
    steps: [
      'Construct Authorization header with expired JWT signature',
      'Send GET /api/v1/user/profile',
      'Assert response status code is exactly 401',
      'Assert response JSON contains {"error": "Signature has expired", "code": "TOKEN_EXPIRED"}'
    ],
    expectedResult: 'HTTP 401 Unauthorized with descriptive TOKEN_EXPIRED error message.',
    codeSnippet: `import requests

def test_expired_token_rejection():
    headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired_signature"}
    res = requests.get("https://api.testgenius.internal/v1/user/profile", headers=headers, timeout=3)
    assert res.status_code == 401
    assert res.json().get("code") == "TOKEN_EXPIRED"`,
    status: 'failed',
    durationMs: 65,
    errorMessage: 'AssertionError: Expected HTTP 401, got HTTP 500 Internal Server Error (jwt.decode unhandled ExpiredSignatureError)',
    stackTrace: `Traceback (most recent call last):
  File "tests/test_api.py", line 42, in test_expired_token_rejection
    assert res.status_code == 401
AssertionError: Expected 401, got 500
Server Exception Trace:
jwt.exceptions.ExpiredSignatureError: Signature has expired
Uncaught in auth_middleware.py line 84:
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])`,
    assertionLog: [
      '✓ Sent request with expired signature header',
      '✗ Expected status 401, server returned 500 Internal Server Error',
      '✗ Backend unhandled exception: ExpiredSignatureError'
    ]
  },
  {
    id: 'API-003',
    name: 'Idempotency Key & Payment Transaction Double-Submission Test',
    description: 'Ensure sending duplicate POST /v1/payments with identical Idempotency-Key returns cached result without double billing.',
    type: 'api',
    priority: 'Critical',
    steps: [
      'Generate UUID v4 Idempotency-Key',
      'Send POST /v1/payments for $150.00',
      'Assert first call status is 201 Created with transaction_id',
      'Re-send identical POST request with exact same Idempotency-Key within 300ms',
      'Assert second call returns 200 OK with same transaction_id and header Idempotent-Replayed: true'
    ],
    expectedResult: 'Duplicate charge prevented. Same transaction_id returned with Idempotent-Replayed header.',
    codeSnippet: `import requests, uuid

def test_payment_idempotency():
    idem_key = str(uuid.uuid4())
    headers = {"Idempotency-Key": idem_key, "Authorization": "Bearer test_key"}
    payload = {"amount_cents": 15000, "currency": "usd", "account_id": "acc_992"}
    
    r1 = requests.post("https://api.testgenius.internal/v1/payments", json=payload, headers=headers)
    assert r1.status_code == 201
    tx_id_1 = r1.json()["transaction_id"]
    
    r2 = requests.post("https://api.testgenius.internal/v1/payments", json=payload, headers=headers)
    assert r2.status_code in [200, 201]
    assert r2.json()["transaction_id"] == tx_id_1
    assert r2.headers.get("Idempotent-Replay") == "true"`,
    status: 'passed',
    durationMs: 78,
    assertionLog: [
      '✓ Initial payment request processed (201 Created)',
      '✓ Replayed identical request with same key',
      '✓ Idempotency lock detected in Redis',
      '✓ Duplicate charge avoided, identical TX ID returned'
    ]
  },

  // --- 3. CUSTOM MACHINE LEARNING MODEL TESTS ---
  {
    id: 'ML-001',
    name: 'ML Adversarial Continuous Feature Perturbation (epsilon=0.03)',
    description: 'Inject Gaussian noise into continuous feature inputs to verify that customer churn predictions do not flip erratically.',
    type: 'ml',
    priority: 'Critical',
    steps: [
      'Load reference test sample vector with 94.2% Low Churn Risk baseline',
      'Generate Gaussian noise perturbation matrix (epsilon = 0.03, L-infinity norm)',
      'Compute model.predict(noisy_sample)',
      'Assert classification label remains invariant ("Low Churn Risk")',
      'Assert confidence score delta is strictly below 15%'
    ],
    expectedResult: 'Prediction class remains invariant. Confidence delta <= 0.10 under noise injection.',
    codeSnippet: `import numpy as np

def test_ml_adversarial_noise(model, baseline_sample):
    clean_pred = model.predict([baseline_sample])[0]
    noise = np.random.normal(0, 0.03, size=baseline_sample.shape)
    noisy_sample = baseline_sample + noise
    noisy_pred = model.predict([noisy_sample])[0]
    
    assert clean_pred["label"] == noisy_pred["label"], "Adversarial noise flipped classification label"
    assert abs(clean_pred["confidence"] - noisy_pred["confidence"]) < 0.15`,
    status: 'passed',
    durationMs: 54,
    assertionLog: [
      '✓ Baseline inference: "Low Churn Risk" (94.2% conf)',
      '✓ Injected epsilon=0.03 Gaussian noise',
      '✓ Perturbed inference: "Low Churn Risk" (91.8% conf)',
      '✓ Invariance test PASSED (confidence delta: 2.4%)'
    ]
  },
  {
    id: 'ML-002',
    name: 'ML Data Drift Detection: Population Stability Index (PSI)',
    description: 'Compare feature distribution of incoming production inference batch against training baseline using PSI metric.',
    type: 'ml',
    priority: 'High',
    steps: [
      'Load baseline feature histogram distribution (1,000 samples)',
      'Collect incoming batch feature distribution (500 samples)',
      'Compute Population Stability Index across 10 decile buckets',
      'Assert PSI < 0.20 (Safe threshold; > 0.25 indicates critical concept shift)'
    ],
    expectedResult: 'Calculated PSI <= 0.15 indicating acceptable stability without retraining requirement.',
    codeSnippet: `from src.ml_model_tester import calculate_psi

def test_feature_data_drift(baseline_distribution, production_batch):
    psi_score = calculate_psi(baseline_distribution, production_batch, num_buckets=10)
    assert psi_score < 0.20, f"Critical distribution drift detected: PSI={psi_score:.4f}"`,
    status: 'passed',
    durationMs: 62,
    assertionLog: [
      '✓ Loaded 1,000 baseline reference distributions',
      '✓ Computed 10-decile PSI for tenure, spend, and usage features',
      '✓ Resulting PSI score: 0.084 (Threshold: < 0.20)',
      '✓ No significant drift detected'
    ]
  },
  {
    id: 'ML-003',
    name: 'ML Inference Latency SLA Benchmark (p95 < 75ms)',
    description: 'Benchmark real-time inference latency across 100 consecutive prediction requests under simulated load.',
    type: 'ml',
    priority: 'High',
    steps: [
      'Warm up model runtime with 5 discarded iterations',
      'Execute 100 timed prediction requests with diverse feature vectors',
      'Compute 50th, 95th, and 99th percentile response latencies',
      'Assert p95 latency is strictly under 75ms'
    ],
    expectedResult: 'p95 latency <= 75ms and p99 latency <= 110ms with zero memory leaks.',
    codeSnippet: `import numpy as np, time

def test_inference_latency_sla(model, test_samples):
    latencies = []
    for sample in test_samples[:100]:
        t0 = time.perf_counter()
        _ = model.predict([sample])
        latencies.append((time.perf_counter() - t0) * 1000)
        
    p95 = np.percentile(latencies, 95)
    assert p95 < 75.0, f"p95 latency SLA breached: {p95:.1f}ms (target: < 75ms)"`,
    status: 'passed',
    durationMs: 82,
    assertionLog: [
      '✓ Executed 100 inference iterations',
      '✓ p50 latency: 28.4ms',
      '✓ p95 latency: 48.6ms (SLA target < 75ms PASSED)',
      '✓ p99 latency: 64.2ms'
    ]
  },
  {
    id: 'ML-004',
    name: 'ML Boundary Sanity: NaN, Inf, and Negative Tenure Handling',
    description: 'Verify model inference service returns HTTP 422 Unprocessable Entity when corrupted inputs are passed.',
    type: 'ml',
    priority: 'Critical',
    steps: [
      'Create payload with tenure_months = float("nan")',
      'Create payload with monthly_spend_usd = float("inf")',
      'Create payload with negative integer for support_tickets',
      'Assert API returns HTTP 422 with validation schema details'
    ],
    expectedResult: 'Model throws ValueError or returns HTTP 422 instead of crashing or returning faulty prediction.',
    codeSnippet: `import pytest

def test_corrupted_and_nan_inputs(model_client):
    with pytest.raises(ValueError):
        model_client.predict({"tenure_months": float("nan"), "spend": 100})
        
    res = model_client.post("/predict", json={"tenure_months": -5})
    assert res.status_code == 422
    assert "Invalid range" in res.text`,
    status: 'passed',
    durationMs: 38,
    assertionLog: [
      '✓ Injected NaN in continuous feature',
      '✓ Injected infinite values in numerical vector',
      '✓ Validation engine caught invalid payloads (422 Unprocessable Entity)'
    ]
  },

  // --- 4. SECURITY & INTEGRATION TESTS ---
  {
    id: 'SEC-001',
    name: 'Brute-Force Authentication Lockout & Rate Limiting (5 Attempts)',
    description: 'Ensure IP or account is temporarily throttled with HTTP 429 Too Many Requests after 5 consecutive failed logins.',
    type: 'integration',
    priority: 'Critical',
    steps: [
      'Dispatch 5 consecutive failed login POST requests within 10 seconds',
      'Dispatch 6th login request',
      'Assert response code is 429 Too Many Requests',
      'Assert Retry-After header is present and integer > 0'
    ],
    expectedResult: 'HTTP 429 Too Many Requests with Retry-After: 60 header.',
    codeSnippet: `import requests

def test_login_rate_limiting():
    url = "https://api.testgenius.internal/v1/auth/login"
    payload = {"email": "target@domain.com", "password": "wrong_password"}
    for i in range(5):
        requests.post(url, json=payload)
        
    res = requests.post(url, json=payload)
    assert res.status_code == 429
    assert "Retry-After" in res.headers
    assert int(res.headers["Retry-After"]) >= 30`,
    status: 'passed',
    durationMs: 58,
    assertionLog: [
      '✓ Attempts 1 through 5 recorded in sliding-window rate limiter',
      '✓ 6th attempt successfully throttled',
      '✓ HTTP 429 returned with Retry-After: 60'
    ]
  },
  {
    id: 'SEC-002',
    name: 'SQL Injection & Malicious Payload Sanitization on Search Query',
    description: 'Test that inputs with SQL injection syntax are safely escaped via parameterized queries without syntax errors.',
    type: 'integration',
    priority: 'Critical',
    steps: [
      'Send GET /api/v1/search?q=\' OR 1=1 --',
      'Send GET /api/v1/search?q=admin\'--',
      'Assert response status code is 200 OK without database syntax errors',
      'Assert query execution returned safe empty or filtered results'
    ],
    expectedResult: 'HTTP 200 OK. 0 SQL syntax exceptions. Database query executed with parameterized bindings.',
    codeSnippet: `import requests

def test_sql_injection_sanitization():
    payloads = ["' OR 1=1 --", "admin'--", "1; DROP TABLE users;"]
    for p in payloads:
        res = requests.get(f"https://api.testgenius.internal/v1/search?q={p}")
        assert res.status_code == 200
        assert "syntax error" not in res.text.lower()
        assert "sql" not in res.text.lower()`,
    status: 'passed',
    durationMs: 44,
    assertionLog: [
      '✓ Tested 3 SQL injection vectors',
      '✓ Parameterized ORM queries sanitized all inputs',
      '✓ Zero database leak or syntax error'
    ]
  }
];

export const PRESET_REQUIREMENTS = [
  {
    title: 'User Authentication & Session Security',
    type: 'ui_playwright',
    domain: 'Web Application UI',
    prompt: 'Create comprehensive test cases for a user login form with valid credentials, password masking, empty field validation, and brute force lockout after 5 failed attempts.',
  },
  {
    title: 'Custom ML Churn Prediction Model QA',
    type: 'ml',
    domain: 'Machine Learning',
    prompt: 'Automated testing suite for Customer Churn Classifier (v2.4). Must test data drift (PSI < 0.18), inference latency SLA (p95 < 75ms), adversarial input perturbation (epsilon=0.03), and missing/null values tolerance.',
  },
  {
    title: 'REST API Payment Gateway & Idempotency',
    type: 'api',
    domain: 'Fintech & Payments',
    prompt: 'Test suite for POST /v1/payments. Verify valid tokenized credit card charge, idempotency key replay handling, expired card 402 Payment Required, malformed currency code, and bearer token authorization.',
  },
  {
    title: 'Custom Fraud Transaction Detection ML Model',
    type: 'ml',
    domain: 'Machine Learning / Fraud',
    prompt: 'Test suite for real-time Fraud Transaction Detector. Test high-throughput latency (< 40ms), concept drift under holiday shopping distribution, extreme transaction amounts, and false positive minimization.',
  },
  {
    title: 'E-Commerce Cart, Inventory & Discount Codes',
    type: 'integration',
    domain: 'E-Commerce',
    prompt: 'Test suite for e-commerce checkout: adding multiple items, applying discount coupon with expiration check, inventory decrement, tax calculation, and order total reconciliation.',
  },
  {
    title: 'Healthcare Patient Risk Classifier Model',
    type: 'ml',
    domain: 'Healthcare ML',
    prompt: 'Quality assurance suite for clinical diagnostic ML model. Verify demographic fairness parity, sensitivity to missing vital signs, bounded confidence calibration, and latency under 100ms.',
  }
];

export const DEFAULT_ML_MODELS: MLModelSpec[] = [
  {
    id: 'ml-01',
    name: 'Customer Churn Predictor v2.4',
    taskType: 'binary_classification',
    version: '2.4.0',
    slaMaxLatencyP95Ms: 75,
    maxDriftPsi: 0.18,
    minAccuracy: 0.88,
    features: [
      { name: 'tenure_months', type: 'number', range: [1, 72], defaultVal: 18 },
      { name: 'monthly_spend_usd', type: 'number', range: [10, 500], defaultVal: 84.5 },
      { name: 'support_tickets_30d', type: 'number', range: [0, 20], defaultVal: 2 },
      { name: 'contract_type', type: 'category', defaultVal: 'Month-to-Month' },
      { name: 'auto_pay_enabled', type: 'number', range: [0, 1], defaultVal: 1 }
    ]
  },
  {
    id: 'ml-02',
    name: 'Fraud Transaction Detector (Real-Time)',
    taskType: 'binary_classification',
    version: '3.1.2',
    slaMaxLatencyP95Ms: 40,
    maxDriftPsi: 0.12,
    minAccuracy: 0.96,
    features: [
      { name: 'amount_usd', type: 'number', range: [1, 10000], defaultVal: 245.0 },
      { name: 'distance_from_home_km', type: 'number', range: [0, 5000], defaultVal: 12.4 },
      { name: 'velocity_last_hour', type: 'number', range: [1, 50], defaultVal: 3 },
      { name: 'device_risk_score', type: 'number', range: [0, 1], defaultVal: 0.05 }
    ]
  },
  {
    id: 'ml-03',
    name: 'Custom User Inference Endpoint (HTTP / REST)',
    taskType: 'custom_api',
    version: '1.0.0',
    endpointUrl: 'http://localhost:5000/predict',
    slaMaxLatencyP95Ms: 120,
    maxDriftPsi: 0.20,
    minAccuracy: 0.85,
    features: [
      { name: 'feature_vector_x', type: 'number', range: [-10, 10], defaultVal: 1.5 },
      { name: 'feature_vector_y', type: 'number', range: [0, 100], defaultVal: 42.0 },
      { name: 'category_flag', type: 'category', defaultVal: 'premium' }
    ]
  }
];
