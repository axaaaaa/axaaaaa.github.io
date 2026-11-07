export const SHORTCUT_FAVORITES_KEY = '01-shortcut-favorites';
export function normalizeShortcutQuery(value) {
  return String(value || '').toLowerCase().replace(/command|⌘/g, 'cmd').replace(/control|⌃/g, 'ctrl').replace(/option|⌥/g, 'alt').replace(/⇧/g, 'shift').replace(/[\s+→]/g, '');
}
export function filterShortcuts(entries, { query = '', category = '', topic = '', favoritesOnly = false, favorites = [] } = {}) {
  const needle = normalizeShortcutQuery(query);
  return entries.filter(entry => (!category || entry.category === category) && (!topic || entry.topic === topic) && (!favoritesOnly || favorites.includes(entry.id)) && (!needle || normalizeShortcutQuery([entry.title, entry.category, entry.platform, entry.topic, entry.note, entry.strokes.flat().join(' ')].join(' ')).includes(needle)));
}
export function readShortcutFavorites(storage, entries) {
  try {
    const saved = JSON.parse(storage.getItem(SHORTCUT_FAVORITES_KEY) || '[]');
    return Array.isArray(saved) ? [...new Set(saved.filter(id => entries.some(entry => entry.id === id)))] : [];
  } catch { return []; }
}
