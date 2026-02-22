(function () {
    'use strict';

    var PAGE_SIZE = 6;
    var FALLBACK_IMG = 'solartower.png';

    // DB API config — set window.ENV_NEWS_API and window.ENV_NEWS_SECRET in env-config.js
    var API_BASE   = (window.ENV_NEWS_API   || 'https://api.plugin.az').replace(/\/$/, '');
    var API_SECRET = window.ENV_NEWS_SECRET || '';
    var CACHE_KEY  = 'cescocomp_news_cache';
    var CACHE_TTL  = 10 * 60 * 1000; // 10 minutes — refresh silently after this

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

    /* ─── DB API fetch ──────────────────────────────────────────────── */

    function fetchFromAPI(page, pageSize, source) {
        var url = API_BASE + '/api/news?page=' + page + '&pageSize=' + pageSize +
                  (source && source !== 'all' ? '&source=' + encodeURIComponent(source) : '');
        return fetch(url, {
            headers: API_SECRET ? { 'Authorization': 'Bearer ' + API_SECRET } : {}
        }).then(function (r) {
            if (!r.ok) throw new Error('API error ' + r.status);
            return r.json();
        });
    }

    /* ─── localStorage cache ────────────────────────────────────────── */

    function loadCache() {
        try {
            var raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            return obj;
        } catch (e) { return null; }
    }

    function saveCache(articles) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                articles: articles,
                ts: Date.now()
            }));
        } catch (e) {}
    }

    function isCacheStale(cache) {
        return !cache || (Date.now() - (cache.ts || 0)) > CACHE_TTL;
    }

    /* ─── Bootstrap ─────────────────────────────────────────────────── */

    function showGrid() {
        loading.style.display = 'none';
        grid.style.display = 'grid';
    }

    function populateArticles(articles) {
        allArticles = articles.map(function (a) {
            return {
                title:   a.title   || '',
                date:    a.published_at || '',
                image:   a.image   || '',
                excerpt: a.excerpt || '',
                link:    a.link    || '#',
                source:  a.source  || '',
                _ts:     parseDate(a.published_at).getTime()
            };
        });
        filteredArticles = activeSource === 'all'
            ? allArticles
            : allArticles.filter(function (a) { return a.source === activeSource; });
        currentPage = 0;
        showGrid();
        renderPage();
    }

    function init() {
        // 1. Render from cache immediately (zero-wait display)
        var cache = loadCache();
        if (cache && cache.articles && cache.articles.length > 0) {
            populateArticles(cache.articles);
        }

        // 2. Fetch fresh data from DB API (always, to keep content current)
        fetchFromAPI(1, 200, 'all')
            .then(function (data) {
                var articles = data.articles || [];
                if (articles.length === 0) return;
                saveCache(articles);
                // Only re-render if we got different data than cache
                var cacheLen = (cache && cache.articles) ? cache.articles.length : 0;
                if (articles.length !== cacheLen || isCacheStale(cache)) {
                    populateArticles(articles);
                }
            })
            .catch(function (err) {
                console.warn('[news] API fetch failed:', err.message);
                // If no cache was available either, show empty state
                if (!cache || !cache.articles || cache.articles.length === 0) {
                    showGrid();
                    renderPage();
                }
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
