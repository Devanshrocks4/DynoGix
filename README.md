# 🚀 DYnoGix — Enterprise Operations Platform

![DYnoGix](dynogix/Dynogixlogo.png)

**DYnoGix** is a comprehensive SaaS-style enterprise operations platform that combines powerful workflow automation, role-based access control, asset management, issue tracking, and real-time analytics with cutting-edge **AI-powered insights**.

Transform your operations with intelligent automation, comprehensive audit trails, and an AI assistant that understands your business context.

## 🌐 Live Demo

[![Deployed Frontend](https://img.shields.io/badge/Live%20Demo-Frontend-blue?style=for-the-badge&logo=netlify)](https://dynogix.netlify.app/)
[![Deployed Backend](https://img.shields.io/badge/API%20Backend-Active-green?style=for-the-badge&logo=render)](https://dynogix-backend.onrender.com)

## ✨ Key Features

- 🔐 **Secure Authentication** — JWT-based login/signup with enterprise-grade security
- 👥 **Role-Based Access Control** — Granular permissions for admins, managers, and team members
- 📊 **Analytics Dashboard** — Real-time metrics, KPIs, and performance insights
- 🐛 **Issue Tracking System** — Create, assign, track, and resolve issues efficiently
- 💼 **Asset Management** — Track hardware, software, and digital assets across your organization
- 📝 **Comprehensive Audit Logs** — Track every action with detailed change history
- 🤖 **AI Chat & Insights Panel** — Context-aware AI assistant for workflow analysis and recommendations
- 🎨 **Responsive Modern UI** — Built with Tailwind CSS and featuring immersive 3D animated backgrounds
- ⚡ **Workflow Engine** — Configurable state machines for complex business processes

## 🛠 Tech Stack

### Frontend
```
React 18+ (Vite)
Tailwind CSS
Three.js (3D Animations)
Zustand (State Management)
```

### Backend
```
Node.js / Express.js
MongoDB Atlas (Database)
JWT Authentication
Comprehensive API Routes
```

### Deployment
```
Netlify (Frontend Hosting)
Render (Backend Hosting)
MongoDB Atlas (Cloud Database)
```

## 📂 Project Structure

```
dynogix/
├── frontend/           # React + Vite + Tailwind + Three.js
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route-based pages (Dashboard, Issues, Assets, etc.)
│   │   ├── services/   # API integration
│   │   └── store/      # Global state management
│   └── public/
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── auth/       # Authentication & JWT
│   │   ├── roles/      # RBAC implementation
│   │   ├── modules/    # Issues, Assets management
│   │   ├── audit/      # Activity logging
│   │   ├── ai/         # AI routes & integration
│   │   └── analytics/  # Dashboard data
│   └── server.js
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm/yarn

### Frontend Setup
```bash
cd dynogix/frontend
npm install
npm run dev
```
**Local: http://localhost:5173**

### Backend Setup
```bash
cd dynogix/backend
npm install
npm run dev
```
**Local API: http://localhost:5000**

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
DB_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

## 📸 Screenshots

*Add screenshots here*

```
- Dashboard overview
- Issue tracking interface  
- AI chat panel
- Role management
- Analytics charts
- 3D animated background
```

## 📈 Future Improvements

- ⚡ **Performance Optimization** — Code splitting, lazy loading, caching
- 🧠 **Advanced AI Features** — Predictive analytics, anomaly detection
- 🔔 **Real-time Notifications** — WebSocket integration for live updates
- 📱 **Mobile App** — React Native companion app
- 🔌 **Integrations** — Slack, Jira, ServiceNow connectors
- 🛡️ **Advanced Security** — 2FA, SSO, encryption at rest

## 👨‍💻 Author

**Developed by Devansh Gupta**

[![Portfolio](https://img.shields.io/badge/Portfolio-Devansh%20Gupta-blue?style=for-the-badge&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/yourprofile)

---

⭐ **Star this repository if you find it useful!**  
📄 **License: MIT** | **© 2024 DYnoGix**
