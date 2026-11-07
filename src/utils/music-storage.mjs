// Audio blobs stay in this origin's IndexedDB, never in a remote service.
export const MUSIC_DB_NAME = 'navx-local-music';
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
    const request = indexedDB.open(MUSIC_DB_NAME, 1);
    let blocked = false;
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('tracks')) db.createObjectStore('tracks', { keyPath: 'key' });
    };
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return; }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => { blocked = true; reject(new Error('Music database blocked')); };
  });
}
async function transaction(mode, action) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let result;
    let tx;
    try {
      tx = db.transaction('tracks', mode);
      const request = action(tx.objectStore('tracks'));
      if (request) request.onsuccess = () => { result = request.result; };
      tx.oncomplete = () => { db.close(); resolve(result); };
      tx.onabort = () => { db.close(); reject(tx.error || new Error('Music storage aborted')); };
      tx.onerror = () => { /* Abort handles rejection, including quota failures. */ };
    } catch (error) { if (tx) tx.abort(); db.close(); reject(error); }
  });
}
export async function loadMusicFiles() {
  const rows = await transaction('readonly', store => store.getAll());
  return (rows || []).filter(row => row.blob instanceof Blob).sort((a, b) => a.order - b.order);
}
export function saveMusicFiles(tracks) {
  return transaction('readwrite', store => { tracks.forEach(track => store.put(track)); });
}
export function deleteMusicFile(key) { return transaction('readwrite', store => store.delete(key)); }
export function clearMusicFiles() { return transaction('readwrite', store => store.clear()); }
