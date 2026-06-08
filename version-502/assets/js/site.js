(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var missingImages = document.querySelectorAll('img.cover-img, .rank-thumb img, .related-thumb img');
  missingImages.forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-missing');
      img.removeAttribute('src');
    });
  });

  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.from(hero.querySelectorAll('.hero-slide'));
    var dots = Array.from(hero.querySelectorAll('.hero-dots button'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  var localFilter = document.querySelector('[data-local-filter]');
  if (localFilter) {
    var keywordInput = localFilter.querySelector('[data-filter-keyword]');
    var yearSelect = localFilter.querySelector('[data-filter-year]');
    var regionSelect = localFilter.querySelector('[data-filter-region]');
    var cards = Array.from(document.querySelectorAll('.movie-card'));

    function applyLocalFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matchKeyword = !keyword || title.indexOf(keyword) >= 0 || genre.indexOf(keyword) >= 0;
        var matchYear = !year || cardYear === year;
        var matchRegion = !region || cardRegion.indexOf(region) >= 0;
        card.hidden = !(matchKeyword && matchYear && matchRegion);
      });
    }

    [keywordInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyLocalFilter);
        control.addEventListener('change', applyLocalFilter);
      }
    });
  }

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && window.MovieSearchData) {
    var form = searchRoot.querySelector('form');
    var input = searchRoot.querySelector('input[name="q"]');
    var resultGrid = searchRoot.querySelector('[data-search-results]');
    var count = searchRoot.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function movieCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '<a class="movie-cover" href="' + escapeHtml(movie.url) + '">',
        '<img class="cover-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="cover-shade"></span>',
        '<span class="play-dot">▶</span>',
        '</a>',
        '<div class="movie-info">',
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
        '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[character];
      });
    }

    function runSearch(query) {
      var value = query.trim().toLowerCase();
      if (input) {
        input.value = query;
      }

      if (!value) {
        var featured = window.MovieSearchData.slice(0, 24);
        resultGrid.innerHTML = featured.map(movieCard).join('');
        count.textContent = '输入关键词可搜索标题、类型、地区、年份和标签。';
        return;
      }

      var terms = value.split(/\s+/).filter(Boolean);
      var results = window.MovieSearchData.filter(function (movie) {
        var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) >= 0;
        });
      }).slice(0, 120);

      if (results.length) {
        resultGrid.innerHTML = results.map(movieCard).join('');
        count.textContent = '找到 ' + results.length + ' 条相关影片。';
      } else {
        resultGrid.innerHTML = '<div class="empty-state">没有找到匹配内容，可以换一个片名、地区或类型继续搜索。</div>';
        count.textContent = '没有匹配结果。';
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value : '';
        var url = new URL(window.location.href);
        if (query.trim()) {
          url.searchParams.set('q', query.trim());
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
        runSearch(query);
      });
    }

    runSearch(initialQuery);
  }
})();
