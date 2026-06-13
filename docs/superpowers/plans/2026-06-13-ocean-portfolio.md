# Ocean Portfolio (Calon Guru SD) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, ocean-themed (deep-but-cute) portfolio website for an elementary school teacher (PGSD) job application, with lively interactive canvas animations, in pure HTML/CSS/JS.

**Architecture:** One `index.html` with 6 anchored sections. A fixed full-screen `<canvas>` renders cute sea creatures + bubbles behind frosted-glass content cards. CSS handles the depth gradient, light rays, layout, and a friendly SVG mascot. A small `main.js` wires navigation/scroll-spy/lightbox; `ocean.js` is the self-contained animation engine. No build step; deployable as static files.

**Tech Stack:** HTML5, CSS3 (custom properties, `clamp()`, `backdrop-filter`), vanilla JS (Canvas 2D, `requestAnimationFrame`, `IntersectionObserver`), Google Fonts (Fredoka + Nunito). Verified with a local `python3 -m http.server` + Playwright screenshots.

**Spec:** `docs/superpowers/specs/2026-06-13-ocean-portfolio-design.md`

---

## Conventions (read once)

- **Palette (CSS variables in `:root`):**
  - `--deep-1:#0a1a2f` (surface-ish, top), `--deep-2:#06182b`, `--deep-3:#041220` (abyss, bottom)
  - `--coral:#ff7e9d`, `--sun:#ffd56b`, `--glow:#5fe0d8`, `--jelly:#9b8cff`
  - `--ink:#f4f9ff` (primary text), `--ink-soft:#a9c2d9` (secondary text)
  - `--card:rgba(255,255,255,0.07)`, `--card-border:rgba(255,255,255,0.14)`
- **Fonts:** headings `'Fredoka', sans-serif`; body `'Nunito', sans-serif`.
- **Section ids:** `home`, `about`, `journey`, `skills`, `works`, `contact`.
- **Z-index layers:** canvas `0`, light-ray overlay `1`, content `2`, nav `10`, lightbox `100`.
- **Verification loop (used by most tasks):** start a static server once with
  `python3 -m http.server 5500 --directory /home/probersama/ocean-portfolio` (run in background),
  then drive Playwright: `browser_navigate` to `http://localhost:5500`, `browser_console_messages` (expect no errors), `browser_take_screenshot`. Reuse the same server across tasks; only restart if it died.
- **Commit after every task.** Repo already initialised at `/home/probersama/ocean-portfolio` (git user/email configured).

---

## File Structure

- `index.html` — all sections, inline SVG mascot, `<link>` to fonts/css, `<script>` to js.
- `css/style.css` — variables, reset, layout, sections, frosted cards, nav, light rays, mascot animation, responsive, reduced-motion.
- `js/ocean.js` — canvas engine: setup, DPR/resize, RAF loop, creatures, bubbles, cursor/click interactivity, FPS auto-throttle, visibility pause, reduced-motion guard. Exposes nothing globally except an init on `DOMContentLoaded`.
- `js/main.js` — mobile nav toggle, scroll-spy (IntersectionObserver), gallery lightbox, smooth-scroll for nav links.
- `assets/favicon.svg` — cute fish favicon.
- `assets/img/.gitkeep` — placeholder folder for user photos/gallery (images use inline SVG/CSS placeholders in-page so layout is stable without real files).
- `assets/cv/.gitkeep` — placeholder folder; "Download CV" links to `assets/cv/CV.pdf` (user adds later).
- `README.md` — how to edit content + how to run/deploy + SSH port-forward preview note.

---

## Task 1: Project scaffold + base styles + favicon + serve

**Files:**
- Create: `index.html`, `css/style.css`, `js/ocean.js`, `js/main.js`, `assets/favicon.svg`, `assets/img/.gitkeep`, `assets/cv/.gitkeep`

- [ ] **Step 1: Create `assets/favicon.svg`** — a simple cute fish on transparent bg:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <g>
    <ellipse cx="28" cy="32" rx="18" ry="12" fill="#ff7e9d"/>
    <polygon points="44,32 60,22 60,42" fill="#ff7e9d"/>
    <circle cx="20" cy="28" r="3" fill="#041220"/>
    <circle cx="21" cy="27" r="1" fill="#fff"/>
  </g>
</svg>
```

- [ ] **Step 2: Create `index.html` skeleton** with head (charset, viewport, title "Nama Lengkap — Calon Guru SD", description meta, favicon link, Google Fonts preconnect + Fredoka/Nunito, css link), a `<canvas id="ocean-canvas">`, a `<div class="light-rays" aria-hidden="true"></div>`, an empty `<nav>`, a `<main>` with six empty `<section id="...">` placeholders (home/about/journey/skills/works/contact), and `<script src="js/ocean.js" defer>` + `<script src="js/main.js" defer>` before `</body>`.

- [ ] **Step 3: Create `css/style.css`** with: `:root` palette + font vars (per Conventions), a minimal reset (`*{box-sizing:border-box;margin:0}`), `html{scroll-behavior:smooth}`, `body{font-family:var(--font-body);color:var(--ink);background:linear-gradient(180deg,var(--deep-1),var(--deep-2) 45%,var(--deep-3));min-height:100vh}`, canvas style `#ocean-canvas{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}`, and `main{position:relative;z-index:2}`.

