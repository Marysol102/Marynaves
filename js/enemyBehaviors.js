// enemyBehaviors.js — Lógica de movimiento y ataque de cada tipo

import { TYPES } from './enemyTypes.js';

// Estados kamikaze
const KS_APPROACH = 0;
const KS_CHARGE   = 1;
const KS_FLEE     = 2;

export function updateBehavior(enemy, ship, enemyBullets) {
  if (ship.isDead) return; // enemigos se quedan quietos si el jugador murió

  enemy.stateTimer++;
  enemy.attackTimer++;

  const def = TYPES[enemy.type];

  switch (def.behavior) {
    case 'kamikaze':          behaviorKamikaze(enemy, ship, def);                     break;
    case 'spiral_shooter':    behaviorSpiralShooter(enemy, ship, def, enemyBullets);  break;
    case 'shielded_burst':    behaviorShieldedBurst(enemy, ship, def, enemyBullets);  break;
    case 'boss':              behaviorBoss(enemy, ship, def, enemyBullets);           break;
    case 'swarm_kamikaze':    behaviorSwarmKamikaze(enemy, ship, def);                break;
    case 'fast_orbit_burst':  behaviorFastOrbitBurst(enemy, ship, def, enemyBullets); break;
    case 'crusher':           behaviorCrusher(enemy, ship, def, enemyBullets);        break;
  }

  enemy.x += enemy.vx;
  enemy.y += enemy.vy;

  if (enemy.flashTimer > 0) enemy.flashTimer--;
}

// ── Helpers ───────────────────────────────────────────────────
function toPlayer(enemy, ship) {
  const dx   = ship.x - enemy.x;
  const dy   = ship.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  return { dx, dy, dist, nx: dx / dist, ny: dy / dist };
}

function capSpeed(enemy, maxSpd) {
  const spd = Math.sqrt(enemy.vx ** 2 + enemy.vy ** 2);
  if (spd > maxSpd) {
    enemy.vx = (enemy.vx / spd) * maxSpd;
    enemy.vy = (enemy.vy / spd) * maxSpd;
  }
}

function mkBullet(x, y, angle, speed, hue, size, damage = 1) {
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1, damage, isMine: false, hue, size,
  };
}

// ── SPORE: approach → charge → flee tras contacto ─────────────
function behaviorKamikaze(enemy, ship, def) {
  if (!enemy.kamikazeState) enemy.kamikazeState = KS_APPROACH;

  const { nx, ny, dist } = toPlayer(enemy, ship);
  const contactDist = enemy.size + ship.size * 0.8;

  if (enemy.kamikazeState === KS_FLEE) {
    // Huye en dirección opuesta al jugador acelerando
    enemy.vx -= nx * def.speed * 0.25;
    enemy.vy -= ny * def.speed * 0.25;
    capSpeed(enemy, def.speed * 3.5);
    // Se destruye solo cuando ya está lejos (fuera de la zona de juego)
    // La destrucción la maneja enemies.js por isWayOutOfBounds
    return;
  }

  enemy.angle = Math.atan2(ny, nx);

  if (enemy.kamikazeState === KS_APPROACH) {
    // Deriva lenta acercándose
    enemy.vx += nx * def.speed * 0.04;
    enemy.vy += ny * def.speed * 0.04;
    capSpeed(enemy, def.speed * 0.6);
    if (enemy.stateTimer >= def.chargeDelay) {
      enemy.kamikazeState = KS_CHARGE;
    }
  } else {
    // KS_CHARGE: carga directa
    enemy.vx += nx * def.speed * 0.22;
    enemy.vy += ny * def.speed * 0.22;
    capSpeed(enemy, def.speed * 2.8);
  }

  enemy.vx *= 0.96;
  enemy.vy *= 0.96;

  // Contacto con jugador → huir
  if (dist < contactDist) {
    enemy.kamikazeState = KS_FLEE;
    // Impulso de rebote
    enemy.vx = -nx * def.speed * 2.5;
    enemy.vy = -ny * def.speed * 2.5;
  }
}

