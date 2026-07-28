# Odyssey - Resilient Interactive AI Trip Planner

Odyssey is a premium, highly interactive React application that transforms free-form travel requests into day-by-day travel boards. It connects to the **Google Gemini 2.5 Flash** model via a secure Node.js Express proxy backend, parses structure-enforced JSON, and renders a stateful user interface. 

The application is heavily designed around **UX resilience**—specifically managing LLM volatility, malformed syntaxes, request timeouts, race conditions, and network failures.

---

## 🌟 Key Features & Interactive Controls

1. **Structured Timelines**: Day-by-day itineraries showing times, activity categories, durations, and costs.
2. **Interactive State Mutations**:
   - **Reorder Sights**: Arrow buttons let users swap stops up/down to customize schedule orders on both mobile and desktop.
   - **Edit Stops**: Inline form editor on each activity card to customize titles, descriptions, locations, times, and costs.
   - **Remove Sights**: Instant stop deletion with real-time budget adjustments.
   - **Add Manual Sights**: Form panel to inject personal custom stops into the AI-planned schedule.
3. **Live AI Refinement Loop**: Send chat instructions (e.g. *"Make Day 2 morning more active"* or *"Replace museum with a coffee tasting"*). The current client state of the trip is sent as context, and Gemini returns an updated merged itinerary.
4. **Interactive Cost Analytics**: Auto-extracts numeric values from LLM cost strings (e.g. "$15 USD", "Free", "$80 for dinner") and dynamically aggregates expenses in a CSS-only visual categorized progress chart.
5. **Local Session Sync**: Saves/loads trips, custom edits, and checklists directly in the browser's local storage.
6. **Double-key Entrance**: Supports API key loading from a server-side backend `.env` file **OR** securely entering/clearing custom keys via a client-side settings dialog.
7. **Offline Demo Mode**: Immediate offline testing utilizing Kyoto mockup data, ensuring the app is testable even without an active API key.

---

## 🛡️ Volatility & Failure Handling Strategy (Resilience Layer)

| Volatility Scenario | UI/UX Mitigation Behavior | Implementation |
| :--- | :--- | :--- |
| **Network Failure / Server Offline** | Displays a distinct **Network Connectivity Error** panel, detailing connection parameters and server location, with a quick return button. | Handled via express status checks and standard fetch catch-blocks. |
| **API Error / Missing Credentials** | Displays a specific **API Key Missing** boundary with a settings dialog trigger and clear AI Studio referral link. | express return code `401` captures credential absence; UI renders custom key forms. |
| **Malformed JSON / Truncated Text** | Runs the raw text through a bracket-balancing parser. If it recovers, the app loads normally. If not, it falls back to the **Error Panel**. | Custom brace-balancing stack engine inside `jsonRepair.js`. |
| **Structural Schema Mismatch** | Validates object properties and logs which items/keys are missing or corrupted. Displays a list of issues to the developer/user. | Runtime schema validator inside `schema.js`. |
| **Slow LLM Responses** | Integrates an animated progress-indicator showing the generation state ("Weaving itinerary...", "Validating schema..."). Includes a **Cancel** button. | `AbortController` cancellation bindings in `useTrip.js`. |
| **Out-of-Order Race Conditions** | Tracks sequential query IDs. If a user fires a new prompt before the first finishes, any slower pending response is discarded. | Stale request tracking via an incrementing useRef index. |
| **Manual Repair Console** | If a response fails to parse, the app shows the raw string in an inline text editor. Users can manually fix syntax errors and click **Validate & Load**. | Collapsible RAW JSON editor inside `ErrorPanel.jsx`. |

---

## 🛠️ Tech Stack

- **Frontend**: React 19 (Hooks, custom hooks, functional components), Vite (bundling), Lucide React (icons), and Vanilla CSS (premium dark/light glassmorphic stylesheet).
- **Backend Proxy**: Node.js, Express, Cors, Dotenv, and the official `@google/generative-ai` SDK.
- **Automation Testing**: Custom browser automated subagents for walkthrough validation.

---

## 🚀 Setup & Execution Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (recommended v18+).

