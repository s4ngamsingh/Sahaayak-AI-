# Samadhan AI - Smart Citizen Grievance Redressal Portal

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://ais-pre-y5r7gxgka5yl3pklq4npur-184102740272.asia-southeast1.run.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TailwindCSS-61DAFB.svg)](https://reactjs.org/)
[![Node Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-339933.svg)](https://expressjs.com/)

**Samadhan AI** is a next-generation, multilingual, AI-powered citizen grievance redressal and municipal administration platform. It bridges the gap between citizens and municipal authorities by combining continuous voice dictation, high-accuracy GPS geolocation, automated department routing, real-time SLA tracking, and interactive officer administration workflows.

---

## 🌐 Live Application

- **Live URL:** [https://ais-pre-y5r7gxgka5yl3pklq4npur-184102740272.asia-southeast1.run.app](https://ais-pre-y5r7gxgka5yl3pklq4npur-184102740272.asia-southeast1.run.app)

---

## 🚀 Key Features

### 1. 🎙️ Multilingual Voice Dictation & Text Input
- Natural language speech recognition supporting 12+ Indian and global languages (Hindi, English, Bengali, Marathi, Tamil, Telugu, Kannada, Gujarati, Malayalam, Punjabi, Odia, Urdu).
- Real-time continuous speech synthesis without repetitive stuttering.
- Live audio playback of grievances, instructions, and officer responses via built-in Web Speech synthesis.

### 2. 📍 High-Accuracy Hardware GPS & Smart Ward Mapping
- Auto-detects pinpoint satellite GPS coordinates with sub-10-meter precision (`±4m – ±10m`).
- Reverse geocoding engine parses raw latitude/longitude into complete street-level addresses, postal codes, and municipal zones.
- Automatic routing to corresponding municipal administrative wards (e.g., *Ward 42 Indiranagar North*, *Ward 18 Malleshwaram West*).
- Live Google Maps pin verification link for field workers and citizens.

### 3. 🧠 Smart AI Triage & Classification
- Analyzes grievance severity, sentiment score, urgency levels (Critical, High, Medium, Low), and estimated resolution timelines (SLAs).
- Automatically routes complaints to the appropriate municipal department:
  - Public Works Department (PWD) — Roads, Potholes, Bridges
  - Water Supply & Sewerage Board (BWSSB) — Leaks, Contamination
  - Electricity & Energy (BESCOM) — Blackouts, Streetlights, Transformers
  - Solid Waste Management & Sanitation (BBMP) — Garbage, Drains
  - Public Health, Safety & Traffic Management
- Generates unique tracking tokens (e.g. `GRV-2026-PWD-8492`) with QR code generation and SMS/WhatsApp mock dispatch.

### 4. 🔎 Transparent Grievance Tracking & SLA Escalation
- Real-time lifecycle timeline: `Submitted` ➔ `Assigned to Nodal Officer` ➔ `In-Progress` ➔ `Resolved / Closed`.
- Live SLA countdown timer with automatic escalation warnings for delayed tickets.
- Citizen feedback submission, resolution satisfaction rating, and duplicate ticket detection.

### 5. 🏛️ Officer Command Dashboard
- Dedicated portal for municipal nodal officers and ward engineers to triage, inspect evidence photos, update resolution statuses, and leave field remarks.
- Inter-ward ticket re-routing and department escalation management.
- Comprehensive city-wide analytics: heatmaps, SLA compliance rates, ward-level performance indices, and department response benchmarks.

### 6. 💬 24/7 AI Civic Sahayak Assistant
- Conversational AI drawer capable of answering civic service queries, detecting citizen location, providing municipal helpline numbers, and guiding citizens through grievance filing.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion), GSAP, Three.js, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, tsx, esbuild
- **Geocoding & Mapping:** HTML5 Geolocation API, OpenStreetMap Nominatim Engine
- **Voice & Speech:** Web Speech Recognition & SpeechSynthesis APIs
- **Database / Persistence:** Drizzle ORM, PostgreSQL / Cloud Firestore integration ready

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/samadhan-ai.git
cd samadhan-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Optional: Set your Gemini API key for server-side AI features
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build

To compile the production frontend and backend bundle:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

---

## 📂 Project Structure

```
├── server.ts                  # Express backend & API endpoints (Reverse Geocode, Grievances, AI)
├── src/
│   ├── components/            # UI Components
│   │   ├── Header.tsx                 # Navigation & Language Switcher
│   │   ├── LodgeGrievanceForm.tsx     # Voice & GPS Complaint Filing Form
│   │   ├── GrievanceTracker.tsx       # Live Status & SLA Tracker
│   │   ├── OfficerDashboard.tsx       # Municipal Admin & Field Engineer Portal
│   │   ├── CityAnalyticsView.tsx      # Ward Heatmaps & SLA Visualizer
│   │   ├── DepartmentDirectory.tsx    # Nodal Officers & Directory
│   │   ├── AIChatbotDrawer.tsx        # 24/7 Citizen AI Assistant
│   │   ├── Civic3DScene.tsx           # Three.js Visual Civic Model
│   │   ├── FastAPIDocsModal.tsx       # OpenAPI Documentation Viewer
│   │   └── AuthModal.tsx              # Citizen / Officer Authentication
│   ├── utils/
│   │   ├── geolocation.ts             # High-accuracy GPS & Ward Matcher
│   │   └── speech.ts                  # Clean Multilingual Speech Recognition
│   ├── data/
│   │   └── mockData.ts                # Default Departments, Wards, & Data
│   ├── types.ts                       # Shared TypeScript Interfaces
│   ├── App.tsx                        # Main Application Root
│   └── main.tsx                       # React DOM Entry
├── vite.config.ts             # Vite configuration
├── package.json               # Dependencies and scripts
└── metadata.json              # App capabilities & permissions
```

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
