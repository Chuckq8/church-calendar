// utils.js

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
