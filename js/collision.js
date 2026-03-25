// collision.js — Detección de colisiones

import { ship }            from './ship.js';
import { getBullets }      from './bullets.js';
import { enemies, enemyBullets, addScore } from './enemies.js';
import { TYPES }           from './enemyTypes.js';
import { spawnBurst }      from './particles.js';

const PLAYER_HITBOX    = 10;  // radio de colisión del jugador
const BULLET_HITBOX    =  5;  // radio de colisión del proyectil jugador
const EBULLET_HITBOX   =  4;  // radio de colisión proyectil enemigo
const CONTACT_DAMAGE_INTERVAL = 45; // frames entre daño por contacto

export function checkCollisions() {
  checkPlayerBulletsVsEnemies();
  checkEnemyBulletsVsPlayer();
  checkEnemyContactVsPlayer();
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

      const dist = distance(b, e);
      const threshold = BULLET_HITBOX + e.size * 0.75;

      if (dist < threshold) {
        // SHELL: comprobar si el escudo bloquea este proyectil
        if (e.type === 'SHELL' && isBlockedByShield(b, e)) {
          // Bala bloqueada — destruir bala pero no dañar enemigo
          bullets.splice(bi, 1);
          spawnBurst(b.x, b.y, TYPES.SHELL.hue, 4);
          break;
        }

        // Impacto normal
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
  if (ship.invTimer > 0) return;

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    if (b.isMine) continue; // las minas se manejan en checkMinesVsPlayer

    if (distance(b, ship) < EBULLET_HITBOX + PLAYER_HITBOX) {
      enemyBullets.splice(i, 1);
      damagePlayer(b.damage);
    }
  }
}

// ── Minas vs jugador ─────────────────────────────────────────
function checkMinesVsPlayer() {
  if (ship.invTimer > 0) return;

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    if (!b.isMine || !b.armed) continue;

    if (distance(b, ship) < b.triggerRadius) {
      enemyBullets.splice(i, 1);
      spawnBurst(b.x, b.y, b.hue, 20);
      damagePlayer(b.damage);
    }
  }
}

// ── Contacto físico enemigo vs jugador ───────────────────────
function checkEnemyContactVsPlayer() {
  if (ship.invTimer > 0) return;

  for (const e of enemies) {
    if (e.isDead) continue;
    if (!e.contactTimer) e.contactTimer = 0;
    e.contactTimer++;

    if (e.contactTimer < CONTACT_DAMAGE_INTERVAL) continue;

    const threshold = PLAYER_HITBOX + e.size * 0.6;
    if (distance(e, ship) < threshold) {
      e.contactTimer = 0;
      damagePlayer(1);
      // Rebote
      const { nx, ny } = normalize(ship.x - e.x, ship.y - e.y);
      ship.vx += nx * 5;
      ship.vy += ny * 5;
    }
  }
}

// ── SHELL: comprobar si el escudo bloquea una bala ───────────
function isBlockedByShield(bullet, enemy) {
  const def = TYPES.SHELL;
  // Ángulo desde el enemigo hasta la bala
  const angleToBullet = Math.atan2(bullet.y - enemy.y, bullet.x - enemy.x);
  // El escudo apunta hacia el jugador (shieldAngle)
  let diff = angleToBullet - enemy.shieldAngle;
  while (diff >  Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) < def.shieldArc / 2;
}

// ── Daño al jugador ───────────────────────────────────────────
function damagePlayer(amount) {
  ship.hp = Math.max(0, ship.hp - amount);
  ship.invTimer = 80; // 80 frames de invulnerabilidad
  spawnBurst(ship.x, ship.y, 200, 10);
}

// ── Helpers ───────────────────────────────────────────────────
function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalize(x, y) {
  const len = Math.sqrt(x * x + y * y) || 1;
  return { nx: x / len, ny: y / len };
}
