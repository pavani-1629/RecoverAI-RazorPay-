<div align="center">

# ⚡ RecoverAI

### AI-Powered Payment Revenue Recovery Control Plane

> *"Don't just detect failed payments. Recover the revenue behind them."*

<p align="center">
  <a href="https://frontend-b8dqnkkvl-pavani-1629s-projects.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://recoverai-razorpay.onrender.com/docs">
    <img src="https://img.shields.io/badge/API%20Docs-Swagger%20UI-46E3B7?style=for-the-badge&logo=fastapi&logoColor=black" alt="API Docs" />
  </a>
  <a href="https://github.com/pavani-1629/RecoverAI-RazorPay-">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository" />
  </a>
</p>

---

</div>

## 1. Project Overview

In traditional payment workflows, when an issuing bank or payment gateway returns a failure code (`insufficient_funds`, `bank_declined`, `timeout`, `limit_exceeded`), the checkout journey simply halts. The merchant experiences immediate revenue leakage, customer churn, and unnecessary retry costs.

**Payment failure is not the end of the transaction lifecycle.**

**RecoverAI** is an intelligent revenue recovery control plane that automatically intercepts failed transactions, estimates recovery likelihood using machine learning, evaluates safe deterministic recovery policies, leverages a Google Gemini agent for operational explainability, and executes bounded recovery actions while maintaining an immutable audit log.

```
Payment Failure ➔ Recoverability Prediction ➔ Policy Decision ➔ AI Explanation ➔ Recovery Execution ➔ Audit / Outcome
```

> **The Core Difference**:
> Most payment gateways and checkout systems focus solely on initial payment processing.
> **RecoverAI focuses on recovering the merchant revenue lost after a payment failure.**

---

## 2. Why RecoverAI?

| Problem in Payment Infrastructure | RecoverAI Approach |
| :--- | :--- |
| **Failed payment causes instant drop-off** | Automatically captures failed transactions and calculates revenue at risk |
| **Unclear or naive retry strategies** | ML model calculates cost-sensitive recovery probability per transaction |
| **Unsafe or unpredictable AI automation** | Deterministic policy engine remains the single source of truth for actions |
| **Opaque black-box failure codes** | Gemini AI agent inspects tools and synthesizes clear root-cause explanations |
| **Manual merchant intervention** | Automated, bounded recovery execution (Smart Retries, Alternative Payment Links) |
| **Zero visibility into recovery lifecycle** | Full audit trail tracking every evaluation, decision, and recovery execution |

---

## 3. Core Decision Model

RecoverAI separates prediction, decision-making, explanation, and execution into four distinct layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE DECISION PIPELINE                          │
├─────────────────┬──────────────────────────────────────────────────────┤
│ 1. ML Predicts  │ Calculates statistical recovery probability (0.0 to  │
│                 │ 1.0) using trained scikit-learn models.              │
├─────────────────┼──────────────────────────────────────────────────────┤
│ 2. Policy       │ Evaluates safety boundaries and failure codes to     │
│    Decides      │ select the exact action (Deterministic Ground Truth).│
├─────────────────┼──────────────────────────────────────────────────────┤
│ 3. AI Explains  │ Gemini Agent inspects data via tools and generates   │
│                 │ grounded diagnostic briefings without altering policy│
├─────────────────┼──────────────────────────────────────────────────────┤
│ 4. Executor     │ Executes the approved bounded action and records the │
│    Acts         │ outcome and audit event in PostgreSQL.               │
└─────────────────┴──────────────────────────────────────────────────────┘
```

- **ML is not the final authority**: The predictive model informs priority, but does not execute arbitrary actions.
- **Policy is deterministic**: Strict rules govern payment rails, retry limits, and failure reason handling.
- **Gemini does not override policy**: The AI agent provides explainability and context grounded in database facts.
- **Execution is bounded**: Only pre-approved recovery actions (`retry_payment`, `alternative_payment`, `customer_notification`, `manual_review`) are dispatched.

---

## 4. System Architecture

```mermaid
flowchart TD
    subgraph Ingestion ["1. Failure Ingestion"]
        A[Failed Transaction] --> B[FastAPI Gateway]
        B --> C[(PostgreSQL Database)]
    end

    subgraph Intelligence ["2. Recovery Intelligence Layer"]
        C --> D[ML Recovery Predictor]
        D -->|Recovery Probability| E[Deterministic Recovery Policy]
        E -->|Policy Decision| F[Recovery Case Created]
    end

    subgraph Explanation ["3. AI Diagnostic Layer"]
        F --> G[Google Gemini Agent]
        G <-->|Tools: get_transaction, get_prediction, get_decision| C
        G --> H[Grounded AI Briefing]
    end

    subgraph Execution ["4. Execution & Audit"]
        F --> I[Recovery Executor]
        I -->|Dispatch Action| J[Smart Retry / Payment Link]
        I --> K[(Audit Trail & State)]
    end
