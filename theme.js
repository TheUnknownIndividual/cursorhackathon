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
