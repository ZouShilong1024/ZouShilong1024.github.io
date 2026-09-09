import { releaseMedia, createMediaLoader } from "./media.js";

// Shared task navigation, lazy loading and reference-video synchronization.
export function createVideoGallery({ id, tasks, getMedia, sync = "progress", matchDuration = false }) {
  const element = document.getElementById(`${id}-gallery`);
  const stage = document.getElementById(`${id}-stage`);
  const videos = [...document.querySelectorAll(`[data-${id}-video]`)];
  const buttons = [...document.querySelectorAll(`[data-${id}-task]`)];
  const taskName = document.getElementById(`${id}-task-name`);
  const counter = document.getElementById(`${id}-counter`);
  let currentIndex = 0;
  let visible = false;
  let userPaused = false;
  const loader = createMediaLoader(videos);
  let mediaLoaded = false;

  const play = () => {
    if (userPaused || !visible || document.hidden) return;
    videos.forEach((video) => video.play().catch(() => {}));
  };
  const pause = () => videos.forEach((video) => video.pause());

  const showTask = (index, immediate = false) => {
    const normalizedIndex = (index + tasks.length) % tasks.length;
    const task = tasks[normalizedIndex];
    loader.cancel();
    currentIndex = normalizedIndex;
    pause();
    if (!immediate) stage.classList.add("is-changing");

    taskName.textContent = task.instruction ?? task.label;
    counter.textContent = `${normalizedIndex + 1} / ${tasks.length}`;
    buttons.forEach((button, buttonIndex) => {
      const active = buttonIndex === normalizedIndex;
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
      button.classList.toggle("border-zinc-900", active);
      button.classList.toggle("bg-ink", active);
      button.classList.toggle("text-white", active);
      button.classList.toggle("border-transparent", !active);
      button.classList.toggle("text-mute", !active);
      button.classList.toggle("hover:bg-zinc-50", !active);
      button.classList.toggle("hover:text-ink", !active);
    });

    videos.forEach((video) => {
      const slot = video.getAttribute(`data-${id}-video`);
      const media = getMedia(task, slot);
      video.setAttribute("aria-label", `${task.label}: ${media.label}`);
      video.poster = media.poster;
    });
    if (!visible) {
      stage.classList.remove("is-changing");
      return;
    }
    mediaLoaded = true;

    const markLoaded = () => {
      videos.forEach((video) => { video.currentTime = 0; });
      if (matchDuration) {
        const longest = Math.max(...videos.map(video => Number.isFinite(video.duration) ? video.duration : 0));
        if (longest > 0) videos.forEach(video => {
          video.playbackRate = Number.isFinite(video.duration) ? Math.min(1, Math.max(0.5, video.duration / longest)) : 1;
        });
      }
      stage.classList.remove("is-changing");
      play();
    };
    loader.load((video) => {
      const slot = video.getAttribute(`data-${id}-video`);
      video.src = getMedia(task, slot).src;
    }, markLoaded, () => {
      stage.classList.remove("is-changing");
      play();
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => showTask(Number(button.getAttribute(`data-${id}-task`))));
  });
  document.getElementById(`${id}-prev`).addEventListener("click", () => showTask(currentIndex - 1));
  document.getElementById(`${id}-next`).addEventListener("click", () => showTask(currentIndex + 1));
  element.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showTask(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  const master = videos.find((video) => video.getAttribute(`data-${id}-video`) === "reference");
  master.addEventListener("timeupdate", () => {
    if (!Number.isFinite(master.duration) || master.duration <= 0) return;
    videos.forEach((video) => {
      if (video === master || video.readyState < 1 || !Number.isFinite(video.duration)) return;
      const time = sync === "progress" ? master.currentTime / master.duration * video.duration : master.currentTime;
      const targetTime = Math.min(time, Math.max(0, video.duration - 0.05));
      if (Math.abs(video.currentTime - targetTime) > (sync === "progress" ? 0.5 : 0.12)) video.currentTime = targetTime;
    });
  });
  master.addEventListener("play", () => {
    if (userPaused || !visible || document.hidden) { pause(); return; }
    videos.forEach((video) => { if (video !== master) video.play().catch(() => {}); });
  });
  master.addEventListener("pause", () => {
    videos.forEach((video) => { if (video !== master) video.pause(); });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible = entry.isIntersecting;
      if (visible && !mediaLoaded) showTask(currentIndex, true);
      else if (visible) play();
      else pause();
    });
  }, { threshold: 0.2 });
  observer.observe(element);
  showTask(0, true);

  return {
    play: play,
    pause: pause,
    setUserPaused(paused) {
      userPaused = paused;
      if (paused) pause();
      else play();
    },
    restart() {
      videos.forEach(video => { video.currentTime = 0; });
      play();
    },
    activate() {
      visible = true;
      if (!mediaLoaded) showTask(currentIndex, true);
      else play();
    },
    release() {
      visible = false;
      if (!mediaLoaded) return;
      mediaLoaded = false;
      loader.cancel();
      releaseMedia(videos);
    },
  };
}