// ── DRIFTER: orbita + espiral continua ─────────────────────────
function behaviorSpiralShooter(enemy, ship, def, enemyBullets) {
  const { dx, dy, dist, nx, ny } = toPlayer(enemy, ship);

  const diff  = dist - def.orbitRadius;
  const force = diff / def.orbitRadius * 0.025;
  enemy.vx += nx * force * def.speed * 12;
  enemy.vy += ny * force * def.speed * 12;

  const perpX = -dy / dist;
  const perpY =  dx / dist;
  enemy.vx += perpX * 0.014;
  enemy.vy += perpY * 0.014;

  capSpeed(enemy, def.speed);
  enemy.vx *= 0.98;
  enemy.vy *= 0.98;

  const spd = Math.sqrt(enemy.vx ** 2 + enemy.vy ** 2);
  if (spd > 0.1) enemy.angle = Math.atan2(enemy.vy, enemy.vx);

  if (enemy.attackTimer >= def.attackInterval) {
    enemy.attackTimer = 0;
    enemyBullets.push(mkBullet(
      enemy.x + Math.cos(enemy.spiralAngle) * enemy.size,
      enemy.y + Math.sin(enemy.spiralAngle) * enemy.size,
      enemy.spiralAngle, 2.6, def.hue, 4
    ));
    enemy.spiralAngle += (Math.PI * 2) / def.spiralCount;
  }
}

// ── SHELL: orbita + escudo frontal + ráfaga ────────────────────
function behaviorShieldedBurst(enemy, ship, def, enemyBullets) {
  const { dx, dy, dist, nx, ny } = toPlayer(enemy, ship);

  const diff  = dist - def.orbitRadius;
  const force = diff / def.orbitRadius * 0.022;
  enemy.vx += nx * force * def.speed * 12;
  enemy.vy += ny * force * def.speed * 12;

  const perpX = -dy / dist;
  const perpY =  dx / dist;
  enemy.vx += perpX * 0.011;
  enemy.vy += perpY * 0.011;

  capSpeed(enemy, def.speed);
  enemy.vx *= 0.98;
  enemy.vy *= 0.98;

  enemy.shieldAngle = Math.atan2(dy, dx);

  if (enemy.attackTimer >= def.attackInterval && enemy.burstRemaining === 0) {
    enemy.attackTimer    = 0;
    enemy.burstRemaining = def.burstCount;
    enemy.burstTimer     = 0;
    enemy.burstAimAngle  = Math.atan2(dy, dx);
  }

  if (enemy.burstRemaining > 0) {
    enemy.burstTimer++;
    if (enemy.burstTimer >= def.burstInterval) {
      enemy.burstTimer = 0;
      const idx    = def.burstCount - enemy.burstRemaining;
      const spread = (idx - (def.burstCount - 1) / 2) * 0.18;
      const a      = enemy.burstAimAngle + spread;
      enemy.burstRemaining--;
      enemyBullets.push(mkBullet(
        enemy.x + Math.cos(a) * enemy.size,
        enemy.y + Math.sin(a) * enemy.size,
        a, 3.5, def.hue, 4
      ));
    }
  }
}

// ── LEVIATÁN: jefe ─────────────────────────────────────────────
function behaviorBoss(enemy, ship, def, enemyBullets) {
  const { dx, dy, dist, nx, ny } = toPlayer(enemy, ship);

  enemy.vx += nx * 0.01;
  enemy.vy += ny * 0.01;
  capSpeed(enemy, def.speed);
  enemy.vx *= 0.99;
  enemy.vy *= 0.99;

  if (dist > 5) enemy.angle = Math.atan2(dy, dx);

  enemy.ringTimer++;
  if (enemy.ringTimer >= def.ringInterval) {
    enemy.ringTimer = 0;
    for (let i = 0; i < def.ringCount; i++) {
      const a = (i / def.ringCount) * Math.PI * 2;
      enemyBullets.push(mkBullet(
        enemy.x + Math.cos(a) * enemy.size * 0.7,
        enemy.y + Math.sin(a) * enemy.size * 0.7,
        a, 2.8, def.hue, 5
      ));
    }
  }

  enemy.spiralTimer++;
  if (enemy.spiralTimer >= def.spiralInterval) {
    enemy.spiralTimer = 0;
    enemyBullets.push(mkBullet(
      enemy.x + Math.cos(enemy.spiralAngle) * enemy.size * 0.6,
      enemy.y + Math.sin(enemy.spiralAngle) * enemy.size * 0.6,
      enemy.spiralAngle, 3.0, 20, 5
    ));
    enemy.spiralAngle += 0.21;
  }
}

