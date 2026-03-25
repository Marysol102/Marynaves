// renderer.js — Todo el dibujo del juego

import { ship }            from './ship.js';
import { getBullets }      from './bullets.js';
import { getParticles }    from './particles.js';
import { input }           from './input.js';
import { enemies, enemyBullets, score } from './enemies.js';
import { drawEnemy, drawEnemyBullets }  from './enemyRenderer.js';
import { TYPES }           from './enemyTypes.js';

export function drawScene(ctx, W, H) {
  drawParticles(ctx);
  drawBullets(ctx);
  drawEnemyBullets(ctx, enemyBullets);
  for (const e of enemies) drawEnemy(ctx, e);
  drawCreature(ctx);
  if (!input.isMobile) drawCursor(ctx);
  drawHUD(ctx, W, H);
}

// ── Criatura ──────────────────────────────────────────────
function drawCreature(ctx) {
  const { x, y, angle, size } = ship;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2); // punta apunta hacia el ángulo

  const now   = Date.now();
  const pulse = 1 + Math.sin(now * 0.004) * 0.06;
  const glow  = 0.7 + Math.sin(now * 0.006) * 0.3;
  const s     = size;

  // --- Halo exterior ---
  const halo = ctx.createRadialGradient(0, 0, s * 0.5, 0, 0, s * 3.5 * pulse);
  halo.addColorStop(0, `rgba(60,160,255,${glow * 0.15})`);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, s * 3.5 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = `rgba(80,200,255,${glow})`;
  ctx.shadowBlur  = 14;

  // --- Ala izquierda ---
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.9);
  ctx.bezierCurveTo(-s * 2.2, -s * 0.3, -s * 2.5,  s * 0.6, -s * 0.2, s * 0.5);
  ctx.bezierCurveTo(-s * 0.1,  s * 0.2,          0, s * 0.1,          0,      0);
  ctx.fillStyle   = `rgba(20,80,160,${0.35 * glow})`;
  ctx.strokeStyle = `rgba(100,220,255,${0.8 * glow})`;
  ctx.lineWidth   = 1.2;
  ctx.fill();
  ctx.stroke();

  // --- Ala derecha ---
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.9);
  ctx.bezierCurveTo( s * 2.2, -s * 0.3,  s * 2.5,  s * 0.6,  s * 0.2, s * 0.5);
  ctx.bezierCurveTo( s * 0.1,  s * 0.2,          0, s * 0.1,         0,      0);
  ctx.fill();
  ctx.stroke();

  // --- Cola ---
  ctx.beginPath();
  ctx.moveTo(-s * 0.15, s * 0.4);
  ctx.bezierCurveTo(-s * 0.3, s * 1.2, -s * 0.1, s * 1.8,  0, s * 2.1);
  ctx.bezierCurveTo( s * 0.1, s * 1.8,  s * 0.3, s * 1.2, s * 0.15, s * 0.4);
  ctx.fillStyle = `rgba(20,80,160,${0.25 * glow})`;
  ctx.fill();
  ctx.stroke();

  // --- Núcleo bioluminiscente ---
  const core = ctx.createRadialGradient(0, -s * 0.1, 0, 0, -s * 0.1, s * 0.7);
  core.addColorStop(0,   `rgba(180,240,255,${glow})`);
  core.addColorStop(0.4, `rgba(60,160,255,${glow * 0.7})`);
  core.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.1, s * 0.65, s * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Ojo ---
  ctx.shadowBlur  = 8;
  ctx.shadowColor = 'rgba(200,240,255,0.9)';
  ctx.fillStyle   = 'rgba(200,240,255,0.9)';
  ctx.beginPath();
  ctx.arc(0, -s * 0.72, s * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // --- Tentáculos ---
  ctx.shadowBlur = 5;
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const tx     = i * s * 0.28;
    const wiggle = Math.sin(now * 0.003 + i) * s * 0.3;
    ctx.strokeStyle = `rgba(80,180,255,${0.3 * glow})`;
    ctx.lineWidth   = 0.9;
    ctx.beginPath();
    ctx.moveTo(tx, s * 0.5);
    ctx.bezierCurveTo(tx + wiggle, s * 1.1, tx - wiggle * 0.5, s * 1.7, tx + wiggle * 0.3, s * 2.2);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Proyectiles ───────────────────────────────────────────
function drawBullets(ctx) {
  for (const b of getBullets()) {
    ctx.save();
    ctx.globalAlpha = b.life;
    ctx.translate(b.x, b.y);
    ctx.shadowColor = 'rgba(150,255,120,0.9)';
    ctx.shadowBlur  = 12;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
    g.addColorStop(0, 'rgba(220,255,180,1)');
    g.addColorStop(1, 'rgba(80,255,80,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Partículas de estela ──────────────────────────────────
function drawParticles(ctx) {
  for (const p of getParticles()) {
    ctx.save();
    ctx.globalAlpha = p.life * 0.6;
    ctx.shadowColor = `hsla(${p.hue},100%,70%,0.8)`;
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = `hsla(${p.hue},100%,75%,${p.life})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Cursor retícula (solo desktop) ───────────────────────
function drawCursor(ctx) {
  const { x, y } = input;
  ctx.save();
  ctx.strokeStyle = 'rgba(100,220,255,0.45)';
  ctx.lineWidth   = 1;
  const cr = 8;
  ctx.beginPath();
  ctx.arc(x, y, cr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - cr - 4, y); ctx.lineTo(x + cr + 4, y);
  ctx.moveTo(x, y - cr - 4); ctx.lineTo(x, y + cr + 4);
  ctx.stroke();
  ctx.restore();
}

// ── HUD ───────────────────────────────────────────────────
function drawHUD(ctx, W, H) {
  ctx.save();
  ctx.font = '11px Courier New';
  ctx.letterSpacing = '2px';

  // ── Barra de vida (arriba izquierda) ────────────────────
  const barW   = 120;
  const barH   = 6;
  const barX   = 28;
  const barY   = 28;
  const hpPct  = ship.hp / ship.maxHp;
  const hpHue  = hpPct > 0.5 ? 180 : hpPct > 0.25 ? 50 : 0;
  const flicker = ship.invTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0;

  if (!flicker) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = `hsla(${hpHue},100%,60%,0.9)`;
    ctx.shadowColor = `hsla(${hpHue},100%,70%,0.8)`;
    ctx.shadowBlur  = 6;
    ctx.fillRect(barX, barY, barW * hpPct, barH);

    // Segmentos de vida
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth   = 1;
    for (let i = 1; i < ship.maxHp; i++) {
      const sx = barX + (barW / ship.maxHp) * i;
      ctx.beginPath();
      ctx.moveTo(sx, barY);
      ctx.lineTo(sx, barY + barH);
      ctx.stroke();
    }

    ctx.shadowBlur  = 0;
    ctx.fillStyle   = `hsla(${hpHue},60%,70%,0.5)`;
    ctx.fillText('VIDA', barX, barY - 5);
  }

  // ── Score (arriba derecha) ──────────────────────────────
  ctx.shadowBlur  = 0;
  ctx.fillStyle   = 'rgba(100,200,255,0.35)';
  ctx.textAlign   = 'right';
  ctx.fillText(String(score).padStart(6, '0'), W - 28, 40);

  // ── Barra de jefe — LEVIATÁN (arriba centro) ─────────────
  const levi = enemies.find(e => e.type === 'LEVIATHAN' && !e.isDead);
  if (levi) {
    const bw    = Math.min(400, W * 0.5);
    const bx    = W / 2 - bw / 2;
    const by    = 16;
    const bh    = 8;
    const pct   = levi.hp / levi.maxHp;

    ctx.textAlign   = 'center';
    ctx.fillStyle   = 'rgba(255,60,30,0.6)';
    ctx.fillText('L E V I A T Á N', W / 2, by - 5);

    ctx.fillStyle   = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx, by, bw, bh);

    ctx.shadowColor = 'rgba(255,60,30,0.8)';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = `hsl(${5 + pct * 15},100%,55%)`;
    ctx.fillRect(bx, by, bw * pct, bh);
  }

  ctx.restore();
}
