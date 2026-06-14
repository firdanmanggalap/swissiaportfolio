// Orchestrator: canvas + RAF loop. Each frame reads scroll depth and paints
// water gradient → light rays → surface → bubbles → creatures → seafloor → glow.
import { getDepth, gradientFor } from './depth.js';
import { drawSurface } from './surface.js';
import { tickCreatures, drawSeafloor } from './creatures.js';

export function initScene() {
  const canvas = document.getElementById('ocean-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    w: 0, h: 0, dpr: 1,
    bubbles: [],
    pointer: { x: -999, y: -999, active: false },
    running: true, lastT: 0, fpsEMA: 60, throttle: 1,
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

  // ---- Bubbles ----
  function bubbleCount() { return Math.round((16 + Math.min(1, state.w / 1280) * 20) * state.throttle); }
  function spawnBubble(seed) {
    return { x: rand(0, state.w), y: seed ? rand(0, state.h) : state.h + rand(0, 40), r: rand(2, 6), vy: rand(20, 55), drift: rand(0.4, 1.2), phase: rand(0, Math.PI * 2) };
  }
  function reconcileBubbles() {
    const want = bubbleCount();
    while (state.bubbles.length < want) state.bubbles.push(spawnBubble(true));
    if (state.bubbles.length > want) state.bubbles.length = want;
  }
  function updateBubble(b, dt) {
    b.y -= b.vy * dt;
    b.x += Math.sin(b.phase + b.y * 0.01) * b.drift;
    if (b.y < -10) Object.assign(b, spawnBubble(false));
  }
  function drawBubble(b) {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180,230,255,0.4)';
    ctx.fillStyle = 'rgba(150,220,255,0.07)';
    ctx.fill(); ctx.stroke();
  }

  // ---- Water / rays / glow ----
  function paintWater(depth) {
    const g = gradientFor(depth);
    const grad = ctx.createLinearGradient(0, 0, 0, state.h);
    grad.addColorStop(0, g.top); grad.addColorStop(1, g.bottom);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, state.w, state.h);
  }
  function drawRays(depth) {
    const a = Math.max(0, Math.min(0.5, 0.5 * (1 - depth / 0.6)));
    if (a <= 0) return;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const x = state.w * (0.2 + i * 0.3);
      const gr = ctx.createLinearGradient(x, 0, x + 80, state.h);
      gr.addColorStop(0, `rgba(190,240,255,${a})`);
      gr.addColorStop(1, 'rgba(190,240,255,0)');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.moveTo(x - 40, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 120, state.h); ctx.lineTo(x - 10, state.h); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function drawGlow(depth) {
    if (depth <= 0.55) return;
    const a = (depth - 0.55) * 0.25;
    const gr = ctx.createRadialGradient(state.w / 2, state.h * 0.4, 0, state.w / 2, state.h * 0.4, state.h * 0.7);
    gr.addColorStop(0, `rgba(95,224,216,${a})`);
    gr.addColorStop(1, 'rgba(95,224,216,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, state.w, state.h);
  }

  function renderFrame(depth, dt, t) {
    paintWater(depth);
    drawRays(depth);
    drawSurface(ctx, depth, t, state.w, state.h);
    for (const b of state.bubbles) { if (dt) updateBubble(b, dt); drawBubble(b); }
    tickCreatures(ctx, depth, dt, t, state.pointer, state.w, state.h, state.throttle);
    drawSeafloor(ctx, depth, t, state.w, state.h);
    drawGlow(depth);
  }
  // verification-only depth override (?depth=0..1) for deterministic screenshots
  const _params = new URLSearchParams(location.search);
  const forcedDepth = _params.has('depth') ? Math.min(1, Math.max(0, parseFloat(_params.get('depth')) || 0)) : null;
  const currentDepth = () => (forcedDepth !== null ? forcedDepth : getDepth());

  function renderStatic() { renderFrame(currentDepth(), 0, performance.now() / 1000); }

  function frame(now) {
    if (!state.running) return;
    const dt = Math.min(0.05, (now - state.lastT) / 1000 || 0.016);
    state.lastT = now;
    const fps = 1 / (dt || 0.016);
    state.fpsEMA = state.fpsEMA * 0.9 + fps * 0.1;
    if (state.fpsEMA < 30 && state.throttle > 0.4) { state.throttle -= 0.05; reconcileBubbles(); }
    else if (state.fpsEMA > 50 && state.throttle < 1) { state.throttle = Math.min(1, state.throttle + 0.01); }
    renderFrame(currentDepth(), dt, now / 1000);
    requestAnimationFrame(frame);
  }

  // ---- Init ----
  resize();
  reconcileBubbles();

  // verification-only: ?scroll=<0..1> jumps to a scroll fraction for deterministic screenshots
  const params = new URLSearchParams(location.search);
  if (params.has('scroll')) {
    const f = Math.min(1, Math.max(0, parseFloat(params.get('scroll')) || 0));
    const apply = () => window.scrollTo(0, f * (document.documentElement.scrollHeight - window.innerHeight));
    requestAnimationFrame(apply);
    setTimeout(apply, 300);
  }

  if (reduceMotion) {
    renderStatic();
    let scheduled = false;
    const onScroll = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; renderStatic(); }); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { resize(); reconcileBubbles(); renderStatic(); });
    return;
  }

  window.addEventListener('resize', () => { resize(); reconcileBubbles(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { state.running = false; }
    else { state.running = true; state.lastT = performance.now(); requestAnimationFrame(frame); }
  });
  window.addEventListener('pointermove', (e) => { state.pointer.x = e.clientX; state.pointer.y = e.clientY; state.pointer.active = true; });
  window.addEventListener('pointerleave', () => { state.pointer.active = false; });
  window.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) state.bubbles.push({ x: e.clientX + rand(-6, 6), y: e.clientY, r: rand(1.5, 4), vy: rand(40, 90), drift: rand(0.4, 1.2), phase: rand(0, Math.PI * 2) });
  });

  window.__ocean = { state, getDepth };
  state.lastT = performance.now();
  requestAnimationFrame(frame);
}
