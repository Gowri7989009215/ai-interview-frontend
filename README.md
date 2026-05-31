# ProInterview AI — Premium SaaS Frontend Portal

This is the interactive, visually stunning frontend client for **ProInterview AI** built using React, Vite, and Tailwind CSS. It provides a premium suite of mock interview setups, sandboxed coding rounds with real-time feedback, interactive radar skill matrices, and a comprehensive career growth console.

---

## 💎 Features & Interactive Panels

- **AI Career Growth Console (`/dashboard`)**:
  - Interactive profile strength tracker & matching percentages for 11+ roles and 12+ top tech companies (Google, Meta, Amazon, etc.).
  - Circular animated Career Readiness Rings and Hiring Badges.
  - Radar Skill Matrix charts (powered by Chart.js) mapping frontend, backend, DSA, and soft skill standings.
  - Achievements gallery displaying gamified badges.
  - Interactive 6-week preparation roadmaps where users can check off completed topics.
  - Real-time AI Career Mentor Coach chat panel.
- **Premium Interview Room (`/interview/:id`)**:
  - Sandboxed coding console powered by the **Monaco Code Editor**.
  - Speech-to-Text Voice answers powered by browser Web Speech APIs.
  - Dynamic CSS-animated bouncing audio waveforms.
  - Strict anti-cheat monitoring (blur, copy, paste, copy-block detection) with automatic visual warning cards.
- **Secure Authentication Flow**:
  - Double Auth flows supporting traditional Email + password and Google Authentication.
  - Transparent JWT Token Refresh Rotation using secure Axios response interceptors.

---

## ⚙️ Configuration Setup

Create a `.env` file in the client directory with the following variables:

```env
# Google OAuth Client ID (Create on Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 🚀 Development Guidelines

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The client console will initialize on port `5173`. Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Compile Production Bundle
```bash
npm run build
```
Vite will compile and output minified static assets to the `dist/` directory.

---

## 📂 Architecture Overview

```
client/
├── public/            # Static assets & public images
├── src/
│   ├── components/    # Reusable components (Navbar, Footers, etc.)
│   ├── pages/         # Interactive portals (Landing, Dashboard, Interview, Report)
│   ├── utils/         # Custom Axios client (api.js) with token refresh interceptor
│   ├── App.jsx        # Routing configuration & route guards
│   ├── index.css      # Core styles & Tailwind directives
│   └── main.jsx       # App bootstrap entry point
├── package.json       # Front-end dependencies list
└── vite.config.js     # Bundler configuration file
```
