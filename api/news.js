const { Pool } = require('pg');

// Connection pool — reused across warm invocations
let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: false,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    });
  }
  return pool;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    return res.status(200).end();
  }

  // Auth check
  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (process.env.NEWS_API_SECRET && token !== process.env.NEWS_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = getPool();
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(200, parseInt(req.query.pageSize) || 200);
    const source   = req.query.source;
    const offset   = (page - 1) * pageSize;
    const hasSource = source && source !== 'all';

    const [rows, count] = await Promise.all([
      db.query(
        hasSource
          ? `SELECT * FROM articles WHERE source=$3 ORDER BY fetched_at DESC LIMIT $1 OFFSET $2`
          : `SELECT * FROM articles ORDER BY fetched_at DESC LIMIT $1 OFFSET $2`,
        hasSource ? [pageSize, offset, source] : [pageSize, offset]
      ),
      db.query(
        hasSource
          ? `SELECT COUNT(*) FROM articles WHERE source=$1`
          : `SELECT COUNT(*) FROM articles`,
        hasSource ? [source] : []
      )
    ]);

    return res.status(200).json({
      articles: rows.rows,
      total: parseInt(count.rows[0].count),
      page,
      pageSize
    });
  } catch (e) {
    console.error('[api/news]', e.message);
    return res.status(500).json({ error: 'DB error: ' + e.message });
  }
};
