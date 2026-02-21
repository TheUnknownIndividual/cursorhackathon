(function () {
    var STORAGE_KEY = 'az-energy-theme';

    function isDark() {
        return document.body.classList.contains('dark-mode');
    }

    function applyDark(dark) {
        if (dark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        try {
            localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
        } catch (e) {}
    }

    function initTheme() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'dark') applyDark(true);
            else if (saved === 'light') applyDark(false);
        } catch (e) {}
    }

    window.toggleTheme = function () {
        var btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.classList.add('theme-swirl');
            btn.setAttribute('aria-pressed', isDark() ? 'false' : 'true');
            setTimeout(function () {
                applyDark(!isDark());
                btn.classList.remove('theme-swirl');
            }, 320);
        } else {
            applyDark(!isDark());
        }
    };

    window.initTheme = initTheme;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();

// ── Mobile burger menu ───────────────────────────────────────────
(function () {
    function initBurger() {
        var burger = document.getElementById('nav-burger');
        var navInner = burger && burger.closest('.nav-inner');
        if (!burger || !navInner) return;

        burger.addEventListener('click', function () {
            var open = navInner.classList.toggle('nav-open');
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        // Close menu when a nav link is clicked
        var links = navInner.querySelectorAll('.nav-links a');
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                navInner.classList.remove('nav-open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!navInner.contains(e.target)) {
                navInner.classList.remove('nav-open');
                burger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBurger);
    } else {
        initBurger();
    }
})();
