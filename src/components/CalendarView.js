// components/CalendarView.js

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, Copy } from 'lucide-react';
import { EVENT_TYPES } from '../constants';
import { DAYS, MONTHS, getDaysInMonth, getFirstDayOfMonth, todayStr } from '../utils';
import { Modal, Btn } from './UI';
import EventForm from './EventForm';
import EventDetail from './EventDetail';

export default function CalendarView({ events, participants, groups, isAdmin, onAddEvent, onAddEvents, onEditEvent, onDeleteEvent, showToast }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const [copyingEvent, setCopyingEvent] = useState(null);
  const [copyDate, setCopyDate] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const todayDate = todayStr();

  const expandedEvents = useMemo(() => {
    const result = [];
    events.forEach(e => {
      if (e.endDate && e.endDate > e.date) {
        const start = new Date(e.date + 'T00:00:00');
        const end = new Date(e.endDate + 'T00:00:00');
        const cur = new Date(start);
        let dayIndex = 0;
        const totalDays = Math.round((end - start) / 86400000) + 1;
        while (cur <= end) {
          const dateStr = cur.getFullYear() + '-' +
            String(cur.getMonth() + 1).padStart(2, '0') + '-' +
            String(cur.getDate()).padStart(2, '0');
          result.push({ ...e, _displayDate: dateStr, _isMultiDay: true, _dayIndex: dayIndex, _totalDays: totalDays });
          cur.setDate(cur.getDate() + 1);
          dayIndex++;
        }
      } else {
        result.push({ ...e, _displayDate: e.date, _isMultiDay: false });
      }
    });
    return result;
  }, [events]);

  const monthEvents = useMemo(() => expandedEvents.filter(e => {
    const matchMonth = e._displayDate?.startsWith(monthStr);
    const matchType = filterType === 'all' || e.type === filterType;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchType && matchSearch;
  }), [expandedEvents, monthStr, filterType, search]);

  const eventsByDate = useMemo(() => {
    const map = {};
    monthEvents.forEach(e => {
      if (!map[e._displayDate]) map[e._displayDate] = [];
      map[e._displayDate].push(e);
    });
    return map;
  }, [monthEvents]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleCopyEvent = () => {
    if (!copyDate || !copyingEvent) return;
    const { id, _displayDate, _isMultiDay, _dayIndex, _totalDays, ...rest } = copyingEvent;
    let newEndDate;
    if (rest.endDate && rest.endDate > rest.date) {
      const diff = new Date(rest.endDate + 'T00:00:00') - new Date(rest.date + 'T00:00:00');
      const newEnd = new Date(new Date(copyDate + 'T00:00:00').getTime() + diff);
      newEndDate = newEnd.getFullYear() + '-' + String(newEnd.getMonth()+1).padStart(2,'0') + '-' + String(newEnd.getDate()).padStart(2,'0');
    }
    onAddEvent({
      ...rest,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      date: copyDate,
      endDate: newEndDate,
      title: rest.title + ' (copy)',
    });
    setCopyingEvent(null);
    setCopyDate('');
    showToast('Event copied!', 'success');
  };

  return (
    <div>
      {/* Top bar */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14, alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, flex:1, minWidth:0 }}>
          <button onClick={prevMonth} style={navBtn}><ChevronLeft size={16}/></button>
          <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:'#1e293b', flex:1, textAlign:'center', whiteSpace:'nowrap' }}>
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} style={navBtn}><ChevronRight size={16}/></button>
          <button onClick={goToday} style={{ ...navBtn, fontSize:11, padding:'5px 10px', borderRadius:8, width:'auto', color:'#4f46e5' }}>
            Today
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:9, padding:'6px 10px', flex:1, minWidth:0 }}>
          <Search size={13} color="#94a3b8"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            style={{ border:'none', background:'none', outline:'none', fontSize:13, color:'#1e293b', width:'100%', minWidth:0 }}/>
        </div>
        {isAdmin && (
          <Btn variant="primary" onClick={() => setAddingEvent(true)} style={{ padding:'7px 10px', fontSize:12 }}>
            <Plus size={14}/> Add
          </Btn>
        )}
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:5, marginBottom:12, flexWrap:'wrap' }}>
        {[['all','All','#64748b'], ...Object.entries(EVENT_TYPES).map(([k,v]) => [k, v.label, v.color])].map(([k, label, color]) => (
          <button key={k} onClick={() => setFilterType(k)} style={{
            padding:'3px 10px', borderRadius:20, border:'none', cursor:'pointer',
            fontSize:11, fontWeight:700,
            background: filterType === k ? color : '#f1f5f9',
            color: filterType === k ? '#fff' : '#64748b',
          }}>{label}</button>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ background:'#fff', borderRadius:12, overflow:'hidden', border:'1.5px solid #e2e8f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        {/* Day headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#f8fafc', borderBottom:'1.5px solid #e2e8f0' }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding:'8px 2px', textAlign:'center', fontSize:11, fontWeight:700, color: d === 'Sat' ? '#4f46e5' : '#64748b' }}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} style={emptyCell}/>;
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayDate;
            const isSat = new Date(year, month, day).getDay() === 6;

            return (
              <div key={day} style={{
                minHeight:60,
                padding:'4px 2px 2px',
                borderRight:'1px solid #f1f5f9',
                borderBottom:'1px solid #f1f5f9',
                background: isToday ? '#eff6ff' : isSat ? '#faf5ff' : '#fff',
                overflow:'hidden',
              }}>
                {/* Day number */}
                <div style={{
                  width:22, height:22, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight: isToday ? 800 : 500,
                  background: isToday ? '#4f46e5' : 'none',
                  color: isToday ? '#fff' : isSat ? '#4f46e5' : '#374151',
                  marginBottom:2,
                }}>{day}</div>

                {/* Events — show max 2 on mobile */}
                {dayEvents.slice(0, 2).map(ev => {
                  const t = EVENT_TYPES[ev.type] || EVENT_TYPES.event;
                  const isStart = !ev._isMultiDay || ev._dayIndex === 0;
                  return (
                    <div
                      key={ev.id + ev._displayDate}
                      onClick={() => setSelectedEvent(ev)}
                      title={ev.title}
                      style={{
                        background: t.color,
                        color: '#fff',
                        fontSize:9,
                        fontWeight:700,
                        borderRadius: ev._isMultiDay ? (isStart ? '3px 0 0 3px' : (ev._dayIndex === ev._totalDays - 1 ? '0 3px 3px 0' : '0')) : 3,
                        padding:'1px 4px',
                        marginBottom:1,
                        cursor:'pointer',
                        overflow:'hidden',
                        textOverflow:'ellipsis',
                        whiteSpace:'nowrap',
                        maxWidth:'100%',
                        display:'block',
                        lineHeight:'14px',
                        height:14,
                      }}
                    >
                      {(!ev._isMultiDay || isStart) ? ev.title : '\u00A0'}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div style={{ fontSize:9, color:'#94a3b8', paddingLeft:2 }}>+{dayEvents.length - 2}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:10, marginTop:10, flexWrap:'wrap' }}>
        {Object.entries(EVENT_TYPES).map(([k, v]) => (
          <div key={k} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#64748b' }}>
            <div style={{ width:8, height:8, borderRadius:2, background:v.color }}/>
            {v.label}
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#64748b' }}>
          <div style={{ width:8, height:8, borderRadius:2, background:'#faf5ff', border:'1px solid #c4b5fd' }}/>
          Saturday
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <Modal title={selectedEvent.title} onClose={() => setSelectedEvent(null)}>
          <EventDetail
            event={selectedEvent} participants={participants} groups={groups} isAdmin={isAdmin}
            onEdit={() => { setEditingEvent(selectedEvent); setSelectedEvent(null); }}
            onDelete={() => { onDeleteEvent(selectedEvent.id); setSelectedEvent(null); showToast('Event deleted', 'success'); }}
            onCopy={() => { setCopyingEvent(selectedEvent); setCopyDate(selectedEvent.date); setSelectedEvent(null); }}
            onClose={() => setSelectedEvent(null)}
          />
        </Modal>
      )}

      {/* Add/Edit modal */}
      {(addingEvent || editingEvent) && (
        <Modal title={editingEvent ? 'Edit Event' : 'Add New Event'} onClose={() => { setAddingEvent(false); setEditingEvent(null); }}>
          <EventForm
            event={editingEvent} participants={participants} groups={groups}
            onSave={ev => {
              if (editingEvent) {
                onEditEvent(ev);
                showToast('Event updated!', 'success');
                setEditingEvent(null);
              } else if (Array.isArray(ev)) {
                onAddEvents(ev);
                showToast('Added ' + ev.length + ' recurring events!', 'success');
              } else {
                onAddEvent(ev);
                showToast('Event added!', 'success');
              }
              setAddingEvent(false);
              setEditingEvent(null);
            }}
            onClose={() => { setAddingEvent(false); setEditingEvent(null); }}
          />
        </Modal>
      )}

      {/* Copy modal — now uses controlled state, no getElementById */}
      {copyingEvent && (
        <Modal title={'Copy: ' + copyingEvent.title} onClose={() => { setCopyingEvent(null); setCopyDate(''); }}>
          <p style={{ fontSize:14, color:'#64748b', marginBottom:16 }}>
            Pick a new start date to copy this event to:
          </p>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:700, color:'#475569', display:'block', marginBottom:6 }}>New Start Date</label>
            <input
              type="date"
              value={copyDate}
              onChange={e => setCopyDate(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:14, boxSizing:'border-box', outline:'none' }}
            />
          </div>
          {copyingEvent.endDate && copyingEvent.endDate > copyingEvent.date && copyDate && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'8px 12px', marginBottom:16, fontSize:12, color:'#166534' }}>
              End date will automatically be adjusted to maintain the same duration.
            </div>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <Btn variant="ghost" onClick={() => { setCopyingEvent(null); setCopyDate(''); }} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
            <Btn variant="primary" onClick={handleCopyEvent} style={{ flex:1, justifyContent:'center' }}>
              <Copy size={14}/> Copy Event
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

const navBtn = {
  background:'#f1f5f9', border:'none', borderRadius:9,
  width:32, height:32, cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center', color:'#475569',
  flexShrink:0,
};
const emptyCell = {
  minHeight:60,
  borderRight:'1px solid #f1f5f9',
  borderBottom:'1px solid #f1f5f9',
  background:'#fafafa',
};
