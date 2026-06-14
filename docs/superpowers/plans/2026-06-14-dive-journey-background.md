# Dive-Journey Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static ocean background with a scroll-driven "dive" where one `depth` value (0=surface, 1=seafloor) continuously drives water color, a surface scene (sun/island/ship/birds), depth-banded creatures, light rays, and bioluminescent glow — ending at a seafloor with a dumbo octopus.

**Architecture:** Refactor the single `js/ocean.js` into focused ES modules under `js/ocean/`. `scene.js` owns the canvas + RAF loop and each frame reads `depth` from scroll, paints the water gradient, then delegates to `surface.js` and `creatures.js`. Performance stays bounded by depth-band culling (only creatures near the current depth are active) plus the existing FPS throttle / visibility pause / DPR cap.

**Tech Stack:** Vanilla JS ES modules (`<script type="module">`), Canvas 2D, `requestAnimationFrame`. Verified with bundled Chromium headless screenshots at multiple scroll offsets.

**Spec:** `docs/superpowers/specs/2026-06-14-dive-journey-background-design.md`

---

## Conventions

- **Preview server (reuse if running):** `python3 -m http.server 5500 --directory /home/probersama/ocean-portfolio` (background).
- **Bundled Chromium:** `~/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome`.
- **Screenshot-at-scroll helper** (used in verification). Because headless `--screenshot` only captures the top viewport, scroll is forced via a tiny injected script using the DevTools `--virtual-time-budget`; simplest reliable method is a temporary `?scroll=<fraction>` query the scene reads on load. So: in `scene.js`, on init, read `?scroll=` and if present set `window.scrollTo(0, fraction*(scrollHeight-innerHeight))` AND freeze depth to that fraction for one static paint. (Verification-only hook; harmless in production.)
- **Commit after every task** on branch `feat/dive-journey-background`.
- **Depth color stops** (interpolate `{top,bottom}` by depth):
  `[0.0,'#aee9ff','#4fc4d4'],[0.15,'#2ea7be','#0f6f93'],[0.35,'#0a4f73','#06314f'],[0.55,'#06243c','#04182b'],[0.80,'#03101f','#020a14'],[1.0,'#05131f','#0a2435']`

## File Structure