- [ ] **Step 4: Create empty `js/ocean.js` and `js/main.js`** each with a single `// placeholder` comment (filled in later tasks).

- [ ] **Step 5: Start the static server (background)** and verify:

Run: `python3 -m http.server 5500 --directory /home/probersama/ocean-portfolio` (background)
Then Playwright: navigate `http://localhost:5500`, `browser_console_messages` (Expected: no errors), `browser_take_screenshot`.
Expected: a dark blue gradient page, no console errors, favicon loads (no 404).

- [ ] **Step 6: Commit**

```bash
cd /home/probersama/ocean-portfolio
git add -A && git commit -m "feat: scaffold ocean portfolio (html/css/js shell, favicon)"
```

---

## Task 2: Ocean ambient background (depth gradient already set + light rays)

**Files:** Modify `css/style.css`

- [ ] **Step 1: Add animated light rays.** Append to `style.css`:

```css
.light-rays{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;opacity:.5}
.light-rays::before,.light-rays::after{
  content:"";position:absolute;top:-20%;left:50%;width:140%;height:140%;
  background:repeating-linear-gradient(100deg,
    transparent 0 60px, rgba(95,224,216,.06) 60px 90px, transparent 90px 160px);
  transform:translateX(-50%) rotate(8deg);transform-origin:top center;
  animation:rayDrift 16s ease-in-out infinite alternate;
}
.light-rays::after{animation-duration:24s;animation-direction:alternate-reverse;opacity:.6}
@keyframes rayDrift{from{transform:translateX(-55%) rotate(6deg)}to{transform:translateX(-45%) rotate(12deg)}}
```

