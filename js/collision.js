// collision.js — Detección de colisiones

import { ship, damageShip }  from './ship.js';
import { getBullets }        from './bullets.js';
import { enemies, enemyBullets, addScore } from './enemies.js';
import { TYPES }             from './enemyTypes.js';
import { spawnBurst }        from './particles.js';

const PLAYER_HITBOX  = 10;
const BULLET_HITBOX  =  5;
const EBULLET_HITBOX =  4;

export function checkCollisions() {
  if (ship.isDead) return;
  checkPlayerBulletsVsEnemies();
  checkEnemyBulletsVsPlayer();
  checkMinesVsPlayer();
  checkEnemyContactVsPlayer();
}

// ── Proyectiles del jugador vs enemigos ───────────────────────
function checkPlayerBulletsVsEnemies() {
  const bullets = getBullets();
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi];
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (e.isDead) continue;
      const dist = distance(b, e);
      if (dist < BULLET_HITBOX + e.size * 0.75) {
        if (e.type === 'SHELL' && isBlockedByShield(b, e)) {
          bullets.splice(bi, 1);
          spawnBurst(b.x, b.y, TYPES.SHELL.hue, 4);
          break;
        }
        e.hp--;
        e.flashTimer = 6;
        bullets.splice(bi, 1);
        if (e.hp <= 0) {
          e.isDead = true;
          addScore(TYPES[e.type].scoreValue);
          spawnBurst(e.x, e.y, TYPES[e.type].hue, e.type === 'LEVIATHAN' ? 40 : 14);
        } else {
          spawnBurst(b.x, b.y, TYPES[e.type].hue, 5);
        }
        break;
      }
    }
  }
}

// ── Proyectiles enemigos vs jugador ──────────────────────────
function checkEnemyBulletsVsPlayer() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    if (b.isMine) continue;
    if (distance(b, ship) < EBULLET_HITBOX + PLAYER_HITBOX) {
      enemyBullets.splice(i, 1);
      damageShip(b.damage * 8);
      pushShipFrom(b.x, b.y, 3);
      spawnBurst(ship.x, ship.y, 200, 8);
    }
  }
}

// ── Minas vs jugador ─────────────────────────────────────────
function checkMinesVsPlayer() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    if (!b.isMine || !b.armed) continue;
    if (distance(b, ship) < b.triggerRadius) {
      enemyBullets.splice(i, 1);
      spawnBurst(b.x, b.y, b.hue, 20);
      damageShip(b.damage * 12);
      pushShipFrom(b.x, b.y, 9);
      spawnBurst(ship.x, ship.y, 200, 10);
    }
  }
}

// ── Contacto físico de cualquier enemigo vs jugador ───────────
function checkEnemyContactVsPlayer() {
  for (const e of enemies) {
    if (e.isDead) continue;
    if (!e.contactCooldown) e.contactCooldown = 0;
    if (e.contactCooldown > 0) { e.contactCooldown--; continue; }

    const dist      = distance(e, ship);
    const threshold = PLAYER_HITBOX + e.size * 0.7;

    if (dist < threshold) {
      const def = TYPES[e.type];
      // Daño basado en HP del tipo: enemigos más duros hacen más daño al tocar
      const dmg = Math.min(22, (def?.hp ?? 1) * 2.5);
      damageShip(dmg);
      e.contactCooldown = 55; // ~0.9s de cooldown por enemigo

      // Empuje proporcional al tamaño
      pushShipFrom(e.x, e.y, 4.5 + e.size * 0.12);
      spawnBurst(ship.x, ship.y, 200, 6);
    }
  }
}

// ── SHELL: escudo ────────────────────────────────────────────
function isBlockedByShield(bullet, enemy) {
  const def = TYPES.SHELL;
  const angleToBullet = Math.atan2(bullet.y - enemy.y, bullet.x - enemy.x);
  let diff = angleToBullet - enemy.shieldAngle;
  while (diff >  Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) < def.shieldArc / 2;
}

// ── Helpers ───────────────────────────────────────────────────
function pushShipFrom(ox, oy, force) {
  const dx  = ship.x - ox;
  const dy  = ship.y - oy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  ship.vx  += (dx / len) * force;
  ship.vy  += (dy / len) * force;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
