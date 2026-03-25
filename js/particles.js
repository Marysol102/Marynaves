// particles.js — Estela de partículas bioluminiscentes

import { ship, getShipSpeed } from './ship.js';

const particles = [];

export function getParticles() { return particles; }

export function updateParticles() {
  const speed = getShipSpeed();

  // Emitir partículas según velocidad
  if (speed > 0.4 && Math.random() < speed * 0.3) {
    spawnParticle();
  }

  // Actualizar
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x    += p.vx;
    p.y    += p.vy;
    p.vx   *= 0.97;
    p.vy   *= 0.97;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function spawnParticle() {
  const spread = (Math.random() - 0.5) * 0.8;
  const speed  = Math.random() * 1.5 + 0.5;
  particles.push({
    x: ship.x,
    y: ship.y,
    vx: Math.cos(ship.angle + Math.PI + spread) * speed,
    vy: Math.sin(ship.angle + Math.PI + spread) * speed,
    life:  1,
    decay: Math.random() * 0.025 + 0.015,
    size:  Math.random() * 2.5 + 0.8,
    hue:   Math.random() * 40 + 180  // rango azul-cian
  });
}

// ── Explosión de partículas en un punto (muerte de enemigo, impacto) ──
export function spawnBurst(x, y, hue, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = Math.random() * 3.5 + 0.5;
    particles.push({
      x, y,
      vx:    Math.cos(angle) * spd,
      vy:    Math.sin(angle) * spd,
      life:  1,
      decay: Math.random() * 0.03 + 0.018,
      size:  Math.random() * 4 + 1,
      hue:   hue + (Math.random() - 0.5) * 30,
    });
  }
}
