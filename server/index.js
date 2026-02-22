require('dotenv').config();
const { init } = require('./db');
const app      = require('./api');
const { runAll } = require('./cron');

const PORT = process.env.PORT || 3001;

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] API listening on port ${PORT}`);
    });
    // Seed DB on first start — won't duplicate due to ON CONFLICT DO NOTHING
    console.log('[server] running initial scrape...');
    return runAll();
  })
  .catch(e => {
    console.error('[server] startup error:', e);
    process.exit(1);
  });
