// Depth-banded creatures + static seafloor. Only bands near the current depth are active.

const rand = (a, b) => a + Math.random() * (b - a);
const FISH_COLORS = ['#ff7e9d', '#ffd56b', '#5fe0d8', '#ffa46b'];

export const BANDS = [
  { kind: 'fish', min: 0.10, max: 0.50, count: 8 },
  { kind: 'jelly', min: 0.20, max: 0.55, count: 4 },
  { kind: 'turtle', min: 0.15, max: 0.45, count: 2 },
  { kind: 'plankton', min: 0.50, max: 0.92, count: 26 },
  { kind: 'angler', min: 0.65, max: 0.90, count: 3 },
  { kind: 'dumbo', min: 0.88, max: 1.00, count: 2 },
];
const MARGIN = 0.12;
const pools = {}; // kind -> array

function spawnY(kind, h) {
  return kind === 'dumbo' ? rand(h * 0.5, h * 0.8) : rand(h * 0.12, h * 0.92);
}

function spawn(kind, w, h) {
  const dir = Math.random() < 0.5 ? 1 : -1;
  const base = { kind, dir, phase: rand(0, Math.PI * 2), x: rand(0, w), y: spawnY(kind, h) };
  if (kind === 'fish') return { ...base, scale: rand(0.6, 1.1), vx: dir * rand(18, 42), color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)] };
  if (kind === 'jelly') return { ...base, scale: rand(0.7, 1.1), vx: dir * rand(6, 14), color: '#9b8cff' };
  if (kind === 'turtle') return { ...base, scale: rand(0.8, 1.2), vx: dir * rand(14, 26), color: '#7fd6a0' };
  if (kind === 'plankton') return { ...base, scale: rand(0.5, 1.5), vx: dir * rand(2, 8), color: '#9ef7ee' };
  if (kind === 'angler') return { ...base, scale: rand(0.8, 1.2), vx: dir * rand(10, 20), color: '#3b4a66' };
  if (kind === 'dumbo') return { ...base, scale: rand(0.9, 1.3), vx: dir * rand(8, 16), color: '#ff9ec4' };
  return base;
}

function update(c, dt, pointer, w, h) {
  c.phase += dt * 2;
  c.x += c.vx * dt;
  c.y += Math.sin(c.phase) * 6 * dt * 10;
  if (pointer.active && c.kind !== 'plankton') {
    const dx = c.x - pointer.x, dy = c.y - pointer.y, d2 = dx * dx + dy * dy;
    if (d2 < 110 * 110 && d2 > 1) {
      const d = Math.sqrt(d2), f = (110 - d) / 110;
      c.x += (dx / d) * f * 60 * dt;
      c.y += (dy / d) * f * 60 * dt;
    }
  }
  const off = 180 * (c.scale || 1);
  if ((c.dir === 1 && c.x > w + off) || (c.dir === -1 && c.x < -off)) {
    c.x = c.dir === 1 ? -off : w + off; // re-enter from the edge
    c.y = spawnY(c.kind, h);
    c.phase = rand(0, Math.PI * 2);
  }
}

export function tickCreatures(ctx, depth, dt, t, pointer, w, h, throttle) {
  for (const band of BANDS) {
    const active = depth >= band.min - MARGIN && depth <= band.max + MARGIN;
    const pool = pools[band.kind] || (pools[band.kind] = []);
    if (active) {
      const want = Math.max(1, Math.round(band.count * throttle));
      while (pool.length < want) pool.push(spawn(band.kind, w, h));
      if (pool.length > want) pool.length = want;
      for (const c of pool) {
        if (dt) update(c, dt, pointer, w, h);
        draw(ctx, c, depth);
      }
    } else if (pool.length) {
      pool.length = 0;
    }
  }
}

function draw(ctx, c, depth) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(c.dir * (c.scale || 1), c.scale || 1);
  ctx.fillStyle = c.color;
  if (c.kind === 'fish') drawFish(ctx, c);
  else if (c.kind === 'jelly') drawJelly(ctx, c);
  else if (c.kind === 'turtle') drawTurtle(ctx, c);
  else if (c.kind === 'plankton') drawPlankton(ctx, c, depth);
  else if (c.kind === 'angler') drawAngler(ctx, c);
  else if (c.kind === 'dumbo') drawDumbo(ctx, c);
  ctx.restore();
}

// All creatures face +x (head forward); scale(dir) flips them to match travel.
function drawFish(ctx, c) {
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-24, -7 + Math.sin(c.phase) * 2); ctx.lineTo(-24, 7 - Math.sin(c.phase) * 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#041220'; ctx.beginPath(); ctx.arc(7, -2, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6.4, -2.6, 0.7, 0, Math.PI * 2); ctx.fill();
}

function drawJelly(ctx, c) {
  const sq = 1 + Math.sin(c.phase) * 0.12;
  ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 12 * sq, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = c.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.55;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath(); ctx.moveTo(i * 3, 2); ctx.quadraticCurveTo(i * 3 + Math.sin(c.phase + i) * 3, 14, i * 3, 22); ctx.stroke();
  }
}

