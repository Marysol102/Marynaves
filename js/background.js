// background.js — Fondo abismal con orbs bioluminiscentes ambientales

let orbs = [];

export function initBackground(W, H) {
  orbs = [];
  for (let i = 0; i < 20; i++) {
    orbs.push({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 70 + 20,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.001 + 0.0004,
      hue:   pickHue()
    });
  }
}

export function drawBackground(ctx, W, H) {
  // Base oscura
  ctx.fillStyle = '#000810';
  ctx.fillRect(0, 0, W, H);

  // Orbs pulsantes
  const now = Date.now();
  for (const o of orbs) {
    const alpha = (Math.sin(now * o.speed + o.phase) + 1) / 2 * 0.04 + 0.01;
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    g.addColorStop(0, `hsla(${o.hue}, 100%, 70%, ${alpha})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function pickHue() {
  const r = Math.random();
  if (r < 0.55) return 200;  // azul
  if (r < 0.80) return 260;  // violeta
  return 150;                 // verde
}
