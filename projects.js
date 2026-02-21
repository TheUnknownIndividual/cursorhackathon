(function () {
    var list = document.getElementById('projects-list');
    var buttons = document.querySelectorAll('.projects-filters .filter-btn');
    if (!list || !buttons.length) return;

    function filter(status) {
        var cards = list.querySelectorAll('.project-card');
        cards.forEach(function (card) {
            var s = card.getAttribute('data-status');
            if (status === 'all' || s === status) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var status = btn.getAttribute('data-status');
            buttons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            filter(status);
        });
    });
})();
