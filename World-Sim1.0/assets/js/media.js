export function releaseMedia(videos) {
  videos.forEach((video) => {
    video.pause();
    video.removeAttribute("src");
    video.playbackRate = 1;
    video.load();
  });
}

// Cancel listeners and the fallback timer before loading another task.
export function createMediaLoader(videos) {
  let controller;
  let timer;
  const cancel = () => {
    controller?.abort();
    clearTimeout(timer);
  };
  return {
    cancel,
    load(setSource, onReady, onTimeout) {
      cancel();
      controller = new AbortController();
      let loaded = 0;
      const markLoaded = () => {
        if (++loaded !== videos.length) return;
        clearTimeout(timer);
        onReady();
      };
      timer = window.setTimeout(onTimeout, 900);
      videos.forEach(video => {
        video.addEventListener("loadeddata", markLoaded, { once: true, signal: controller.signal });
        setSource(video);
        video.load();
      });
    },
  };
}

export function initStandaloneVideos() {
  const visible = new Set();
  const play = () => {
    if (document.hidden) return;
    visible.forEach(video => {
      if (video.dataset.userPaused !== "true") video.play().catch(() => {});
    });
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target: video, isIntersecting }) => {
      if (isIntersecting) {
        visible.add(video);
        const rate = Number(video.dataset.playbackRate);
        if (Number.isFinite(rate) && rate > 0) video.playbackRate = rate;
      } else {
        visible.delete(video);
        video.pause();
      }
    });
    play();
  }, { threshold: 0.35 });
  document.querySelectorAll("video:not([data-overview-stream]):not([data-viewpoint-video]):not([data-embodiment-video]):not([data-object-video]):not([data-reverse-video])").forEach(video => { if (!video.dataset.overviewSecond) observer.observe(video); });
  return { play, pause: () => visible.forEach(video => video.pause()) };
}
