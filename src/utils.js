// utils.js

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, min] = timeStr.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${min} ${hr < 12 ? 'AM' : 'PM'}`;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
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
  return 'id' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getInitials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
