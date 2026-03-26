// renderer.js — Todo el dibujo del juego

import { ship }                             from './ship.js';
import { getBullets }                       from './bullets.js';
import { getParticles }                     from './particles.js';
import { input }                            from './input.js';
import { enemies, enemyBullets, score }     from './enemies.js';
import { drawEnemy, drawEnemyBullets }      from './enemyRenderer.js';

export function drawScene(ctx, W, H) {
  drawParticles(ctx);
  drawBullets(ctx);
  drawEnemyBullets(ctx, enemyBullets);
  for (const e of enemies) drawEnemy(ctx, e);

  if (!ship.isDead) {
    drawCreature(ctx);
    if (!input.isMobile) drawCursor(ctx);
  } else {
    drawDeathExplosion(ctx);
  }

  drawHUD(ctx, W, H);

  if (ship.isDead && ship.deathTimer > 80) {
    drawGameOver(ctx, W, H);
  }
}

// ── Criatura ──────────────────────────────────────────────────
function drawCreature(ctx) {
  const { x, y, angle, size: s } = ship;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);

  const now   = Date.now();
  const pulse = 1 + Math.sin(now * 0.004) * 0.06;
  const glow  = 0.7 + Math.sin(now * 0.006) * 0.3;

  // Parpadeo cuando está en invulnerabilidad
  if (ship.invTimer > 0 && Math.floor(now / 60) % 2 === 0) {
    ctx.restore();
    return;
  }

  // Halo
  const halo = ctx.createRadialGradient(0, 0, s * 0.5, 0, 0, s * 3.5 * pulse);
  halo.addColorStop(0, `rgba(60,160,255,${glow * 0.15})`);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, s * 3.5 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = `rgba(80,200,255,${glow})`;
  ctx.shadowBlur  = 14;

  // Ala izquierda
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.9);
  ctx.bezierCurveTo(-s*2.2, -s*0.3, -s*2.5, s*0.6, -s*0.2, s*0.5);
  ctx.bezierCurveTo(-s*0.1, s*0.2, 0, s*0.1, 0, 0);
  ctx.fillStyle   = `rgba(20,80,160,${0.35*glow})`;
  ctx.strokeStyle = `rgba(100,220,255,${0.8*glow})`;
  ctx.lineWidth   = 1.2;
  ctx.fill(); ctx.stroke();

  // Ala derecha
  ctx.beginPath();
  ctx.moveTo(0, -s*0.9);
  ctx.bezierCurveTo(s*2.2, -s*0.3, s*2.5, s*0.6, s*0.2, s*0.5);
  ctx.bezierCurveTo(s*0.1, s*0.2, 0, s*0.1, 0, 0);
  ctx.fill(); ctx.stroke();

  // Cola
  ctx.beginPath();
  ctx.moveTo(-s*0.15, s*0.4);
  ctx.bezierCurveTo(-s*0.3, s*1.2, -s*0.1, s*1.8, 0, s*2.1);
  ctx.bezierCurveTo(s*0.1, s*1.8, s*0.3, s*1.2, s*0.15, s*0.4);
  ctx.fillStyle = `rgba(20,80,160,${0.25*glow})`;
  ctx.fill(); ctx.stroke();

  // Núcleo
  const core = ctx.createRadialGradient(0, -s*0.1, 0, 0, -s*0.1, s*0.7);
  core.addColorStop(0,   `rgba(180,240,255,${glow})`);
  core.addColorStop(0.4, `rgba(60,160,255,${glow*0.7})`);
  core.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.ellipse(0, -s*0.1, s*0.65, s*0.55, 0, 0, Math.PI*2);
  ctx.fill();

  // Ojo
  ctx.shadowBlur  = 8;
  ctx.shadowColor = 'rgba(200,240,255,0.9)';
  ctx.fillStyle   = 'rgba(200,240,255,0.9)';
  ctx.beginPath();
  ctx.arc(0, -s*0.72, s*0.13, 0, Math.PI*2);
  ctx.fill();

  // Tentáculos
  ctx.shadowBlur = 5;
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const tx     = i * s * 0.28;
    const wiggle = Math.sin(now * 0.003 + i) * s * 0.3;
    ctx.strokeStyle = `rgba(80,180,255,${0.3*glow})`;
    ctx.lineWidth   = 0.9;
    ctx.beginPath();
    ctx.moveTo(tx, s*0.5);
    ctx.bezierCurveTo(tx+wiggle, s*1.1, tx-wiggle*0.5, s*1.7, tx+wiggle*0.3, s*2.2);
    ctx.stroke();
  }

  ctx.restore();

  // ── Haz de mira (fuera del ctx rotado, en espacio mundo) ──
  drawAimBeam(ctx, x, y, angle, s);
}

