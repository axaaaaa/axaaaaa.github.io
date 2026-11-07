// Short locally synthesized clicks: no downloads or audio-file requests.
export const SOUND_STORAGE_KEY = 'navx-interaction-sounds';
export function createInteractionSounds({ view = window, doc = document, onChange = () => {} } = {}) {
  let enabled = true;
  try { enabled = view.localStorage.getItem(SOUND_STORAGE_KEY) !== 'off'; } catch { /* Storage is optional. */ }
  let context = null;
  let disposed = false;
  let unlocked = false;
  let lastHover = -Infinity;
  let lastClick = -Infinity;
  let lastTyping = -Infinity;
  const buffers = new Map();
  const sources = new Set();
  function unlock() {
    if (!enabled || disposed) return;
    unlocked = true;
    try {
      const AudioContext = view.AudioContext || view.webkitAudioContext;
      if (!context && AudioContext) context = new AudioContext();
      if (context?.state === 'suspended') context.resume()?.catch(() => {});
    } catch { /* Audio availability never interrupts navigation. */ }
  }
  function play(kind = 'click') {
    if (!enabled || disposed || !unlocked || doc.hidden || context?.state !== 'running') return;
    const now = view.performance.now();
    if (kind === 'hover' ? now - lastHover < 75 : kind === 'typing' ? now - lastTyping < 30 : now - lastClick < 35) return;
    if (kind === 'hover') lastHover = now; else if (kind === 'typing') lastTyping = now; else lastClick = now;
    try {
      if (!buffers.has(kind)) {
        const duration = kind === 'hover' || kind === 'typing' ? 0.018 : 0.026;
        const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / context.sampleRate;
          const attack = Math.min(1, i / (context.sampleRate * 0.0007));
          const envelope = attack * Math.exp(-t * (kind === 'hover' ? 340 : 260)) * Math.pow(1 - i / data.length, 2);
          data[i] = (Math.sin(2 * Math.PI * 1700 * t) * 0.35 + (Math.random() * 2 - 1) * 0.65) * envelope;
        }
        buffers.set(kind, buffer);
      }
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffers.get(kind);
      gain.gain.value = kind === 'typing' ? 0.065 : kind === 'hover' ? 0.075 : 0.12;
      source.connect(gain); gain.connect(context.destination);
      sources.add(source);
      source.onended = () => { sources.delete(source); source.disconnect(); gain.disconnect(); };
      source.start();
    } catch { /* Ignore unsupported or interrupted audio output. */ }
  }
  const onPointerDown = event => { if (event.isTrusted && event.button === 0) unlock(); };
  const onKeyDown = event => { if (event.isTrusted && !event.repeat) unlock(); };
  const onClick = event => {
    if (!event.isTrusted || event.target?.closest?.('[data-sound-toggle]')) return;
    unlock(); play('click');
  };
  const onHover = event => {
    if (!event.isTrusted || event.pointerType !== 'mouse') return;
    const card = event.target?.closest?.('.website-card');
    if (!card || (event.relatedTarget && card.contains(event.relatedTarget))) return;
    play('hover');
  };
  // Native input events cover typing, deletion, IME composition and mobile keyboards.
  // Programmatic v-model changes and unrelated inputs stay silent.
  const onInput = event => {
    if (!event.isTrusted || !event.target?.matches?.('input, textarea') ||
        !event.target.closest('[data-typing-sound]')) return;
    unlock(); play('typing');
  };
  const onStorage = event => {
    if (event.key === SOUND_STORAGE_KEY || event.key === null) setEnabled(event.newValue !== 'off', false);
  };
  function setEnabled(value, persist = true) {
    enabled = Boolean(value);
    if (persist) { try { view.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off'); } catch { /* Optional. */ } }
    if (!enabled) for (const source of sources) { try { source.stop(); } catch { /* Already ended. */ } }
    onChange(enabled);
    if (enabled && persist) { unlock(); play('click'); }
  }
  doc.addEventListener('pointerdown', onPointerDown, true);
  doc.addEventListener('keydown', onKeyDown, true);
  doc.addEventListener('click', onClick, true);
  doc.addEventListener('pointerover', onHover, true);
  doc.addEventListener('input', onInput, true);
  view.addEventListener('storage', onStorage);
  onChange(enabled);
  return {
    get enabled() { return enabled; },
    setEnabled,
    dispose() {
      disposed = true;
      doc.removeEventListener('pointerdown', onPointerDown, true);
      doc.removeEventListener('keydown', onKeyDown, true);
      doc.removeEventListener('click', onClick, true);
      doc.removeEventListener('pointerover', onHover, true);
      doc.removeEventListener('input', onInput, true);
      view.removeEventListener('storage', onStorage);
      for (const source of sources) { try { source.stop(); } catch { /* Already ended. */ } }
      sources.clear(); buffers.clear();
      context?.close()?.catch(() => {});
    }
  };
}
