const cron = require('node-cron');
const { upsertArticles } = require('./db');
const scrapeMinen      = require('./scrapers/minenergy');
const scrapeArea       = require('./scrapers/area');
const scrapeRenewables = require('./scrapers/renewables');

async function runAll() {
  console.log('[cron] run started', new Date().toISOString());

  const results = await Promise.allSettled([
    scrapeMinen(),
    scrapeArea(),
    scrapeRenewables()
  ]);

  let total = 0;
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      await upsertArticles(r.value);
      total += r.value.length;
    } else if (r.status === 'rejected') {
      console.error('[cron] scraper error:', r.reason?.message);
    }
  }

  console.log(`[cron] done — ${total} articles processed at ${new Date().toISOString()}`);
}

// Run every day at 06:00 server time
cron.schedule('0 6 * * *', () => {
  runAll().catch(e => console.error('[cron] fatal:', e));
});

console.log('[cron] scheduled daily at 06:00');

module.exports = { runAll };
