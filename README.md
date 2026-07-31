# 💀 CyberDork OSINT Suite v7.0 — Ultimate Matrix Edition

> **1000+ Dorks • 700+ File Extensions • 7 Search Engines • PWA • Cyber Terminal CLI**
> Hub: `jigsi_karia` — For authorized cyber security research & education ONLY.

A full **Multi-Page Single Page Application (SPA)** that merges the legacy
**CyberDork Pro – Advanced Multi-Engine Dorking Portal** and the
**jigsi_karia – 700+ Ultimate File Extension Finder Engine** into one
high-performance Matrix-themed OSINT workstation.

![Theme](https://img.shields.io/badge/theme-matrix%20neon-00ff00)
![Dorks](https://img.shields.io/badge/dorks-1000%2B-00bcff)
![Extensions](https://img.shields.io/badge/extensions-700%2B-ffaa00)
![PWA](https://img.shields.io/badge/PWA-ready-00ff00)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ⚠️ Legal Notice

This tool is built **exclusively** for:

- Authorized penetration testing and vulnerability research
- OSINT / digital forensics education and training
- Threat intelligence and security verification

**Do not** use any dork or query in this project against systems or data you
do not own or have explicit written permission to test. The maintainers are
not responsible for any misuse. Always respect local, national and
international laws.

---

## 🗂 Project Structure

```
.
├── index.html          # 7-page SPA (router, auth overlay, matrix canvas)
├── styles.css          # Matrix neon theme, CRT scanlines, glass panels
├── app.js              # Router, multi-engine runner, UI handlers, radar
├── dorks.js            # 1000+ dork database (auto-generated, 21 categories)
├── extensions.js       # 700+ file extension DB (auto-generated, 15 categories)
├── tools.js            # Cyber Terminal CLI, SFX synthesizer, dork builder
├── auth.js             # LocalStorage auth + search history manager
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline caching)
├── app.py              # Optional Flask backend (CORS proxy + API hooks)
├── README.md           # This file
└── legacy/             # Original uploaded source files (index.html, index1.html)
```

## 🚀 Quick Start

The app is **fully static** — no build step required.

### Option A — Open locally

```bash
git clone <your-repo-url>
cd <repo-folder>
```

Then open `index.html` in your browser, or serve it:

```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080`.

### Option B — Python backend (optional)

The Flask backend adds `/api/*` endpoints (CORS proxy, Shodan/VT hooks).

```bash
pip install -r requirements.txt   # flask flask-cors requests
python app.py
```

Set integration keys via environment variables:

```bash
export SHODAN_API_KEY="..."
export VIRUSTOTAL_API_KEY="..."
python app.py
```

> The SPA works without the backend. The backend is optional infrastructure.

---

## 📄 Features

### Page 1 — ⚡ Dashboard & Quick OSINT Radar
- Live Matrix rain canvas with **pause / speed** controls
- Real-time stats cards (1000+ dorks, 700+ extensions, engines, sessions)
- Target radar: phone lookup, domain OSINT, social footprinting, leak check
- Super multi-search matrix (Google + Bing + DuckDuckGo + Yandex + Shodan)
- Notice banner & visitor counter

### Page 2 — 🎯 CyberDork Pro Engine
- 1000+ dorks across 21 categories (cloud, docs, software, directories, …)
- 7-engine selector: Google, Bing, DuckDuckGo, Yandex, Shodan, Ecosia, Startpage
- Favorites vault (⭐), live filtering, category tabs
- One-click `🚀 Multi` runs each dork across 5 engines
- Export database to JSON / CSV

### Page 3 — 🔍 700+ File Extension Intelligence Hub
- 937 unique extensions in 15 categories
- Instant live filter, direct Google `filetype:` trigger
- All original extensions preserved

### Page 4 — 🛠️ OSINT Toolkit & Dork Builder
- Visual dork builder: `site:`, `filetype:`, `inurl:`, `intitle:`, `ext:`,
  `-exclude`, `*wildcard*` + quote target
- Hash identifier (MD5, SHA-1/2, bcrypt, JWT, UUID, …)
- Quick-launch stack: VirusTotal, Censys, SecurityTrails, Wayback, IPVoid,
  CentralOps, Shodan, IntelX, Hunter.io, HIBP, Dehashed
- Custom dork importer/exporter (JSON)

### Page 5 — 💻 Cyber Terminal CLI
Interactive retro terminal. Example commands:

```text
dork --target 9898048483 --type cloud
ext --type pdf --search 9898048483
multi --query 9898048483
matrix --speed fast
search --q "query" --engine shodan
whois --target example.com
help | stats | export | clear
```

### Page 6 — 🛒 Pro Action Hub
- Buy Pro (WhatsApp pre-filled), Donation System, Official Digital Store
- Custom OSINT service inquiry
- Printable report generator (dorks / extensions / quick matrix)

### Page 7 — 🔐 Auth & Session Manager
- LocalStorage login / signup / guest access
- Profile dashboard with session uptime
- Search history log viewer, clear + export (JSON / CSV)

### New Advanced Features
1. 🎵 **Web Audio Synthesizer** — retro click/type SFX with mute toggle
2. 📄 **Report Generator** — printable summary or JSON data package
3. 📡 **Live Threat Feed Ticker** — simulated rolling cyber-threat marquee
4. 📦 **Custom Dork Importer/Exporter** — persist custom JSON dork lists
5. 📱 **PWA** — installable on desktop & mobile via service worker

### Default Target
Every search box, OSINT input and dork builder is **pre-filled with
`9898048483`** as the default target.

---

## 🎨 Theme

- **Canvas:** Live Matrix rain (`#000000` background, `#00ff00` glyphs)
- **Palette:** Cyber Green `#00ff00` • Electric Blue `#00bcff` • Neon Pink
  `#ff0055` • Gold `#ffaa00`
- **Typography:** `'Courier New', monospace`
- **Effects:** CRT scanline overlay, glowing borders, glassmorphic panels,
  neon hover, light/dark toggle

---

## ⚙️ Deployment Guides

### GitHub Pages (free static)

1. Push this repo to GitHub.
2. Repo **Settings → Pages** → Source: **Deploy from a branch** → `main` → `/ (root)`.
3. Save. Your site is live at `https://<user>.github.io/<repo>/`.

> Because the app uses relative paths (`./index.html`), it works from any
> subdirectory.

### Vercel (1-click)

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Framework preset: **Other** → Build command: *(empty)* → Output: `/`.
4. **Deploy.** Done.

### Netlify (1-click)

1. Push the repo to GitHub.
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import an
   existing project** → pick the repo.
3. Build command: *(empty)* — Publish directory: `/`.
4. **Deploy site.** Done.

### Render (backend + static)

Static site:

1. [render.com](https://render.com) → **New → Static Site** → connect repo.
2. Build command: empty → Publish directory: `/` → **Create Static Site**.

Flask backend (optional):

1. **New → Web Service** → connect repo.
2. Root directory: `/` → Build command: `pip install -r requirements.txt`.
3. Start command: `gunicorn app:app --bind 0.0.0.0:$PORT`
4. Add environment variables `SHODAN_API_KEY` / `VIRUSTOTAL_API_KEY` as needed.

---

## 🔗 Reference

- Original sources preserved in `legacy/` (unmodified).
- Databases regenerated by `tools/gen_*` generators; both are `node --check` clean.

## 📄 License

[MIT](LICENSE)
