// enemies.js — Estado, spawn y sistema de oleadas

import { TYPES }           from './enemyTypes.js';
import { updateBehavior }  from './enemyBehaviors.js';

export const enemies      = [];
export const enemyBullets = [];
export let   score        = 0;

let nextId      = 0;
let spawnTimer  = 0;
let waveTimer   = 0;  // tiempo total de juego en frames
let difficulty  = 0;  // 0..1 crece con el tiempo

const SPAWN_INTERVAL = 240; // frames entre spawns (~4s a 60fps)

// ─────────────────────────────────────────────────────────────
export function initEnemies() {
  enemies.length      = 0;
  enemyBullets.length = 0;
  score               = 0;
  nextId              = 0;
  spawnTimer          = 0;
  waveTimer           = 0;
  difficulty          = 0;
}

// ─────────────────────────────────────────────────────────────
export function updateEnemies(W, H, ship) {
  waveTimer++;
  difficulty = Math.min(1, waveTimer / (60 * 120)); // satura en 2 min

  // Spawn
  spawnTimer++;
  const interval = Math.max(90, SPAWN_INTERVAL - difficulty * 150);
  if (spawnTimer >= interval) {
    spawnTimer = 0;
    spawnNextEnemy(W, H);
  }

  // Actualizar enemigos
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.isDead) { enemies.splice(i, 1); continue; }
    updateBehavior(e, ship, enemyBullets);

    // Salir del área visible (solo se destruyen si llevan mucho tiempo fuera)
    if (isWayOutOfBounds(e, W, H)) enemies.splice(i, 1);
  }

  // Actualizar proyectiles enemigos
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];

    if (b.isMine) {
      // Las minas se arman tras 60 frames y duran 8 segundos
      b.armTimer++;
      if (b.armTimer > 60) b.armed = true;
      b.life -= 0.0021; // ~8 segundos
      if (b.life <= 0) { enemyBullets.splice(i, 1); continue; }
    } else {
      b.x    += b.vx;
      b.y    += b.vy;
      b.life -= 0.007;
      if (b.life <= 0 || outOfBounds(b, W, H)) {
        enemyBullets.splice(i, 1);
        continue;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
export function addScore(value) {
  score += value;
}

// ─────────────────────────────────────────────────────────────
function spawnNextEnemy(W, H) {
  // Pool de tipos disponibles según dificultad
  const pool = buildPool();
  const type = pool[Math.floor(Math.random() * pool.length)];

  if (type === 'SWARM') {
    spawnSwarm(W, H);
  } else {
    const pos = randomEdgePos(W, H);
    spawnEnemy(type, pos.x, pos.y);
  }
}

function buildPool() {
  // Siempre disponibles
  const pool = ['SPORE', 'SPORE', 'DRIFTER'];

  if (difficulty > 0.10) pool.push('SWARM', 'DART');
  if (difficulty > 0.20) pool.push('SHELL', 'DART');
  if (difficulty > 0.35) pool.push('CRUSHER', 'SHELL');
  if (difficulty > 0.55) pool.push('CRUSHER');

  // LEVIATÁN: spawn ocasional en dificultad alta y si no hay uno ya
  const hasLevi = enemies.some(e => e.type === 'LEVIATHAN');
  if (difficulty > 0.45 && !hasLevi && Math.random() < 0.12) {
    pool.push('LEVIATHAN', 'LEVIATHAN'); // más peso para que aparezca
  }

  return pool;
}

function spawnSwarm(W, H) {
  const def    = TYPES.SWARM;
  const pos    = randomEdgePos(W, H);
  const swarmId = nextId++;
  for (let i = 0; i < def.spawnCount; i++) {
    const a  = (i / def.spawnCount) * Math.PI * 2;
    const ex = pos.x + Math.cos(a) * def.formationRadius;
    const ey = pos.y + Math.sin(a) * def.formationRadius;
    const e  = spawnEnemy('SWARM', ex, ey);
    e.swarmId = swarmId;
  }
}

function spawnEnemy(type, x, y) {
  const def = TYPES[type];
  const e   = {
    id:   nextId++,
    type,
    x, y,
    vx: 0, vy: 0,
    angle: 0,
    hp:    def.hp,
    maxHp: def.hp,
    size:  def.size,

    // Timers generales
    stateTimer:    0,
    attackTimer:   0,
    flashTimer:    0,

    // Ráfaga (SHELL, DART)
    burstRemaining: 0,
    burstTimer:     0,
    burstAimAngle:  0,

    // Espiral (DRIFTER, LEVIATHAN)
    spiralAngle: Math.random() * Math.PI * 2,

    // Jefe (LEVIATHAN)
    ringTimer:    0,
    spiralTimer:  0,

    // Escudo (SHELL)
    shieldAngle: 0,

    // Enjambre
    swarmId: null,

    isDead: false,
  };
  enemies.push(e);
  return e;
}

// ─────────────────────────────────────────────────────────────
function randomEdgePos(W, H, margin = 80) {
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: return { x: Math.random() * W, y: -margin };
    case 1: return { x: W + margin, y: Math.random() * H };
    case 2: return { x: Math.random() * W, y: H + margin };
    default:return { x: -margin, y: Math.random() * H };
  }
}

function outOfBounds(obj, W, H, margin = 40) {
  return obj.x < -margin || obj.x > W + margin ||
         obj.y < -margin || obj.y > H + margin;
}

function isWayOutOfBounds(obj, W, H) {
  const m = 300;
  return obj.x < -m || obj.x > W + m || obj.y < -m || obj.y > H + m;
}
