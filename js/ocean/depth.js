// Depth = scroll progress (0 surface → 1 seafloor) + color helpers.

export function getDepth() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

export const lerp = (a, b, t) => a + (b - a) * t;

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpColor(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
}

// depth → { top, bottom } water gradient colors, interpolated between stops.
const STOPS = [
  [0.0, '#aee9ff', '#4fc4d4'],
  [0.15, '#2ea7be', '#0f6f93'],
  [0.35, '#0a4f73', '#06314f'],
  [0.55, '#06243c', '#04182b'],
  [0.80, '#03101f', '#020a14'],
  [1.0, '#05131f', '#0a2435'],
];

export function gradientFor(d) {
  let i = 0;
  while (i < STOPS.length - 1 && d > STOPS[i + 1][0]) i++;
  const [d0, t0, b0] = STOPS[i];
  const [d1, t1, b1] = STOPS[Math.min(i + 1, STOPS.length - 1)];
  const f = d1 === d0 ? 0 : (d - d0) / (d1 - d0);
  return { top: lerpColor(t0, t1, f), bottom: lerpColor(b0, b1, f) };
}
