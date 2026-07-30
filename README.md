# CivicMind AI — Hackathon Project
## Innovation Sprint Hackathon 2026 | PS-06: AI Public Service Automation

> **The AI Operating System for Smart City Governance**

---

## 🚀 Quick Start

### 1. Clone & Setup

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 2. Environment Setup

```bash
# In server/
cp .env.example .env
# Fill in: MONGO_URI, GEMINI_API_KEY
```

### 3. Seed Database

```bash
cd server
npm run seed
```

### 4. Start Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend  
cd client && npm run dev
```

Open: http://localhost:5173

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| 👤 Citizen | citizen@demo.com | Demo@123 |
| 👮 Officer | officer@demo.com | Demo@123 |
| ⚙️ Admin | admin@demo.com | Demo@123 |

---

## 🏗️ Architecture

```
CivicMind AI
├── Frontend: React + Vite + Tailwind + Framer Motion
├── Backend: Node.js + Express + MongoDB
├── AI: Google Gemini 1.5 Flash
├── Maps: Leaflet
├── Charts: Recharts
└── Auth: JWT + bcrypt + RBAC
```

## 🔐 Security Features
- JWT Authentication (24h expiry)
- Role-Based Access Control (Citizen/Officer/Admin)
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min)
- Helmet.js security headers
- Input validation (express-validator)
- Audit logging for all writes
- File upload validation (type + size)
- CORS whitelisting

## 🤖 AI Features
- Complaint classification (category, subcategory)
- Priority scoring (0-100)
- Department auto-routing
- Duplicate detection
- AI summary generation
- 7-day predictive analytics
- ARIA admin chat assistant
- Voice input (Web Speech API)

---

Built with ❤️ for Innovation Sprint Hackathon 2026
