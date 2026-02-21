(function () {
    var TYPE_SPEED        = 55;    // ms per character (base text)
    var WORD_TYPE_SPEED   = 80;    // ms per character (cycling word)
    var DELETE_SPEED      = 45;    // ms per character deleted
    var HOLD_MS           = 30000; // 30 s between word changes
    var PAUSE_AFTER_TYPE  = 600;   // brief pause after a word finishes typing

    var CONFIGS = {
        en: {
            base:  'Azerbaijan Sustainable Energies ',
            words: ['Hub', 'Platform', 'Portal', 'Gateway', 'Directory']
        },
        az: {
            base:  'Azərbaycan Davamlı Enerji ',
            words: ['Mərkəzi', 'Platforması', 'Portalı']
        },
        ru: {
            base:  'Центр устойчивой энергетики ',
            words: ['Азербайджана', 'Хаб', 'Платформа']
        }
    };

    var baseEl  = null;
    var wordEl  = null;
    var cfg     = CONFIGS.en;
    var wordIdx = 0;
    var timerId = null;
    var rafId   = null;

    function clearTimers() {
        if (timerId) { clearTimeout(timerId); timerId = null; }
        if (rafId)   { cancelAnimationFrame(rafId); rafId = null; }
    }

    // Generic character-by-character typer for any element
    function typeInto(el, text, speed, onDone) {
        var i = 0;
        el.textContent = '';
        function tick() {
            if (i < text.length) {
                el.textContent = text.slice(0, ++i);
                timerId = setTimeout(function () { rafId = requestAnimationFrame(tick); }, speed);
            } else {
                if (onDone) onDone();
            }
        }
        rafId = requestAnimationFrame(tick);
    }

    function deleteText(onDone) {
        function tick() {
            var cur = wordEl.textContent;
            if (cur.length > 0) {
                wordEl.textContent = cur.slice(0, -1);
                timerId = setTimeout(function () { rafId = requestAnimationFrame(tick); }, DELETE_SPEED);
            } else {
                if (onDone) onDone();
            }
        }
        rafId = requestAnimationFrame(tick);
    }

    function typeWord(idx, onDone) {
        typeInto(wordEl, cfg.words[idx], WORD_TYPE_SPEED, function () {
            timerId = setTimeout(onDone, PAUSE_AFTER_TYPE);
        });
    }

    function showNext() {
        wordIdx = (wordIdx + 1) % cfg.words.length;
        typeWord(wordIdx, scheduleNext);
    }

    function scheduleNext() {
        timerId = setTimeout(function () {
            deleteText(showNext);
        }, HOLD_MS);
    }

    function startFor(lang) {
        clearTimers();
        cfg     = CONFIGS[lang] || CONFIGS.en;
        wordIdx = 0;

        if (!baseEl || !wordEl) return;

        wordEl.textContent = '';
        // Type the base sentence first, then the first word
        typeInto(baseEl, cfg.base, TYPE_SPEED, function () {
            typeWord(0, scheduleNext);
        });
    }

    function init() {
        baseEl = document.getElementById('tw-base');
        wordEl = document.getElementById('tw-word');
        if (!wordEl) return;

        var initLang = (window.getLanguage && window.getLanguage()) || 'en';
        startFor(initLang);

        window.addEventListener('langchange', function (e) {
            startFor(e.detail.lang);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
