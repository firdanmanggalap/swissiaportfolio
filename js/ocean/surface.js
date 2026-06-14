// Surface scene (sky, sun, clouds, island, ship, birds). Fades + lifts as you dive.

export function drawSurface(ctx, depth, t, w, h) {
  const alpha = Math.max(0, Math.min(1, 1 - depth / 0.18));
  if (alpha <= 0) return;
  const lift = depth * h * 1.2;
  const horizon = h * 0.42;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(0, -lift);

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#bfe9ff');
  sky.addColorStop(1, '#eaf7ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);

  // sun + halo
  const sx = w * 0.78, sy = h * 0.16;
  const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 95);
  halo.addColorStop(0, 'rgba(255,236,150,0.9)');
  halo.addColorStop(1, 'rgba(255,236,150,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(sx, sy, 95, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffe07a';
  ctx.beginPath(); ctx.arc(sx, sy, 30, 0, Math.PI * 2); ctx.fill();

  // clouds
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  drawCloud(ctx, w * 0.20 + Math.sin(t * 0.10) * 20, h * 0.12, 1.0);
  drawCloud(ctx, w * 0.55 + Math.cos(t * 0.08) * 16, h * 0.07, 0.8);
  drawCloud(ctx, w * 0.42 + Math.sin(t * 0.12) * 12, h * 0.24, 0.6);

  // island near horizon
  drawIsland(ctx, w * 0.28, horizon, 130, 56);

  // water surface band with gentle waves
  ctx.fillStyle = 'rgba(79,196,212,0.55)';
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  for (let x = 0; x <= w; x += 20) ctx.lineTo(x, horizon + Math.sin(x * 0.05 + t) * 3);
  ctx.lineTo(w, horizon + 60); ctx.lineTo(0, horizon + 60); ctx.closePath(); ctx.fill();

  // ship riding the waves
  drawShip(ctx, w * 0.62, horizon - 2 + Math.sin(t * 0.8) * 2);

  // birds
  ctx.strokeStyle = '#34516b';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const bx = w * 0.1 + i * w * 0.12 + Math.sin(t * 0.2 + i) * 30;
    const by = h * 0.10 + i * 8 + Math.sin(t + i) * 4;
    drawBird(ctx, bx, by, t + i);
  }

  ctx.restore();
}

function drawCloud(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.arc(18, 4, 13, 0, Math.PI * 2);
  ctx.arc(-18, 4, 13, 0, Math.PI * 2);
  ctx.arc(0, 6, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIsland(ctx, x, y, wd, ht) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#d9c08a';
  ctx.beginPath(); ctx.ellipse(0, 0, wd * 0.5, ht * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3fa86a';
  ctx.beginPath(); ctx.moveTo(-wd * 0.3, 0); ctx.quadraticCurveTo(0, -ht, wd * 0.3, 0); ctx.fill();
  // palm
  ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(wd * 0.18, -2); ctx.quadraticCurveTo(wd * 0.22, -24, wd * 0.16, -36); ctx.stroke();
  ctx.fillStyle = '#3fa86a';
  for (let a = 0; a < 5; a++) {
    ctx.save(); ctx.translate(wd * 0.16, -36); ctx.rotate(-1.2 + a * 0.6);
    ctx.beginPath(); ctx.ellipse(9, 0, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawShip(ctx, x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#b4452f';
  ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(14, 13); ctx.lineTo(-14, 13); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7a3320'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -24); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(2, -22); ctx.lineTo(17, -4); ctx.lineTo(2, -4); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawBird(ctx, x, y, ph) {
  const f = Math.sin(ph * 3) * 4;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + f);
  ctx.quadraticCurveTo(x, y - 5, x, y);
  ctx.quadraticCurveTo(x, y - 5, x + 8, y + f);
  ctx.stroke();
}
