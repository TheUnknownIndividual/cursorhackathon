(function () {
    'use strict';

    var PAGE_SIZE = 6;
    var FALLBACK_IMG = 'solartower.png';
    var CORS_PROXY = 'https://api.allorigins.win/get?url=';

    var allArticles = [];
    var filteredArticles = [];
    var currentPage = 0;
    var activeSource = 'all';

    var grid = document.getElementById('news-grid');
    var loading = document.getElementById('news-loading');
    var loadMoreBtn = document.getElementById('load-more-btn');
    var filterBar = document.getElementById('news-filter-bar');

    /* ─── Date parsing ──────────────────────────────────────────────── */

    function parseDate(str) {
        if (!str) return new Date(0);
        // "DD.MM.YYYY HH:MM" or "DD.MM.YYYY"
        var m = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
        if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
        var d = new Date(str);
        return isNaN(d) ? new Date(0) : d;
    }

    function formatDate(str) {
        var d = parseDate(str);
        if (!d || d.getTime() === 0) return str || '';
        return d.toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    /* ─── Card builder ──────────────────────────────────────────────── */

    function buildCard(art) {
        var article = document.createElement('article');
        article.className = 'news-card';

        var imgSrc = art.image || FALLBACK_IMG;
        var excerpt = art.excerpt || '';
        var dateStr = formatDate(art.date);
        var link = art.link || '#';
        var source = art.source || '';

        article.innerHTML =
            '<div class="news-card-img-wrap">' +
                '<img class="news-card-img" src="' + escHtml(imgSrc) + '" alt="' + escHtml(art.title) + '" loading="lazy">' +
            '</div>' +
            '<div class="news-card-body">' +
                (source ? '<span class="news-source-badge">' + escHtml(source) + '</span>' : '') +
                '<div class="news-date">' + escHtml(dateStr) + '</div>' +
                '<h3>' + escHtml(art.title) + '</h3>' +
                (excerpt ? '<p>' + escHtml(excerpt) + '</p>' : '') +
                '<a class="read-more" href="' + escHtml(link) + '" target="_blank" rel="noopener">Ətraflı oxu →</a>' +
            '</div>';

        // Fallback image on error
        var img = article.querySelector('.news-card-img');
        img.addEventListener('error', function () {
            if (this.src !== location.origin + '/' + FALLBACK_IMG) {
                this.src = FALLBACK_IMG;
            }
        });

        return article;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* ─── Render ────────────────────────────────────────────────────── */

    function renderPage() {
        var start = currentPage * PAGE_SIZE;
        var slice = filteredArticles.slice(start, start + PAGE_SIZE);

        if (currentPage === 0) {
            grid.innerHTML = '';
        }

        if (slice.length === 0 && currentPage === 0) {
            var empty = document.createElement('p');
            empty.className = 'news-empty-state';
            empty.textContent = 'Bu mənbədən xəbər tapılmadı.';
            grid.appendChild(empty);
        } else {
            var frag = document.createDocumentFragment();
            slice.forEach(function (art) { frag.appendChild(buildCard(art)); });
            grid.appendChild(frag);
        }

        currentPage++;
        var hasMore = currentPage * PAGE_SIZE < filteredArticles.length;
        loadMoreBtn.style.display = hasMore ? 'inline-block' : 'none';
    }

    /* ─── Filter ────────────────────────────────────────────────────── */

    function applyFilter(source) {
        activeSource = source;
        currentPage = 0;
        filteredArticles = source === 'all'
            ? allArticles
            : allArticles.filter(function (a) { return a.source === source; });
        renderPage();
    }

    filterBar.addEventListener('click', function (e) {
        var btn = e.target.closest('.news-filter-btn');
        if (!btn) return;
        filterBar.querySelectorAll('.news-filter-btn').forEach(function (b) {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        applyFilter(btn.dataset.source);
    });

    loadMoreBtn.addEventListener('click', function () {
        renderPage();
    });

    /* ─── Source A: CECSO / renewables.az (local JSON) ─────────────── */

    function loadCECSO() {
        return fetch('cecso-news.json')
            .then(function (r) {
                if (!r.ok) throw new Error('cecso-news.json ' + r.status);
                return r.json();
            })
            .then(function (data) {
                var articles = data.articles || [];
                return articles.map(function (a) {
                    return {
                        title:   a.title   || '',
                        date:    a.date    || '',
                        image:   a.image   || '',
                        excerpt: a.excerpt || '',
                        link:    a.link    || '#',
                        source:  'renewables.az',
                        _ts:     parseDate(a.date).getTime()
                    };
                });
            });
    }

    /* ─── Source B: minenergy.gov.az ────────────────────────────────── */

    function scrapeMinen() {
        var url = 'https://minenergy.gov.az/az/xeberler-arxivi';
        return fetchViaProxy(url).then(function (html) {
            return parseMinenHtml(html);
        });
    }

    function parseMinenHtml(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var results = [];

        // Try common Bootstrap card/list patterns
        var items = doc.querySelectorAll('.card, .news-item, .news__item, article');

        // Fallback: look for any anchor with a news URL pattern
        if (items.length === 0) {
            items = doc.querySelectorAll('a[href*="/az/"]');
        }

        items.forEach(function (el) {
            var titleEl = el.querySelector('h2, h3, h4, h5, .card-title, .news-title, .title');
            var linkEl  = el.tagName === 'A' ? el : el.querySelector('a');
            var imgEl   = el.querySelector('img');
            var dateEl  = el.querySelector('time, .date, .news-date, small, .text-muted');
            var excerptEl = el.querySelector('p, .card-text, .excerpt');

            var title = titleEl ? titleEl.textContent.trim() : (linkEl ? linkEl.textContent.trim() : '');
            if (!title || title.length < 10) return;

            var href = linkEl ? linkEl.getAttribute('href') : '#';
            if (href && !href.startsWith('http')) {
                href = 'https://minenergy.gov.az' + href;
            }

            var img = '';
            if (imgEl) {
                img = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '';
                if (img && !img.startsWith('http')) {
                    img = 'https://minenergy.gov.az' + img;
                }
            }

            var date = dateEl ? dateEl.textContent.trim() : '';
            var excerpt = excerptEl ? excerptEl.textContent.trim() : '';

            results.push({
                title:   title,
                date:    date,
                image:   img,
                excerpt: excerpt.slice(0, 200),
                link:    href || '#',
                source:  'minenergy.gov.az',
                _ts:     parseDate(date).getTime()
            });
        });

        return results;
    }

    /* ─── Source C: area.gov.az ─────────────────────────────────────── */

    function scrapeArea() {
        var urls = [
            'https://area.gov.az/az/news',
            'https://area.gov.az/az/xeberler',
            'https://area.gov.az/az'
        ];

        function tryNext(idx) {
            if (idx >= urls.length) return Promise.resolve([]);
            return fetchViaProxy(urls[idx])
                .then(function (html) {
                    var items = parseAreaHtml(html, urls[idx]);
                    if (items.length > 0) return items;
                    return tryNext(idx + 1);
                })
                .catch(function () { return tryNext(idx + 1); });
        }

        return tryNext(0);
    }

    function parseAreaHtml(html, baseUrl) {
        var base = baseUrl.replace(/\/[^/]*$/, '');
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var results = [];

        var items = doc.querySelectorAll('.card, article, .news-item, .news__item, li.item');

        if (items.length === 0) {
            // Generic: all anchors that look like article links
            items = doc.querySelectorAll('a[href*="/news/"], a[href*="/xeberler/"]');
        }

        items.forEach(function (el) {
            var titleEl = el.querySelector('h2, h3, h4, h5, .card-title, .title');
            var linkEl  = el.tagName === 'A' ? el : el.querySelector('a');
            var imgEl   = el.querySelector('img');
            var dateEl  = el.querySelector('time, .date, .news-date, small');
            var excerptEl = el.querySelector('p, .card-text, .excerpt, .lead');

            var title = titleEl ? titleEl.textContent.trim() : (linkEl ? linkEl.textContent.trim() : '');
            if (!title || title.length < 10) return;

            var href = linkEl ? linkEl.getAttribute('href') : '#';
            if (href && !href.startsWith('http')) {
                href = 'https://area.gov.az' + href;
            }

            var img = '';
            if (imgEl) {
                img = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '';
                if (img && !img.startsWith('http')) {
                    img = 'https://area.gov.az' + img;
                }
            }

            var date = dateEl ? dateEl.textContent.trim() : '';
            var excerpt = excerptEl ? excerptEl.textContent.trim() : '';

            results.push({
                title:   title,
                date:    date,
                image:   img,
                excerpt: excerpt.slice(0, 200),
                link:    href || '#',
                source:  'area.gov.az',
                _ts:     parseDate(date).getTime()
            });
        });

        return results;
    }

    /* ─── CORS proxy fetch ──────────────────────────────────────────── */

    function fetchViaProxy(url) {
        var proxyUrl = CORS_PROXY + encodeURIComponent(url);
        return Promise.race([
            fetch(proxyUrl).then(function (r) {
                if (!r.ok) throw new Error('Proxy error ' + r.status);
                return r.json();
            }).then(function (data) {
                if (!data || !data.contents) throw new Error('No contents');
                return data.contents;
            }),
            new Promise(function (_, reject) {
                setTimeout(function () { reject(new Error('Timeout')); }, 8000);
            })
        ]);
    }

    /* ─── Bootstrap ─────────────────────────────────────────────────── */

    function showGrid() {
        loading.style.display = 'none';
        grid.style.display = 'grid';
    }

    function init() {
        var sources = [
            loadCECSO(),
            scrapeMinen(),
            scrapeArea()
        ];

        Promise.allSettled(sources).then(function (results) {
            results.forEach(function (r) {
                if (r.status === 'fulfilled' && Array.isArray(r.value)) {
                    allArticles = allArticles.concat(r.value);
                }
            });

            // Sort newest first; articles with no date go to the end
            allArticles.sort(function (a, b) {
                var ta = a._ts || 0;
                var tb = b._ts || 0;
                if (ta === 0 && tb === 0) return 0;
                if (ta === 0) return 1;
                if (tb === 0) return -1;
                return tb - ta;
            });

            filteredArticles = allArticles;
            showGrid();
            renderPage();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
