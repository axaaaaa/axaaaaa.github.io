const GLYPHS = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+<>[]{}ｱｲｳｴｵｶｷｸｹｺ';
const states = new WeakMap();

export function glitchGlyphs(random = Math.random) {
  return Array.from({ length: 7 }, () => Array.from({ length: 13 }, () =>
    GLYPHS[Math.floor(random() * GLYPHS.length)]).join('')).join('\n');
}

// A clipped decorative patch follows the pointer anywhere on the card.
// Original text, highlights, links and controls are never replaced or hidden.
export const cardScramble = {
  mounted(card, binding) {
    const view = card.ownerDocument.defaultView;
    const motion = view.matchMedia?.('(prefers-reduced-motion: reduce)');
    const state = { enabled: Boolean(binding.value), frame: null, layer: null, patch: null };
    const stop = () => {
      if (state.frame !== null) view.cancelAnimationFrame(state.frame);
      state.frame = null;
      state.layer?.remove();
      state.layer = null;
      state.patch = null;
    };
    const move = event => {
      if (!state.enabled || event.pointerType === 'touch' || motion?.matches) { stop(); return; }
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (!state.layer) {
        const layer = card.ownerDocument.createElement('span');
        layer.className = 'card-glitch-layer';
        layer.setAttribute('aria-hidden', 'true');
        const patch = card.ownerDocument.createElement('span');
        patch.className = 'card-glitch-patch';
        patch.textContent = glitchGlyphs();
        layer.appendChild(patch);
        card.appendChild(layer);
        state.layer = layer;
        state.patch = patch;
        let lastPaint = view.performance.now();
        const tick = now => {
          if (now - lastPaint >= 40) {
            patch.textContent = glitchGlyphs();
            lastPaint = now;
          }
          state.frame = view.requestAnimationFrame(tick);
        };
        state.frame = view.requestAnimationFrame(tick);
      }
      // Account for card transforms and borders; the overlay uses padding-box coordinates.
      const x = (event.clientX - rect.left) * ((card.offsetWidth || rect.width) / rect.width) - card.clientLeft;
      const y = (event.clientY - rect.top) * ((card.offsetHeight || rect.height) / rect.height) - card.clientTop;
      state.patch.style.left = `${x}px`;
      state.patch.style.top = `${y}px`;
    };
    const motionChange = () => { if (motion.matches) stop(); };
    Object.assign(state, { stop, move, motion, motionChange });
    states.set(card, state);
    card.addEventListener('pointerenter', move);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', stop);
    card.addEventListener('pointercancel', stop);
    motion?.addEventListener?.('change', motionChange);
  },
  updated(card, binding) {
    const state = states.get(card);
    if (!state) return;
    state.enabled = Boolean(binding.value);
    if (!state.enabled) state.stop();
  },
  beforeUnmount(card) {
    const state = states.get(card);
    if (!state) return;
    state.stop();
    card.removeEventListener('pointerenter', state.move);
    card.removeEventListener('pointermove', state.move);
    card.removeEventListener('pointerleave', state.stop);
    card.removeEventListener('pointercancel', state.stop);
    state.motion?.removeEventListener?.('change', state.motionChange);
    states.delete(card);
  }
};
