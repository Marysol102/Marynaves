// ship.js — Estado y física de la criatura

import { input } from './input.js';

export const ship = {
  x: 0, y: 0,
  vx: 0, vy: 0,
  angle: 0,
  targetAngle: 0,
  size: 14,

  hp:       100,
  maxHp:    100,
  invTimer: 0,        // frames de invulnerabilidad tras recibir daño
  regenTimer: 0,      // frames desde el último daño recibido
  isDead:   false,
  deathTimer: 0,      // frames desde la muerte (para animación)
};

const DRAG        = 0.965;
const ACCEL       = 0.18;
const MAX_DIST    = 280;
const ROT_SPEED   = 0.12;
const REGEN_DELAY = 180;   // frames sin daño antes de empezar a regenerar (~3s)
const REGEN_RATE  = 0.06;  // HP por frame durante la regeneración

export function initShip(W, H) {
  ship.x          = W / 2;
  ship.y          = H / 2;
  ship.vx         = 0;
  ship.vy         = 0;
  ship.hp         = ship.maxHp;
  ship.invTimer   = 0;
  ship.regenTimer = 0;
  ship.isDead     = false;
  ship.deathTimer = 0;
  ship.angle      = -Math.PI / 2;
  ship.targetAngle = ship.angle;
}

export function updateShip(W, H) {
  if (ship.isDead) {
    ship.deathTimer++;
    return;
  }

  const dx   = input.x - ship.x;
  const dy   = input.y - ship.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 5) {
    ship.targetAngle = Math.atan2(dy, dx);
    const force = Math.min(dist, MAX_DIST) / MAX_DIST * ACCEL;
    if (dist > 8) {
      ship.vx += (dx / dist) * force;
      ship.vy += (dy / dist) * force;
    }
  }

  ship.angle = lerpAngle(ship.angle, ship.targetAngle, ROT_SPEED);
  ship.vx *= DRAG;
  ship.vy *= DRAG;
  ship.x  += ship.vx;
  ship.y  += ship.vy;

  // Wrap-around
  if (ship.x < -60)    ship.x = W + 60;
  if (ship.x > W + 60) ship.x = -60;
  if (ship.y < -60)    ship.y = H + 60;
  if (ship.y > H + 60) ship.y = -60;

  // Invulnerabilidad
  if (ship.invTimer > 0) ship.invTimer--;

  // Regeneración de vida
  ship.regenTimer++;
  if (ship.regenTimer > REGEN_DELAY && ship.hp < ship.maxHp) {
    ship.hp = Math.min(ship.maxHp, ship.hp + REGEN_RATE);
  }
}

export function damageShip(amount) {
  if (ship.isDead || ship.invTimer > 0) return;
  ship.hp         = Math.max(0, ship.hp - amount);
  ship.invTimer   = 80;
  ship.regenTimer = 0; // reinicia el contador de regen
  if (ship.hp <= 0) {
    ship.isDead   = true;
    ship.deathTimer = 0;
  }
}

export function getShipSpeed() {
  return Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
}

function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff >  Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
