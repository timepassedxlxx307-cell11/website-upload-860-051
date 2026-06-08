(function () {
    var body = document.body;
    var toggle = document.querySelector('[data-menu-toggle]');
    if (toggle) {
        toggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var active = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === active);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-movie-filter]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var noResult = document.querySelector('[data-no-result]');
    var filterType = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        var query = normalize(filterInput ? filterInput.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year')
            ].join(' '));
            var typeText = normalize(card.getAttribute('data-type') + ' ' + card.getAttribute('data-genre'));
            var queryMatch = !query || haystack.indexOf(query) !== -1;
            var typeMatch = filterType === 'all' || typeText.indexOf(filterType) !== -1;
            var isVisible = queryMatch && typeMatch;
            card.style.display = isVisible ? '' : 'none';
            if (isVisible) {
                visible += 1;
            }
        });

        if (noResult) {
            noResult.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            filterType = chip.getAttribute('data-filter-chip') || 'all';
            chips.forEach(function (item) {
                item.classList.toggle('is-active', item === chip);
            });
            applyFilter();
        });
    });

    applyFilter();
}());