```

### Production Integration Flow (Planned Webhook Architecture)

```mermaid
sequenceDiagram
    autonumber
    participant Gateway as Payment Gateway / Razorpay
    participant API as RecoverAI FastAPI
    participant DB as Supabase PostgreSQL
    participant ML as ML Predictor
    participant Policy as Policy Engine
    participant Agent as Gemini Agent
    participant Exec as Recovery Executor

    Gateway->>API: Webhook (payment.failed) [Planned]
    API->>DB: Store failed transaction
    API->>ML: Extract features & predict recoverability
    ML-->>API: Recovery Score (e.g. 88.7%)
    API->>Policy: Evaluate decision rules
    Policy-->>API: Action: alternative_payment
    API->>DB: Create Recovery Case & Audit Log
    API->>Agent: Generate diagnostic briefing
    Agent-->>API: Grounded root-cause analysis
    API->>Exec: Trigger bounded recovery dispatch
    Exec->>DB: Record execution result & recovered GMV
```

> *Note: Live webhook ingestion from external payment gateways is architected for production integration; current release ingests via API endpoints and synthetic failure datasets.*

---

## 5. Technology Stack

<div align="center">

### Frontend
<p align="center">
  <img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind" alt="React, TypeScript, Vite, Tailwind CSS" />
</p>

### Backend & Database
<p align="center">
  <img src="https://skillicons.dev/icons?i=python,fastapi,postgres,supabase" alt="Python, FastAPI, PostgreSQL, Supabase" />
</p>

### AI / Machine Learning & Tools
<p align="center">
  <img src="https://skillicons.dev/icons?i=scikitlearn,git,github,vercel" alt="Scikit-Learn, Git, GitHub, Vercel" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75C2?style=flat-square&logo=googlegemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/SQLAlchemy%202.0-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy" />
  <img src="https://img.shields.io/badge/Psycopg%203-336791?style=flat-square&logo=postgresql&logoColor=white" alt="Psycopg 3" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black" alt="Render" />
</p>

</div>

| Layer | Technologies | Role in RecoverAI |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons | Responsive revenue control plane, live charts, recovery cases pipeline, interactive AI modals |
| **Backend API** | Python 3.11+, FastAPI, Pydantic, Uvicorn | High-performance RESTful API endpoints for transactions, predictions, cases, and executions |
| **Database ORM** | PostgreSQL (Supabase / Render), SQLAlchemy 2.0, Psycopg 3 | Transaction ledger, customer records, recovery cases, action histories, immutable audit logs |
| **Machine Learning** | scikit-learn, NumPy, Pandas, Joblib | Cost-sensitive recovery probability scoring (Logistic Regression / Gradient Boosting) |
| **AI Agent** | Google Gemini (via `google-genai`), Tool Calling | Grounded root-cause failure analysis, policy explainability, operational briefings |
| **Deployment** | Vercel (Frontend), Render (Backend), Supabase (Database) | Cloud-native hosting with automated continuous deployment |

---

## 6. Feature Highlights

- **Real-Time Revenue at Risk Visibility**: Instant breakdown of total failed revenue, recoverable volume, and overall recovery percentage.
- **ML Recoverability Scoring**: Evaluates customer history, payment rail reliability, failure type, and velocity metrics to predict recovery probability.
- **Cost-Sensitive Thresholding**: Uses a calibrated 30% operating threshold to prevent wasteful recovery attempts on low-probability failures.
- **Deterministic Recovery Policies**: Rule-based strategy engine mapping failure reasons (`insufficient_funds`, `bank_declined`, `timeout`, `limit_exceeded`) to bounded recovery actions.
- **End-to-End Recovery Cases Pipeline**: Complete lifecycle management from *Open* to *Executed* recovery cases.
- **Grounded Gemini AI Diagnostics**: Tool-augmented AI agent providing structured explanations without hallucinating or overriding policy.
- **Interactive Multi-Rail Exploration**: Supports UPI AutoPay, Credit/Debit Cards, NetBanking, and Wallets.
- **Immutable Audit Trail**: Chronological event logging tracking actors, decisions, descriptions, and recovered amounts.
- **Offline & Demo Resiliency**: Built-in fallback dataset guaranteeing seamless interactive evaluation even during backend cold starts.

---

## 7. How RecoverAI Works

```
1. DETECT     ➔ Intercepts failed payment and records transaction metadata.
2. PREDICT    ➔ ML model computes recovery probability (0.0% – 100.0%).
3. DECIDE     ➔ Deterministic policy assigns approved action and priority.
4. EXPLAIN    ➔ Gemini Agent synthesizes root-cause diagnostic briefing.
5. ACT        ➔ Recovery executor dispatches approved action (retry / link).
6. RECORD     ➔ Immutable audit trail stores full state and recovered revenue.
```

1. **Detect**: The system captures transaction metadata including payment rail, failure code, amount, retry count, and customer ID.
2. **Predict**: Feature extraction aggregates customer lifetime success rate, rail stability, and transaction amount to output a recovery confidence score.
3. **Decide**: The policy engine evaluates whether the failure qualifies for automated retry, alternative payment link, customer notification, or manual review.
4. **Explain**: The Gemini AI agent queries database tools to produce a 5-point structured diagnostic briefing explaining why the failure happened and why the chosen strategy is optimal.
5. **Act**: The merchant or automated scheduler executes the recovery action.
6. **Record**: State transitions and financial outcomes are immutably written to PostgreSQL audit logs.

---

## 8. AI Recovery Agent Architecture

The RecoverAI Gemini Agent operates with strict grounding to eliminate hallucinations:

```
                  ┌───────────────────────────────┐
                  │    Google Gemini AI Agent     │
                  └──────────────┬────────────────┘
                                 │
                 Tool Calls (Schema-Constrained)
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ get_transaction  │   │ get_recovery_pred │   │ get_recovery_dec  │
│  (DB Ledger)     │   │  (ML Probability) │   │  (Policy Engine)  │
└──────────────────┘   └───────────────────┘   └───────────────────┘
```

### Registered Agent Tools:
- `get_transaction(transaction_id)`: Fetches customer details, amount, rail, retry count, and gateway failure reason.
- `get_recovery_prediction(transaction_id)`: Fetches ML recovery confidence probability and operating threshold flag.
- `get_recovery_decision(transaction_id)`: Fetches the approved recovery policy action, execution priority, and policy reasoning.

---

## 9. Real Transaction Decision Example

Below is an authentic decision flow from the RecoverAI engine:

```
[FAILED PAYMENT]
Transaction #1001 • ₹14,999.00 INR • UPI AutoPay
Failure Reason: insufficient_funds • Prior Retries: 1
       │
       ▼
