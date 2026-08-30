<<<<<<< HEAD
# VeriLens — AI-Assisted Misinformation & Fake News Detection Platform

> **"Verify before you share."**  
> VeriLens is a full-stack media forensics platform that generates explainable, evidence-based credibility assessments. It **never** claims absolute certainty or presents AI predictions as ground truth.

---

## 🏛️ Core Philosophy: The Zero-Certainty Standard

Misinformation cannot be reliably identified solely through writing style or black-box predictions. Factual investigative reporting may employ emotive language, whereas state-sponsored or commercial disinformation frequently masquerades behind detached, neutral prose.

VeriLens enforces a **layered evidence architecture**:
- **Strictly Calibrated Verdicts:**
  - `Likely credible`
  - `Potentially misleading`
  - `Insufficient evidence`
  - `Likely false based on available fact-checks`
- **Confidence Levels:** `Low`, `Medium`, or `High` based on the volume and consensus of verifiable external records.
- **Mandatory Epistemic Notice:** Every assessment includes an unremovable disclaimer reminding users that automated tools assist human discernment but cannot replace primary document investigation.

---

## 🚀 Technology Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React Icons
- **Design System:** Restrained editorial typography, accessible color tokens (Deep Navy, Slate, Teal, Amber, Crimson), Dark/Light mode toggle
- **Charts & Data Visualization:** Recharts (Verdict distribution Donut chart, Daily timeline Bar chart)
- **Backend & APIs:** Next.js API routes & Server Actions
- **Database & ORM:** Prisma ORM with SQLite (`dev.db`), structured with repository abstractions for seamless PostgreSQL migration
- **Validation:** Zod schemas for runtime request & payload validation
- **Testing:** Vitest test suite for scoring algorithms, NLP heuristics, and SSRF security
- **Security:** In-memory sliding-window rate limiting, strict SSRF guards, safe server-side article scraping (timeouts & 2MB max payload)

---

## 📦 System Architecture

```
User Input (Text, URL, Claim)
    │
    ├──> SSRF Guard & Input Sanitizer (Zod + DNS Lookup)
    │
    ├──> Claim Extractor & Search Query Generator
    │       │
    │       ├──> Google Fact Check Tools API (Verified Fact-Checks)
    │       └──> GDELT 2.0 DOC API (Global News Corroboration)
    │
    ├──> URL Fetcher & Google Safe Browsing API v4
    │
    ├──> Rule-Based Linguistic & Sensationalism Heuristics Engine
    │
    ▼
Transparent Scoring Engine (Weighted Multi-Factor Formula in config.ts)
    │
    ▼
Groq AI Synthesis (Structured JSON) / Deterministic Forensic Fallback
    │
    ▼
Prisma Database Storage (dev.db) ──> Interactive Results Dossier & History
```

---

## 🔑 Environment Variables & API Key Setup

VeriLens is designed to function **out-of-the-box in Demo/Offline mode** even without any API keys. To connect live external services, configure the following keys in `.env`:

```env
# Google Fact Check Tools API Key
FACT_CHECK_API_KEY=

# Google Safe Browsing API Key
SAFE_BROWSING_API_KEY=

# Groq Cloud API Key for AI explanation synthesis
GROQ_API_KEY=

# Local SQLite Database (Prisma)
DATABASE_URL="file:./dev.db"
```

### How to Obtain Free API Keys:

1. **Google Fact Check Tools API (`FACT_CHECK_API_KEY`):**
   - Visit the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project, enable the **Fact Check Tools API**, and generate an API key under **Credentials**.
   - Free tier includes generous quotas for search queries.

2. **Google Safe Browsing API (`SAFE_BROWSING_API_KEY`):**
   - In Google Cloud Console, enable the **Safe Browsing APIs (v4)**.
   - Use the same API key or generate a restricted key.

3. **Groq Cloud API (`GROQ_API_KEY`):**
   - Register at [console.groq.com](https://console.groq.com/).
   - Generate an API key under **API Keys**.
   - Free tier provides fast inference on open-source models (`llama-3.1-8b-instant`).
   - *Note:* If omitted, VeriLens automatically uses its built-in deterministic forensic synthesizer.

4. **GDELT 2.0 Global Coverage API:**
   - Public REST endpoint — **no API key required**.

---

## 🛠️ Installation & Running Locally

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Initialize the Database
```bash
npx prisma generate
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Unit Tests
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🧪 Scoring Weight Configuration

All scoring weights and thresholds are strictly centralized in [`src/lib/scoring/config.ts`](src/lib/scoring/config.ts):

| Dimension | Weight | Forensic Basis |
| :--- | :---: | :--- |
| **Verified Fact-Checks** | `45%` | Authoritative ClaimReview records from accredited IFCN publishers |
| **Cross-Source Corroboration** | `20%` | Independent global media coverage indexed in GDELT 2.0 |
| **Source Technical Profile** | `15%` | HTTPS encryption, Google Safe Browsing malware/phishing signals |
| **Language Tone Restraint** | `10%` | Absence of sensationalist shock-words, panic urgency, and hyperbole |
| **Attribution & Transparency** | `10%` | Verifiable author bylines, explicit timestamps, and cited links |

---

## 🔒 Security & Reliability Features

- **SSRF Defense:** Prevents server-side request forgery by blocking private IP ranges (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `::1`, `localhost`), validating DNS resolution, and permitting only HTTP/HTTPS protocols.
- **Safe Web Scraping:** Uses 6-second abort timeouts and strict 2MB response size limits to prevent denial-of-service.
- **Rate Limiting:** Sliding-window rate limiter on the analysis API routes.
- **No Client Key Exposure:** All API requests and credentials remain isolated on the server.

---

## ⚖️ Limitations & Ethical Use Statement

1. **Automated Verification Boundaries:** Machine analysis synthesizes indexed digital records but cannot replace primary source inspection, clinical trial documentation, or investigative reporting.
2. **Breaking News Delay:** Real-world investigations require time; unindexed breaking stories receive an honest label of `"Insufficient Evidence"` rather than a fabricated verdict.
3. **Primary Source Imperative:** Users must consult the linked primary sources cited in every VeriLens report before making decisions or sharing content.

---

## 📄 License
MIT License. Built for open and transparent information hygiene.
=======
# fake-news-detector
It is a fully functional fake news detector that contains ai api
>>>>>>> 3ce249f9c1b640f529d105970ce0d41d3c22b4f7
