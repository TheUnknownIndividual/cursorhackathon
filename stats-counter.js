(function () {
    var DURATION = 1800; // ms for the full count-up

    function easeOut(t) {
        // Exponential ease-out: fast start, slow finish
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateCounter(el) {
        var target   = parseFloat(el.getAttribute('data-count'));
        var suffix   = el.getAttribute('data-suffix') || '';
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var start    = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            var elapsed  = timestamp - start;
            var progress = Math.min(elapsed / DURATION, 1);
            var value    = easeOut(progress) * target;
            el.textContent = value.toFixed(decimals) + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toFixed(decimals) + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    function initCounters() {
        var counters = document.querySelectorAll('.stat-number[data-count]');
        if (!counters.length) return;

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            counters.forEach(function (el) { observer.observe(el); });
        } else {
            // Fallback: run immediately
            counters.forEach(animateCounter);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCounters);
    } else {
        initCounters();
    }
})();
