# Kisan Scheme Saathi — Node.js & Express API Backend

Fast, lightweight Node.js/TypeScript backend for **Kisan Saathi** implementing the exact same REST API contract and deterministic rules engine as the Java backend, with built-in mock persistence in `data/app-db.json`.

---

## 🌟 Highlights

- **Instant Setup**: Runs directly with Node.js and TypeScript (`tsx`).
- **Deterministic Rules Engine**: Strictly matches eligibility conditions for Karnataka farmers without LLM hallucinations.
- **Conversational AI Chat Endpoint**: Exposes `POST /api/eligibility-chat` to power the interactive questionnaire on the Check Eligibility page.
- **Full Authentication**: SMS OTP registration, phone normalization (+91 E.164), PBKDF2 password hashing, and JWT tokens.
- **PostgreSQL Ready & Zero-Config Fallback**: Connects to PostgreSQL if configured, or seamlessly falls back to `data/app-db.json` for instant zero-dependency local development.

---

## 🚀 How to Run

### 1. Install Dependencies
From the project root:
```bash
npm install
```
Or inside `server/`:
```bash
cd server
npm install
```

### 2. Start the Server
From the root workspace:
```bash
npx tsx server/server.ts
```
The server will start on **`http://localhost:5000`**.

### 3. Endpoints Provided
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck & configured SMS provider |
| `GET` | `/api/schemes` | List verified Karnataka schemes |
| `GET` | `/api/schemes/:id` | Detailed scheme information |
| `POST` | `/api/eligibility/evaluate` | Deterministic profile evaluator |
| `POST` | `/api/eligibility-chat` | Interactive conversational questionnaire |
| `GET` | `/api/schemes/:id/checklist` | Required official documents |
| `GET` | `/api/schemes/:id/application-guide`| Step-by-step portal application guide |
| `POST` | `/api/auth/register` | Register farmer with SMS OTP |
| `POST` | `/api/auth/login` | Login with username/phone + password |
| `GET` | `/api/saved-schemes` | Farmer's bookmarked schemes |
| `GET` | `/api/applications` | Farmer's application status tracker |
| `GET` | `/api/reminders/upcoming` | Deadlines & renewal reminders |
