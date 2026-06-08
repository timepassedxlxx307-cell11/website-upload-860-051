(function () {
  function initMoviePlayer(streamUrl, videoId, buttonId, coverId, statusId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    var status = document.getElementById(statusId);
    var hls = null;
    var ready = false;

    if (!video || !streamUrl) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function load() {
      if (ready) {
        return;
      }
      ready = true;
      setStatus('');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('视频加载失败，请稍后再试。');
          }
        });
        return;
      }

      video.src = streamUrl;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function play() {
      load();
      hideCover();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          setStatus('点击播放后即可继续观看。');
        });
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', toggle);
    video.addEventListener('play', hideCover);
    video.addEventListener('error', function () {
      setStatus('视频加载失败，请稍后再试。');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
