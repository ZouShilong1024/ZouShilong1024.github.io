// Count one page load; never poll the counting endpoint (polling inflates views).
(() => {
  const status = document.getElementById('visit-counter-status');
  const value = document.getElementById('busuanzi_value_page_pv');
  if (!status || !value) return;
  // Keep localhost, file previews and alternate build paths out of public counts.
  if (location.hostname !== 'zoushilong1024.github.io' ||
      !/^\/Pelican-Sim1\.0\/(?:index\.html)?$/.test(location.pathname)) {
    status.textContent = 'Available on the live website';
    return;
  }
  const unavailable = () => { status.textContent = 'Temporarily unavailable'; };
  const timer = setTimeout(unavailable, 10000);
  const observer = new MutationObserver(() => {
    if (/^\d+$/.test(value.textContent.trim())) {
      clearTimeout(timer);
      status.hidden = true;
      observer.disconnect();
    }
  });
  observer.observe(value, { childList: true, characterData: true, subtree: true });
  const script = document.createElement('script');
  script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
  script.async = true;
  script.referrerPolicy = 'no-referrer-when-downgrade';
  script.onerror = () => {
    clearTimeout(timer);
    observer.disconnect();
    unavailable();
  };
  document.head.appendChild(script);
})();
