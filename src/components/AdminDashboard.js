// components/AdminDashboard.js
import { Calendar, Users, Bell, Tag, Download, RefreshCw, Layers } from 'lucide-react';
import { EVENT_TYPES } from '../constants';
import { formatDate, formatTime, todayStr } from '../utils';
import { Btn } from './UI';

export default function AdminDashboard({ events, participants, shuffleHistory, onExport }) {
  const today = todayStr();
  const upcoming = events.filter(e => e.date >= today).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 6);

  const stats = [
    { label:'Total Events',        value: events.length,                                 icon: Calendar, color:'#2563eb', bg:'#dbeafe' },
    { label:'Sabbath Gatherings',  value: events.filter(e => e.type==='sabbath').length, icon: Bell,     color:'#16a34a', bg:'#dcfce7' },
    { label:'Holidays',            value: events.filter(e => e.type==='holiday').length, icon: Tag,      color:'#dc2626', bg:'#fee2e2' },
    { label:'Ministry Events',     value: events.filter(e => e.type==='ministry').length,icon: Layers,   color:'#9333ea', bg:'#f3e8ff' },
    { label:'Active Members',      value: participants.filter(p => p.isActive).length,   icon: Users,    color:'#d97706', bg:'#fef3c7' },
    { label:'Total Members',       value: participants.length,                            icon: Users,    color:'#64748b', bg:'#f1f5f9' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:12 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:'#fff', borderRadius:14, padding:18, border:'1.5px solid #e2e8f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width:38, height:38, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <s.icon size={19} color={s.color}/>
            </div>
            <div style={{ fontSize:30, fontWeight:800, color:'#1e293b', lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <div style={{ background:'#fff', borderRadius:14, padding:22, border:'1.5px solid #e2e8f0' }}>
        <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#1e293b', display:'flex', alignItems:'center', gap:8 }}>
          <Calendar size={16} color="#4f46e5"/> Upcoming Events
        </h3>
        {upcoming.length === 0 ? (
          <p style={{ color:'#94a3b8', fontSize:14, margin:0 }}>No upcoming events.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {upcoming.map(ev => {
              const t = EVENT_TYPES[ev.type] || EVENT_TYPES.event;
              const assigned = (ev.participants || []).length;
              return (
                <div key={ev.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'11px 14px', background:'#f8fafc', borderRadius:10, border:'1px solid #e2e8f0' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:t.color, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1e293b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ev.title}</div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{formatDate(ev.date)}{ev.time ? ` · ${formatTime(ev.time)}` : ''}</div>
                  </div>
                  <span style={{ fontSize:11, color:'#94a3b8', whiteSpace:'nowrap' }}>{assigned} member{assigned !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shuffle history */}
      <div style={{ background:'#fff', borderRadius:14, padding:22, border:'1.5px solid #e2e8f0' }}>
        <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:'#1e293b', display:'flex', alignItems:'center', gap:8 }}>
          <RefreshCw size={16} color="#9333ea"/> Shuffle History
        </h3>
        {shuffleHistory.length === 0 ? (
          <p style={{ color:'#94a3b8', fontSize:14, margin:0 }}>
            No shuffles performed yet. Use the <strong>Shuffle</strong> button in the Members tab to assign participants to Sabbath gatherings.
          </p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[...shuffleHistory].reverse().map((h, i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'center', fontSize:13, color:'#475569', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
                <RefreshCw size={13} color="#9333ea" style={{ flexShrink:0 }}/>
                <span><strong>{formatDate(h.date)}</strong> — Reshuffled {h.count} Sabbath events with {h.participants} active members</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div style={{ background:'#fff', borderRadius:14, padding:22, border:'1.5px solid #e2e8f0' }}>
        <h3 style={{ margin:'0 0 8px', fontSize:15, fontWeight:700, color:'#1e293b', display:'flex', alignItems:'center', gap:8 }}>
          <Download size={16} color="#2563eb"/> Export Data
        </h3>
        <p style={{ margin:'0 0 14px', fontSize:13, color:'#64748b' }}>Download your calendar data for backup or use in other apps.</p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <Btn variant="ghost" onClick={() => onExport('csv')}><Download size={14}/> Export CSV</Btn>
          <Btn variant="ghost" onClick={() => onExport('json')}><Download size={14}/> Export JSON</Btn>
        </div>
      </div>
    </div>
  );
}
