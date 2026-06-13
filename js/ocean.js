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

  const rand = (a, b) => a + Math.random() * (b - a);

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function targetCounts() {
    const base = Math.min(1, state.w / 1280);
    return {
      bubbles: Math.round((18 + base * 22) * state.throttle),
      creatures: Math.round((10 + base * 12) * state.throttle),
    };
  }

  /* ---------- Bubbles ---------- */
  function spawnBubble(seed) {
    return {
      x: rand(0, state.w), y: seed ? rand(0, state.h) : state.h + rand(0, 40),
      r: rand(2, 6), vy: rand(20, 55), drift: rand(0.4, 1.2), phase: rand(0, Math.PI * 2),
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

  /* ---------- Creatures ---------- */
  const SPECIES = ['fish', 'fish', 'fish', 'jelly', 'octopus', 'turtle', 'whale'];
  const SP_COLOR = { fish: ['#ff7e9d', '#ffd56b', '#5fe0d8'], jelly: '#9b8cff', octopus: '#ff9e7d', turtle: '#7fd6a0', whale: '#8fb8ff' };

  function spawnCreature() {
    const kind = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const dir = Math.random() < 0.5 ? 1 : -1;
    const scale = kind === 'whale' ? rand(1.4, 2.0) : kind === 'jelly' ? rand(0.7, 1.1) : rand(0.6, 1.1);
    return {
      kind, dir, scale,
      x: dir === 1 ? rand(-120, -20) : state.w + rand(20, 120),
      y: rand(state.h * 0.15, state.h * 0.9),
      vx: dir * rand(18, 42) * (kind === 'whale' ? 0.6 : 1),
      phase: rand(0, Math.PI * 2),
      color: kind === 'fish' ? SP_COLOR.fish[Math.floor(Math.random() * 3)] : SP_COLOR[kind],
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
    if (state.pointer.active) {
      const dx = c.x - state.pointer.x, dy = c.y - state.pointer.y, d2 = dx * dx + dy * dy;
      if (d2 < 110 * 110 && d2 > 1) {
        const d = Math.sqrt(d2), f = (110 - d) / 110;
        c.x += (dx / d) * f * 60 * dt;
        c.y += (dy / d) * f * 60 * dt;
      }
    }
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
      ctx.beginPath(); ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(24, -7 + Math.sin(c.phase) * 2); ctx.lineTo(24, 7 - Math.sin(c.phase) * 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#041220'; ctx.beginPath(); ctx.arc(-7, -2, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-7.6, -2.6, 0.7, 0, Math.PI * 2); ctx.fill();
    } else if (c.kind === 'jelly') {
      const sq = 1 + Math.sin(c.phase) * 0.12;
      ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.ellipse(0, 0, 12, 12 * sq, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = c.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.55;
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 3, 2); ctx.quadraticCurveTo(i * 3 + Math.sin(c.phase + i) * 3, 14, i * 3, 22); ctx.stroke(); }
    } else if (c.kind === 'octopus') {
      ctx.beginPath(); ctx.arc(0, -2, 12, Math.PI, 0); ctx.fill();
      ctx.fillRect(-12, -2, 24, 6);
      ctx.strokeStyle = c.color; ctx.lineWidth = 3;
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 3.2, 4); ctx.quadraticCurveTo(i * 3.2 + Math.sin(c.phase + i) * 4, 16, i * 3.2, 20); ctx.stroke(); }
      ctx.fillStyle = '#041220'; ctx.beginPath(); ctx.arc(-4, -4, 1.6, 0, Math.PI * 2); ctx.arc(4, -4, 1.6, 0, Math.PI * 2); ctx.fill();
    } else if (c.kind === 'turtle') {
      ctx.beginPath(); ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5bbf88'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.arc(15, 0, 4, 0, Math.PI * 2); ctx.fill(); // head
      ctx.fillRect(-12, 8 + Math.sin(c.phase), 6, 4);
      ctx.fillRect(8, 8 - Math.sin(c.phase), 6, 4); // flippers
    } else if (c.kind === 'whale') {
      ctx.beginPath(); ctx.ellipse(0, 0, 26, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(38, -10); ctx.lineTo(38, 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#cfe0ff'; ctx.beginPath(); ctx.ellipse(-4, 4, 18, 7, 0, 0, Math.PI); ctx.fill(); // belly
      ctx.fillStyle = '#041220'; ctx.beginPath(); ctx.arc(-14, -3, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- Loop ---------- */
  function frame(t) {
    if (!state.running) return;
    const dt = Math.min(0.05, (t - state.lastT) / 1000 || 0.016);
    state.lastT = t;
    const fps = 1 / (dt || 0.016);
    state.fpsEMA = state.fpsEMA * 0.9 + fps * 0.1;
    if (state.fpsEMA < 30 && state.throttle > 0.4) { state.throttle -= 0.05; reconcileBubbles(); reconcileCreatures(); }
    else if (state.fpsEMA > 50 && state.throttle < 1) { state.throttle = Math.min(1, state.throttle + 0.01); }

    ctx.clearRect(0, 0, state.w, state.h);
    for (const b of state.bubbles) { updateBubble(b, dt); drawBubble(b); }
    for (const c of state.creatures) { updateCreature(c, dt); drawCreature(c); }

    requestAnimationFrame(frame);
  }

  function start() {
    resize();
    reconcileBubbles();
    reconcileCreatures();
    if (reduceMotion) {
      ctx.clearRect(0, 0, state.w, state.h);
      for (const b of state.bubbles) drawBubble(b);
      for (const c of state.creatures) drawCreature(c);
      return;
    }
    state.running = true;
    state.lastT = performance.now();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => { resize(); reconcileBubbles(); reconcileCreatures(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { state.running = false; }
    else if (!reduceMotion) { state.running = true; state.lastT = performance.now(); requestAnimationFrame(frame); }
  });
  window.addEventListener('pointermove', (e) => { state.pointer.x = e.clientX; state.pointer.y = e.clientY; state.pointer.active = true; });
  window.addEventListener('pointerleave', () => { state.pointer.active = false; });
  window.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) state.bubbles.push({
      x: e.clientX + rand(-6, 6), y: e.clientY, r: rand(1.5, 4),
      vy: rand(40, 90), drift: rand(0.4, 1.2), phase: rand(0, Math.PI * 2),
    });
  });

  window.__ocean = { state, rand };
  start();
})();