- `index.html` — change the two `<script>` tags to a single `<script type="module" src="js/ocean.js"></script>` (main.js stays a normal script or is imported; keep main.js as a separate classic script tag — it doesn't need modules).
- `js/ocean.js` — entry: `import { initScene } from './ocean/scene.js'; addEventListener('DOMContentLoaded', initScene)`.
- `js/ocean/depth.js` — `getDepth()`, `lerp(a,b,t)`, `lerpColor(hexA,hexB,t)`, `gradientFor(depth)` → `{top,bottom}` via stops.
- `js/ocean/surface.js` — `drawSurface(ctx, depth, t, w, h)`: sky/sun/clouds/island/ship/birds with fade+parallax.
- `js/ocean/creatures.js` — band defs + `tickCreatures(ctx, depth, dt, t, pointer, w, h)` (spawn/cull/update/draw) incl. fish/jelly/turtle/plankton/anglerfish/dumboOctopus/seafloor.
- `js/ocean/scene.js` — canvas setup, RAF loop, water gradient, light rays, bubbles, pointer/click interactivity, FPS throttle, visibility pause, reduced-motion.
- `css/style.css` — dark-frosted card background for readability across depths.

---

## Task 1: Refactor existing engine into ES modules (behavior parity)

**Files:** Create `js/ocean/scene.js`; Modify `index.html`, `js/ocean.js`

- [ ] **Step 1:** Create `js/ocean/scene.js` and MOVE the entire current contents of `js/ocean.js` into an exported `export function initScene(){ ... }` (the existing IIFE body becomes the function body; keep all current behavior: bubbles, creatures, pointer, click, throttle, visibility, reduced-motion). Remove the self-invoking wrapper.
- [ ] **Step 2:** Replace `js/ocean.js` with the thin entry:

```js
import { initScene } from './ocean/scene.js';
if (document.readyState !== 'loading') initScene();
else document.addEventListener('DOMContentLoaded', initScene);
```

- [ ] **Step 3:** In `index.html`, change `<script src="js/ocean.js" defer></script>` to `<script type="module" src="js/ocean.js"></script>` (keep `<script src="js/main.js" defer></script>` as-is).
- [ ] **Step 4: Verify parity.** Start/confirm server. Screenshot `http://localhost:5500/` (desktop 1440x900, `--virtual-time-budget=2500`). Expected: identical to current site (hero + bubbles + creatures), no console errors (`--enable-logging=stderr` grep clean).
- [ ] **Step 5: Commit** `refactor: split ocean engine into ES modules (parity)`.

---

## Task 2: `depth.js` utilities

**Files:** Create `js/ocean/depth.js`

- [ ] **Step 1:** Create `js/ocean/depth.js`:

```js
export function getDepth() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}
export const lerp = (a, b, t) => a + (b - a) * t;
function hexToRgb(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];}
export function lerpColor(a, b, t){
  const A=hexToRgb(a),B=hexToRgb(b);
  return `rgb(${Math.round(lerp(A[0],B[0],t))},${Math.round(lerp(A[1],B[1],t))},${Math.round(lerp(A[2],B[2],t))})`;
}
const STOPS=[[0.0,'#aee9ff','#4fc4d4'],[0.15,'#2ea7be','#0f6f93'],[0.35,'#0a4f73','#06314f'],[0.55,'#06243c','#04182b'],[0.80,'#03101f','#020a14'],[1.0,'#05131f','#0a2435']];
export function gradientFor(d){
  let i=0; while(i<STOPS.length-1 && d>STOPS[i+1][0]) i++;
  const [d0,t0,b0]=STOPS[i], [d1,t1,b1]=STOPS[Math.min(i+1,STOPS.length-1)];
  const f=d1===d0?0:(d-d0)/(d1-d0);
  return { top:lerpColor(t0,t1,f), bottom:lerpColor(b0,b1,f) };
}
```

- [ ] **Step 2: Verify** via Chromium `--virtual-time-budget` evaluate-less check: not needed; covered when scene.js consumes it (Task 3). Just confirm no syntax error by loading page after Task 3.
- [ ] **Step 3: Commit** `feat: depth + color-interpolation utilities`.

---

## Task 3: Water gradient driven by depth (in `scene.js`)

**Files:** Modify `js/ocean/scene.js`

- [ ] **Step 1:** Import depth utils at top of `scene.js`: `import { getDepth, gradientFor, lerp } from './depth.js';`
- [ ] **Step 2:** Add a verification scroll hook in `initScene` (after canvas setup): read `?scroll`:

```js
const params = new URLSearchParams(location.search);
const forcedScroll = params.has('scroll') ? Math.min(1,Math.max(0,parseFloat(params.get('scroll')))) : null;
if (forcedScroll !== null) requestAnimationFrame(() => window.scrollTo(0, forcedScroll*(document.documentElement.scrollHeight-window.innerHeight)));
```

- [ ] **Step 3:** In the frame loop, BEFORE drawing bubbles/creatures, replace `ctx.clearRect(...)` with a depth gradient fill:

```js
const depth = getDepth();
const g = gradientFor(depth);
const grad = ctx.createLinearGradient(0,0,0,state.h);
grad.addColorStop(0, g.top); grad.addColorStop(1, g.bottom);
ctx.fillStyle = grad; ctx.fillRect(0,0,state.w,state.h);
```

Also remove the CSS body gradient reliance: set `body{background:#04182b}` fallback (canvas covers it). Pass `depth` to creature/surface calls in later tasks.
- [ ] **Step 4:** Make the canvas opaque background visible: ensure `#ocean-canvas` has no `pointer-events` change; keep `z-index:0`. The body gradient in `style.css` can stay as a fallback for reduced-motion-not-loaded, but the canvas now paints the water.
- [ ] **Step 5: Verify** screenshots at `?scroll=0`, `?scroll=0.5`, `?scroll=1.0`. Expected: top is bright teal, middle deep blue, bottom darkest — gradient clearly changes with scroll. No console errors.
- [ ] **Step 6: Commit** `feat: scroll-depth water gradient`.

---

## Task 4: Surface scene (`surface.js`)

**Files:** Create `js/ocean/surface.js`; Modify `js/ocean/scene.js`

- [ ] **Step 1:** Create `js/ocean/surface.js` exporting `drawSurface(ctx, depth, t, w, h)`. Fade = `alpha = clamp(1 - depth/0.18, 0, 1)`; if `alpha<=0` return early. Parallax: `lift = depth * h * 1.2` (everything translated up by `lift`). Draw, in order: sky gradient band (top→horizon), sun (circle + radial halo) top-right, 3 clouds (soft ellipses drifting with `t`), island (hill arc + simple palm) near horizon, ship (trapezoid hull + triangular sail) on water line, 5 birds (two-stroke "m", wing angle animated by `t`), water-surface line with a low-amplitude sine. Use `ctx.save()/restore()` and `ctx.globalAlpha = alpha`. Provide concrete drawing code for each (sun: `createRadialGradient`; birds: `moveTo/quadraticCurveTo`).
- [ ] **Step 2:** In `scene.js` frame loop, after the water gradient and before creatures, call `drawSurface(ctx, depth, t, state.w, state.h)` (import it). `t` = `performance.now()/1000`.
- [ ] **Step 3: Verify** screenshot at `?scroll=0` (full surface: sun, island, ship, birds, clouds over bright water) and `?scroll=0.2` (surface mostly faded/lifted). No console errors.
- [ ] **Step 4: Commit** `feat: surface scene (sun, island, ship, birds, clouds)`.

---

## Task 5: Depth-banded creatures (`creatures.js`)

**Files:** Create `js/ocean/creatures.js`; Modify `js/ocean/scene.js`

- [ ] **Step 1:** Create `js/ocean/creatures.js`. Define bands:

```js
export const BANDS = [
  { kind:'fish',    min:0.10, max:0.50, count:8 },
  { kind:'jelly',   min:0.20, max:0.55, count:4 },
  { kind:'turtle',  min:0.15, max:0.45, count:2 },
  { kind:'plankton',min:0.50, max:0.92, count:30 },
  { kind:'angler',  min:0.65, max:0.90, count:3 },
  { kind:'dumbo',   min:0.88, max:1.00, count:2 },
];
const MARGIN = 0.12;
```

Maintain a pool keyed by kind. Each frame `tickCreatures(ctx, depth, dt, t, pointer, w, h)`:
for each band, if `depth >= min-MARGIN && depth <= max+MARGIN` ensure pool filled to `count*throttleFromScene` (pass throttle in), update (drift + cursor-avoidance reused from current fish logic) and draw; otherwise drain that band's pool. Provide draw funcs: reuse existing fish/jelly/turtle/octopus shapes; add `drawAngler` (round body + lure dot with glow + big cute eye + small teeth), `drawDumbo` (rounded mantle + two flapping ear-fins + short tentacles + big eyes), `drawPlankton` (tiny glowing dots, alpha pulsing with `t`, alpha scaled by `(depth-0.5)/0.42`).
- [ ] **Step 2:** Add seafloor static elements drawn when `depth > 0.9` inside `creatures.js` via `drawSeafloor(ctx, depth, t, w, h)`: sand band at bottom, 3–4 corals, 2 seaweed clumps (sine sway), a treasure chest, 2 starfish. Anchor to bottom of viewport.
- [ ] **Step 3:** In `scene.js`: replace the current per-frame creature loop with `tickCreatures(...)` and call `drawSeafloor(...)`. Remove the old hard-coded creature array/logic now living in `creatures.js`. Keep bubbles + click-burst in scene.js. Pass `state.throttle`.
- [ ] **Step 4: Verify** screenshots at `?scroll=0.35` (fish/jelly/turtle), `?scroll=0.75` (angler + glow plankton, dark water), `?scroll=1.0` (seafloor: sand, coral, chest, dumbo octopus). No console errors.
- [ ] **Step 5: Commit** `feat: depth-banded creatures + seafloor (angler, dumbo octopus, plankton, coral, chest)`.

---

## Task 6: Light rays + glow by depth, and readable dark-frosted cards

**Files:** Modify `js/ocean/scene.js`, `css/style.css`

- [ ] **Step 1:** In `scene.js`, after surface and before/after creatures, draw light rays whose alpha = `clamp(0.5*(1-depth/0.6),0,0.5)` (strong near surface). Implement as 3 translucent vertical wedges from top using `createLinearGradient` with `rgba(180,240,255,alpha)`. Also add a deep-glow vignette: when `depth>0.55`, overlay a subtle radial `rgba(95,224,216, (depth-0.55)*0.25)` near the horizontal center to suggest bioluminescence.
- [ ] **Step 2:** In `css/style.css`, change `--card` to a dark frosted value so text stays readable over the now-sometimes-bright background:

```css
--card:rgba(6,22,38,0.55);
--card-border:rgba(255,255,255,0.12);
```

(Light-rays CSS overlay `.light-rays` from the old static bg can be removed or kept faint; if removed, also remove the `<div class="light-rays">` from index.html. Decision: REMOVE the CSS `.light-rays` rules and the div, since rays are now canvas-drawn and depth-aware.)
- [ ] **Step 3: Verify** screenshots at `?scroll=0` (rays strong, hero card text crisp on bright surface), `?scroll=0.7` (rays gone, glow present), confirm hero/contact text contrast OK. No console errors.
- [ ] **Step 4: Commit** `feat: depth-aware light rays + bioluminescent glow; dark-frosted readable cards`.

---

## Task 7: Reduced-motion static path + perf check

**Files:** Modify `js/ocean/scene.js`

- [ ] **Step 1:** In `scene.js`, when `prefers-reduced-motion: reduce`: do NOT run the RAF loop. Instead define `renderStatic()` that paints one frame for the current `getDepth()` (gradient + surface if depth<0.18 + a few static creatures for the active band + seafloor if depth>0.9), and call it on init, on `scroll` (throttled via `requestAnimationFrame` one-shot), and on `resize`. This keeps the dive effect on scroll without continuous animation.
- [ ] **Step 2:** Confirm FPS auto-throttle still scales `count` (pass `state.throttle` into `tickCreatures`; multiply band counts). Confirm visibility pause still stops/restarts the loop.
- [ ] **Step 3: Verify** run a screenshot with `--force-prefers-reduced-motion` at `?scroll=0` and `?scroll=1.0`: static surface and static seafloor render (no error). And a normal-motion full-page parity check has no console errors.
- [ ] **Step 4: Commit** `feat: reduced-motion static dive rendering`.

---

## Task 8: Final verification + README note

**Files:** Modify `README.md`

- [ ] **Step 1:** Add a short README section "Background menyelam" explaining: scroll changes depth; how to tweak depth color stops (`js/ocean/depth.js`) and creature bands (`js/ocean/creatures.js`); note ES modules require serving over http (not opening file:// directly).
- [ ] **Step 2: Full verification matrix.** For widths desktop `1440x900` and mobile `390x844`, capture `?scroll=` at `0, 0.25, 0.5, 0.75, 1.0` (10 screenshots). Confirm: smooth color progression, surface only at top, creatures appropriate per depth, seafloor + dumbo octopus at bottom, text readable throughout, `--enable-logging=stderr` grep shows no JS errors, and `main.js` interactions (lightbox open/close, scroll-spy) still function (spot-check by reading code unaffected + one lightbox screenshot via injected `open`).
- [ ] **Step 3:** Remove any leftover dead CSS (old `.light-rays`) and confirm no `?scroll` side effects in normal use (no query → `forcedScroll` null → normal behavior).
- [ ] **Step 4: Commit** `docs: README dive-background notes; final verification`.

---

## Self-Review

- **Spec coverage:** depth mechanic → Task 2,3; surface scene → Task 4; creatures per band + dumbo/angler/plankton/seafloor → Task 5; light rays + glow by depth → Task 6; readable cards → Task 6; module structure → Task 1; performance (culling/throttle/visibility/DPR) → Tasks 5,7 (+ carried from existing); reduced-motion → Task 7; verification → every task + Task 8. ✓ All spec sections mapped.
- **Naming consistency:** `getDepth`, `gradientFor`, `lerp`, `lerpColor` (depth.js); `drawSurface` (surface.js); `tickCreatures`, `drawSeafloor`, `BANDS` (creatures.js); `initScene` (scene.js). Used consistently across tasks. `state.throttle` threaded into `tickCreatures`.
- **Placeholder scan:** drawing code for surface/creatures is specified by shape + technique per element (Task 4/5 step 1) rather than full literal bodies — acceptable as these are creative drawing routines; the implementer (me, inline) has the shapes from the existing `ocean.js` fish/jelly/octopus/turtle to extend. No "TODO/TBD" left.
- **Verification realism:** `?scroll=` hook makes headless depth screenshots deterministic (avoids the smooth-scroll/virtual-time flakiness seen previously).
