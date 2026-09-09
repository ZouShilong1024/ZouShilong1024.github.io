// A scene is one comparison: load, buffer and loop its videos together.
export function createSceneGroup(videos, { loadOnActivate = true } = {}) {
  let active = false;
  let frame = null;
  let loaded = false;
  const pause = () => videos.forEach(video => video.pause());
  const tick = () => {
    frame = null;
    if (!active || document.hidden) { pause(); return; }
    if (videos.some(video => video.ended)) {
      pause();
      videos.forEach(video => { video.currentTime = 0; });
    }
    if (videos.every(video => video.readyState >= 3 && !video.seeking && Number.isFinite(video.duration) && video.duration > 0)) {
      const duration = Math.max(...videos.map(video => video.duration));
      const master = videos[0];
      const progress = master.currentTime / master.duration;
      videos.forEach(video => {
        video.playbackRate = video.duration / duration;
        const target = progress * video.duration;
        if (Math.abs(video.currentTime - target) > 0.08) video.currentTime = target;
      });
      if (!videos.some(video => video.seeking)) {
        videos.forEach(video => { if (video.paused) video.play().catch(() => {}); });
      } else pause();
    } else pause();
    frame = requestAnimationFrame(tick);
  };
  videos.forEach(video => {
    video.loop = false;
    video.addEventListener('waiting', pause);
    video.addEventListener('stalled', () => { if (video.readyState < 3) pause(); });
  });
  return {
    activate() {
      active = true;
      if (!loaded && loadOnActivate) {
        loaded = true;
        videos.forEach(video => { video.preload = 'auto'; video.load(); });
      }
      if (frame === null) tick();
    },
    pause() {
      active = false;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      pause();
    },
  };
}

export function initSceneVideos() {
  const panels = [...document.querySelectorAll('.scene-set-panel')];
  const groups = new Map(panels.map(panel => [panel, createSceneGroup([...panel.querySelectorAll('video')])]));
  let visible = false;
  const refresh = () => groups.forEach((group, panel) => {
    if (visible && !document.hidden && !panel.classList.contains('hidden') && !document.getElementById('panel-scene').classList.contains('hidden')) group.activate();
    else group.pause();
  });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    refresh();
  }, { threshold: 0 });
  observer.observe(document.getElementById('panel-scene'));
  document.querySelectorAll('[data-scene-set], .tab').forEach(button => button.addEventListener('click', refresh));
  return { play: refresh, pause: () => groups.forEach(group => group.pause()) };
}
