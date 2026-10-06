# Finova Finance — Modern Finance & Loan Management Platform

> **Tagline:** *"Simple Finance. Smarter Decisions."*  
> **Notice:** This application is an educational & enterprise demonstration platform with realistic mock financial data. It is not an actual regulated banking institution.

---

## 🌟 Executive Overview

**Finova Finance** is a full-stack, enterprise-grade digital finance and loan management web platform. Designed with modern fintech aesthetics—clean typography, responsive layouts, subtle micro-interactions, and accessible contrast—it provides a seamless borrowing and loan servicing experience for retail customers while equipping loan officers with a comprehensive administrative workbench.

### Core Highlights
* **Dual-Role Access Control (RBAC):** Customer Portal vs. Admin Control Center.
* **₹1,00,000 Approval Rule Engine:**
  * **Loans < ₹1,00,000:** Automated qualification pipeline with instant eligibility check.
  * **Loans ≥ ₹1,00,000:** Mandatory `PENDING_ADMIN_REVIEW` gate requiring underwriter evaluation, risk scoring, document inspection, and formal approval/rejection/clarification actions.
* **Accurate Financial Math:** Standard reducing-balance EMI formula ($EMI = \frac{P \cdot r \cdot (1+r)^n}{(1+r)^n - 1}$) and Simple Interest ($SI = \frac{P \cdot R \cdot T}{100}$) with full monthly amortization tables.
* **7-Step Loan Application Wizard:** Multi-step wizard with real-time EMI estimation, personal & income profiling, masked banking details, drag-and-drop file uploader, and dynamic guarantor/co-applicant modules.
* **Active Loan Servicing:** Repayment progress tracking, monthly amortization schedules, demo payment gateway (UPI, Net Banking, Debit Card) with instant printable receipts.
* **Complete Audit Trail & Notifications:** Automated real-time alerts on status transitions and immutable administrative action logging.

---

## 🏗️ Technology Stack & Architecture

```
                          ┌─────────────────────────────┐
                          │   Finova Finance Frontend   │
                          │   React 18 + TypeScript     │
                          │   Tailwind CSS + Recharts   │
                          │   Port: 3000 (Vite)         │
                          └──────────────┬──────────────┘
                                         │  Proxy (/api)
                                         ▼
                          ┌─────────────────────────────┐
                          │   Finova REST API Backend   │
                          │   Node.js + Express + TS    │
                          │   JWT Auth + Bcrypt + Multer│
                          │   Port: 5000                │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │ SQLite / WASM Persistence │                   │ Enterprise MySQL Schema   │
   │ (sql.js - zero native C++)│                   │ (schema.mysql.sql ready)  │
   │ server/data/finova.db     │                   └───────────────────────────┘
   └───────────────────────────┘
```

### Frontend
* **Core:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS (Custom curated fintech palette: Deep Navy `#0f274a`, Blue `#2563eb`, Emerald `#10b981`, Amber `#f59e0b`, Rose `#ef4444`)
* **State & Navigation:** React Router v6, React Context (`AuthContext`, `NotificationContext`)
* **Charts & Visuals:** Recharts (Donut charts, Area charts, Bar charts), Lucide React icons
* **HTTP Client:** Axios with JWT request interceptors & error handlers

### Backend
* **Runtime & Framework:** Node.js, Express, TypeScript
* **Database & ORM:** Relational SQLite engine powered by `sql.js` (WebAssembly with synchronous binary disk persistence; no native C++ compiler needed on Windows). Enterprise MySQL DDL script also provided in `server/schema.mysql.sql`.
* **Security & Auth:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing (salt rounds: 10), Role-based route middleware.
* **Document Management:** Multer with mime-type checking, 10MB limit, disk storage isolated outside frontend public folders.
* **Calculations:** Money-safe precision math utils (`src/utils/calculations.ts`).

---

## 👥 Demo Credentials

For convenience, a **One-Click Demo Switcher** is pinned to the top of the interface, or you can log in manually:

| Role | Email / Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Demo Customer** | `rahul@example.com` | `Password@123` | Personal Dashboard, Apply Loans, EMI Payments, Amortization, Profile |
| **Demo Admin** | `admin@finova.demo` | `Admin@123` | Underwriting Workbench, Application Approval, User Management, Loan Products, Audit Logs |

