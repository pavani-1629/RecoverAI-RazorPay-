# RecoverAI — Complete Deployment Guide (Vercel + Render + Supabase)

This guide walks you through deploying **RecoverAI** into production using the specified stack:
- **Database**: PostgreSQL on **[Supabase](https://supabase.com)**
- **Backend API**: Python + FastAPI + Scikit-learn + Gemini AI on **[Render](https://render.com)**
- **Frontend App**: React + TypeScript + Vite + Tailwind CSS on **[Vercel](https://vercel.com)**
- **Version Control**: GitHub

---

## Architecture Overview

```
[ User Browser ]
       │
       ▼ (HTTPS)
[ Vercel CDN ]  ─── (React + Vite SPA)
       │
       │ (REST API calls with CORS)
       ▼
[ Render Web Service ] ─── (FastAPI + ML Model + Gemini AI Agent)
       │
       ▼ (PostgreSQL Session Pooler)
[ Supabase Database ]
```

---

## Pre-requisites Checklist

Before starting, make sure you have accounts on:
1. [GitHub](https://github.com)
2. [Supabase](https://supabase.com) (Free tier)
3. [Render](https://render.com) (Free tier)
4. [Vercel](https://vercel.com) (Free tier)
5. [Google AI Studio](https://aistudio.google.com/) (For `GEMINI_API_KEY`)

---

## Step 1: Push Code to GitHub

Make sure your project repository is committed and pushed to GitHub:

```bash
git add .
git commit -m "feat: configure production deployment for Vercel, Render, and Supabase"
git push origin main
```

---

## Step 2: Set Up Supabase Database

1. Log in to [Supabase](https://supabase.com/dashboard) and click **"New project"**.
2. Fill in:
   - **Name**: `recoverai-db`
   - **Database Password**: (Generate a strong password and **save it safely**).
   - **Region**: Choose the region closest to your Render server (e.g. *AWS Singapore / Frankfurt / US East*).
3. Once the database is provisioned (1-2 minutes):
   - Navigate to **Project Settings** (gear icon) → **Database**.
   - Scroll to **Connection string** section.
   - Select the **URI** tab.
   - Choose **Session Pooler** (Port `5432`) or **Direct connection**.
   - Copy the URI. It will look like:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password.

---

## Step 3: Deploy Backend on Render

1. Log in to [Render](https://dashboard.render.com/) and click **"New +"** → **"Web Service"**.
2. Connect your GitHub repository (`RecoverAI`).
3. Configure the service settings:
   - **Name**: `recoverai-backend` (or any unique name)
   - **Region**: Same region or closest to your Supabase DB.
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: `Free`

4. Scroll to **Environment Variables** and add:
   | Key | Value | Description |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://postgres...` | Your Supabase connection string from Step 2 |
   | `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key from Google AI Studio |
   | `PYTHON_VERSION` | `3.12.0` | Recommended Python version |

5. Click **"Deploy Web Service"**.

> **Note on Migrations**:
> Because the start command includes `alembic upgrade head`, Render will automatically create all tables in your Supabase database upon first deployment!

6. Once the build completes and status is **Live**, copy your Render service URL:
   `https://recoverai-backend.onrender.com`

7. Test it by opening `https://recoverai-backend.onrender.com/health` in your browser. You should see:
   ```json
   {"status": "healthy", "version": "1.0.0"}
   ```

---

## Step 4: Seed Database with Initial Data (Optional / Recommended)

To populate sample merchants, customers, and payment transactions into your Supabase database:

### Option A: From your local terminal pointing to Supabase
In your local `backend/.env` file, temporarily set:
```ini
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@...supabase.com:5432/postgres
```
Then run:
```bash
# In backend directory
python scripts/seed_data.py
```

### Option B: Using Render Shell (Paid/Free CLI or one-off job)
Or trigger the seed script through your database management tool / Python script.

---

## Step 5: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.
2. Import your GitHub repository (`RecoverAI`).
3. In the project configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`.
   - **Build Command**: `npm run build` (or default)
   - **Output Directory**: `dist` (default)
4. Expand **Environment Variables** and add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://recoverai-backend.onrender.com` | Your live Render backend URL from Step 3 (without trailing slash) |

5. Click **"Deploy"**.

6. Once deployed, Vercel will give you a live production URL:
   `https://recoverai-frontend.vercel.app`

---

## Step 6: Verify End-to-End Functionality

1. Open your live Vercel URL in your browser.
2. Verify that:
   - Dashboard metrics (Recovery Rate, Revenue at Risk, Total Recovered) load properly from Supabase.
   - The **Transactions** table displays failed and recovered transactions.
   - Clicking a transaction opens the modal and allows you to trigger **ML Recoverability Prediction** and the **Gemini Recovery Agent**.
   - The **Audit Trail** drawer records immutable events in PostgreSQL.

---

## Environment Variables Reference

### Backend (`backend/.env` or Render Environment)
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase PostgreSQL URI (`postgresql://postgres:...`) |
| `GEMINI_API_KEY` | Yes | Google Gemini API Key for multi-turn recovery agent reasoning |
| `PORT` | Auto | Render assigns `$PORT` dynamically (defaults to 8000) |

### Frontend (`frontend/.env` or Vercel Environment)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Public URL of your deployed Render backend (e.g. `https://recoverai-backend.onrender.com`) |

---

## Troubleshooting & FAQs

### 1. Backend shows `Connection refused` or `database connection timeout`
- Ensure you used the **Session Pooler** URI from Supabase (Port `5432` or `6543`) with IPv4 support if running on Render free tier.
- Double-check that your database password is correctly URL-encoded if it contains special characters like `@`, `#`, or `%`.

### 2. Frontend shows CORS or network errors
- The FastAPI backend has `CORSMiddleware` configured with `allow_origins=["*"]` by default in `backend/app/main.py`.
- Verify that `VITE_API_BASE_URL` on Vercel does not contain a trailing slash (e.g., `https://recoverai-backend.onrender.com`).

### 3. Render Free Tier Sleep
- Render free tier web services spin down after 15 minutes of inactivity. The first request after sleep may take ~30 seconds to cold start.