- [ ] **Step 2: Verify** via Playwright screenshot at `http://localhost:5500`. Expected: soft diagonal light beams drifting from the top over the blue gradient; no console errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add drifting light-ray ambient overlay"
```

---

## Task 3: Canvas engine core — setup, DPR, resize, RAF loop, bubbles, visibility pause

**Files:** Replace `js/ocean.js`

- [ ] **Step 1: Write the engine core.** Replace `js/ocean.js` with:

```js
// Ocean animation engine — cute deep-sea creatures + bubbles on one canvas.
(() => {
  const canvas = document.getElementById('ocean-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    w: 0, h: 0, dpr: 1,
    bubbles: [], creatures: [],
    pointer: { x: -999, y: -999, active: false },
    running: true,
    lastT: 0, fpsEMA: 60, throttle: 1, // throttle scales object counts 0..1
  };

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function spawnBubble(seed) {
    return {
      x: rand(0, state.w), y: seed ? rand(0, state.h) : state.h + rand(0, 40),
      r: rand(2, 6), vy: rand(20, 55), drift: rand(0.4, 1.2), phase: rand(0, Math.PI * 2),
    };
  }

  function targetCounts() {
    // scale to viewport width + throttle
    const base = Math.min(1, state.w / 1280);
    return {
      bubbles: Math.round((18 + base * 22) * state.throttle),
      creatures: Math.round((10 + base * 12) * state.throttle),
    };
  }

  function reconcileBubbles() {
    const want = targetCounts().bubbles;
    while (state.bubbles.length < want) state.bubbles.push(spawnBubble(true));
    if (state.bubbles.length > want) state.bubbles.length = want;
  }

  function updateBubble(b, dt) {
    b.y -= b.vy * dt;
    b.x += Math.sin(b.phase + b.y * 0.01) * b.drift;
    if (b.y < -10) Object.assign(b, spawnBubble(false));
  }

  function drawBubble(b) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180,230,255,0.45)';
    ctx.fillStyle = 'rgba(150,220,255,0.08)';
    ctx.fill(); ctx.stroke();
  }

  function frame(t) {
    if (!state.running) return;
    const dt = Math.min(0.05, (t - state.lastT) / 1000 || 0.016);
    state.lastT = t;
    // FPS EMA + throttle (Task 5 expands this)
    const fps = 1 / (dt || 0.016);
    state.fpsEMA = state.fpsEMA * 0.9 + fps * 0.1;

    ctx.clearRect(0, 0, state.w, state.h);
    for (const b of state.bubbles) { updateBubble(b, dt); drawBubble(b); }
    // creatures drawn in Task 4
    if (window.__oceanDrawCreatures) window.__oceanDrawCreatures(ctx, state, dt);

    requestAnimationFrame(frame);
  }

  function start() {
    resize();
    reconcileBubbles();
    if (reduceMotion) {
      // draw a single static frame, no loop
      ctx.clearRect(0, 0, state.w, state.h);
      for (const b of state.bubbles) drawBubble(b);
      if (window.__oceanDrawCreatures) window.__oceanDrawCreatures(ctx, state, 0);
      return;
    }
    state.running = true;
    state.lastT = performance.now();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => { resize(); reconcileBubbles(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { state.running = false; }
    else if (!reduceMotion) { state.running = true; state.lastT = performance.now(); requestAnimationFrame(frame); }
  });

  // expose state for later tasks (creatures/interactivity)
  window.__ocean = { state, rand };
  start();
})();
```

- [ ] **Step 2: Verify** via Playwright at `http://localhost:5500`: screenshot shows bubbles rising over the gradient; `browser_console_messages` has no errors. Resize check optional.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: canvas engine core with rising bubbles, DPR, resize, visibility pause"
```

---

## Task 4: Cute sea creatures (fish, jellyfish, octopus, turtle, whale)

**Files:** Modify `js/ocean.js`

- [ ] **Step 1: Add creature spawning + drawing.** Inside the IIFE in `ocean.js`, after `reconcileBubbles`, add a creature system and register `window.__oceanDrawCreatures`. Add this block (before `start()` is defined is fine; it references `state`/`rand` in closure):

```js
  const SPECIES = ['fish', 'fish', 'fish', 'jelly', 'octopus', 'turtle', 'whale'];
  const SP_COLOR = { fish: ['#ff7e9d','#ffd56b','#5fe0d8'], jelly:'#9b8cff', octopus:'#ff9e7d', turtle:'#7fd6a0', whale:'#8fb8ff' };

  function spawnCreature() {
    const kind = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const dir = Math.random() < 0.5 ? 1 : -1;
    const scale = kind === 'whale' ? rand(1.4, 2.0) : kind === 'jelly' ? rand(0.7, 1.1) : rand(0.6, 1.1);
    return {
      kind, dir, scale,
      x: dir === 1 ? rand(-120, -20) : state.w + rand(20, 120),
      y: rand(state.h * 0.15, state.h * 0.9),
      vx: dir * rand(18, 42) * (kind === 'whale' ? 0.6 : 1),
      vy: 0, baseY: 0, phase: rand(0, Math.PI * 2),
      color: kind === 'fish' ? SP_COLOR.fish[Math.floor(Math.random()*3)] : SP_COLOR[kind],
    };
  }

  function reconcileCreatures() {
    const want = targetCounts().creatures;
    while (state.creatures.length < want) state.creatures.push(spawnCreature());
    if (state.creatures.length > want) state.creatures.length = want;
  }

  function updateCreature(c, dt) {
    c.phase += dt * 2;
    c.x += c.vx * dt;
    c.y += Math.sin(c.phase) * 6 * dt * 10; // gentle bob
    // recycle when off-screen
    const off = 160 * c.scale;
    if ((c.dir === 1 && c.x > state.w + off) || (c.dir === -1 && c.x < -off)) {
      Object.assign(c, spawnCreature());
    }
  }

  function drawCreature(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.dir * c.scale, c.scale);
    ctx.fillStyle = c.color;
    if (c.kind === 'fish') {
      ctx.beginPath(); ctx.ellipse(0,0,14,9,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(24,-7+Math.sin(c.phase)*2); ctx.lineTo(24,7-Math.sin(c.phase)*2); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#041220'; ctx.beginPath(); ctx.arc(-7,-2,1.8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-7.6,-2.6,.7,0,Math.PI*2); ctx.fill();
    } else if (c.kind === 'jelly') {
      const sq = 1 + Math.sin(c.phase)*0.12;
      ctx.globalAlpha=.85;
      ctx.beginPath(); ctx.ellipse(0,0,12,12*sq,0,Math.PI,0); ctx.fill();
      ctx.strokeStyle=c.color; ctx.lineWidth=2; ctx.globalAlpha=.55;
      for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*3,2);ctx.quadraticCurveTo(i*3+Math.sin(c.phase+i)*3,14,i*3,22);ctx.stroke();}
    } else if (c.kind === 'octopus') {
      ctx.beginPath(); ctx.arc(0,-2,12,Math.PI,0); ctx.fill();
      ctx.fillRect(-12,-2,24,6);
      for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*3.2,4);ctx.quadraticCurveTo(i*3.2+Math.sin(c.phase+i)*4,16,i*3.2,20);ctx.lineWidth=3;ctx.strokeStyle=c.color;ctx.stroke();}
      ctx.fillStyle='#041220'; ctx.beginPath(); ctx.arc(-4,-4,1.6,0,Math.PI*2); ctx.arc(4,-4,1.6,0,Math.PI*2); ctx.fill();
    } else if (c.kind === 'turtle') {
      ctx.beginPath(); ctx.ellipse(0,0,14,10,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#5bbf88'; ctx.beginPath(); ctx.ellipse(0,0,10,7,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=c.color; ctx.beginPath(); ctx.arc(15,0,4,0,Math.PI*2); ctx.fill(); // head
      ctx.fillRect(-12,8+Math.sin(c.phase)*1,6,4); ctx.fillRect(8,8-Math.sin(c.phase)*1,6,4); // flippers
    } else if (c.kind === 'whale') {
      ctx.beginPath(); ctx.ellipse(0,0,26,15,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(24,0); ctx.lineTo(38,-10); ctx.lineTo(38,10); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#cfe0ff'; ctx.beginPath(); ctx.ellipse(-4,4,18,7,0,0,Math.PI); ctx.fill(); // belly
      ctx.fillStyle='#041220'; ctx.beginPath(); ctx.arc(-14,-3,2,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  window.__oceanDrawCreatures = (ctx2, st, dt) => {
    if (st.creatures.length === 0) reconcileCreatures();
    for (const c of st.creatures) { if (dt) updateCreature(c, dt); drawCreature(c); }
  };

  // also reconcile creatures on resize
  window.addEventListener('resize', reconcileCreatures);
```

- [ ] **Step 2: Verify** via Playwright screenshot. Expected: several cute creatures (fish/jelly/octopus/turtle/whale) drifting horizontally with bubbles; no console errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add cute sea creatures (fish, jelly, octopus, turtle, whale)"
```

---

## Task 5: Interactivity (cursor avoidance, click bubble burst) + FPS auto-throttle

**Files:** Modify `js/ocean.js`

- [ ] **Step 1: Enable pointer capture on canvas without blocking clicks.** The canvas has `pointer-events:none`, so listen on `window` instead. After `window.__ocean = {...}` (before `start()` call) add:

```js
  window.addEventListener('pointermove', (e) => { state.pointer.x = e.clientX; state.pointer.y = e.clientY; state.pointer.active = true; });
  window.addEventListener('pointerleave', () => { state.pointer.active = false; });
  window.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) state.bubbles.push({
      x: e.clientX + rand(-6,6), y: e.clientY, r: rand(1.5,4),
      vy: rand(40,90), drift: rand(0.4,1.2), phase: rand(0,Math.PI*2),
    });
  });
```

- [ ] **Step 2: Add cursor avoidance in `updateCreature`.** Insert before the recycle check in `updateCreature`:

```js
    if (state.pointer.active) {
      const dx = c.x - state.pointer.x, dy = c.y - state.pointer.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < 110*110 && d2 > 1) {
        const d = Math.sqrt(d2), f = (110 - d) / 110;
        c.x += (dx / d) * f * 60 * dt;
        c.y += (dy / d) * f * 60 * dt;
      }
    }
```

- [ ] **Step 3: Add FPS auto-throttle.** In `frame`, after updating `state.fpsEMA`, add:

```js
    if (state.fpsEMA < 30 && state.throttle > 0.4) { state.throttle -= 0.05; reconcileBubbles(); reconcileCreatures(); }
    else if (state.fpsEMA > 50 && state.throttle < 1) { state.throttle = Math.min(1, state.throttle + 0.01); }
```

(Note: `reconcileCreatures` is defined in Task 4's closure — same scope, callable here.)

- [ ] **Step 4: Verify** with Playwright: navigate, `browser_evaluate` to dispatch a click at center and confirm `window.__ocean.state.bubbles.length` increased; `browser_console_messages` clean. Screenshot.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: cursor-avoidance, click bubble burst, FPS auto-throttle"
```

---

## Task 6: Layout shell — fonts, frosted cards, sticky nav, mobile hamburger, scroll-spy

**Files:** Modify `index.html`, `css/style.css`, replace `js/main.js`

- [ ] **Step 1: Add nav markup** inside `<body>` before `<main>`:

```html
<nav class="nav" id="nav">
  <a href="#home" class="nav__brand">🐠 Nama Lengkap</a>
  <button class="nav__toggle" id="navToggle" aria-label="Buka menu" aria-expanded="false">☰</button>
  <ul class="nav__links" id="navLinks">
    <li><a href="#about">Tentang</a></li>
    <li><a href="#journey">Pendidikan &amp; Pengalaman</a></li>
    <li><a href="#skills">Kompetensi</a></li>
    <li><a href="#works">Karya</a></li>
    <li><a href="#contact">Kontak</a></li>
  </ul>
</nav>
```

- [ ] **Step 2: Add layout + nav + card CSS** to `style.css`:

```css
:root{--maxw:1100px}
.section{position:relative;max-width:var(--maxw);margin:0 auto;padding:clamp(56px,9vw,120px) 20px}
.section__title{font-family:var(--font-head);font-size:clamp(1.6rem,4vw,2.6rem);margin-bottom:.4em}
.card{background:var(--card);border:1px solid var(--card-border);border-radius:20px;
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:clamp(18px,3vw,30px);
  box-shadow:0 8px 30px rgba(0,0,0,.25)}
h1,h2,h3{font-family:var(--font-head);line-height:1.15}
a{color:var(--glow)}
.nav{position:fixed;top:0;left:0;right:0;z-index:10;display:flex;align-items:center;justify-content:space-between;
  padding:12px clamp(16px,4vw,40px);background:rgba(4,18,32,.55);backdrop-filter:blur(8px)}
.nav__brand{font-family:var(--font-head);font-weight:600;color:var(--ink);text-decoration:none}
.nav__links{display:flex;gap:18px;list-style:none}
.nav__links a{color:var(--ink-soft);text-decoration:none;font-weight:600;transition:color .2s}
.nav__links a:hover,.nav__links a.active{color:var(--glow)}
.nav__toggle{display:none;background:none;border:0;color:var(--ink);font-size:1.5rem;cursor:pointer}
@media(max-width:760px){
  .nav__toggle{display:block}
  .nav__links{position:absolute;top:100%;right:0;flex-direction:column;background:rgba(4,18,32,.95);
    padding:16px 24px;gap:14px;border-bottom-left-radius:16px;transform:translateY(-150%);transition:transform .3s;}
  .nav__links.open{transform:translateY(0)}
}
```

- [ ] **Step 3: Replace `js/main.js`** with nav toggle + scroll-spy + smooth close:

```js
(() => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e) => { if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); } });
  }
  // scroll-spy
  const navAnchors = [...document.querySelectorAll('.nav__links a')];
  const map = new Map(navAnchors.map(a => [a.getAttribute('href').slice(1), a]));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const a = map.get(en.target.id); if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(s => obs.observe(s));
})();
```

- [ ] **Step 4: Verify** Playwright: nav fixed at top; resize to 400px width via `browser_resize`, click `#navToggle`, confirm `#navLinks` gets `open`; console clean. Screenshot desktop + mobile.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: layout shell, sticky nav, mobile hamburger, scroll-spy, frosted cards"
```

---

## Task 7: Hero section + friendly SVG mascot

**Files:** Modify `index.html`, `css/style.css`

- [ ] **Step 1: Fill `#home`** in `index.html`:

```html
<section id="home" class="section hero">
  <div class="hero__inner card">
    <div class="hero__mascot" aria-hidden="true">
      <svg viewBox="0 0 120 120" width="120" height="120">
        <ellipse cx="55" cy="60" rx="34" ry="24" fill="#ff7e9d"/>
        <polygon points="86,60 116,44 116,76" fill="#ff7e9d"/>
        <circle cx="42" cy="52" r="6" fill="#041220"/><circle cx="40" cy="50" r="2" fill="#fff"/>
        <path d="M34 70 q10 8 22 0" stroke="#041220" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </div>
    <p class="hero__hi">Halo, perkenalkan 👋</p>
    <h1 class="hero__name">Nama Lengkap</h1>
    <p class="hero__role">Calon Guru Sekolah Dasar</p>
    <p class="hero__tag">"Setiap anak adalah samudra potensi — tugas saya membantu mereka berani menyelam." <em>(ganti dengan filosofi mengajarmu)</em></p>
    <div class="hero__cta">
      <a class="btn btn--primary" href="assets/cv/CV.pdf" download>⬇ Download CV</a>
      <a class="btn btn--ghost" href="#contact">Hubungi Saya</a>
    </div>
  </div>
  <div class="scroll-hint" aria-hidden="true">Scroll buat menyelam 🤿</div>
</section>
```