---

## ⚡ Quick Start Guide

### Prerequisites
* Node.js v18+ (tested on Node.js v24.13.0)
* npm v9+

### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
```
*Backend runs at:* `http://localhost:5000`  
*Health Check:* `http://localhost:5000/api/health`

### 2. Start Frontend Application
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
*Frontend runs at:* `http://localhost:3000` (automatically proxies `/api` calls to port 5000).

---

## 📊 Database Schema & Entities

The application implements a normalized relational database containing 12 key entities:

1. **`users`**: Customer and administrator profiles, hashed passwords, contact info, masked account numbers, KYC status.
2. **`loan_products`**: Configurable loan catalog (Personal, Education, Home, Vehicle, Business, Emergency) with interest rates, min/max limits, tenure ranges, and guarantor/co-applicant policies.
3. **`loan_applications`**: Application lifecycle tracking, requested amounts, DTI ratios, employment/income profiles, and underwriting review notes.
4. **`loan_documents`**: Uploaded KYC, address, and income proofs with mime validation, size tracking, and review status.
5. **`guarantors` & `co_applicants`**: Surety and co-borrower demographics, relationship, employment, and income proofs.
6. **`loan_accounts`**: Disbursed loan accounts (`LN-XXXX-XXXXXX`), outstanding balance, interest rates, disbursement date, and loan health.
7. **`repayment_schedules`**: Monthly amortization schedules (opening balance, principal, interest, EMI, closing balance, status).
8. **`payments` & `transactions`**: Mock payment logs (UPI/Card/NetBanking), transaction IDs, and downloadable receipt records.
9. **`notifications`**: Targeted user and admin alerts for loan status updates and payment reminders.
10. **`audit_logs`**: Immutable record of administrative operations (Approve, Reject, Request Info, Product Config).

---

## 🚦 Business Rules & Workflows

### 1. Loan Approval Rule Engine
```
                       [Customer Submits Loan Application]
                                        │
                                        ▼
                         Is Requested Amount < ₹1,00,000?
                                  /            \
                                 /              \
                             YES                 NO
                             /                     \
                            ▼                       ▼
            [Automated Eligibility Check]   [Status: PENDING_ADMIN_REVIEW]
                            │                       │
                            ▼                       ▼
                   [Status: APPROVED]      [Admin Evaluates in Workbench]
                            │                 ├── Action: APPROVE
                            │                 ├── Action: REJECT (Reason required)
                            │                 └── Action: REQUEST INFO (Msg required)
                            │                       │ (If Approved)
                            └───────────┬───────────┘
                                        ▼
                             [Loan Account Created]
                                        │
                                        ▼
                        [Amortization Schedule Generated]
                                        │
                                        ▼
                         [Customer Pays Monthly EMIs]
```

### 2. Financial Calculations
* **Reducing Balance Monthly EMI:**
  $$\text{EMI} = \frac{P \cdot r \cdot (1 + r)^n}{(1 + r)^n - 1}$$
  *Example:* ₹5,00,000 at 12% for 5 years = ₹11,122 / month (Total Repayment: ₹6,67,333).
* **Simple Interest:**
  $$\text{SI} = \frac{P \cdot R \cdot T}{100}$$

---

## 🌐 Complete API Reference

### Authentication & Profile
* `POST /api/auth/register` — Register new customer account
* `POST /api/auth/login` — Authenticate customer or admin, return JWT
* `GET  /api/users/me` — Fetch authenticated user profile & masked details
* `PUT  /api/users/profile` — Update address & contact information

### Loan Products & Calculators
* `GET  /api/loans/products` — List all active loan products
* `GET  /api/loans/products/:id` — Get single product details
* `POST /api/loans/calculate-emi` — Compute reducing-balance EMI & amortization preview
* `POST /api/loans/calculate-simple` — Compute simple interest

### Applications & Documents
* `POST /api/applications` — Submit new 7-step loan application
* `GET  /api/applications/my` — List applications for authenticated customer
* `GET  /api/applications/:id` — View complete application details & timeline
* `POST /api/applications/:id/documents` — Secure multi-file document upload
* `GET  /api/applications/:id/documents/:docId/download` — Secure document download

