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
}

// ── Proyectiles del jugador vs enemigos ───────────────────────
function checkPlayerBulletsVsEnemies() {
  const bullets = getBullets();

  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi];

    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (e.isDead) continue;

      const dist      = distance(b, e);
      const threshold = BULLET_HITBOX + e.size * 0.75;

      if (dist < threshold) {
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
      damageShip(b.damage * 8); // daño en escala 0-100
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
      spawnBurst(ship.x, ship.y, 200, 10);
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
function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
