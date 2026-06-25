// storage.js - localStorage-based persistence
// Data is stored per-browser. For truly shared data across devices,
// this can be swapped for a backend API call.

export function storageGet(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Storage remove error:', e);
  }
}
