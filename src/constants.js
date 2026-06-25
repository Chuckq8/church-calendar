// constants.js

export const EVENT_TYPES = {
  sabbath:  { label: 'Sabbath Gathering', color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  event:    { label: 'Church Event',      color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' },
  holiday:  { label: 'Holiday',           color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  ministry: { label: 'Ministry',          color: '#9333ea', bg: '#f3e8ff', border: '#c4b5fd' },
};

export const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const ADMIN_CREDENTIALS = { username: 'admin', password: 'church2024' };

export const DEFAULT_HOLIDAYS = [
  { id:'h1',  title:"New Year's Day",   date:'2025-01-01', type:'holiday', time:'', description:'Celebration of the New Year', participants:[] },
  { id:'h2',  title:'Good Friday',      date:'2025-04-18', type:'holiday', time:'', description:'Commemoration of the crucifixion of Jesus', participants:[] },
  { id:'h3',  title:'Easter Sunday',    date:'2025-04-20', type:'holiday', time:'09:00', description:'Resurrection of Jesus Christ', participants:[] },
  { id:'h4',  title:'Pentecost Sunday', date:'2025-06-08', type:'holiday', time:'09:30', description:'Descent of the Holy Spirit', participants:[] },
  { id:'h5',  title:'Christmas Day',    date:'2025-12-25', type:'holiday', time:'09:00', description:'Birth of Jesus Christ', participants:[] },
  { id:'h6',  title:"New Year's Day",   date:'2026-01-01', type:'holiday', time:'', description:'Celebration of the New Year', participants:[] },
  { id:'h7',  title:'Good Friday',      date:'2026-04-03', type:'holiday', time:'', description:'Commemoration of the crucifixion of Jesus', participants:[] },
  { id:'h8',  title:'Easter Sunday',    date:'2026-04-05', type:'holiday', time:'09:00', description:'Resurrection of Jesus Christ', participants:[] },
  { id:'h9',  title:'Christmas Day',    date:'2026-12-25', type:'holiday', time:'09:00', description:'Birth of Jesus Christ', participants:[] },
];

export function generateSabbaths(startYear = 2025, endYear = 2026) {
  const sabbaths = [];
  let id = 1;
  for (let yr = startYear; yr <= endYear; yr++) {
    for (let mo = 0; mo < 12; mo++) {
      const d = new Date(yr, mo, 1);
      while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
      while (d.getMonth() === mo) {
        const dateStr = d.toISOString().slice(0, 10);
        sabbaths.push({
          id: `sab${id++}`,
          title: 'Sabbath Worship Service',
          date: dateStr,
          time: '09:30',
          type: 'sabbath',
          description: 'Weekly Sabbath Worship Service — 7th Day Sabbath gathering',
          participants: [],
        });
        d.setDate(d.getDate() + 7);
      }
    }
  }
  return sabbaths;
}

export const DEFAULT_PARTICIPANTS = [];
