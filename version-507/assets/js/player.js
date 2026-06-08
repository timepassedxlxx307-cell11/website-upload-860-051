(function () {
  function bindPlayer(frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.play-trigger');
    var stream = frame.getAttribute('data-stream');
    var hlsInstance = null;

    if (!video || !stream) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else {
      video.src = stream;
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    frame.addEventListener('click', function (event) {
      if (event.target === video || event.target === frame) {
        playVideo(event);
      }
    });

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      frame.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('.player-frame').forEach(bindPlayer);

  document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      var frame = document.querySelector('.player-frame');
      var trigger = frame ? frame.querySelector('.play-trigger') : null;
      if (frame) {
        frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (trigger) {
        trigger.click();
      }
    });
  });
})();
