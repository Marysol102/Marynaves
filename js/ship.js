// ship.js — Estado y física de la criatura

import { input } from './input.js';

export const ship = {
  x: 0, y: 0,
  vx: 0, vy: 0,
  angle: 0,
  targetAngle: 0,
  size: 14,          // tamaño base
  hp:    5,
  maxHp: 5,
  invTimer: 0,       // frames de invulnerabilidad tras recibir daño
};

const DRAG      = 0.965;   // resistencia del agua
const ACCEL     = 0.18;    // fuerza de aceleración base
const MAX_DIST  = 280;     // distancia considerada "máximo"
const ROT_SPEED = 0.12;    // velocidad de giro

export function initShip(W, H) {
  ship.x        = W / 2;
  ship.y        = H / 2;
  ship.hp       = ship.maxHp;
  ship.invTimer = 0;
  ship.angle    = -Math.PI / 2;
  ship.targetAngle = ship.angle;
}

export function updateShip(W, H) {
  const dx   = input.x - ship.x;
  const dy   = input.y - ship.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 5) {
    ship.targetAngle = Math.atan2(dy, dx);

    // Aceleración proporcional a la distancia, cap a MAX_DIST
    const force = Math.min(dist, MAX_DIST) / MAX_DIST * ACCEL;
    if (dist > 8) {
      ship.vx += (dx / dist) * force;
      ship.vy += (dy / dist) * force;
    }
  }

  // Rotación suave
  ship.angle = lerpAngle(ship.angle, ship.targetAngle, ROT_SPEED);

  // Inercia + drag de agua
  ship.vx *= DRAG;
  ship.vy *= DRAG;
  ship.x  += ship.vx;
  ship.y  += ship.vy;

  // Wrap-around en bordes
  if (ship.x < -60)  ship.x = W + 60;
  if (ship.x > W+60) ship.x = -60;
  if (ship.y < -60)  ship.y = H + 60;
  if (ship.y > H+60) ship.y = -60;

  // Invulnerabilidad
  if (ship.invTimer > 0) ship.invTimer--;
}

export function getShipSpeed() {
  return Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
}

// ── helpers ──────────────────────────────────────────────
function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff >  Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
