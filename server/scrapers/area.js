const axios = require('axios');
const cheerio = require('cheerio');

const BASE = 'https://area.gov.az';
const URLS = [
  `${BASE}/az/news`,
  `${BASE}/az/xeberler`,
  `${BASE}/az`
];

async function tryUrl(url) {
  const { data: html } = await axios.get(url, {
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cescocomp-bot/1.0)' }
  });

  const $ = cheerio.load(html);
  const results = [];

  $('article, .card, .news-item, .news__item, li.item').each((_, el) => {
    const titleEl   = $(el).find('h2,h3,h4,h5,.card-title,.title').first();
    const linkEl    = $(el).find('a').first();
    const imgEl     = $(el).find('img').first();
    const dateEl    = $(el).find('time,.date,.news-date,small').first();
    const excerptEl = $(el).find('p,.card-text,.excerpt,.lead').first();

    const title = titleEl.text().trim() || linkEl.text().trim();
    if (!title || title.length < 10) return;

    let href = linkEl.attr('href') || '#';
    if (href && !href.startsWith('http')) href = BASE + href;

    let img = imgEl.attr('src') || imgEl.attr('data-src') || '';
    if (img && !img.startsWith('http')) img = BASE + img;

    results.push({
      title,
      excerpt:      excerptEl.text().trim().slice(0, 300),
      image:        img,
      link:         href,
      source:       'area.gov.az',
      published_at: dateEl.text().trim()
    });
  });

  return results;
}

module.exports = async function scrapeArea() {
  for (const url of URLS) {
    try {
      const items = await tryUrl(url);
      if (items.length > 0) {
        console.log(`[area] scraped ${items.length} articles from ${url}`);
        return items;
      }
    } catch (e) {
      console.warn(`[area] failed ${url}: ${e.message}`);
    }
  }
  console.warn('[area] all URLs failed');
  return [];
};
