(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-button]');
    var mobileNav = qs('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    qsa('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = qs('input[name="q"]', form);
            var value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
            }
        });
    });

    function setupHero(slider) {
        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        var current = 0;

        if (!slides.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    qsa('[data-hero-slider]').forEach(setupHero);

    qsa('[data-filter-form]').forEach(function (form) {
        var input = qs('[data-filter-input]', form);
        var scope = qs('[data-filter-scope]');
        var empty = qs('[data-filter-empty]');

        if (!input || !scope) {
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
        });

        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            qsa('[data-movie-card]', scope).forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    });

    function makeCard(item) {
        return [
            '<article class="movie-card">',
            '    <a class="movie-poster" href="./' + item.file + '" aria-label="' + escapeHtml(item.title) + '">',
            '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">',
            '        <span class="poster-badge">' + escapeHtml(item.type) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <a class="movie-card-title" href="./' + item.file + '">' + escapeHtml(item.title) + '</a>',
            '        <p class="movie-meta">' + escapeHtml(item.region) + ' · ' + item.year + ' · ' + escapeHtml(item.genre) + '</p>',
            '        <p class="movie-line">' + escapeHtml(item.oneLine) + '</p>',
            '        <div class="tag-list">' + item.tags.slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function renderSearch() {
        var results = qs('[data-search-results]');
        var empty = qs('[data-search-empty]');
        var input = qs('[data-search-page-input]');
        var title = qs('[data-search-title]');

        if (!results || typeof SEARCH_ITEMS === 'undefined') {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        if (input) {
            input.value = query;
        }

        if (!query) {
            results.innerHTML = '';
            if (empty) {
                empty.hidden = false;
            }
            return;
        }

        var lower = query.toLowerCase();
        var matched = SEARCH_ITEMS.filter(function (item) {
            return item.search.indexOf(lower) !== -1;
        }).slice(0, 240);

        if (title) {
            title.textContent = '“' + query + '”的搜索结果';
        }

        results.innerHTML = matched.map(makeCard).join('');
        if (empty) {
            empty.hidden = matched.length !== 0;
            if (!matched.length) {
                empty.textContent = '没有找到相关影片';
            }
        }
    }

    renderSearch();
})();