// ── SWARM: crías kamikaze con flee ─────────────────────────────
function behaviorSwarmKamikaze(enemy, ship, def) {
  if (!enemy.kamikazeState) enemy.kamikazeState = KS_CHARGE; // crías cargan directo

  const { nx, ny, dist } = toPlayer(enemy, ship);
  const contactDist = enemy.size + ship.size * 0.8;

  if (enemy.kamikazeState === KS_FLEE) {
    enemy.vx -= nx * def.speed * 0.3;
    enemy.vy -= ny * def.speed * 0.3;
    capSpeed(enemy, def.speed * 4);
    return;
  }

  enemy.angle = Math.atan2(ny, nx);
  enemy.vx += nx * def.speed * 0.14;
  enemy.vy += ny * def.speed * 0.14;
  capSpeed(enemy, def.speed);
  enemy.vx *= 0.97;
  enemy.vy *= 0.97;

  if (dist < contactDist) {
    enemy.kamikazeState = KS_FLEE;
    enemy.vx = -nx * def.speed * 3;
    enemy.vy = -ny * def.speed * 3;
  }
}

// ── DART: órbita rápida + ráfaga ───────────────────────────────
function behaviorFastOrbitBurst(enemy, ship, def, enemyBullets) {
  const { dx, dy, dist, nx, ny } = toPlayer(enemy, ship);

  const diff  = dist - 175;
  const force = diff / 175 * 0.07;
  enemy.vx += nx * force * 15;
  enemy.vy += ny * force * 15;

  const perpX = -dy / dist;
  const perpY =  dx / dist;
  enemy.vx += perpX * 0.09;
  enemy.vy += perpY * 0.09;

  capSpeed(enemy, def.speed);
  enemy.vx *= 0.97;
  enemy.vy *= 0.97;

  const spd = Math.sqrt(enemy.vx ** 2 + enemy.vy ** 2);
  if (spd > 0.1) enemy.angle = Math.atan2(enemy.vy, enemy.vx);

  if (enemy.attackTimer >= def.attackInterval && enemy.burstRemaining === 0) {
    enemy.attackTimer    = 0;
    enemy.burstRemaining = def.burstCount;
    enemy.burstTimer     = 0;
    enemy.burstAimAngle  = Math.atan2(ny, nx);
  }

  if (enemy.burstRemaining > 0) {
    enemy.burstTimer++;
    if (enemy.burstTimer >= def.burstInterval) {
      enemy.burstTimer = 0;
      const idx    = def.burstCount - enemy.burstRemaining;
      const spread = (idx - (def.burstCount - 1) / 2) * 0.2;
      const a      = enemy.burstAimAngle + spread;
      enemy.burstRemaining--;
      enemyBullets.push(mkBullet(
        enemy.x + Math.cos(a) * enemy.size,
        enemy.y + Math.sin(a) * enemy.size,
        a, 4.5, def.hue, 4
      ));
    }
  }
}

// ── CRUSHER: avance + empujón + minas ──────────────────────────
function behaviorCrusher(enemy, ship, def, enemyBullets) {
  const { dx, dy, dist, nx, ny } = toPlayer(enemy, ship);

  if (dist > def.pushRadius * 1.4) {
    enemy.vx += nx * 0.015;
    enemy.vy += ny * 0.015;
  }
  capSpeed(enemy, def.speed);
  enemy.vx *= 0.98;
  enemy.vy *= 0.98;
  enemy.angle = Math.atan2(dy, dx);

  if (dist < def.pushRadius) {
    const strength = (1 - dist / def.pushRadius) * def.pushForce * 0.07;
    ship.vx -= nx * strength;
    ship.vy -= ny * strength;
  }

  if (enemy.attackTimer >= def.mineInterval) {
    enemy.attackTimer = 0;
    enemyBullets.push({
      x: enemy.x, y: enemy.y,
      vx: 0, vy: 0,
      life: 1, damage: 2,
      isMine: true, armed: false, armTimer: 0,
      triggerRadius: 38, hue: def.hue, size: 7,
    });
  }
}