### Loan Servicing & Payments
* `GET  /api/loans/my` — List disbursed active loan accounts
* `GET  /api/loans/:id` — Loan account details & balance summary
* `GET  /api/loans/:id/schedule` — Complete monthly amortization schedule
* `POST /api/payments` — Process mock EMI payment (UPI, Net Banking, Card)
* `GET  /api/payments/history` — Customer payment history & receipt generation
* `GET  /api/transactions` — Transaction ledger with filter & search

### Admin Management
* `GET  /api/admin/dashboard` — Platform overview metrics & chart aggregations
* `GET  /api/admin/applications` — Underwriting list with search & status filters
* `GET  /api/admin/applications/:id` — Full underwriter application packet
* `PUT  /api/admin/applications/:id/approve` — Approve loan & auto-generate loan account
* `PUT  /api/admin/applications/:id/reject` — Reject loan with mandatory reason
* `PUT  /api/admin/applications/:id/request-info` — Request missing info / documents
* `GET  /api/admin/users` — List platform users & active loan summaries
* `PUT  /api/admin/users/:id/status` — Toggle user account active/suspended
* `POST /api/admin/loans/products` — Create new loan product configuration
* `PUT  /api/admin/loans/products/:id` — Update loan product rates, limits, and rules
* `GET  /api/admin/audit-logs` — Immutable administrative audit log trail

---

## 🔒 Security Architecture

1. **Role-Based Access Control (RBAC):** Middleware validates JWT claims on every request. Route guards on the frontend immediately redirect unauthorized attempts to `/login` or `/admin/login`.
2. **Password Protection:** Passwords are never stored in plaintext and never transmitted back in API responses. Salted bcrypt hashing with 10 rounds is enforced.
3. **Sensitive Data Masking:** Account numbers (`XXXXXX4812`) and PAN cards (`ABCDE****F`) are masked both in API outputs and in customer dashboards to prevent shoulder-surfing.
4. **Isolated Document Storage:** User-uploaded files are stored outside the public document root (`server/uploads/`) with random hashed disk filenames, validating mime types (`application/pdf`, `image/jpeg`, `image/png`) and file size caps.
5. **Ownership Authorization:** Endpoints verify that regular customers can only view and mutate their own applications and loan accounts.
6. **Audit Trails:** Sensitive admin actions (approvals, rejections, product edits) are recorded into `audit_logs` with timestamps and administrator identifiers.

---

## 🧪 Verification & Automated Testing

An end-to-end integration test suite is included in `server/test_e2e.js`. It validates 11 critical workflows:

```bash
cd server
node test_e2e.js
```

**Test Results:**
* `✔ API Health Check`
* `✔ EMI Calculation Precision (₹5,00,000 @ 12% for 5y => ₹11,122)`
* `✔ Customer Registration & Login (JWT Verification)`
* `✔ Business Rule: < ₹1,00,000 Auto-Approval Workflow`
* `✔ Business Rule: ≥ ₹1,00,000 Mandatory PENDING_ADMIN_REVIEW Gate`
* `✔ Admin Login & Underwriting Queue Inspection`
* `✔ Admin Sanction/Approval & Loan Account Creation`
* `✔ 36-Month Amortization Schedule Generation`
* `✔ Customer EMI Payment & Outstanding Balance Reduction`
* `✔ Security Audit Log Recording`
* `✔ Real-Time Status Notification Dispatch`

---

## 🚀 Future Roadmap

* **Live Payment Gateway:** Integration with Razorpay / Stripe for real card and UPI authorizations.
* **Document OCR & KYC Validation:** Automated PAN & Aadhaar OCR extraction using cloud vision APIs.
* **Cloud Storage Adapter:** Drop-in adapter for AWS S3 / Google Cloud Storage for scalable document archiving.
* **SMS & Email Webhooks:** Real-time transactional emails via SendGrid / AWS SES.
* **Credit Bureau Simulation:** Integration with mock CIBIL/Experian credit score inquiry modules.

---

**Finova Finance** — Built with clean architecture, enterprise security, and modern web standards.