[ML RECOVERABILITY SCORING]
Recovery Probability: 88.7% (Recoverable: YES • Threshold >= 30%)
Customer Profile: High historical payment completion rate
       │
       ▼
[DETERMINISTIC POLICY DECISION]
Approved Action: alternative_payment
Execution Priority: HIGH
Policy Reason: "High recovery probability but direct naive retry may fail again without balance update."
       │
       ▼
[GEMINI AI DIAGNOSTIC BRIEFING]
"Payment degraded due to insufficient funds during UPI AutoPay batch execution.
Direct naive retries will increase gateway fees. Dispatched instant WhatsApp/SMS
alternative payment link with zero friction."
       │
       ▼
[RECOVERY EXECUTION]
Action Executed ➔ Recovery Case #501 Marked EXECUTED
Audit Event #902 Created ➔ ₹14,999.00 Revenue Recovered
```

---

## 10. Project Structure

```text
RecoverAI-RazorPay-/
├── backend/
│   ├── alembic/                      # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── agents/                   # Tool-grounded Gemini AI agent
│   │   │   └── recovery_agent.py
│   │   ├── api/                      # REST API routers
│   │   │   └── recovery.py
│   │   ├── core/                     # App settings & URL sanitizers
│   │   │   └── config.py
│   │   ├── db/                       # SQLAlchemy models & DB connection
│   │   │   ├── models/
│   │   │   │   ├── audit_event.py
│   │   │   │   ├── customer.py
│   │   │   │   ├── merchant.py
│   │   │   │   ├── recovery_action.py
│   │   │   │   ├── recovery_case.py
│   │   │   │   ├── recovery_ground_truth.py
│   │   │   │   └── transaction.py
│   │   │   └── database.py
│   │   ├── ml/                       # ML model wrapper
│   │   │   └── recovery_model.py
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   │   └── recovery.py
│   │   ├── services/                 # Predictor, Policy & Executor services
│   │   │   ├── feature_extractor.py
│   │   │   ├── recovery_executor.py
│   │   │   ├── recovery_features.py
│   │   │   ├── recovery_policy.py
│   │   │   └── recovery_predictor.py
│   │   └── main.py                   # FastAPI app entrypoint
│   ├── models/                       # Trained ML model weights
│   │   └── recovery_model.joblib
│   ├── scripts/                      # Synthetic data generation & training
│   │   ├── evaluate_model.py
│   │   ├── generate_dataset.py
│   │   ├── seed_data.py
│   │   └── train_model.py
│   ├── tests/                        # Pytest suite
│   │   └── test_recovery.py
│   ├── Dockerfile
│   ├── pytest.ini
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                      # Centralized API client & interceptors
│   │   │   └── recoveryApi.ts
│   │   ├── components/               # UI components, modals & visualizers
│   │   │   ├── AgentToolsVisualization.tsx
│   │   │   ├── AIIntelligencePanel.tsx
│   │   │   ├── ArchitectureDiagram.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── HeroVisual.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── RecoveryCaseCard.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── TransactionDetailModal.tsx
│   │   │   └── TransactionsTable.tsx
│   │   ├── data/                     # Resilient demo fallback dataset
│   │   │   └── mockData.ts
│   │   ├── hooks/                    # Live/Demo state synchronization
│   │   │   └── useRecoveryData.ts
│   │   ├── pages/                    # Overview, Cases, Audit, Architecture
│   │   │   ├── ArchitecturePage.tsx
│   │   │   ├── AuditTrailPage.tsx
│   │   │   ├── OverviewPage.tsx
│   │   │   ├── RecoveryCasesPage.tsx
│   │   │   └── TransactionsPage.tsx
│   │   ├── types/                    # TypeScript interfaces
│   │   │   └── recovery.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json
│   └── vite.config.ts
│
├── DEPLOYMENT.md                     # Production deployment documentation
├── render.yaml                       # Render Infrastructure as Code
└── README.md
```

---

## 11. Backend API Capabilities

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/` | Root API health status and welcome payload |
| `GET` | `/health` | Lightweight service health probe |
| `GET` | `/api/recovery/metrics` | High-level GMV at risk, recoverable GMV, recovered GMV, and failure breakdowns |
| `GET` | `/api/recovery/transactions` | Lists transactions filtered by status with recovery case metadata |
| `GET` | `/api/recovery/predict/{id}` | Runs ML recoverability prediction and evaluates policy decision |
| `GET` | `/api/recovery/cases` | Retrieves all created recovery cases ordered by priority |
| `GET` | `/api/recovery/cases/{id}` | Fetches detailed case information and recommended action |
| `GET` | `/api/recovery/cases/{id}/actions` | Retrieves chronological history of recovery actions for a case |
| `POST` | `/api/recovery/cases/{transaction_id}` | Creates a new recovery case, assigns action, and emits audit event |
| `POST` | `/api/recovery/cases/{id}/execute` | Executes the approved recovery action and updates state |
| `POST` | `/api/recovery/agent/{transaction_id}` | Invokes tool-grounded Gemini AI agent for diagnostic synthesis |
| `GET` | `/api/recovery/audit-events` | Fetches immutable system-wide regulatory and operational audit logs |

