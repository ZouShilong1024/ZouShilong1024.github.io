document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('about');
  const content = document.querySelector('.reading-content');
  const photoStrip = document.getElementById('photo-strip-bar');
  const navigation = document.querySelector('.section-navigation');
  const visitorSection = document.getElementById('visitors');
  const menuToggle = document.querySelector('.section-menu-toggle');
  const sectionLinks = [...document.querySelectorAll('.section-nav-link')];
  const sections = sectionLinks.map(link => ({link, section: document.querySelector(link.getAttribute('href'))}));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.textContent = '↑';
  backToTop.setAttribute('aria-label', 'Back to personal introduction');
  backToTop.addEventListener('click', () => hero.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth'}));
  document.body.appendChild(backToTop);

  function updateNavigationOffset() {
    const offset = navigation.getBoundingClientRect().height + 24;
    content.style.setProperty('--section-offset', `${offset}px`);
    return offset;
  }
  menuToggle.addEventListener('click', () => {
    const expanded = navigation.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(expanded));
    updateNavigationOffset();
  });
  sectionLinks.forEach(link => link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    updateNavigationOffset();
  }));

  let framePending = false;
  function updateScrollState() {
    framePending = false;
    const inContent = hero.getBoundingClientRect().bottom <= 0;
    document.documentElement.classList.toggle('reading-mode', inContent);
    backToTop.classList.toggle('show', inContent);
    photoStrip.inert = !inContent;

    // Give the visitor map and footer their own reading area without the chapter bar.
    const viewingVisitors = visitorSection.getBoundingClientRect().top <= window.innerHeight * .65;
    navigation.classList.toggle('is-at-visitors', viewingVisitors);
    navigation.inert = viewingVisitors;

    const boundary = updateNavigationOffset() + 2;
    let active = null;
    for (const item of sections) {
      if (item.section.getBoundingClientRect().top <= boundary) active = item;
    }
    sections.forEach(item => {
      const selected = inContent && item === active;
      item.link.classList.toggle('active', selected);
      if (selected) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
  }
  function scheduleScrollState() {
    if (!framePending) {
      framePending = true;
      window.requestAnimationFrame(updateScrollState);
    }
  }
  window.addEventListener('scroll', scheduleScrollState, {passive: true});
  window.addEventListener('resize', scheduleScrollState);
  window.addEventListener('pageshow', scheduleScrollState);
  // Also covers additional biography copy or images that change the hero's height.
  if ('ResizeObserver' in window) {
    const layoutObserver = new ResizeObserver(scheduleScrollState);
    layoutObserver.observe(hero);
    layoutObserver.observe(navigation);
  }
  updateScrollState();

  document.getElementById('photo-strip-close').addEventListener('click', () => {
    document.documentElement.classList.add('photo-strip-off');
  });

  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(({target: video, isIntersecting}) => {
      if (isIntersecting) {
        if (video.dataset.src && !video.getAttribute('src')) video.src = video.dataset.src;
        video.loop = true;
        const playback = video.play();
        if (playback) playback.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, {threshold: .1});
  content.querySelectorAll('video[data-src]').forEach(video => videoObserver.observe(video));
});
