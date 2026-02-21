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

### Production (Vercel)

- Deploy to Vercel. The Solar Calculator uses two serverless API routes:
  - **`/api/pvgis`** — Proxies requests to PVGIS (no env var required).
  - **`/api/ai-analysis`** — Calls OpenAI for paywalled AI insights. Set **`OPENAI_API_KEY`** in the Vercel project (Settings → Environment Variables). If unset, AI analysis will show "not configured".
- No `env-config.js` is needed on Vercel; secrets stay in Vercel env.

### Local development

1. Clone the repo.
2. Serve with any static server (e.g. `python3 -m http.server 8080` or `npx serve .`).
3. For **PVGIS**: use a local proxy or run the Vercel dev server (`vercel dev`) so `/api/pvgis` is available; otherwise the calculator will fall back to the Azerbaijan average and show a note.
4. For **AI analysis**: either set `OPENAI_API_KEY` when running `vercel dev`, or the UI will show that AI analysis is not configured.

> **Note:** The site must be served (not opened as `file://`) for `fetch()` calls to work.

## Tech Stack

Vanilla HTML / CSS / JavaScript — no framework, no build step.

External APIs: PVGIS (solar data via `/api/pvgis` proxy), OpenAI GPT-4o-mini (AI analysis via `/api/ai-analysis`; key from Vercel env), allorigins.win (CORS proxy for news scraping), ipapi.co (geolocation), Leaflet + OpenStreetMap (map).
