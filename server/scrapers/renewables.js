const axios = require('axios');
const cheerio = require('cheerio');

const BASE = 'https://renewables.az';
const URLS = [`${BASE}/news`, `${BASE}/xeberler`, BASE];

async function tryUrl(url) {
  const { data: html } = await axios.get(url, {
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cescocomp-bot/1.0)' }
  });

  const $ = cheerio.load(html);
  const results = [];

  $('article, .card, .news-item, .post-item, .post').each((_, el) => {
    const titleEl   = $(el).find('h2,h3,h4,.title,.card-title,.entry-title').first();
    const linkEl    = $(el).find('a').first();
    const imgEl     = $(el).find('img').first();
    const dateEl    = $(el).find('time,.date,small,.entry-date').first();
    const excerptEl = $(el).find('p,.excerpt,.card-text,.entry-summary').first();

    const title = titleEl.text().trim() || linkEl.text().trim();
    if (!title || title.length < 10) return;

    let href = linkEl.attr('href') || '#';
    if (href && !href.startsWith('http')) href = BASE + href;

    let img = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
    if (img && !img.startsWith('http')) img = BASE + img;
    // Use storage path images as-is (already absolute on renewables.az)
    if (img.includes('storage/news_images')) img = img;

    results.push({
      title,
      excerpt:      excerptEl.text().trim().slice(0, 300),
      image:        img,
      link:         href,
      source:       'renewables.az',
      published_at: dateEl.text().trim()
    });
  });

  return results;
}

module.exports = async function scrapeRenewables() {
  for (const url of URLS) {
    try {
      const items = await tryUrl(url);
      if (items.length > 0) {
        console.log(`[renewables] scraped ${items.length} articles from ${url}`);
        return items;
      }
    } catch (e) {
      console.warn(`[renewables] failed ${url}: ${e.message}`);
    }
  }
  console.warn('[renewables] all URLs failed');
  return [];
};