---

## 12. Local Setup Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and `npm`
- Git

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment (Windows PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
# By default, SQLite is used for zero-setup local development
Set-Content .env @"
DATABASE_URL=sqlite:///./recoverai.db
GEMINI_API_KEY=your_gemini_api_key_here
"@

# Seed local database with 1,000 transactions and demo cases
python scripts/seed_data.py

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
*FastAPI Swagger documentation will be live at `http://localhost:8000/docs`.*

### 2. Frontend Setup

```powershell
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend control plane will be live at `http://localhost:5173/` (or `5174`).*

---

## 13. Production Deployment

| Component | Platform | URL / Configuration |
| :--- | :--- | :--- |
| **Frontend UI** | **Vercel** | [Live Frontend Deployment](https://frontend-b8dqnkkvl-pavani-1629s-projects.vercel.app/) |
| **Backend API** | **Render** | [Live Backend Service](https://recoverai-razorpay.onrender.com/) • [Swagger Docs](https://recoverai-razorpay.onrender.com/docs) |
| **Database** | **Supabase** | Managed PostgreSQL instance with SSL pooling |

### Production Environment Variables

#### Backend (Render):
- `DATABASE_URL`: `postgresql+psycopg://postgres.YOUR_REF:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
- `GEMINI_API_KEY`: Google Gemini API Key

#### Frontend (Vercel):
- `VITE_API_BASE_URL`: `https://recoverai-razorpay.onrender.com`

---

## 14. Screenshots & Interface Preview

<div align="center">

| Overview Control Plane | AI Diagnostics Modal |
| :---: | :---: |
| *(High-level GMV metrics & failure breakdowns)* | *(Tool-grounded Gemini briefing for failed payments)* |

| Recovery Cases Pipeline | Immutable Audit Trail |
| :---: | :---: |
| *(Case triage, confidence scores & execution actions)* | *(Regulatory chronological audit events ledger)* |

> *Interactive UI demonstrations and video recordings are accessible directly on the [Live Vercel Deployment](https://frontend-b8dqnkkvl-pavani-1629s-projects.vercel.app/).*

</div>

---

## 15. Judge & Recruiter Walkthrough Flow

When evaluating the live demo, follow this guided end-to-end journey:

1. **Dashboard Overview**: Inspect total revenue at risk (₹8.42L+), recoverable revenue, and payment method failure distributions.
2. **Transactions Table**: Filter failed transactions by payment rail (UPI, Card, NetBanking, Wallet).
3. **Transaction Details Modal**: Click on any failed payment to view the customer profile, gateway error code, and real-time ML recovery probability.
4. **Run AI Diagnosis**: Click **"Run Gemini AI Diagnosis"** to inspect how the agent leverages database tools to produce a root-cause explanation.
5. **Recovery Cases Page**: Filter by *Open* vs *Executed* cases. Review recommended recovery actions (`retry_payment`, `alternative_payment`).
6. **Execute Recovery**: Click **"Execute Recovery"** on an open case to trigger execution, recover GMV, and transition case status.
7. **Audit Trail Page**: Verify that the execution immediately produced an immutable event with actor, timestamp, and recovered amount.
8. **Architecture Page**: Inspect the end-to-end pipeline diagram and decision boundary specifications.

---

## 16. Differentiation

```
Traditional Gateways:    Checkout ➔ Gateway ➔ [PAYMENT FAILED] ➔ Drop-off (Lost GMV)
RecoverAI Layer:         [PAYMENT FAILED] ➔ ML Score ➔ Policy ➔ AI Briefing ➔ Bounded Action ➔ Recovered GMV
```

RecoverAI is not another checkout widget or payment gateway. It is a **post-failure recovery decision and execution layer** that sits alongside payment infrastructure to reclaim revenue that would otherwise be permanently lost.

---

## 17. Built By

**Pavani Parla**  
*Full Stack & AI/ML Engineer*  
Built for the **Razorpay AI Buildathon 2026**

- **Email**: [pavaniparla19@gmail.com](mailto:pavaniparla19@gmail.com)
- **GitHub**: [@pavani-1629](https://github.com/pavani-1629)
- **Project Repo**: [RecoverAI-RazorPay-](https://github.com/pavani-1629/RecoverAI-RazorPay-)

---

<div align="center">

### RecoverAI
**AI-Powered Payment Revenue Recovery Control Plane**

*Built with FastAPI • React • TypeScript • PostgreSQL • scikit-learn • Google Gemini*

</div>
