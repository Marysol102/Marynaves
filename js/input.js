// input.js — Maneja ratón y toque de forma unificada

export const input = {
  x: 0,
  y: 0,
  active: false,   // true mientras hay click/toque
  isMobile: false
};

export function initInput(canvas) {
  // Detectar si es móvil/touch
  input.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // Posición inicial en el centro
  input.x = window.innerWidth / 2;
  input.y = window.innerHeight / 2;

  // Actualizar hint UI según dispositivo
  const ui = document.getElementById('ui');
  if (input.isMobile) {
    ui.textContent = 'mantén el dedo para mover y disparar';
  }
  // Ocultar hint tras 4 segundos
  setTimeout(() => ui.classList.add('hidden'), 4000);

  // ── RATÓN ──────────────────────────────────────────
  window.addEventListener('mousemove', e => {
    input.x = e.clientX;
    input.y = e.clientY;
  });

  window.addEventListener('mousedown', e => {
    input.x = e.clientX;
    input.y = e.clientY;
    input.active = true;
  });

  window.addEventListener('mouseup', () => {
    input.active = false;
  });

  // ── TOQUE ──────────────────────────────────────────
  // En móvil: mientras hay toque → moverse hacia el dedo Y disparar continuo
  window.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    input.x = t.clientX;
    input.y = t.clientY;
    input.active = true;
  }, { passive: false });

  window.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    input.x = t.clientX;
    input.y = t.clientY;
  }, { passive: false });

  window.addEventListener('touchend', e => {
    e.preventDefault();
    // Si quedan otros toques activos, seguir disparando
    if (e.touches.length === 0) {
      input.active = false;
    }
  }, { passive: false });

  window.addEventListener('touchcancel', () => {
    input.active = false;
  });
}
