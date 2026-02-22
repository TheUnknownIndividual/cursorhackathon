require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { getArticles } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

function auth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (!process.env.API_SECRET || token !== process.env.API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// GET /api/news?page=1&pageSize=20&source=all
app.get('/api/news', auth, async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)     || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
    const source   = req.query.source || 'all';
    const data = await getArticles({ page, pageSize, source });
    res.json(data);
  } catch (e) {
    console.error('[api] /api/news error:', e.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/news/sources
app.get('/api/news/sources', auth, (req, res) => {
  res.json({ sources: ['renewables.az', 'minenergy.gov.az', 'area.gov.az'] });
});

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

module.exports = app;
