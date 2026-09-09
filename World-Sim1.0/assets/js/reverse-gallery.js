import { reverseTasks } from "./demo-data.js";
import { releaseMedia, createMediaLoader } from "./media.js";

export function initReverseGallery() {
  const reverseGallery = document.getElementById("reverse-gallery");
  const reverseStage = document.getElementById("reverse-stage");
  const reverseVideos = [...document.querySelectorAll("[data-reverse-video]")];
  const reversePhasePanels = [...document.querySelectorAll("[data-reverse-phase]")];
  const reverseTaskButtons = [...document.querySelectorAll("[data-reverse-task]")];
  const reverseTaskName = document.getElementById("reverse-task-name");
  const reverseDataset = document.getElementById("reverse-dataset");
  const reverseCounter = document.getElementById("reverse-counter");
  const reverseBySlot = Object.fromEntries(reverseVideos.map((video) => [video.dataset.reverseVideo, video]));
  const reverseForwardPair = reverseVideos.filter((video) => video.dataset.reverseVideo.startsWith("forward"));
  const reverseReversePair = reverseVideos.filter((video) => video.dataset.reverseVideo.startsWith("reverse"));
  let reverseIndex = 0;
  let reverseVisible = false;
  let userPaused = false;
  const loader = createMediaLoader(reverseVideos);
  let reverseMediaLoaded = false;
  let reversePhase = "forward";

  const reverseActivePair = () => (reversePhase === "forward" ? reverseForwardPair : reverseReversePair);
  const reverseIdlePair = () => (reversePhase === "forward" ? reverseReversePair : reverseForwardPair);
  const reversePhaseMaster = () => (reversePhase === "forward" ? reverseBySlot.forward_action : reverseBySlot.reverse_action);

  const markReversePhase = () => {
    reversePhasePanels.forEach((panel) => {
      panel.classList.toggle("is-idle", panel.dataset.reversePhase !== reversePhase);
    });
  };

  const startReversePhase = (phase) => {
    reversePhase = phase;
    markReversePhase();
    reverseIdlePair().forEach((video) => {
      video.pause();
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      video.currentTime = phase === "reverse" ? Math.max(0, video.duration - 0.05) : 0;
    });
    reverseActivePair().forEach((video) => { video.currentTime = 0; });
    if (userPaused || !reverseVisible || document.hidden) return;
    reverseActivePair().forEach((video) => video.play().catch(() => {}));
  };

  const playReverseVideos = () => {
    if (userPaused || !reverseVisible || document.hidden) return;
    reverseActivePair().forEach((video) => video.play().catch(() => {}));
  };
  const pauseReverseVideos = () => reverseVideos.forEach((video) => video.pause());

  const showReverseTask = (index, immediate = false) => {
    const normalizedIndex = (index + reverseTasks.length) % reverseTasks.length;
    const task = reverseTasks[normalizedIndex];
    loader.cancel();
    reverseIndex = normalizedIndex;
    reversePhase = "forward";
    markReversePhase();
    pauseReverseVideos();
    if (!immediate) reverseStage.classList.add("is-changing");

    reverseTaskName.textContent = task.instruction;
    reverseDataset.textContent = `${task.dataset} · Bidirectional motion`;
    reverseCounter.textContent = `${normalizedIndex + 1} / ${reverseTasks.length}`;
    reverseTaskButtons.forEach((button, buttonIndex) => {
      const active = buttonIndex === normalizedIndex;
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
      button.className = active
        ? "reverse-task-tab shrink-0 rounded-full border border-zinc-900 bg-ink px-3 py-1.5 text-[11px] font-medium text-white"
        : "reverse-task-tab shrink-0 rounded-full border border-transparent px-3 py-1.5 text-[11px] font-medium text-mute hover:bg-zinc-50 hover:text-ink";
    });

    reverseVideos.forEach((video) => {
      const slot = video.dataset.reverseVideo;
      const stem = `ood_reverse_${task.stem}_${slot}`;
      const direction = slot.startsWith("forward") ? "forward" : "reverse";
      const content = slot.endsWith("action") ? "rendered action" : "World-Sim 1.0 prediction";
      video.loop = false;
      video.setAttribute("aria-label", `${task.label}: ${direction} ${content}`);
      video.poster = `assets/posters/${stem}.jpg`;
    });
    if (!reverseVisible) {
      reverseStage.classList.remove("is-changing");
      return;
    }
    reverseMediaLoaded = true;

    const markLoaded = () => {
      reverseVideos.forEach((video) => { video.currentTime = 0; });
      reverseStage.classList.remove("is-changing");
      startReversePhase("forward");
    };
    loader.load((video) => {
      const slot = video.dataset.reverseVideo;
      video.src = `assets/videos/ood_reverse_${task.stem}_${slot}.mp4`;
    }, markLoaded, () => {
      reverseStage.classList.remove("is-changing");
      startReversePhase("forward");
    });
  };

  reverseTaskButtons.forEach((button) => {
    button.addEventListener("click", () => showReverseTask(Number(button.dataset.reverseTask)));
  });
  document.getElementById("reverse-prev").addEventListener("click", () => showReverseTask(reverseIndex - 1));
  document.getElementById("reverse-next").addEventListener("click", () => showReverseTask(reverseIndex + 1));
  reverseGallery.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showReverseTask(reverseIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  reverseVideos.forEach((video) => {
    video.addEventListener("ended", () => {
      if (userPaused || !reverseVisible || !video.dataset.reverseVideo.endsWith("_action")) return;
      if (reversePhase === "forward" && video.dataset.reverseVideo === "forward_action") startReversePhase("reverse");
      else if (reversePhase === "reverse" && video.dataset.reverseVideo === "reverse_action") startReversePhase("forward");
    });
    video.addEventListener("timeupdate", () => {
      const master = reversePhaseMaster();
      if (video !== master) return;
      if (!Number.isFinite(master.duration) || master.duration <= 0) return;
      const progress = master.currentTime / master.duration;
      reverseActivePair().forEach((other) => {
        if (other === master || other.readyState < 1 || !Number.isFinite(other.duration)) return;
        const targetTime = Math.min(progress * other.duration, Math.max(0, other.duration - 0.05));
        if (Math.abs(other.currentTime - targetTime) > 0.12) other.currentTime = targetTime;
      });
    });
  });

  const reverseObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      reverseVisible = entry.isIntersecting;
      if (reverseVisible && !reverseMediaLoaded) showReverseTask(reverseIndex, true);
      else if (reverseVisible) playReverseVideos();
      else pauseReverseVideos();
    });
  }, { threshold: 0.2 });
  reverseObserver.observe(reverseGallery);
  showReverseTask(0, true);

  return {
    play: playReverseVideos,
    pause: pauseReverseVideos,
    setUserPaused(paused) {
      userPaused = paused;
      if (paused) pauseReverseVideos();
      else playReverseVideos();
    },
    restart() { startReversePhase("forward"); },
    activate() {
      reverseVisible = true;
      if (!reverseMediaLoaded) showReverseTask(reverseIndex, true);
      else playReverseVideos();
    },
    release() {
      reverseVisible = false;
      if (!reverseMediaLoaded) return;
      reverseMediaLoaded = false;
      loader.cancel();
      releaseMedia(reverseVideos);
    },
  };
}
