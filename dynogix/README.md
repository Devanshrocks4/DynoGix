# ⚡ DYnoGix — Enterprise Operations Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql" />
  <img src="https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Three.js-3D-black?logo=three.js" />
</div>

<br/>

> A modular, enterprise-grade internal operations platform with AI assistant, workflow engine, audit-first design, and premium dark UI.

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT-based auth with role-aware access (Admin / Manager / User) |
| 📊 **Dashboard** | Live stats, activity feed, Recharts analytics |
| 🐛 **Issue Tracker** | Full CRUD with dynamic workflow transitions |
| 📦 **Asset Management** | Track hardware assets with state machine lifecycle |
| 🔄 **Workflow Engine** | Config-driven, reusable state machine for any module |
| 📋 **Audit Logs** | Immutable chronological log of every action |
| 🛡️ **Role Management** | Visual permission matrix, per-role access control |
| 📈 **Analytics** | Productivity charts, SLA tracking, team performance |
| 🤖 **AI Assistant** | Claude-powered chat sidebar for operational insights |
| ⚙️ **Settings** | Profile, notifications, AI config, security |

---

## 🎨 Design System

- **Theme:** Dark (`#0F172A`) with violet (`#7F5AF0`), mint (`#2CB67D`), floral pink (`#FF7EB6`)
- **Fonts:** Syne (display) · Instrument Sans (body) · DM Mono (code)
- **UI:** Glassmorphism cards, soft shadows, Framer Motion animations
- **3D:** Three.js particle background with interactive mouse parallax

---

## 🏗️ Architecture

```
dynogix/
├── frontend/              # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── layout/    # AppLayout sidebar, topbar
│       │   ├── ui/        # ThreeBackground, reusable UI
│       │   └── ai/        # AiChatPanel
│       ├── pages/         # One folder per route
│       ├── store/         # Zustand global state
│       └── services/      # Axios API client
│
├── backend/               # Node.js + Express REST API
│   └── src/
│       ├── auth/          # JWT login/signup
│       ├── users/         # User CRUD
│       ├── roles/         # Role & permission management
│       ├── workflow/      # engine.js — config-driven state machine
│       ├── audit/         # Immutable audit store
│       ├── modules/
│       │   ├── issues/    # Issue tracker with workflow
│       │   └── assets/    # Asset management with workflow
│       ├── dashboard/     # Aggregated stats
│       ├── analytics/     # Performance metrics
│       ├── ai/            # Anthropic Claude integration
│       └── middlewares/   # JWT auth, role guard
│
└── schema.sql             # MySQL schema + seed data
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0 (optional — app runs in mock-data mode without it)
- Anthropic API key (optional — AI falls back to smart mock responses)

### 1. Clone & install

```bash
git clone https://github.com/yourusername/dynogix.git
cd dynogix

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

**.env key values:**
```env
JWT_SECRET=your_strong_secret_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dynogix
ANTHROPIC_API_KEY=sk-ant-...   # Optional for AI features
```

### 3. Setup MySQL (optional)

```bash
mysql -u root -p < schema.sql
```

> **Skip MySQL?** The app runs fully in-memory with realistic mock data. Just start without DB config.

### 4. Run the app

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

### 5. Login

| Email | Password | Role |
|-------|----------|------|
| admin@dynogix.com | password123 | Admin |
| sarah@dynogix.com | password123 | Manager |
| james@dynogix.com | password123 | User |

---

## 🧠 Workflow Engine

The workflow engine is fully config-driven — no hardcoded transitions:

```javascript
// backend/src/workflow/engine.js
const WORKFLOW_CONFIGS = {
  issue: {
    states: ['open', 'in_progress', 'resolved', 'closed'],
    transitions: {
      open:        ['in_progress'],
      in_progress: ['resolved', 'open'],
      resolved:    ['closed', 'in_progress'],
      closed:      [],
    },
    initial: 'open',
    terminal: ['closed'],
  },
  asset: {
    // Available → Assigned → In Use → Maintenance → Retired
    ...
  },
}
```

Add new module workflows by adding a config entry — zero code changes required.

---

## 🤖 AI Assistant

The AI sidebar connects to **Anthropic Claude** for operational intelligence:

- Summarize recent activity
- Detect workflow bottlenecks
- Suggest productivity improvements
- Explain system status

**Without API key:** Falls back to intelligent pre-built responses.
**With API key:** Full Claude Sonnet 4 integration with DYnoGix context.

---

## 📡 API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/auth/signup` | — | Register new user |
| GET | `/api/auth/me` | JWT | Current user info |
| GET | `/api/issues` | JWT | List issues (filterable) |
| POST | `/api/issues` | JWT | Create issue |
| PUT | `/api/issues/:id` | JWT | Update issue |
| POST | `/api/issues/:id/transition` | JWT | Workflow transition |
| DELETE | `/api/issues/:id` | Admin/Manager | Delete issue |
| GET | `/api/assets` | JWT | List assets |
| POST | `/api/assets/:id/transition` | JWT | Asset workflow transition |
| GET | `/api/audit` | Admin/Manager | Audit log with filters |
| GET | `/api/dashboard/stats` | JWT | Dashboard KPIs |
| GET | `/api/analytics/workflow` | JWT | Workflow performance |
| POST | `/api/ai/chat` | JWT | AI assistant chat |
| GET | `/api/ai/insights` | JWT | AI-generated insights |

---

## 🛡️ Security

- **JWT** with 24h expiry
- **Helmet.js** security headers
- **Role guards** on all sensitive endpoints
- **Input validation** via express-validator
- **Audit trail** on every mutation
- **CORS** restricted to frontend origin

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS 4 |
| Animation | Framer Motion 11 |
| 3D | Three.js |
| Charts | Recharts |
| State | Zustand |
| Routing | React Router v7 |
| Backend | Node.js 20, Express 4 |
| Auth | JWT + bcrypt |
| Database | MySQL 8.0 (mysql2) |
| AI | Anthropic Claude (claude-sonnet-4) |
| Validation | express-validator |
| Security | Helmet, CORS |

---

## 🔮 Roadmap

- [ ] WebSocket real-time updates
- [ ] Email notification system
- [ ] PDF report generation
- [ ] Bulk import/export (CSV)
- [ ] Advanced search with filters
- [ ] Mobile app (React Native)
- [ ] Multi-workspace support
- [ ] GitHub/Jira integrations

---

## 📄 License

MIT © 2024 DYnoGix

---

<div align="center">
  Built with ⚡ for enterprise teams
</div>
