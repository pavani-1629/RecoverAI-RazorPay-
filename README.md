<div align="center">

# ⚡ RecoverAI

### AI-Powered Payment Revenue Recovery Control Plane

> *"Don't just detect failed payments — recover the revenue behind them."*

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

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,python,fastapi,postgres,supabase,scikitlearn,git,github,vercel" alt="Tech Stack Icons" />
</p>

</div>

---

## 📌 1. Project Overview

In traditional payment workflows, when a gateway or issuing bank returns a failure code (`insufficient_funds`, `bank_declined`, `timeout`, `limit_exceeded`), the checkout journey abruptly ends. Merchants experience immediate revenue leakage, customer churn, and repetitive retry expenses.

**RecoverAI** is an intelligent revenue recovery control plane that automatically intercepts failed transactions, estimates recovery likelihood using machine learning, evaluates deterministic recovery policies, leverages a Google Gemini agent for operational explainability, and executes bounded recovery actions while maintaining an immutable audit log.

```
Payment Failure ➔ ML Recoverability Prediction ➔ Deterministic Policy ➔ Gemini AI Explanation ➔ Bounded Execution ➔ Immutable Audit
```

---

## 🧠 2. Core 4-Layer Decision Model

RecoverAI enforces a strict separation of concerns across prediction, decision-making, explainability, and execution:

| Layer | Technology | Responsibility | Safety Boundary |
| :--- | :--- | :--- | :--- |
| **1. ML Predicts** | `scikit-learn` | Computes statistical recovery probability (0.0 to 1.0) using customer history and rail metrics. | 30% cost-sensitive threshold prevents wasteful retries. |
| **2. Policy Decides** | Rule Engine | Deterministic ground truth mapping failure codes to approved actions. | ML does not execute actions; policy retains single authority. |
| **3. AI Explains** | Google Gemini | Queries database tools to synthesize grounded root-cause diagnostic briefings. | Agent cannot alter policies or hallucinate database state. |
| **4. Executor Acts** | Postgres Ledger | Executes bounded actions (`retry_payment`, `alternative_payment`, `customer_notification`, `manual_review`). | Emits immutable chronological audit log entries. |

---

## 🏛️ 3. System Architecture

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
        I --> K[(Immutable Audit Log)]
    end
```

---

## 💡 4. Real Transaction Decision Flow

```
[FAILED PAYMENT]
Transaction #1001 • ₹14,999.00 INR • UPI AutoPay • Reason: insufficient_funds • Prior Retries: 1
       │
       ▼
[1. ML RECOVERABILITY SCORING]
Recovery Probability: 88.7% (Recoverable: YES • Threshold >= 30%)
Customer Profile: High historical completion rate, low dispute risk
       │
       ▼
[2. DETERMINISTIC POLICY DECISION]
Approved Action: alternative_payment (Priority: HIGH)
Policy Reason: "High recovery probability but direct naive retry may fail again without balance update."
       │
       ▼
[3. GEMINI AI DIAGNOSTIC BRIEFING]
"Payment degraded due to insufficient funds during UPI AutoPay batch execution.
Direct naive retries will increase gateway fees. Dispatched instant WhatsApp/SMS
alternative payment link with zero friction."
       │
       ▼
[4. RECOVERY EXECUTION & AUDIT]
Action Executed ➔ Recovery Case #501 Marked EXECUTED
Audit Event #902 Created ➔ ₹14,999.00 Revenue Recovered
```

---

## 🛠️ 5. Technology Stack

| Layer | Technologies | Role in RecoverAI |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide, Recharts | Real-time control plane, metrics visualizer, case triage pipeline, and agent modals |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn | High-performance RESTful API endpoints for transactions, predictions, cases, and execution |
| **Database & ORM** | PostgreSQL (Supabase / Render), SQLite (Local), SQLAlchemy 2.0, Psycopg 3 | Transaction store, customer profiles, recovery cases, and immutable audit logs |
| **Machine Learning** | scikit-learn, NumPy, Pandas, Joblib | Cost-sensitive recovery probability scoring (Logistic Regression / Gradient Boosting) |
| **AI Agent** | Google Gemini (`google-genai`), Tool Calling | Grounded root-cause analysis using `get_transaction`, `get_recovery_prediction`, `get_recovery_decision` |
| **Deployment** | Vercel (Frontend), Render (Backend), Supabase (Database) | Automated CI/CD cloud deployment |

---

## ⚡ 6. Key Features & API Endpoints

- **Real-Time Revenue at Risk Visibility**: Instant breakdown of total failed volume, recoverable GMV, and recovered revenue.
- **Cost-Sensitive Thresholding**: 30% baseline threshold prevents wasteful recovery attempts on low-confidence failures.
- **Bounded Deterministic Policies**: Safe action routing across UPI AutoPay, Cards, NetBanking, and Wallets.
- **Grounded Gemini AI Diagnostics**: Tool-augmented root-cause briefing without hallucinations.
- **Immutable Audit Trail**: Regulatory chronological logging of all actors, evaluations, and recovered GMV.

### Core API Reference

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/recovery/metrics` | High-level GMV at risk, recoverable GMV, recovered GMV, and failure breakdowns |
| `GET` | `/api/recovery/transactions` | Lists transactions with customer details and recovery case status |
| `GET` | `/api/recovery/predict/{id}` | Runs ML recoverability prediction and evaluates policy decision |
| `GET` | `/api/recovery/cases` | Retrieves all recovery cases ordered by priority |
| `POST` | `/api/recovery/cases/{id}/execute` | Executes approved recovery action and updates state |
| `POST` | `/api/recovery/agent/{transaction_id}` | Invokes tool-grounded Gemini AI agent for diagnostic synthesis |
| `GET` | `/api/recovery/audit-events` | Fetches system-wide immutable regulatory and operational audit logs |

---

## 🚀 7. Local Setup Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and `npm`

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env (uses SQLite for zero-setup local dev)
echo "DATABASE_URL=sqlite:///./recoverai.db" > .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env

# Seed database with sample transactions & start server
python scripts/seed_data.py
uvicorn app.main:app --reload --port 8000
```
*API documentation will be live at `http://localhost:8000/docs`.*

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies and run Vite dev server
npm install
npm run dev
```
*Frontend control plane will be live at `http://localhost:5173`.*

---

## ☁️ 8. Production Deployment

| Component | Platform | URL / Configuration |
| :--- | :--- | :--- |
| **Frontend UI** | **Vercel** | [Live Frontend Deployment](https://frontend-b8dqnkkvl-pavani-1629s-projects.vercel.app/) |
| **Backend API** | **Render** | [Live Backend Service](https://recoverai-razorpay.onrender.com/) • [Swagger Docs](https://recoverai-razorpay.onrender.com/docs) |
| **Database** | **Supabase** | Managed PostgreSQL instance with SSL pooling |

### Production Environment Variables

- **Backend (Render)**:
  - `DATABASE_URL`: `postgresql+psycopg://postgres.YOUR_REF:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
  - `GEMINI_API_KEY`: Google Gemini API Key
- **Frontend (Vercel)**:
  - `VITE_API_BASE_URL`: `https://recoverai-razorpay.onrender.com`

---

## 👩‍💻 9. Built By

**Pavani Parla**  
*Full Stack & AI/ML Engineer*  
Built for the **Razorpay AI Buildathon 2026**

- **Email**: [pavaniparla19@gmail.com](mailto:pavaniparla19@gmail.com)
- **GitHub**: [@pavani-1629](https://github.com/pavani-1629)
- **Project Repo**: [RecoverAI-RazorPay-](https://github.com/pavani-1629/RecoverAI-RazorPay-)