### 1. Installation
Run the command below in the project root directory. This will automatically install all dependencies for the root, backend proxy, and React frontend concurrently:
```bash
npm install
```

### 2. Configure API Credentials (Optional)
Odyssey requires a Google Gemini API Key. You can get a free key from [Google AI Studio](https://aistudio.google.com/).
Choose one of two ways to configure it:
- **Option A (Local Server Env)**: Create or edit the `.env` file in the `backend/` folder and paste your key:
  ```env
  GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
  ```
- **Option B (Frontend UI)**: Click the **Set API Key** button in the top-right header in the browser, paste your key, and click **Apply**.

### 3. Run Development Servers
Start both the Express API server (port 3000) and Vite development client (port 5173) concurrently:
```bash
npm start
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📂 Project Structure

```
yourusername/bajaj-assignment/
├── package.json               # Coordinator package script configuration
├── README.md                  # Detailed documentation and guidelines
├── backend/
│   ├── package.json           # Express dependencies and scripts
│   ├── server.js              # Proxy and structured output logic
│   └── .env.example           # Server config boilerplate
└── frontend/
    ├── package.json           # Vite React configurations
    ├── index.html             # HTML Entrypoint
    └── src/
        ├── main.jsx           # Mount entry point
        ├── App.jsx            # Main app page router
        ├── index.css          # Curated responsive glassmorphism styles
        ├── components/
        │   ├── Header.jsx     # Navigation, theme, saved lists, credentials
        │   ├── InputForm.jsx  # Prompts, inspiration suggestions
        │   ├── Itinerary.jsx  # Trip hero, tab control, widgets, drawers
        │   ├── DayView.jsx    # Stop coordinates timeline
        │   ├── StopCard.jsx   # Interactive activity card (Display, Edit, Delete, Reorder)
        │   ├── Refinement.jsx # Modification loops console
        │   ├── ErrorPanel.jsx # Volatility handler UI (raw inspector, inline editor)
        │   └── LoadingState.jsx # Cancelable loaders and progress stages
        ├── hooks/
        │   └── useTrip.js     # Custom state, API proxies, and browser local storage sync
        └── utils/
            ├── jsonRepair.js  # Bracket balancing syntax repair engine
            └── schema.js      # Structural validation rules and demo dataset fallback
```

---

## 🎨 Visual Design System

Odyssey features a custom glassmorphism styling setup implemented in vanilla CSS:
- **Color Palettes**: Indigo-to-violet linear gradients, neon category identifiers, and glowing dark backgrounds (`#090d16` to `#151e33`).
- **Dynamic Light Mode**: Instantly toggleable from the header, adapting colors to clean slate whites (`#f8fafc`) and indigo accents.
- **Fluid Layout**: Sidebar widgets for saved logs and details, combined with a responsive timeline column.
- **Adaptive Columns**: Standard split dashboard on desktop, collapsible bottom sheets on tablet, and single-card flow on mobile.

---

## ⚠️ Known Limitations

1. **Gemini Free Tier Thresholds**: Standard rate limits apply. The app handles this by showing clean model/network exception panels.
2. **Offline Mode Scope**: The offline demo loads a pre-built Kyoto trip, allowing you to edit and test itinerary mutation controls locally without making network calls.
3. **Local Storage Size limits**: Browser storage caps are typically 5MB, which is plenty for hundreds of itineraries but restricts storage of complex custom photos/maps.

---

## 🤖 AI-Usage Disclosure
- **Tool Used**: Antigravity (Google DeepMind advanced agentic coding AI).
- **Assisted Scope**: Scaffolding directories, planning the architecture, drafting the vanilla CSS variables design sheet, structuring custom React hooks, and documenting walkthrough verifications.

---

## ⏱️ Time Spent Breakdown
- **Planning & Resilience System Design**: 45 mins
- **Backend Proxy & Gemini structured schemas**: 1 hour
- **Custom React Hooks, Abort signals, and local storage**: 1 hour 15 mins
- **Frontend Dashboard Components & mutations logic**: 1 hour 30 mins
- **CSS styling system & Light/Dark layouts**: 1 hour
- **Verification & Walkthrough validations**: 30 mins
- **Total Time**: **~6 hours**
