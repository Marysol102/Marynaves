// main.js — Loop principal y arranque del juego

import { initInput }                      from './input.js';
import { ship, initShip, updateShip }     from './ship.js';
import { updateBullets }                  from './bullets.js';
import { updateParticles }                from './particles.js';
import { initBackground, drawBackground } from './background.js';
import { drawScene }                      from './renderer.js';
import { initEnemies, updateEnemies }     from './enemies.js';
import { checkCollisions }                from './collision.js';

const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');

let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function init() {
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', e => {
    if (e.key === 'r' || e.key === 'R') {
      if (ship.isDead && ship.deathTimer > 80) restart();
    }
  });

  initInput(canvas);
  initShip(W, H);
  initBackground(W, H);
  initEnemies();
  loop();
}

function restart() {
  initShip(W, H);
  initEnemies();
}

function loop() {
  try {
    updateShip(W, H);
    if (!ship.isDead) {
      updateBullets(W, H);
    }
    updateParticles();
    updateEnemies(W, H, ship);
    checkCollisions();
    drawBackground(ctx, W, H);
    drawScene(ctx, W, H);
  } catch (err) {
    console.error('Loop error:', err);
  }
  requestAnimationFrame(loop);
}

init();
