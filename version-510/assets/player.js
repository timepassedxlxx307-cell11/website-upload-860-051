(function () {
  function bindPlayer(stage) {
    var video = stage.querySelector('video');
    var button = stage.querySelector('[data-play]');
    var stream = stage.getAttribute('data-stream');
    var attached = false;
    var hls = null;

    function playVideo() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    function attachStream() {
      if (attached || !stream || !video) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else {
        video.src = stream;
      }
    }

    function start() {
      attachStream();
      if (button) {
        button.classList.add('is-hidden');
      }
      playVideo();
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('emptied', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
        attached = false;
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
  });
})();
