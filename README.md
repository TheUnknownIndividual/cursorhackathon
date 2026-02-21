# cursorhackathon

Azerbaijan Sustainable Energies Hub — a multi-language renewable energy platform for Azerbaijan featuring a solar panel calculator, renewable energy news aggregator, regulatory framework tracker, and project listings.

## Features

- **Solar Calculator** — PVGIS-powered system sizing with paywall-gated AI analysis (OpenAI GPT-4o-mini)
- **News Aggregator** — Live scraping from area.gov.az, minenergy.gov.az, and renewables.az
- **Regulatory Framework** — Azerbaijan energy law index
- **Projects Map** — Active, in-progress, and completed renewable energy projects
- **Multi-language** — English / Azerbaijani / Russian
- **Dark / Light mode**

## Setup

1. Clone the repo
2. Copy `env-config.example.js` → `env-config.js`
3. Fill in your OpenAI API key (from `.env` → `api=...`) in `env-config.js`
4. Serve with any static server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

> **Note:** The site must be served (not opened as `file://`) for `fetch()` calls to work.

## Tech Stack

Vanilla HTML / CSS / JavaScript — no framework, no build step.

External APIs: PVGIS (solar data), OpenAI GPT-4o-mini (AI analysis), allorigins.win (CORS proxy for news scraping), ipapi.co (geolocation), Leaflet + OpenStreetMap (map).
