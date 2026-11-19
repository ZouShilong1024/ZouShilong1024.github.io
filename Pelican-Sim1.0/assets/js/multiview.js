const section = document.getElementById('robodojo-multiview');
if (section) {
  const dialog = section.querySelector('#mv-comparison-dialog');
  const video = section.querySelector('#mv-comparison-video');
  const title = section.querySelector('#mv-dialog-title');
  const sources = new Set(['01_hold_button', '02_button_colors', '03_pick_outlier', '04_pour_liquid']);
  section.querySelectorAll('[data-mv-compare]').forEach(button => {
    button.addEventListener('click', () => {
      const stem = button.dataset.mvCompare;
      if (!sources.has(stem)) return;
      section.querySelectorAll('.mv-prediction').forEach(player => player.pause());
      title.textContent = button.dataset.mvTitle;
      video.src = `assets/videos/robodojo-multiview/${stem}_comparison.mp4`;
      video.load();
      dialog.showModal();
      video.play().catch(() => {});
    });
  });
  section.querySelector('.mv-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
}
