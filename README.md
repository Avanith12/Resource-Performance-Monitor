# RPM (Resource Performance Monitor)

**Live Dashboard:** [https://resource-performance-monitor-nine.vercel.app/](https://resource-performance-monitor-nine.vercel.app/)

A high-octane, supercar-themed performance dashboard that displays true, real-time telemetry of your machine's CPU, RAM, and GPU.

## How it Works (The Architecture)

Web browsers strictly prohibit websites from accessing deep hardware metrics (like live CPU load or temperatures) for security reasons. To solve this, RPM uses a **"Car and Mechanic"** architecture:

1. **The Dashboard (The Car):** A sleek, React-based web application hosted online (e.g., via Vercel). This provides the UI, the animated gauges, and the visual experience.
2. **The Telemetry Agent (The Mechanic):** A lightweight Node.js script that runs locally on the user's machine. Because it runs directly on the OS, it can securely read the motherboard's live metrics. It instantly creates a local WebSocket bridge (`ws://localhost:8999`).

**The Magic:** When you visit the dashboard in your browser, the website detects your local agent and connects. The data flows directly from your machine to your browser screen—**no hardware telemetry is ever sent to external servers**, ensuring 100% privacy and security.

## Tech Stack

### Frontend (Dashboard)
* **Framework:** React + Vite
* **Styling:** Tailwind CSS v4 (with custom carbon fiber and neon supercar themes)
* **Animations:** Framer Motion (powering the smooth, realistic gauge sweeps)
* **Icons:** Lucide React

### Backend (Telemetry Agent)
* **Runtime:** Node.js
* **Data Gathering:** `systeminformation` (a powerful library for reading OS/hardware data)
* **Communication:** `ws` (WebSockets for 60Hz real-time data streaming)

---

## Running Locally

## 1. Start the Telemetry Agent
Open your first terminal and run:
```bash
cd agent
npm install
node index.js
```
*(You will see a message: `RPM Telemetry Agent Started!`)*

## 2. Start the Dashboard
Open a second terminal and run:
```bash
cd dashboard
npm install
npm run dev
```

Finally, click the local link provided by Vite (usually `http://localhost:5173/` or `5174`) and open it in your browser.

---

## Security & Privacy
Because the Telemetry Agent runs entirely locally and broadcasts only to `localhost`, your hardware data never leaves your computer. The hosted dashboard merely acts as a "display monitor" reading from your local network.# Resource-Performance-Monitor
