// Reveal the actual new theme snapshot, not a decorative color overlay.
export async function revealTheme(apply, event, { doc = document, win = window } = {}) {
  const root = doc.documentElement;
  const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let applied;
  const update = () => applied || (applied = Promise.resolve().then(apply));
  if (!doc.startViewTransition || !root.animate || reduced || doc.hidden) {
    await update();
    return;
  }
  // Keyboard activation also expands from the button centre, never from (0, 0).
  const button = event?.currentTarget?.getBoundingClientRect ? event.currentTarget
    : doc.querySelector('.header-theme-toggle');
  const rect = button?.getBoundingClientRect();
  const width = win.innerWidth, height = win.innerHeight;
  const x = Math.max(0, Math.min(width, rect ? rect.left + rect.width / 2 : width / 2));
  const y = Math.max(0, Math.min(height, rect ? rect.top + rect.height / 2 : height / 2));
  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 2;
  let transition, finished;
  root.classList.add('theme-ripple-active');
  try {
    transition = doc.startViewTransition(update);
    finished = transition.finished.catch(() => {});
    await transition.ready;
    const animation = root.animate({ clipPath: [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${radius}px at ${x}px ${y}px)`
    ] }, {
      duration: 650,
      easing: 'cubic-bezier(.22, .61, .36, 1)',
      pseudoElement: '::view-transition-new(root)',
      fill: 'both'
    });
    await animation.finished;
    // Release fill:both so the transition pseudo-tree can finish and be removed.
    animation.cancel();
    await finished;
  } catch {
    transition?.skipTransition();
    await update();
    await finished;
  } finally {
    root.classList.remove('theme-ripple-active');
  }
}
