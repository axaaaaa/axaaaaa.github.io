<template>
  <canvas ref="sky" class="interactive-starfield" aria-hidden="true"></canvas>
</template>
<script>
export default {
  name: 'InteractiveStarfield',
  props: { dark: Boolean },
  watch: { dark() { this.refreshStarfieldTheme?.(); } },
  mounted() {
    const canvas = this.$refs.sky;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 1, height = 1, stars = [], ripples = [], frame = 0;
    let visible = true, destroyed = false, last = 0;
    let characterField = [];
    let flowTime = 0, lastFlowTime = null;
    const wrap = (value, span) => ((value % span) + span) % span;
    let dust = [], lastDustAt = -Infinity;
    let meteor = null, meteorClock = 0, meteorLastTime = null;
    let nextMeteorAt = 2000;
    const pointer = { x: 0, y: 0, active: false };
    const drift = { x: 0, y: 0 };
    const glyphs = ["·", ".", ":", "+", "*", "0", "1"];
    const scrambleGlyphs = '01<>/#%*+░▒';
    const hoveredGlyph = (original, x, y, time) => {
      if (!pointer.active || Math.hypot(pointer.x - x, pointer.y - y) > 42) return original;
      const beat = motion.matches ? 0 : Math.floor(time / 75);
      const index = Math.abs(Math.floor(x * 17 + y * 31 + beat * 7)) % scrambleGlyphs.length;
      return scrambleGlyphs[index];
    };
    const render = time => {
      const palette = this.dark
        ? { glyph: '176,212,186', highlight: '208,231,215', soft: '148,188,164' }
        : { glyph: '56,106,80', highlight: '41,76,56', soft: '94,117,103' };
      if (!motion.matches && lastFlowTime !== null) flowTime += Math.max(0, Math.min(time - lastFlowTime, 64)) / 1000;
      lastFlowTime = motion.matches ? null : time;
      ctx.clearRect(0, 0, width, height);
      if (!motion.matches) {
        drift.x += ((pointer.active ? pointer.x - width / 2 : 0) - drift.x) * .035;
        drift.y += ((pointer.active ? pointer.y - height / 2 : 0) - drift.y) * .035;
      } else { drift.x = 0; drift.y = 0; }
      ctx.font = '10px Consolas, "Courier New", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const cell of characterField) {
        const speed = 5 + (cell.y / height) * 9;
        const x = motion.matches ? cell.x : wrap(cell.x + flowTime * speed + 8, width + 16) - 8;
        const y = motion.matches ? cell.y : cell.y + Math.sin(flowTime * .35 + cell.x * .012) * 3;
        const glyph = hoveredGlyph(cell.glyph, x, y, time);
        const active = pointer.active && Math.hypot(pointer.x - x, pointer.y - y) <= 42;
        ctx.fillStyle = 'rgba(' + palette.glyph + ',' + (active ? .85 : cell.alpha) + ')';
        ctx.fillText(glyph, x, y);
      }
      for (const star of stars) {
        const x = motion.matches ? star.x : wrap(star.x + flowTime * (10 + star.depth * 12) + drift.x * star.depth * .035 + 10, width + 20) - 10;
        const y = motion.matches ? star.y : wrap(star.y + flowTime * star.depth * 1.5 + drift.y * star.depth * .045 + 10, height + 20) - 10;
        const distance = pointer.active ? Math.hypot(pointer.x - x, pointer.y - y) : 1000;
        const nearby = Math.max(0, 1 - distance / 120);
        const twinkle = motion.matches ? .8 : .72 + .28 * Math.sin(time * star.speed + star.phase);
        const alpha = Math.min(1, star.alpha * twinkle + nearby * .45);
        ctx.font = (star.radius > 1 ? '500 ' : '400 ') + (star.size + nearby * 2) + 'px Consolas, "Courier New", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(' + palette.glyph + ',' + alpha + ')';
        ctx.fillText(hoveredGlyph(star.glyph, x, y, time), x, y);
      }
      if (motion.matches) dust = [];
      dust = dust.filter(particle => time - particle.start < particle.life);
      for (const particle of dust) {
        const age = Math.max(0, time - particle.start);
        const progress = age / particle.life;
        const x = particle.x + particle.vx * age / 1000;
        const y = particle.y + particle.vy * age / 1000;
        const alpha = Math.pow(1 - progress, 1.7) * .8;
        ctx.font = (9 + particle.radius * 3) + 'px Consolas, "Courier New", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(' + palette.soft + ',' + alpha + ')';
        ctx.fillText(particle.glyph, x, y);
      }
      // Advance only visible animation time: no catch-up shower after returning.
      if (motion.matches) { meteor = null; meteorLastTime = null; }
      else {
        if (meteorLastTime !== null) meteorClock += Math.max(0, Math.min(time - meteorLastTime, 64));
        meteorLastTime = time;
        if (!meteor && meteorClock >= nextMeteorAt) {
          meteor = { start: meteorClock, x: width * (.15 + Math.random() * .5), y: height * (.08 + Math.random() * .15), distance: Math.min(width * .4, 290), duration: 950 };
        }
        if (meteor) {
          const progress = (meteorClock - meteor.start) / meteor.duration;
          if (progress >= 1) { meteor = null; nextMeteorAt = meteorClock + 8000 + Math.random() * 8000; }
          else {
            const x = meteor.x + progress * meteor.distance;
            const y = meteor.y + progress * Math.min(height * .65, 125);
            const angle = Math.atan2(Math.min(height * .65, 125), meteor.distance);
            const tail = Math.min(width * .22, 110) * Math.min(1, progress * 5);
            const opacity = Math.min(1, progress * 7) * Math.pow(1 - progress, .6);
            ctx.font = '12px Consolas, "Courier New", monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            for (let i = 0; i < 10; i++) {
              const fraction = i / 9;
              ctx.fillStyle = 'rgba(' + palette.highlight + ',' + opacity * (1 - fraction) + ')';
              ctx.fillText(i === 0 ? '*' : (i < 4 ? '+' : '.'), x - Math.cos(angle) * tail * fraction, y - Math.sin(angle) * tail * fraction);
            }
          }
        }
      }
      ripples = ripples.filter(r => time - r.start < 1200);
      for (const r of ripples) {
        const progress = (time - r.start) / 1200;
        const radius = 8 + progress * 150;
        ctx.font = '11px Consolas, "Courier New", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < 24; i++) {
          const angle = i * Math.PI / 12 + r.seed;
          ctx.fillStyle = 'rgba(' + palette.highlight + ',' + (1 - progress) * .8 + ')';
          ctx.fillText(i % 3 === 0 ? '+' : '.', r.x + Math.cos(angle) * radius, r.y + Math.sin(angle) * radius);
        }
      }
    };
    const tick = time => {
      frame = 0;
      if (destroyed || !visible || document.hidden) return;
      if (time - last >= 32) { render(time); last = time; }
      if (!motion.matches) frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      lastFlowTime = null;
      meteorLastTime = null;
      dust = []; pointer.active = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (!destroyed && visible && !document.hidden) {
        render(performance.now());
        if (!motion.matches) frame = requestAnimationFrame(tick);
      }
    };
    this.refreshStarfieldTheme = resume;
    const resize = () => {
      width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      characterField = [];
      for (let y = 6; y < height; y += 12) {
        for (let x = 6; x < width; x += 10) {
          const center = height * (.7 - .4 * x / width) + Math.sin(x / 160) * height * .12;
          const band = Math.exp(-Math.pow((y - center) / Math.max(20, height * .22), 2));
          if (Math.random() < .12 + band * .55) characterField.push({ x, y,
            glyph: band > .6 ? [':', '.', '+', '*'][Math.floor(Math.random() * 4)] : '.',
            alpha: .06 + band * .17 + Math.random() * .06 });
        }
      }
      stars = Array.from({ length: Math.min(400, Math.max(90, Math.round(width * height / 650))) }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)], size: 7 + Math.random() * 6,
        radius: .25 + Math.pow(Math.random(), 3) * 1.25,
        alpha: .25 + Math.random() * .65, depth: .3 + Math.random(),
        phase: Math.random() * Math.PI * 2, speed: .0004 + Math.random() * .001,
      }));
      resume();
    };
    const move = event => {
      const rect = host.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      const previousX = pointer.active ? pointer.x : x;
      const previousY = pointer.active ? pointer.y : y;
      const distance = Math.hypot(x - previousX, y - previousY);
      const now = performance.now();
      if (!motion.matches && event.pointerType !== 'touch' && !document.hidden && visible && now - lastDustAt >= 16 && distance > 1) {
        const count = Math.min(6, Math.max(1, Math.ceil(distance / 8)));
        for (let i = 0; i < count; i++) {
          const fraction = (i + 1) / count;
          dust.push({ x: previousX + (x - previousX) * fraction + (Math.random() - .5) * 5,
            y: previousY + (y - previousY) * fraction + (Math.random() - .5) * 5,
            start: now, life: 550 + Math.random() * 250,
            vx: (Math.random() - .5) * 15, vy: 5 + Math.random() * 12,
            radius: .5 + Math.random() * 1.2, glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
 });
        }
        dust = dust.slice(-80); lastDustAt = now;
      }
      pointer.x = x; pointer.y = y; pointer.active = true;
      if (motion.matches) render(now);
    };
    const leave = () => { pointer.active = false; if (motion.matches) render(performance.now()); };
    const click = event => {
      if (event.target.closest('input,button,a,.el-select,.el-autocomplete,.el-pagination') || motion.matches) return;
      const rect = host.getBoundingClientRect();
      ripples.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, start: performance.now(), seed: Math.random() });
      ripples = ripples.slice(-5);
    };
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerleave', leave);
    host.addEventListener('click', click);
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(host);
    const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); });
    visibilityObserver.observe(host);
    resize();
    this.disposeStarfield = () => {
      destroyed = true; this.refreshStarfieldTheme = null; cancelAnimationFrame(frame);
      sizeObserver.disconnect(); visibilityObserver.disconnect();
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); host.removeEventListener('click', click);
      document.removeEventListener('visibilitychange', resume); motion.removeEventListener('change', resume);
    };
  },
  beforeUnmount() { if (this.disposeStarfield) this.disposeStarfield(); }
};
</script>
<style scoped>
.interactive-starfield { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: inherit; pointer-events: none; z-index: -1; }
</style>
