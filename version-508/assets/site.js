(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHeaderSearch() {
        var forms = document.querySelectorAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[type="search"]');
                var value = input ? input.value.trim() : '';
                if (value) {
                    window.location.href = './search.html?q=' + encodeURIComponent(value);
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length === 0) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function setupFilters() {
        var scopes = document.querySelectorAll('[data-filter-scope]');
        scopes.forEach(function (scope) {
            var keyword = scope.querySelector('[data-filter-keyword]');
            var year = scope.querySelector('[data-filter-year]');
            var type = scope.querySelector('[data-filter-type]');
            var genre = scope.querySelector('[data-filter-genre]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
            var empty = document.querySelector('[data-empty-state]');
            function apply() {
                var key = normalize(keyword && keyword.value);
                var yearValue = normalize(year && year.value);
                var typeValue = normalize(type && type.value);
                var genreValue = normalize(genre && genre.value);
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var matched = true;
                    if (key && text.indexOf(key) === -1) {
                        matched = false;
                    }
                    if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                        matched = false;
                    }
                    if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
                        matched = false;
                    }
                    if (genreValue && normalize(card.getAttribute('data-genre')).indexOf(genreValue) === -1) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visibleCount === 0);
                }
            }
            [keyword, year, type, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function setupSearchPage() {
        var box = document.querySelector('[data-search-page]');
        if (!box || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = normalize(params.get('q') || '');
        var title = document.querySelector('[data-search-title]');
        var input = document.querySelector('[data-search-main-input]');
        if (input && q) {
            input.value = params.get('q');
        }
        if (title) {
            title.textContent = q ? '搜索：' + params.get('q') : '影片搜索';
        }
        var list = window.MOVIE_SEARCH_DATA.filter(function (item) {
            if (!q) {
                return true;
            }
            var haystack = normalize([
                item.title,
                item.year,
                item.region,
                item.type,
                item.genre,
                item.category,
                (item.tags || []).join(' '),
                item.oneLine
            ].join(' '));
            return haystack.indexOf(q) !== -1;
        }).slice(0, 80);
        box.innerHTML = '';
        list.forEach(function (item) {
            var card = document.createElement('a');
            card.className = 'search-result-card';
            card.href = item.url;
            card.innerHTML = [
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
                '<div>',
                '<h3>' + escapeHtml(item.title) + '</h3>',
                '<p>' + escapeHtml(item.oneLine || '') + '</p>',
                '<div class="movie-meta"><span>' + escapeHtml(item.year || '') + '</span><span>' + escapeHtml(item.region || '') + '</span><span>' + escapeHtml(item.category || '') + '</span></div>',
                '</div>'
            ].join('');
            box.appendChild(card);
        });
        var empty = document.querySelector('[data-search-empty]');
        if (empty) {
            empty.classList.toggle('is-visible', list.length === 0);
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector('[data-player]');
        var overlay = document.querySelector('[data-play-overlay]');
        if (!video || !streamUrl) {
            return;
        }
        var connected = false;
        var hlsInstance = null;
        function attach() {
            if (connected) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                connected = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                connected = true;
                return;
            }
            video.src = streamUrl;
            connected = true;
        }
        function begin() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHeaderSearch();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
