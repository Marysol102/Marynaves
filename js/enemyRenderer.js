// enemyRenderer.js — Dibujo de cada tipo de enemigo

import { TYPES } from './enemyTypes.js';

export function drawEnemy(ctx, enemy) {
  if (enemy.isDead) return;

  const def   = TYPES[enemy.type];
  const flash = enemy.flashTimer > 0;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  // Flash blanco al recibir impacto
  if (flash) ctx.filter = 'brightness(4)';

  switch (enemy.type) {
    case 'SPORE':     drawSpore(ctx, enemy, def);     break;
    case 'DRIFTER':   drawDrifter(ctx, enemy, def);   break;
    case 'SHELL':     drawShell(ctx, enemy, def);     break;
    case 'LEVIATHAN': drawLeviathan(ctx, enemy, def); break;
    case 'SWARM':     drawSwarm(ctx, enemy, def);     break;
    case 'DART':      drawDart(ctx, enemy, def);      break;
    case 'CRUSHER':   drawCrusher(ctx, enemy, def);   break;
  }

  ctx.filter = 'none';

  // Barra de vida (excepto SPORE y SWARM que mueren de 1 golpe)
  if (enemy.maxHp > 1 && enemy.type !== 'LEVIATHAN') {
    drawHpBar(ctx, enemy);
  }

  ctx.restore();
}

// ── Barra de vida ─────────────────────────────────────────────
function drawHpBar(ctx, enemy) {
  const { size, hp, maxHp } = enemy;
  const w    = size * 2;
  const x    = -w / 2;
  const y    = -size - 10;
  const pct  = hp / maxHp;

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x, y, w, 3);

  const hue = pct > 0.5 ? 120 : pct > 0.25 ? 50 : 0;
  ctx.fillStyle = `hsl(${hue},100%,60%)`;
  ctx.fillRect(x, y, w * pct, 3);
}

// ── SPORE ─────────────────────────────────────────────────────
function drawSpore(ctx, enemy, def) {
  const s    = enemy.size;
  const now  = Date.now();
  const glow = 0.7 + Math.sin(now * 0.008 + enemy.id) * 0.3;
  const r    = s * (1 + Math.sin(now * 0.01 + enemy.id) * 0.12);

  ctx.shadowColor = `hsla(${def.hue},100%,70%,${glow})`;
  ctx.shadowBlur  = 14;

  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0,   `hsla(${def.hue},100%,85%,${glow})`);
  g.addColorStop(0.6, `hsla(${def.hue},100%,55%,${glow * 0.7})`);
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Núcleo brillante
  ctx.fillStyle = `hsla(${def.hue},80%,92%,${glow})`;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// ── DRIFTER (medusa) ──────────────────────────────────────────
function drawDrifter(ctx, enemy, def) {
  ctx.rotate(enemy.angle + Math.PI / 2);
  const s   = enemy.size;
  const now = Date.now();
  const g   = 0.7 + Math.sin(now * 0.004 + enemy.id) * 0.3;

  ctx.shadowColor = `hsla(${def.hue},100%,65%,${g})`;
  ctx.shadowBlur  = 16;

  // Campana
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(-s * 1.2, -s * 0.6, -s * 1.3, s * 0.2, 0, s * 0.4);
  ctx.bezierCurveTo( s * 1.3,  s * 0.2,  s * 1.2, -s * 0.6, 0, -s);
  ctx.fillStyle   = `hsla(${def.hue},100%,30%,0.5)`;
  ctx.strokeStyle = `hsla(${def.hue},100%,75%,${g})`;
  ctx.lineWidth   = 1.2;
  ctx.fill();
  ctx.stroke();

  // Borde interior de campana
  ctx.beginPath();
  ctx.moveTo(-s * 0.7, s * 0.1);
  ctx.bezierCurveTo(-s * 0.5, s * 0.5, s * 0.5, s * 0.5, s * 0.7, s * 0.1);
  ctx.strokeStyle = `hsla(${def.hue},100%,80%,${g * 0.5})`;
  ctx.lineWidth   = 0.8;
  ctx.stroke();

  // Tentáculos ondulantes
  for (let i = -3; i <= 3; i++) {
    const tx     = i * s * 0.22;
    const phase  = now * 0.003 + i * 1.2;
    const wiggle = Math.sin(phase) * s * 0.35;
    ctx.strokeStyle = `hsla(${def.hue},100%,65%,${0.4 * g})`;
    ctx.lineWidth   = 0.8;
    ctx.beginPath();
    ctx.moveTo(tx, s * 0.35);
    ctx.bezierCurveTo(tx + wiggle, s * 1.0, tx - wiggle * 0.6, s * 1.7, tx + wiggle * 0.3, s * 2.3);
    ctx.stroke();
  }
}

