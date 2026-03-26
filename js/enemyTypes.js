// enemyTypes.js — Definición de todos los tipos de enemigos (solo datos)

export const TYPES = {

  // ─── ESPORA: pequeña, kamikaze ───────────────────────────────
  SPORE: {
    hp: 1, size: 7, speed: 1.1,
    hue: 300,                   // magenta
    scoreValue: 10,
    behavior: 'kamikaze',
    chargeDelay: 70,            // frames derivando antes de cargar
  },

  // ─── MEDUSA: orbitante, disparo en espiral ───────────────────
  DRIFTER: {
    hp: 3, size: 20, speed: 0.55,
    hue: 185,                   // cian
    scoreValue: 25,
    behavior: 'spiral_shooter',
    attackInterval: 12,         // frames entre disparos de espiral
    spiralCount: 8,             // disparos por vuelta completa
    orbitRadius: 220,
  },

  // ─── NÁUTILO: con escudo frontal, ráfaga ─────────────────────
  SHELL: {
    hp: 5, size: 17, speed: 0.75,
    hue: 38,                    // ámbar
    scoreValue: 40,
    behavior: 'shielded_burst',
    attackInterval: 110,
    burstCount: 3,
    burstInterval: 12,
    shieldArc: 2.2,             // radianes que cubre el escudo (~126°)
    orbitRadius: 185,
  },

  // ─── LEVIATÁN: jefe, ring + espiral ──────────────────────────
  LEVIATHAN: {
    hp: 25, size: 50, speed: 0.28,
    hue: 5,                     // rojo
    scoreValue: 200,
    behavior: 'boss',
    ringInterval: 170,
    ringCount: 12,
    spiralInterval: 10,
  },

  // ─── CRÍA: muy pequeña, aparece en grupo ─────────────────────
  SWARM: {
    hp: 1, size: 5, speed: 1.5,
    hue: 78,                    // verde-amarillo
    scoreValue: 5,
    behavior: 'swarm_kamikaze',
    spawnCount: 7,
    formationRadius: 50,
  },

  // ─── ANGUILA: muy rápida, ráfaga al pasar ────────────────────
  DART: {
    hp: 4, size: 12, speed: 5.2,
    hue: 165,                   // verde azulado
    scoreValue: 35,
    behavior: 'fast_orbit_burst',
    attackInterval: 85,
    burstCount: 3,
    burstInterval: 7,
  },

  // ─── CANGREJO: lento, empujón + minas ───────────────────────
  CRUSHER: {
    hp: 10, size: 34, speed: 0.45,
    hue: 270,                   // violeta
    scoreValue: 80,
    behavior: 'crusher',
    pushRadius: 90,
    pushForce: 8,
    mineInterval: 230,
  },
};