- [ ] **Step 2: Add hero + button + mascot CSS** to `style.css`:

```css
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.hero__inner{max-width:680px}
.hero__mascot{display:flex;justify-content:center;margin-bottom:10px;animation:bob 4s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
.hero__hi{color:var(--ink-soft)}
.hero__name{font-size:clamp(2rem,7vw,3.6rem);color:var(--ink)}
.hero__role{color:var(--glow);font-weight:700;font-size:clamp(1rem,3vw,1.4rem);margin:.2em 0 1em}
.hero__tag{color:var(--ink-soft);max-width:46ch;margin:0 auto 1.4em}
.hero__tag em{opacity:.6;font-size:.85em}
.hero__cta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.btn{display:inline-block;padding:12px 22px;border-radius:999px;font-weight:700;text-decoration:none;transition:transform .15s,box-shadow .2s}
.btn:hover{transform:translateY(-2px)}
.btn--primary{background:var(--coral);color:#2a0a16;box-shadow:0 6px 20px rgba(255,126,157,.4)}
.btn--ghost{background:transparent;color:var(--ink);border:1px solid var(--card-border)}
.scroll-hint{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);color:var(--ink-soft);animation:bob 3s ease-in-out infinite}
```

- [ ] **Step 2b:** In `index.html` head, set the matching title/description text (e.g. title `Nama Lengkap — Calon Guru SD`).

- [ ] **Step 3: Verify** Playwright screenshot at top of page: mascot bobbing, name/role/CTA visible and readable over the ocean; console clean.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: hero section with mascot, CTA buttons, scroll hint"
```

---

## Task 8: About section

**Files:** Modify `index.html`

- [ ] **Step 1: Fill `#about`:**

