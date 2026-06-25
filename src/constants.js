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

// Alberta, Canada statutory holidays 2025-2026
export const DEFAULT_HOLIDAYS = [
  // 2025
  { id: 'h-2025-01', title: "New Year's Day",          date: '2025-01-01', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-02', title: 'Family Day',               date: '2025-02-17', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-03', title: 'Good Friday',              date: '2025-04-18', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-04', title: 'Easter Monday',            date: '2025-04-21', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-05', title: 'Victoria Day',             date: '2025-05-19', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-06', title: 'Canada Day',               date: '2025-07-01', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-07', title: 'Heritage Day',             date: '2025-08-04', type: 'holiday', description: 'Alberta civic holiday',     participants: [], groupIds: [] },
  { id: 'h-2025-08', title: 'Labour Day',               date: '2025-09-01', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-09', title: 'National Day for Truth and Reconciliation', date: '2025-09-30', type: 'holiday', description: 'Federal statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-10', title: 'Thanksgiving Day',         date: '2025-10-13', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-11', title: 'Remembrance Day',          date: '2025-11-11', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-12', title: 'Christmas Day',            date: '2025-12-25', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2025-13', title: 'Boxing Day',               date: '2025-12-26', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  // 2026
  { id: 'h-2026-01', title: "New Year's Day",           date: '2026-01-01', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-02', title: 'Family Day',               date: '2026-02-16', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-03', title: 'Good Friday',              date: '2026-04-03', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-04', title: 'Easter Monday',            date: '2026-04-06', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-05', title: 'Victoria Day',             date: '2026-05-18', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-06', title: 'Canada Day',               date: '2026-07-01', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-07', title: 'Heritage Day',             date: '2026-08-03', type: 'holiday', description: 'Alberta civic holiday',     participants: [], groupIds: [] },
  { id: 'h-2026-08', title: 'Labour Day',               date: '2026-09-07', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-09', title: 'National Day for Truth and Reconciliation', date: '2026-09-30', type: 'holiday', description: 'Federal statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-10', title: 'Thanksgiving Day',         date: '2026-10-12', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-11', title: 'Remembrance Day',          date: '2026-11-11', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-12', title: 'Christmas Day',            date: '2026-12-25', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
  { id: 'h-2026-13', title: 'Boxing Day',               date: '2026-12-26', type: 'holiday', description: 'Alberta statutory holiday', participants: [], groupIds: [] },
];

export function generateSabbaths() {
  const sabbaths = [];
  const now = new Date();
  const year = now.getFullYear();
  let d = new Date(year, 0, 1);
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  let i = 1;
  while (d.getFullYear() === year) {
    const dateStr = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    sabbaths.push({
      id: 'sab-' + i++,
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
