import { viewpointTasks, embodimentTasks, objectTasks } from "./demo-data.js";
import { createVideoGallery } from "./video-gallery.js";
import { initOverview } from "./overview.js";
import { initReverseGallery } from "./reverse-gallery.js";
import { initStandaloneVideos } from "./media.js";
import { initPageUI } from "./page-ui.js";
import { enableTabKeyboard } from "./tab-keyboard.js";

const mediaPaths = (stem, label) => ({
  src: `assets/videos/${stem}.mp4`,
  poster: `assets/posters/${stem}.jpg`,
  label,
});

initPageUI();
const sceneSetTabs = [...document.querySelectorAll("[data-scene-set]")];
sceneSetTabs.forEach(button => button.addEventListener("click", () => {
  sceneSetTabs.forEach(tab => {
    const active = tab === button;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    panel.classList.toggle("hidden", !active);
    if (!active) panel.querySelectorAll("video").forEach(video => video.pause());
  });
}));
enableTabKeyboard(sceneSetTabs);
const overview = initOverview();
const galleries = {
  viewpoint: createVideoGallery({
    id: "viewpoint", tasks: viewpointTasks, matchDuration: true,
    getMedia: (task, slot) => mediaPaths(`ood_view_${task.stem}_${slot}`,
      slot === "reference" ? "reference camera rollout" : `novel camera ${slot.replace("view", "view ")}`),
  }),
  embodiment: createVideoGallery({
    id: "embodiment", tasks: embodimentTasks, sync: "time",
    getMedia: (task, slot) => mediaPaths(`ood_embodiment_${task.stem}_${slot}`,
      slot === "reference" ? "Panda reference RGB" : slot === "action" ? "Panda rendered action" : `${slot.toUpperCase()} prediction`),
  }),
  object: createVideoGallery({
    id: "object", tasks: objectTasks,
    getMedia: (task, slot) => ({
      src: `assets/videos/multi_obj/${slot === "reference" ? "original_objects" : task.source}.mp4`,
      poster: `assets/posters/ood_object_${slot === "reference" ? "reference" : task.stem}.jpg`,
      label: slot === "reference" ? "original-object reference rollout" : `${task.label} object-variation rollout`,
    }),
  }),
  reverse: initReverseGallery(),
};

const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];
tabs.forEach(button => button.addEventListener("click", () => {
  tabs.forEach(tab => {
    const active = tab === button;
    tab.classList.toggle("bg-ink", active);
    tab.classList.toggle("text-white", active);
    tab.classList.toggle("text-mute", !active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panels.forEach(panel => panel.classList.toggle("hidden", panel.id !== `panel-${button.dataset.tab}`));
  Object.entries(galleries).forEach(([id, gallery]) => {
    if (id === button.dataset.tab) gallery.activate();
    else gallery.release();
  });
}));
enableTabKeyboard(tabs);

const players = [overview, ...Object.values(galleries), initStandaloneVideos()];
document.addEventListener("visibilitychange", () => {
  players.forEach(player => document.hidden ? player.pause() : player.play());
});