// ── Haz de mira ───────────────────────────────────────────────
function drawAimBeam(ctx, x, y, angle, s) {
  const beamLen = 55;
  const startD  = s * 1.1;          // empieza justo delante del morro
  const sx = x + Math.cos(angle) * startD;
  const sy = y + Math.sin(angle) * startD;
  const ex = x + Math.cos(angle) * (startD + beamLen);
  const ey = y + Math.sin(angle) * (startD + beamLen);

  ctx.save();
  // Línea exterior tenue
  ctx.strokeStyle = 'rgba(180,240,255,0.12)';
  ctx.lineWidth   = 3;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Línea central brillante con degradado
  const grad = ctx.createLinearGradient(sx, sy, ex, ey);
  grad.addColorStop(0, 'rgba(180,240,255,0.7)');
  grad.addColorStop(1, 'rgba(180,240,255,0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth   = 1.2;
  ctx.shadowColor = 'rgba(120,200,255,0.5)';
  ctx.shadowBlur  = 6;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Puntito en el extremo
  ctx.fillStyle   = 'rgba(200,240,255,0.4)';
  ctx.shadowBlur  = 4;
  ctx.beginPath();
  ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── Explosión de muerte del jugador ───────────────────────────
function drawDeathExplosion(ctx) {
  const t    = ship.deathTimer;
  const x    = ship.x;
  const y    = ship.y;

  if (t > 160) return;

  const rings = [
    { delay: 0,  speed: 4,   alpha: 0.9, hue: 200 },
    { delay: 8,  speed: 3,   alpha: 0.7, hue: 180 },
    { delay: 18, speed: 2.5, alpha: 0.5, hue: 160 },
  ];

  ctx.save();
  for (const r of rings) {
    const rt = t - r.delay;
    if (rt < 0) continue;
    const radius = rt * r.speed;
    const alpha  = Math.max(0, r.alpha * (1 - rt / 80));
    ctx.strokeStyle = `hsla(${r.hue},100%,75%,${alpha})`;
    ctx.lineWidth   = 2.5 * (1 - rt / 120);
    ctx.shadowColor = `hsla(${r.hue},100%,80%,${alpha})`;
    ctx.shadowBlur  = 18;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Flash central que se desvanece
  if (t < 30) {
    const alpha = (1 - t / 30) * 0.6;
    const grad  = ctx.createRadialGradient(x, y, 0, x, y, 80);
    grad.addColorStop(0, `rgba(200,240,255,${alpha})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── Proyectiles del jugador ───────────────────────────────────
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
    ctx.arc(0, 0, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Partículas ────────────────────────────────────────────────
function drawParticles(ctx) {
  for (const p of getParticles()) {
    ctx.save();
    ctx.globalAlpha = p.life * 0.6;
    ctx.shadowColor = `hsla(${p.hue},100%,70%,0.8)`;
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = `hsla(${p.hue},100%,75%,${p.life})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Cursor retícula ───────────────────────────────────────────
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
  ctx.moveTo(x-cr-4, y); ctx.lineTo(x+cr+4, y);
  ctx.moveTo(x, y-cr-4); ctx.lineTo(x, y+cr+4);
  ctx.stroke();
  ctx.restore();
}

// ── HUD ───────────────────────────────────────────────────────
function drawHUD(ctx, W, H) {
  ctx.save();

  // ── Barra de vida — única, larga, con regen ───────────────
  const barW  = Math.min(280, W * 0.35);
  const barH  = 7;
  const barX  = 28;
  const barY  = 38;
  const pct   = Math.max(0, ship.hp / ship.maxHp);

  // Fondo
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

  // Color según vida restante
  const hpHue = pct > 0.55 ? 185 : pct > 0.28 ? 48 : 0;

  // Indicador de regen activo (brillo sutil en la barra vacía)
  const regenActive = ship.regenTimer > 180 && pct < 1;
  if (regenActive) {
    ctx.fillStyle = `hsla(${hpHue},60%,30%,0.3)`;
    ctx.fillRect(barX, barY, barW, barH);
  }

  // Barra de vida
  if (!ship.isDead) {
    // Parpadeo cuando está muy baja
    const flicker = pct < 0.2 && ship.invTimer > 0 && Math.floor(Date.now() / 80) % 2;
    if (!flicker) {
      ctx.fillStyle   = `hsla(${hpHue},100%,58%,0.92)`;
      ctx.shadowColor = `hsla(${hpHue},100%,70%,0.7)`;
      ctx.shadowBlur  = 8;
      ctx.fillRect(barX, barY, barW * pct, barH);
    }
  }

  // Etiqueta
  ctx.shadowBlur  = 0;
  ctx.fillStyle   = regenActive
    ? `hsla(${hpHue},80%,70%,0.6)`
    : 'rgba(100,200,255,0.35)';
  ctx.font        = '10px Courier New';
  ctx.textAlign   = 'left';
  ctx.fillText(regenActive ? 'VIDA  ↑' : 'VIDA', barX, barY - 6);

  // ── Score ─────────────────────────────────────────────────
  ctx.shadowBlur  = 0;
  ctx.fillStyle   = 'rgba(100,200,255,0.35)';
  ctx.font        = '11px Courier New';
  ctx.textAlign   = 'right';
  ctx.fillText(String(score).padStart(6, '0'), W - 28, 40);

  // ── Barra del Leviatán ────────────────────────────────────
  const levi = enemies.find(e => e.type === 'LEVIATHAN' && !e.isDead);
  if (levi) {
    const bw  = Math.min(400, W * 0.5);
    const bx  = W / 2 - bw / 2;
    const by  = 16;
    const bh  = 8;
    const lpt = levi.hp / levi.maxHp;

    ctx.textAlign   = 'center';
    ctx.fillStyle   = 'rgba(255,60,30,0.6)';
    ctx.font        = '10px Courier New';
    ctx.fillText('L E V I A T Á N', W / 2, by - 5);

    ctx.fillStyle   = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx, by, bw, bh);

    ctx.shadowColor = 'rgba(255,60,30,0.8)';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = `hsl(${5 + lpt * 15},100%,55%)`;
    ctx.fillRect(bx, by, bw * lpt, bh);
  }

  ctx.restore();
}

// ── Game Over ─────────────────────────────────────────────────
function drawGameOver(ctx, W, H) {
  const t     = ship.deathTimer - 80;
  const alpha = Math.min(1, t / 60);

  ctx.save();

  // Overlay oscuro
  ctx.fillStyle = `rgba(0,0,10,${alpha * 0.72})`;
  ctx.fillRect(0, 0, W, H);

  if (alpha < 0.3) { ctx.restore(); return; }

  // Texto principal
  ctx.textAlign    = 'center';
  ctx.shadowColor  = 'rgba(80,180,255,0.8)';
  ctx.shadowBlur   = 30;
  ctx.fillStyle    = `rgba(180,230,255,${alpha})`;
  ctx.font         = `${Math.floor(48 * alpha)}px Courier New`;
  ctx.fillText('G A M E   O V E R', W / 2, H / 2 - 20);

  // Score final
  ctx.shadowBlur   = 10;
  ctx.fillStyle    = `rgba(100,200,255,${alpha * 0.7})`;
  ctx.font         = '16px Courier New';
  ctx.fillText(`puntuación  ${String(score).padStart(6, '0')}`, W / 2, H / 2 + 24);

  // Instrucción reinicio
  if (t > 120) {
    const blinkAlpha = (Math.sin(Date.now() * 0.004) * 0.5 + 0.5) * alpha;
    ctx.fillStyle    = `rgba(100,200,255,${blinkAlpha * 0.55})`;
    ctx.font         = '11px Courier New';
    ctx.fillText('pulsa R para reiniciar', W / 2, H / 2 + 60);
  }

  ctx.restore();
}
