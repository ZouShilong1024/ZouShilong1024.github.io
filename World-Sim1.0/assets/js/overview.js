import { createMediaLoader } from "./media.js";
import { overviewDatasets } from "./demo-data.js";

export function initOverview() {
  const overviewStreamLabels = {
    observation: "Ground-truth",
    action: "Rendered action",
    prediction: "Prediction",
  };
  const overviewCarousel = document.getElementById("overview-carousel");
  const overviewStage = document.getElementById("overview-stage");
  const primaryVideos = [...document.querySelectorAll("[data-overview-stream]")];
  const secondaryVideos = [...document.querySelectorAll("[data-overview-second]")];
  const overviewVideos = [...primaryVideos, ...secondaryVideos];
  const overviewTabs = document.getElementById("overview-dataset-tabs");
  const overviewName = document.getElementById("overview-dataset-name");
  const overviewDomain = document.getElementById("overview-dataset-domain");
  const overviewCounter = document.getElementById("overview-counter");
  let overviewIndex = 0;
  let overviewVisible = false;
  let userPaused = false;
  const loader = createMediaLoader(overviewVideos);

  overviewDatasets.forEach((dataset, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "overview-dataset-tab shrink-0 rounded-full border border-transparent px-3 py-1.5 text-[11px] font-medium text-mute hover:bg-zinc-50 hover:text-ink";
    button.textContent = dataset.name;
    button.dataset.overviewIndex = index;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", "false");
    button.addEventListener("click", () => showOverviewDataset(index));
    overviewTabs.appendChild(button);
  });
  const overviewDatasetButtons = [...overviewTabs.children];

  const playOverviewVideos = () => {
    if (userPaused || !overviewVisible || document.hidden) return;
    overviewVideos.forEach((video) => video.play().catch(() => {}));
  };
  const pauseOverviewVideos = () => overviewVideos.forEach((video) => video.pause());

  const showOverviewDataset = (index, immediate = false) => {
    const normalizedIndex = (index + overviewDatasets.length) % overviewDatasets.length;
    const dataset = overviewDatasets[normalizedIndex];
    loader.cancel();
    overviewIndex = normalizedIndex;
    pauseOverviewVideos();
    if (!immediate) overviewStage.classList.add("is-changing");

    overviewName.textContent = dataset.name;
    overviewCounter.textContent = `${normalizedIndex + 1} / ${overviewDatasets.length}`;
    overviewDomain.textContent = dataset.domain;
    overviewDomain.className = dataset.domain === "Real"
      ? "shrink-0 rounded-full bg-cond/10 px-2 py-0.5 text-[10px] font-medium text-cond"
      : "shrink-0 rounded-full bg-act/10 px-2 py-0.5 text-[10px] font-medium text-act";

    overviewDatasetButtons.forEach((button, buttonIndex) => {
      const active = buttonIndex === normalizedIndex;
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
      button.className = active
        ? "overview-dataset-tab shrink-0 rounded-full border border-zinc-900 bg-ink px-3 py-1.5 text-[11px] font-medium text-white"
        : "overview-dataset-tab shrink-0 rounded-full border border-transparent px-3 py-1.5 text-[11px] font-medium text-mute hover:bg-zinc-50 hover:text-ink";
      if (active && !immediate) {
        const targetLeft = button.offsetLeft - (overviewTabs.clientWidth - button.offsetWidth) / 2;
        overviewTabs.scrollTo({ left: targetLeft, behavior: "smooth" });
      }
    });

    const markLoaded = () => {
      overviewVideos.forEach((video) => { video.currentTime = 0; });
      overviewStage.classList.remove("is-changing");
      playOverviewVideos();
    };
    loader.load((video) => {
      const stream = video.dataset.overviewStream ?? video.dataset.overviewSecond;
      const stem = video.dataset.overviewSecond ? `${dataset.secondStem}_${stream}` : `overview_${dataset.id}_${stream}`;
      video.setAttribute("aria-label", `${dataset.name} ${overviewStreamLabels[stream]} video`);
      video.poster = `assets/posters/${stem}.jpg`;
      video.src = `assets/videos/${stem}.mp4`;
    }, markLoaded, () => {
      overviewStage.classList.remove("is-changing");
      playOverviewVideos();
    });
  };

  const shiftOverviewDataset = (step) => showOverviewDataset(overviewIndex + step);
  document.getElementById("overview-prev").addEventListener("click", () => shiftOverviewDataset(-1));
  document.getElementById("overview-next").addEventListener("click", () => shiftOverviewDataset(1));
  overviewCarousel.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    shiftOverviewDataset(event.key === "ArrowRight" ? 1 : -1);
  });

  let overviewTouchStart = null;
  overviewStage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    overviewTouchStart = { x: event.clientX, y: event.clientY };
  });
  overviewStage.addEventListener("pointerup", (event) => {
    if (!overviewTouchStart) return;
    const distanceX = event.clientX - overviewTouchStart.x;
    const distanceY = event.clientY - overviewTouchStart.y;
    overviewTouchStart = null;
    if (Math.abs(distanceX) > 50 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) {
      shiftOverviewDataset(distanceX < 0 ? 1 : -1);
    }
  });
  overviewStage.addEventListener("pointercancel", () => { overviewTouchStart = null; });

  // Each task synchronizes to its own reference, since rows may differ in length.
  [primaryVideos, secondaryVideos].forEach(row => {
    const master = row[0];
    if (!master) return;
    master.addEventListener("timeupdate", () => {
      row.slice(1).forEach(video => {
        if (video.readyState >= 1 && Math.abs(video.currentTime - master.currentTime) > .12) video.currentTime = master.currentTime;
      });
    });
    master.addEventListener("play", () => {
      if (userPaused || !overviewVisible || document.hidden) { pauseOverviewVideos(); return; }
      row.slice(1).forEach(video => video.play().catch(() => {}));
    });
    master.addEventListener("pause", () => row.slice(1).forEach(video => video.pause()));
  });

  const overviewObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      overviewVisible = entry.isIntersecting;
      if (overviewVisible) playOverviewVideos();
      else pauseOverviewVideos();
    });
  }, { threshold: 0.35 });
  overviewObserver.observe(overviewCarousel);
  showOverviewDataset(0, true);

  return {
    play: playOverviewVideos,
    pause: pauseOverviewVideos,
    setUserPaused(paused) {
      userPaused = paused;
      if (paused) pauseOverviewVideos();
      else playOverviewVideos();
    },
    restart() {
      overviewVideos.forEach(video => { video.currentTime = 0; });
      playOverviewVideos();
    },
  };
}