// ── SHELL (náutilo con escudo) ────────────────────────────────
function drawShell(ctx, enemy, def) {
  const s   = enemy.size;
  const now = Date.now();
  const g   = 0.7 + Math.sin(now * 0.005 + enemy.id) * 0.25;

  ctx.shadowColor = `hsla(${def.hue},100%,65%,${g})`;
  ctx.shadowBlur  = 12;

  // Cuerpo (espiral de náutilo simplificada)
  ctx.beginPath();
  ctx.arc(0, 0, s, 0, Math.PI * 2);
  ctx.fillStyle   = `hsla(${def.hue},80%,20%,0.7)`;
  ctx.strokeStyle = `hsla(${def.hue},100%,65%,${g})`;
  ctx.lineWidth   = 1.5;
  ctx.fill();
  ctx.stroke();

  // Espiral interior
  ctx.strokeStyle = `hsla(${def.hue},100%,50%,${g * 0.4})`;
  ctx.lineWidth   = 0.8;
  ctx.beginPath();
  for (let t = 0; t < Math.PI * 2.5; t += 0.1) {
    const r  = s * 0.6 * (1 - t / (Math.PI * 3));
    const px = Math.cos(t) * r;
    const py = Math.sin(t) * r;
    if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Ojo
  ctx.fillStyle   = `hsla(${def.hue},100%,85%,${g})`;
  ctx.shadowBlur  = 8;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Escudo frontal (arco brillante que siempre apunta al jugador)
  ctx.rotate(enemy.shieldAngle);
  const halfArc = def.shieldArc / 2;
  ctx.strokeStyle = `hsla(${def.hue},100%,80%,${0.85 * g})`;
  ctx.lineWidth   = 3.5;
  ctx.shadowColor = `hsla(${def.hue},100%,80%,0.9)`;
  ctx.shadowBlur  = 18;
  ctx.beginPath();
  ctx.arc(0, 0, s * 1.45, -halfArc, halfArc);
  ctx.stroke();

  // Extremos del escudo
  for (const a of [-halfArc, halfArc]) {
    const ex = Math.cos(a) * s * 1.45;
    const ey = Math.sin(a) * s * 1.45;
    ctx.fillStyle = `hsla(${def.hue},100%,90%,${g})`;
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── LEVIATÁN (jefe) ────────────────────────────────────────────
function drawLeviathan(ctx, enemy, def) {
  ctx.rotate(enemy.angle + Math.PI / 2);
  const s   = enemy.size;
  const now = Date.now();
  const g   = 0.65 + Math.sin(now * 0.003 + enemy.id) * 0.25;
  const pls = 1 + Math.sin(now * 0.002) * 0.04;

  ctx.shadowColor = `hsla(${def.hue},100%,55%,${g})`;
  ctx.shadowBlur  = 24;

  // Aura exterior
  const aura = ctx.createRadialGradient(0, 0, s * 0.5, 0, 0, s * 2.2 * pls);
  aura.addColorStop(0,   `hsla(${def.hue},100%,30%,${g * 0.2})`);
  aura.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, s * 2.2 * pls, 0, Math.PI * 2);
  ctx.fill();

  // Cuerpo principal angular
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(-s * 0.5, -s * 0.7, -s * 0.8, -s * 0.3, -s * 0.7, s * 0.2);
  ctx.bezierCurveTo(-s * 0.5, s * 0.6, -s * 0.2, s * 0.8, 0, s * 0.9);
  ctx.bezierCurveTo( s * 0.2, s * 0.8,  s * 0.5, s * 0.6,  s * 0.7, s * 0.2);
  ctx.bezierCurveTo( s * 0.8, -s * 0.3, s * 0.5, -s * 0.7, 0, -s);
  ctx.fillStyle   = `hsla(${def.hue},80%,12%,0.85)`;
  ctx.strokeStyle = `hsla(${def.hue},100%,55%,${g})`;
  ctx.lineWidth   = 2;
  ctx.fill();
  ctx.stroke();

  // Espinas laterales
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const sy   = -s * 0.3 + i * s * 0.35;
      const sx   = side * s * 0.65;
      const ex   = side * (s * 0.95 + i * 4);
      const ey   = sy - s * 0.12;
      ctx.strokeStyle = `hsla(${def.hue},100%,55%,${g * 0.7})`;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }

  // Cola bifurcada
  ctx.strokeStyle = `hsla(${def.hue},100%,45%,${g * 0.6})`;
  ctx.lineWidth   = 2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * s * 0.15, s * 0.85);
    ctx.bezierCurveTo(side * s * 0.4, s * 1.2, side * s * 0.6, s * 1.5, side * s * 0.4, s * 1.9);
    ctx.stroke();
  }

  // Ojo / linterna
  ctx.shadowBlur  = 20;
  ctx.shadowColor = `hsla(${def.hue + 20},100%,80%,1)`;
  const eyeG = ctx.createRadialGradient(0, -s * 0.55, 0, 0, -s * 0.55, s * 0.22);
  eyeG.addColorStop(0, 'rgba(255,255,200,1)');
  eyeG.addColorStop(1, `hsla(${def.hue + 20},100%,60%,0)`);
  ctx.fillStyle = eyeG;
  ctx.beginPath();
  ctx.arc(0, -s * 0.55, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

// ── SWARM (crías) ─────────────────────────────────────────────
function drawSwarm(ctx, enemy, def) {
  ctx.rotate(enemy.angle + Math.PI / 2);
  const s   = enemy.size;
  const now = Date.now();
  const g   = 0.7 + Math.sin(now * 0.01 + enemy.id * 2) * 0.3;

  ctx.shadowColor = `hsla(${def.hue},100%,65%,${g})`;
  ctx.shadowBlur  = 8;
  ctx.fillStyle   = `hsla(${def.hue},100%,70%,${g})`;
  ctx.strokeStyle = `hsla(${def.hue},100%,90%,${g * 0.7})`;
  ctx.lineWidth   = 0.8;

  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(-s * 0.7, s * 0.7);
  ctx.lineTo(0, s * 0.3);
  ctx.lineTo(s * 0.7, s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// ── DART (anguila) ────────────────────────────────────────────
function drawDart(ctx, enemy, def) {
  ctx.rotate(enemy.angle + Math.PI / 2);
  const s   = enemy.size;
  const now = Date.now();
  const g   = 0.75 + Math.sin(now * 0.007 + enemy.id) * 0.2;

  ctx.shadowColor = `hsla(${def.hue},100%,65%,${g})`;
  ctx.shadowBlur  = 12;

  // Cuerpo alargado
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.8);
  ctx.bezierCurveTo(-s * 0.45, -s, -s * 0.55, s * 0.5, -s * 0.2, s * 1.5);
  ctx.bezierCurveTo(-s * 0.05, s * 1.8, s * 0.05, s * 1.8, s * 0.2, s * 1.5);
  ctx.bezierCurveTo( s * 0.55,  s * 0.5, s * 0.45, -s, 0, -s * 1.8);
  ctx.fillStyle   = `hsla(${def.hue},80%,18%,0.8)`;
  ctx.strokeStyle = `hsla(${def.hue},100%,65%,${g})`;
  ctx.lineWidth   = 1.2;
  ctx.fill();
  ctx.stroke();

  // Línea dorsal bioluminiscente
  ctx.strokeStyle = `hsla(${def.hue},100%,80%,${g * 0.8})`;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.7);
  ctx.lineTo(0, s * 1.5);
  ctx.stroke();

  // Ojo
  ctx.fillStyle  = `hsla(${def.hue},100%,85%,${g})`;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(0, -s * 1.2, s * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

// ── CRUSHER (cangrejo/mantis) ─────────────────────────────────
function drawCrusher(ctx, enemy, def) {
  ctx.rotate(enemy.angle + Math.PI / 2);
  const s   = enemy.size;
  const now = Date.now();
  const g   = 0.6 + Math.sin(now * 0.004 + enemy.id) * 0.25;

  ctx.shadowColor = `hsla(${def.hue},80%,55%,${g})`;
  ctx.shadowBlur  = 18;

  // Aura de empujón (sutil)
  const aura = ctx.createRadialGradient(0, 0, s * 0.8, 0, 0, s * 2.8);
  aura.addColorStop(0,   `hsla(${def.hue},80%,40%,${g * 0.08})`);
  aura.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, s * 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Cuerpo hexagonal
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const r = s * (i % 2 === 0 ? 1.0 : 0.85);
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle   = `hsla(${def.hue},60%,15%,0.85)`;
  ctx.strokeStyle = `hsla(${def.hue},80%,55%,${g})`;
  ctx.lineWidth   = 2;
  ctx.fill();
  ctx.stroke();

  // Pinzas (brazos superiores)
  for (const side of [-1, 1]) {
    const bx = side * s * 0.6;
    const by = -s * 0.5;
    ctx.strokeStyle = `hsla(${def.hue},80%,50%,${g * 0.8})`;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(side * s * 1.3, -s * 0.9);
    ctx.stroke();
    // Punta pinza
    ctx.beginPath();
    ctx.moveTo(side * s * 1.3, -s * 0.9);
    ctx.lineTo(side * s * 1.6, -s * 0.6);
    ctx.moveTo(side * s * 1.3, -s * 0.9);
    ctx.lineTo(side * s * 1.0, -s * 0.65);
    ctx.stroke();
  }

  // Ojo central
  ctx.fillStyle  = `hsla(${def.hue},100%,80%,${g})`;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

// ── Proyectiles enemigos y minas ──────────────────────────────
export function drawEnemyBullets(ctx, enemyBullets) {
  for (const b of enemyBullets) {
    if (b.isMine) {
      drawMine(ctx, b);
    } else {
      drawEnemyBullet(ctx, b);
    }
  }
}

function drawEnemyBullet(ctx, b) {
  ctx.save();
  ctx.globalAlpha = b.life;
  ctx.translate(b.x, b.y);
  ctx.shadowColor = `hsla(${b.hue},100%,70%,0.9)`;
  ctx.shadowBlur  = 10;
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size);
  g.addColorStop(0, `hsla(${b.hue},80%,90%,1)`);
  g.addColorStop(1, `hsla(${b.hue},100%,55%,0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, b.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMine(ctx, b) {
  const now   = Date.now();
  const pulse = b.armed ? (0.6 + Math.sin(now * 0.015) * 0.4) : 0.3;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.shadowColor = `hsla(${b.hue},100%,65%,${pulse})`;
  ctx.shadowBlur  = 14;
  ctx.strokeStyle = `hsla(${b.hue},100%,65%,${pulse})`;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, b.size, 0, Math.PI * 2);
  ctx.stroke();
  // Núcleo
  ctx.fillStyle = `hsla(${b.hue},100%,70%,${pulse * 0.8})`;
  ctx.beginPath();
  ctx.arc(0, 0, b.size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Picos
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * b.size,     Math.sin(a) * b.size);
    ctx.lineTo(Math.cos(a) * b.size * 1.5, Math.sin(a) * b.size * 1.5);
    ctx.stroke();
  }
  ctx.restore();
}
