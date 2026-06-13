// Navigation, scroll-spy, lightbox, footer year.
(() => {
  /* ---- Mobile nav toggle ---- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Scroll-spy ---- */
  const navAnchors = [...document.querySelectorAll('.nav__links a')];
  const map = new Map(navAnchors.map((a) => [a.getAttribute('href').slice(1), a]));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        navAnchors.forEach((a) => a.classList.remove('active'));
        const a = map.get(en.target.id);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach((s) => obs.observe(s));

  /* ---- Lightbox ---- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCap');
  const lbClose = document.getElementById('lightboxClose');
  if (lb) {
    document.querySelectorAll('.gallery__item').forEach((item) => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('data-src');
        lbImg.innerHTML = src
          ? `<img src="${src}" alt="" style="max-width:80vw;max-height:75vh;border-radius:12px">`
          : '🖼️';
        lbCap.textContent = item.getAttribute('data-caption') || '';
        lb.hidden = false;
      });
    });
    const close = () => { lb.hidden = true; };
    lbClose.addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ---- Footer year ---- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