function drawTurtle(ctx, c) {
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5bbf88'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(15, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-12, 8 + Math.sin(c.phase), 6, 4);
  ctx.fillRect(8, 8 - Math.sin(c.phase), 6, 4);
}

function drawPlankton(ctx, c, depth) {
  const a = Math.max(0, Math.min(1, (depth - 0.5) / 0.42)) * (0.45 + 0.55 * Math.abs(Math.sin(c.phase * 3)));
  ctx.globalAlpha = a * 0.4; ctx.fillStyle = '#5fe0d8';
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = a; ctx.fillStyle = '#ddfff9';
  ctx.beginPath(); ctx.arc(0, 0, 1.4, 0, Math.PI * 2); ctx.fill();
}

function drawAngler(ctx, c) {
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-26, -8); ctx.lineTo(-26, 8); ctx.closePath(); ctx.fill();
  // lure on a stalk, glowing
  ctx.strokeStyle = c.color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(6, -11); ctx.quadraticCurveTo(18, -24, 22, -14); ctx.stroke();
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffe98a';
  ctx.beginPath(); ctx.arc(22, -14, 5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = '#fff4c2';
  ctx.beginPath(); ctx.arc(22, -14, 2.4, 0, Math.PI * 2); ctx.fill();
  // big cute eye
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(7, -2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#041220'; ctx.beginPath(); ctx.arc(8, -2, 2, 0, Math.PI * 2); ctx.fill();
  // little smile + tooth
  ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(2, 7); ctx.lineTo(13, 7); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(5, 7); ctx.lineTo(7, 10); ctx.lineTo(9, 7); ctx.closePath(); ctx.fill();
}

function drawDumbo(ctx, c) {
  const flap = Math.sin(c.phase * 1.5) * 0.5;
  // mantle
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 15, 0, 0, Math.PI * 2); ctx.fill();
  // ear fins
  ctx.save(); ctx.translate(-13, -10); ctx.rotate(-0.5 + flap); ctx.beginPath(); ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(13, -10); ctx.rotate(0.5 - flap); ctx.beginPath(); ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  // tentacles
  ctx.strokeStyle = c.color; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(i * 5, 12); ctx.quadraticCurveTo(i * 5 + Math.sin(c.phase + i) * 3, 22, i * 5, 27); ctx.stroke();
  }
  // eyes
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-6, -1, 4, 0, Math.PI * 2); ctx.arc(6, -1, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a0a16'; ctx.beginPath(); ctx.arc(-6, 0, 2, 0, Math.PI * 2); ctx.arc(6, 0, 2, 0, Math.PI * 2); ctx.fill();
}

// ---- Seafloor (static, only near the very bottom) ----
export function drawSeafloor(ctx, depth, t, w, h) {
  if (depth <= 0.9) return;
  const a = Math.min(1, (depth - 0.9) / 0.08);
  ctx.save();
  ctx.globalAlpha = a;
  const floorY = h - Math.min(96, h * 0.18);

  // sand
  ctx.fillStyle = '#c8b27a';
  ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, floorY + 10);
  for (let x = 0; x <= w; x += 60) ctx.quadraticCurveTo(x + 30, floorY + ((x / 60) % 2 ? 0 : 14), x + 60, floorY + 8);
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

  // seaweed
  ctx.strokeStyle = '#3fae6e'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const sx of [w * 0.12, w * 0.8, w * 0.55]) {
    ctx.beginPath(); ctx.moveTo(sx, floorY + 6);
    ctx.quadraticCurveTo(sx + Math.sin(t + sx) * 10, floorY - 40, sx + Math.sin(t * 1.2 + sx) * 6, floorY - 84);
    ctx.stroke();
  }

  drawCoral(ctx, w * 0.25, floorY + 6, '#ff8fb0');
  drawCoral(ctx, w * 0.68, floorY + 8, '#ffb36b');
  drawStar(ctx, w * 0.4, floorY + 18, '#ff7e9d');
  drawStar(ctx, w * 0.88, floorY + 14, '#ffd56b');
  drawChest(ctx, w * 0.5, floorY - 2);

  ctx.restore();
}

function drawCoral(ctx, x, y, color) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, -26);
  ctx.moveTo(0, -12); ctx.lineTo(-12, -26);
  ctx.moveTo(0, -16); ctx.lineTo(12, -30);
  ctx.stroke();
  ctx.restore();
}

function drawStar(ctx, x, y, color) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 3.5 : 9;
    const ang = -Math.PI / 2 + i * Math.PI / 5;
    const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawChest(ctx, x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-22, -16, 44, 18);
  ctx.fillStyle = '#6b431f';
  ctx.beginPath(); ctx.moveTo(-22, -16); ctx.quadraticCurveTo(0, -30, 22, -16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd56b'; ctx.fillRect(-3, -12, 6, 10);
  ctx.beginPath(); ctx.arc(0, -12, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
