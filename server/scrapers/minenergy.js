const axios = require('axios');
const cheerio = require('cheerio');

const BASE = 'https://minenergy.gov.az';

module.exports = async function scrapeMinen() {
  const { data: html } = await axios.get(`${BASE}/az/xeberler-arxivi`, {
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cescocomp-bot/1.0)' }
  });

  const $ = cheerio.load(html);
  const results = [];

  $('article, .card, .news-item, .news__item').each((_, el) => {
    const titleEl   = $(el).find('h2,h3,h4,h5,.card-title,.title').first();
    const linkEl    = $(el).find('a').first();
    const imgEl     = $(el).find('img').first();
    const dateEl    = $(el).find('time,.date,.news-date,small,.text-muted').first();
    const excerptEl = $(el).find('p,.card-text,.excerpt').first();

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
      source:       'minenergy.gov.az',
      published_at: dateEl.text().trim()
    });
  });

  console.log(`[minenergy] scraped ${results.length} articles`);
  return results;
};
