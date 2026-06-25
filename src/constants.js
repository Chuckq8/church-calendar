// constants.js

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'church2024',
};

export const EVENT_TYPES = {
  sabbath:  { label: 'Sabbath',   color: '#4f46e5', bg: '#eff6ff', border: '#bfdbfe' },
  holiday:  { label: 'Holiday',   color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
  meeting:  { label: 'Meeting',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  outreach: { label: 'Outreach',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  event:    { label: 'Event',     color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
};

export const DEFAULT_PARTICIPANTS = [];

export const DEFAULT_GROUPS = [];

export const DEFAULT_HOLIDAYS = [
  { id: 'h1', title: 'Christmas Day',  date: `${new Date().getFullYear()}-12-25`, type: 'holiday', description: 'Christmas celebration', participants: [], groupIds: [] },
  { id: 'h2', title: 'Good Friday',    date: `${new Date().getFullYear()}-04-18`, type: 'holiday', description: 'Good Friday service',   participants: [], groupIds: [] },
  { id: 'h3', title: 'Easter Sunday',  date: `${new Date().getFullYear()}-04-20`, type: 'holiday', description: 'Easter Sunday service', participants: [], groupIds: [] },
  { id: 'h4', title: 'Pentecost',      date: `${new Date().getFullYear()}-06-08`, type: 'holiday', description: 'Pentecost Sunday',      participants: [], groupIds: [] },
];

export function generateSabbaths() {
  const sabbaths = [];
  const now = new Date();
  const year = now.getFullYear();
  // Find first Saturday of the year
  let d = new Date(year, 0, 1);
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  let i = 1;
  while (d.getFullYear() === year) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    sabbaths.push({
      id: `sab-${i++}`,
      title: 'Sabbath Gathering',
      date: dateStr,
      type: 'sabbath',
      description: 'Weekly Sabbath worship service',
      participants: [],
      groupIds: [],
    });
    d.setDate(d.getDate() + 7);
  }
  return sabbaths;
}
