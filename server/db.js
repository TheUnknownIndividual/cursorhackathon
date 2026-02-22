require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id           SERIAL PRIMARY KEY,
      title        TEXT NOT NULL,
      excerpt      TEXT,
      content      TEXT,
      image        TEXT,
      link         TEXT UNIQUE NOT NULL,
      source       TEXT,
      category     TEXT,
      published_at TEXT,
      fetched_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('[db] table ready');
}

async function upsertArticles(articles) {
  for (const a of articles) {
    await pool.query(
      `INSERT INTO articles (title, excerpt, content, image, link, source, category, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (link) DO NOTHING`,
      [a.title, a.excerpt, a.content || null, a.image || null, a.link, a.source, a.category || null, a.published_at || null]
    );
  }
}

async function getArticles({ page = 1, pageSize = 20, source } = {}) {
  const offset = (page - 1) * pageSize;
  const hasSource = source && source !== 'all';

  const rows = await pool.query(
    hasSource
      ? `SELECT * FROM articles WHERE source = $3 ORDER BY fetched_at DESC LIMIT $1 OFFSET $2`
      : `SELECT * FROM articles ORDER BY fetched_at DESC LIMIT $1 OFFSET $2`,
    hasSource ? [pageSize, offset, source] : [pageSize, offset]
  );

  const count = await pool.query(
    hasSource
      ? `SELECT COUNT(*) FROM articles WHERE source = $1`
      : `SELECT COUNT(*) FROM articles`,
    hasSource ? [source] : []
  );

  return { articles: rows.rows, total: parseInt(count.rows[0].count) };
}

module.exports = { init, upsertArticles, getArticles };
