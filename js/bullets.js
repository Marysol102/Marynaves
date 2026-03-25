// bullets.js — Sistema de proyectiles

import { input } from './input.js';
import { ship } from './ship.js';

const bullets = [];
const BULLET_SPEED    = 11;
const SHOOT_INTERVAL  = 8;   // frames entre disparos
let   shootTimer      = SHOOT_INTERVAL; // listo para disparar en el primer frame

export function getBullets() { return bullets; }

export function updateBullets(W, H) {
  // Disparar si hay click/toque activo
  if (input.active) {
    shootTimer++;
    if (shootTimer >= SHOOT_INTERVAL) {
      shootTimer = 0;
      spawnBullet();
    }
  } else {
    // Resetear timer para que dispare inmediatamente al primer click
    shootTimer = SHOOT_INTERVAL;
  }

  // Mover y descartar proyectiles fuera del canvas o expirados
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x    += b.vx;
    b.y    += b.vy;
    b.life -= 0.008;
    if (b.life <= 0 || b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) {
      bullets.splice(i, 1);
    }
  }
}

function spawnBullet() {
  const tipX = ship.x + Math.cos(ship.angle) * ship.size;
  const tipY = ship.y + Math.sin(ship.angle) * ship.size;
  bullets.push({
    x: tipX,
    y: tipY,
    vx: Math.cos(ship.angle) * BULLET_SPEED,
    vy: Math.sin(ship.angle) * BULLET_SPEED,
    life: 1
  });
}