```html
<section id="about" class="section">
  <h2 class="section__title">Tentang Saya 🐚</h2>
  <div class="about card">
    <div class="about__photo" aria-hidden="true">
      <!-- ganti dengan <img src="assets/img/foto.jpg" alt="Foto Nama Lengkap"> -->
      <span>Foto kamu di sini</span>
    </div>
    <div class="about__text">
      <p>Halo! Saya <strong>Nama Lengkap</strong>, lulusan S1 PGSD [Nama Universitas]. [Tulis 2–3 kalimat tentang dirimu: kenapa memilih jadi guru SD, pendekatan mengajarmu, dan apa yang kamu sukai dari anak-anak.]</p>
      <div class="about__philos">
        <h3>Filosofi Mengajar</h3>
        <p>[Tulis 1–2 kalimat filosofi mengajarmu, mis. "Saya percaya belajar paling efektif saat menyenangkan dan bermakna."]</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add About CSS** to `style.css`:

```css
.about{display:grid;grid-template-columns:220px 1fr;gap:28px;align-items:start}
.about__photo{aspect-ratio:1;border-radius:18px;background:linear-gradient(135deg,var(--jelly),var(--glow));
  display:flex;align-items:center;justify-content:center;color:#041220;font-weight:700;text-align:center;padding:10px}
.about__text p{color:var(--ink-soft);line-height:1.7;margin-bottom:1em}
.about__philos{border-left:3px solid var(--coral);padding-left:16px;background:rgba(255,126,157,.06);border-radius:0 12px 12px 0;padding:14px 16px}
.about__philos h3{color:var(--coral);margin-bottom:.3em}
@media(max-width:680px){.about{grid-template-columns:1fr}.about__photo{max-width:200px;margin:0 auto}}
```

- [ ] **Step 3: Verify** Playwright screenshot of About; readable; console clean.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: about section with photo placeholder + teaching philosophy"
```

---

## Task 9: Pendidikan & Pengalaman timeline (`#journey`)

**Files:** Modify `index.html`, `css/style.css`

- [ ] **Step 1: Fill `#journey`** with a vertical "diving" timeline (4 placeholder items):

```html
<section id="journey" class="section">
  <h2 class="section__title">Pendidikan &amp; Pengalaman 🐢</h2>
  <ol class="timeline">
    <li class="timeline__item card">
      <span class="timeline__year">2021 — 2025</span>
      <h3>S1 Pendidikan Guru Sekolah Dasar</h3>
      <p class="timeline__where">[Nama Universitas] · IPK [x.xx]</p>
      <p>[Fokus studi / pencapaian akademik singkat.]</p>
    </li>
    <li class="timeline__item card">
      <span class="timeline__year">2024</span>
      <h3>PPL / Magang Mengajar</h3>
      <p class="timeline__where">[Nama SD]</p>
      <p>[Apa yang kamu ajarkan, kelas berapa, hasil/refleksi singkat.]</p>
    </li>
    <li class="timeline__item card">
      <span class="timeline__year">2023 — Sekarang</span>
      <h3>Pengajar Les / Bimbel</h3>
      <p class="timeline__where">[Tempat / privat]</p>
      <p>[Mata pelajaran, jumlah murid, pendekatan.]</p>
    </li>
    <li class="timeline__item card">
      <span class="timeline__year">2022</span>
      <h3>Relawan Mengajar</h3>
      <p class="timeline__where">[Komunitas/kegiatan]</p>
      <p>[Peran & dampak.]</p>
    </li>
  </ol>
</section>
```

- [ ] **Step 2: Add timeline CSS:**

```css
.timeline{list-style:none;position:relative;margin-left:14px;padding-left:26px}
.timeline::before{content:"";position:absolute;left:0;top:6px;bottom:6px;width:2px;background:linear-gradient(var(--glow),var(--jelly))}
.timeline__item{position:relative;margin-bottom:22px}
.timeline__item::before{content:"";position:absolute;left:-33px;top:22px;width:12px;height:12px;border-radius:50%;background:var(--glow);box-shadow:0 0 0 4px rgba(95,224,216,.2)}
.timeline__year{display:inline-block;color:var(--sun);font-weight:700;font-size:.85rem;margin-bottom:.3em}
.timeline__where{color:var(--ink-soft);font-style:italic;margin-bottom:.5em}
.timeline__item p:last-child{color:var(--ink-soft);line-height:1.6}
```

- [ ] **Step 3: Verify** Playwright screenshot; timeline dots/line render; console clean.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: education & teaching-experience diving timeline"
```

---

## Task 10: Kompetensi & Keahlian (`#skills`)

**Files:** Modify `index.html`, `css/style.css`

- [ ] **Step 1: Fill `#skills`** as bubble/coral chips grouped:

```html
<section id="skills" class="section">
  <h2 class="section__title">Kompetensi &amp; Keahlian 🪸</h2>
  <div class="skills-grid">
    <div class="card skillcard">
      <h3>Mengajar &amp; Kurikulum</h3>
      <ul class="chips"><li>Kurikulum Merdeka</li><li>Penyusunan RPP / Modul Ajar</li><li>Manajemen Kelas</li><li>Asesmen Pembelajaran</li></ul>
    </div>
    <div class="card skillcard">
      <h3>Media &amp; Teknologi</h3>
      <ul class="chips"><li>Media Pembelajaran Interaktif</li><li>Canva</li><li>PowerPoint</li><li>Pembelajaran Berbasis Permainan</li></ul>
    </div>
    <div class="card skillcard">
      <h3>Soft Skill</h3>
      <ul class="chips"><li>Sabar &amp; Telaten</li><li>Komunikatif</li><li>Kreatif</li><li>Empati pada Anak</li></ul>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add skills CSS:**

```css
.skills-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
.skillcard h3{color:var(--glow);margin-bottom:.7em}
.chips{list-style:none;display:flex;flex-wrap:wrap;gap:10px}
.chips li{background:rgba(95,224,216,.12);border:1px solid rgba(95,224,216,.3);color:var(--ink);
  padding:7px 14px;border-radius:999px;font-size:.9rem;font-weight:600;transition:transform .15s,background .2s}
.chips li:hover{transform:translateY(-2px);background:rgba(95,224,216,.22)}
```

- [ ] **Step 3: Verify** Playwright screenshot; chips wrap nicely; console clean.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: competencies section with coral/bubble skill chips"
```

---

## Task 11: Sertifikat, Karya & Galeri (`#works`) + lightbox

**Files:** Modify `index.html`, `css/style.css`, `js/main.js`

- [ ] **Step 1: Fill `#works`** with three sub-blocks:

```html
<section id="works" class="section">
  <h2 class="section__title">Sertifikat, Karya &amp; Galeri 🐙</h2>

  <h3 class="works__sub">Sertifikat &amp; Penghargaan</h3>
  <div class="works-grid">
    <div class="card cert"><span class="cert__icon">🏅</span><div><strong>[Nama Sertifikat]</strong><p>[Penerbit · Tahun]</p></div></div>
    <div class="card cert"><span class="cert__icon">📜</span><div><strong>[Nama Sertifikat]</strong><p>[Penerbit · Tahun]</p></div></div>
    <div class="card cert"><span class="cert__icon">🏆</span><div><strong>[Penghargaan]</strong><p>[Penyelenggara · Tahun]</p></div></div>
  </div>

  <h3 class="works__sub">Karya (RPP / Media Ajar)</h3>
  <div class="works-grid">
    <a class="card work" href="#" onclick="return false"><div class="work__thumb">📘</div><strong>[Judul RPP/Modul]</strong><p>[Kelas / mapel]</p></a>
    <a class="card work" href="#" onclick="return false"><div class="work__thumb">🎨</div><strong>[Media Pembelajaran]</strong><p>[Deskripsi singkat]</p></a>
  </div>

  <h3 class="works__sub">Galeri Kegiatan</h3>
  <div class="gallery">
    <button class="gallery__item" data-caption="Kegiatan mengajar 1">🖼️<span>Foto 1</span></button>
    <button class="gallery__item" data-caption="Kegiatan mengajar 2">🖼️<span>Foto 2</span></button>
    <button class="gallery__item" data-caption="Kegiatan mengajar 3">🖼️<span>Foto 3</span></button>
    <button class="gallery__item" data-caption="Kegiatan mengajar 4">🖼️<span>Foto 4</span></button>
  </div>
</section>

<div class="lightbox" id="lightbox" hidden>
  <button class="lightbox__close" id="lightboxClose" aria-label="Tutup">✕</button>
  <div class="lightbox__content"><div class="lightbox__img" id="lightboxImg">🖼️</div><p id="lightboxCap"></p></div>
</div>
```

> Note: gallery items are placeholder buttons; when the user adds real photos they swap the inner content for `<img>` and set `data-src`. The lightbox shows the caption (and image if `data-src` present).

- [ ] **Step 2: Add works + gallery + lightbox CSS:**

```css
.works__sub{margin:1.4em 0 .8em;color:var(--sun);font-size:1.1rem}
.works-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.cert{display:flex;gap:14px;align-items:center}.cert__icon{font-size:1.8rem}
.cert p,.work p{color:var(--ink-soft);font-size:.9rem;margin-top:.2em}
.work{text-decoration:none;color:var(--ink);display:block}
.work__thumb{font-size:2rem;background:rgba(255,255,255,.06);border-radius:12px;padding:18px;text-align:center;margin-bottom:10px}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px}
.gallery__item{aspect-ratio:4/3;border:1px solid var(--card-border);border-radius:14px;background:rgba(255,255,255,.05);
  color:var(--ink-soft);font-size:1.6rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;transition:transform .15s}
.gallery__item span{font-size:.8rem}
.gallery__item:hover{transform:scale(1.03);border-color:var(--glow)}
.lightbox{position:fixed;inset:0;z-index:100;background:rgba(2,10,20,.9);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)}
.lightbox[hidden]{display:none}
.lightbox__content{text-align:center;color:var(--ink)}
.lightbox__img{font-size:5rem}
.lightbox__close{position:absolute;top:20px;right:24px;background:none;border:0;color:#fff;font-size:1.8rem;cursor:pointer}
```

- [ ] **Step 3: Add lightbox JS** to `js/main.js` (append inside the IIFE, before the closing `})();`):

```js
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCap');
  const lbClose = document.getElementById('lightboxClose');
  if (lb) {
    document.querySelectorAll('.gallery__item').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('data-src');
        lbImg.innerHTML = src ? `<img src="${src}" alt="" style="max-width:80vw;max-height:75vh;border-radius:12px">` : '🖼️';
        lbCap.textContent = item.getAttribute('data-caption') || '';
        lb.hidden = false;
      });
    });
    const close = () => { lb.hidden = true; };
    lbClose.addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }
```

- [ ] **Step 4: Verify** Playwright: click a `.gallery__item`, confirm `#lightbox` no longer has `hidden`; click close, confirm hidden again; console clean. Screenshot.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: certificates/works/gallery section with lightbox"
```

---

## Task 12: Kontak + footer + Download CV (`#contact`)

**Files:** Modify `index.html`, `css/style.css`

- [ ] **Step 1: Fill `#contact`** and add footer after `</main>`-adjacent:

```html
<section id="contact" class="section contact">
  <h2 class="section__title">Hubungi Saya 🐠</h2>
  <div class="card contact__card">
    <p class="contact__lead">Tertarik berkolaborasi atau menawarkan posisi mengajar? Yuk ngobrol!</p>
    <ul class="contact__list">
      <li>📧 <a href="mailto:emailkamu@contoh.com">emailkamu@contoh.com</a></li>
      <li>📱 <a href="https://wa.me/62xxxxxxxxxx" target="_blank" rel="noopener">+62 xxx-xxxx-xxxx (WhatsApp)</a></li>
      <li>💼 <a href="https://linkedin.com/in/usernamekamu" target="_blank" rel="noopener">linkedin.com/in/usernamekamu</a></li>
      <li>📍 [Kota domisili]</li>
    </ul>
    <a class="btn btn--primary" href="assets/cv/CV.pdf" download>⬇ Download CV</a>
  </div>
</section>
<footer class="footer">© <span id="year"></span> Nama Lengkap · Dibuat dengan 🌊 &amp; ❤️</footer>
```

- [ ] **Step 2: Add contact + footer CSS:**

```css
.contact__card{text-align:center;max-width:560px;margin:0 auto}
.contact__lead{color:var(--ink-soft);margin-bottom:1.2em}
.contact__list{list-style:none;display:inline-flex;flex-direction:column;gap:12px;text-align:left;margin-bottom:1.4em}
.contact__list a{color:var(--glow);text-decoration:none}
.contact__list a:hover{text-decoration:underline}
.footer{text-align:center;color:var(--ink-soft);padding:30px 20px;position:relative;z-index:2;font-size:.9rem}
```

- [ ] **Step 3: Set footer year** — append to `js/main.js` inside IIFE: `const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();`

- [ ] **Step 4: Verify** Playwright screenshot of contact + footer; links present; year filled; console clean.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: contact section, social links, download CV, footer"
```

---

## Task 13: Responsive pass + SEO meta + README + final verification

**Files:** Modify `index.html`, `css/style.css`; Create `README.md`

- [ ] **Step 1: Add SEO/meta** in `<head>`: `<meta name="description" content="Portfolio Nama Lengkap, Calon Guru Sekolah Dasar — pengalaman mengajar, kompetensi, sertifikat, dan karya.">`, `<meta property="og:title" ...>`, `<meta property="og:description" ...>`, `<meta name="theme-color" content="#06182b">`, `lang="id"` on `<html>`.

- [ ] **Step 2: Mobile polish CSS** — ensure body has top padding so nav doesn't overlap hero (`body{padding-top:0}` is fine since hero is full-height; verify other sections aren't hidden under fixed nav — add `section[id]{scroll-margin-top:70px}`). Append:

```css
section[id]{scroll-margin-top:72px}
@media(max-width:680px){.section{padding-left:16px;padding-right:16px}}
```

- [ ] **Step 3: Create `README.md`** documenting: project purpose; how to edit each content placeholder (name/photo/CV/timeline/skills/certs/gallery/contact — list exact locations in `index.html`); how to add real photos (`assets/img/`, swap `.about__photo` and `.gallery__item` inner HTML, add `data-src` on gallery buttons); how to add CV (`assets/cv/CV.pdf`); how to run locally (`python3 -m http.server 5500`) + SSH port-forward note (`ssh -L 5500:localhost:5500 user@host`); how to deploy (Vercel: import repo, framework "Other", output dir root; or GitHub Pages).

- [ ] **Step 4: Reduced-motion verification** — Playwright `browser_emulate_media`/`browser_evaluate` is limited; instead verify the guard exists by `browser_evaluate` returning `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and confirm engine code branches on it (code review). Also confirm `prefers-reduced-motion` static-frame path doesn't error by setting `state.running=false` is not needed — just confirm no console errors with motion on.

- [ ] **Step 5: Final full verification** — Playwright at desktop (1440) and mobile (390) widths: full-page screenshots of every section; `browser_console_messages` clean; click a nav link and confirm scroll + active state; open/close lightbox; confirm no 404s in `browser_network_requests` except the intentionally-absent `assets/cv/CV.pdf` and `assets/img/*` (document these as expected-until-user-adds).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: responsive polish, SEO meta, README; final verification pass"
```

---

## Self-Review notes (author)

- **Spec coverage:** Hero/About/Journey/Skills/Works(+certs+gallery)/Contact → Tasks 7–12 ✓; deep-cute ocean visual + creatures + bubbles + interactivity → Tasks 2–5 ✓; mascot → Task 7 ✓; frosted readable cards + palette + fonts → Tasks 1,6 ✓; performance (FPS throttle, visibility pause, DPR) + reduced-motion → Tasks 3,5,13 ✓; responsive + mobile nav → Tasks 6,13 ✓; favicon + SEO → Tasks 1,13 ✓; deploy/README → Task 13 ✓; Download CV → Tasks 7,12 ✓.
- **Naming consistency:** section ids, `reconcileBubbles`/`reconcileCreatures`, `window.__ocean`, `window.__oceanDrawCreatures` used consistently across Tasks 3–5. Nav ids (`navToggle`,`navLinks`) and lightbox ids consistent across Tasks 6 and 11.
- **Expected non-errors:** `assets/cv/CV.pdf` and real gallery images are intentionally absent placeholders; their 404s are expected until the user adds files (documented in README + Task 13).
