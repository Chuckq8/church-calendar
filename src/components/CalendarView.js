// components/CalendarView.js

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, Copy } from 'lucide-react';
import { EVENT_TYPES } from '../constants';
import { DAYS, MONTHS } from '../utils';
import { getDaysInMonth, getFirstDayOfMonth, todayStr } from '../utils';
import { Modal, Btn } from './UI';
import EventForm from './EventForm';
import EventDetail from './EventDetail';

export default function CalendarView({ events, participants, groups, isAdmin, onAddEvent, onEditEvent, onDeleteEvent, showToast }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const [copyingEvent, setCopyingEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const todayDate = todayStr();

  // Expand multi-day events into all dates they span
  const expandedEvents = useMemo(() => {
    const result = [];
    events.forEach(e => {
      if (e.endDate && e.endDate > e.date) {
        // Multi-day: generate an entry for each day in range
        const start = new Date(e.date + 'T00:00:00');
        const end = new Date(e.endDate + 'T00:00:00');
        const cur = new Date(start);
        let dayIndex = 0;
        while (cur <= end) {
          const dateStr = cur.getFullYear() + '-' +
            String(cur.getMonth() + 1).padStart(2, '0') + '-' +
            String(cur.getDate()).padStart(2, '0');
          result.push({
            ...e,
            _displayDate: dateStr,
            _isMultiDay: true,
            _dayIndex: dayIndex,
            _totalDays: Math.round((end - start) / 86400000) + 1,
          });
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

  const handleCopyEvent = (ev, newDate) => {
    const { id, _displayDate, _isMultiDay, _dayIndex, _totalDays, ...rest } = ev;
    const copied = {
      ...rest,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      date: newDate,
      endDate: rest.endDate ? (() => {
        const diff = new Date(rest.endDate) - new Date(rest.date);
        const newEnd = new Date(new Date(newDate).getTime() + diff);
        return newEnd.toISOString().slice(0, 10);
      })() : undefined,
      title: rest.title + ' (copy)',
    };
    onAddEvent(copied);
    setCopyingEvent(null);
    showToast('Event copied!', 'success');
  };

  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:18, alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:220 }}>
          <button onClick={prevMonth} style={navBtn}><ChevronLeft size={18}/></button>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:'#1e293b', minWidth:190, textAlign:'center' }}>
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} style={navBtn}><ChevronRight size={18}/></button>
          <button onClick={goToday} style={{ ...navBtn, fontSize:12, padding:'6px 12px', borderRadius:8, width:'auto', color:'#4f46e5' }}>
            Today
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:9, padding:'7px 12px' }}>
          <Search size={14} color="#94a3b8"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
            style={{ border:'none', background:'none', outline:'none', fontSize:14, color:'#1e293b', width:150 }}/>
        </div>
        {isAdmin && (
          <Btn variant="primary" onClick={() => setAddingEvent(true)}>
            <Plus size={16}/> Add Event
          </Btn>
        )}
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','All Events','#64748b'], ...Object.entries(EVENT_TYPES).map(([k,v]) => [k, v.label, v.color])].map(([k, label, color]) => (
          <button key={k} onClick={() => setFilterType(k)} style={{
            padding:'4px 14px', borderRadius:20, border:'none', cursor:'pointer',
            fontSize:12, fontWeight:700,
            background: filterType === k ? color : '#f1f5f9',
            color: filterType === k ? '#fff' : '#64748b',
            transition:'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:'1.5px solid #e2e8f0', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#f8fafc', borderBottom:'1.5px solid #e2e8f0' }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding:'10px 4px', textAlign:'center', fontSize:12, fontWeight:700, letterSpacing:'0.04em', color: d === 'Sat' ? '#4f46e5' : '#64748b' }}>{d}</div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} style={emptyCell}/>;
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayDate;
            const isSat = new Date(year, month, day).getDay() === 6;

            return (
              <div key={day} style={{ minHeight:88, padding:'6px 4px 4px', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9', background: isToday ? '#eff6ff' : isSat ? '#faf5ff' : '#fff' }}>
                <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight: isToday ? 800 : 500, background: isToday ? '#4f46e5' : 'none', color: isToday ? '#fff' : isSat ? '#4f46e5' : '#374151', marginBottom:3 }}>{day}</div>
                {dayEvents.slice(0, 3).map(ev => {
                  const t = EVENT_TYPES[ev.type] || EVENT_TYPES.event;
                  const isStart = !ev._isMultiDay || ev._dayIndex === 0;
                  const isEnd = !ev._isMultiDay || ev._dayIndex === ev._totalDays - 1;
                  return (
                    <div key={ev.id + ev._displayDate} onClick={() => setSelectedEvent(ev)} style={{
                      background: t.bg,
                      color: t.color,
                      fontSize:10,
                      fontWeight:700,
                      borderRadius: ev._isMultiDay ? (isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : '0') : 4,
                      padding:'2px 4px',
                      marginBottom:2,
                      cursor:'pointer',
                      overflow:'hidden',
                      textOverflow:'ellipsis',
                      whiteSpace:'nowrap',
                      border: `1px solid ${t.border}`,
                      borderLeft: ev._isMultiDay && !isStart ? 'none' : `1px solid ${t.border}`,
                      borderRight: ev._isMultiDay && !isEnd ? 'none' : `1px solid ${t.border}`,
                    }}>
                      {/* Only show title on first day of multi-day */}
                      {(!ev._isMultiDay || isStart) ? ev.title : ''}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && <div style={{ fontSize:10, color:'#94a3b8', padding:'0 4px' }}>+{dayEvents.length-3}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:'flex', gap:16, marginTop:14, flexWrap:'wrap' }}>
        {Object.entries(EVENT_TYPES).map(([k, v]) => (
          <div key={k} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#64748b' }}>
            <div style={{ width:10, height:10, borderRadius:2, background:v.color }}/>
            {v.label}
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#64748b' }}>
          <div style={{ width:10, height:10, borderRadius:2, background:'#faf5ff', border:'1px solid #c4b5fd' }}/>
          Saturday (Sabbath)
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <Modal title={selectedEvent.title} onClose={() => setSelectedEvent(null)}>
          <EventDetail
            event={selectedEvent} participants={participants} groups={groups} isAdmin={isAdmin}
            onEdit={() => { setEditingEvent(selectedEvent); setSelectedEvent(null); }}
            onDelete={() => { onDeleteEvent(selectedEvent.id); setSelectedEvent(null); showToast('Event deleted', 'success'); }}
            onCopy={() => { setCopyingEvent(selectedEvent); setSelectedEvent(null); }}
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
              editingEvent ? onEditEvent(ev) : onAddEvent(ev);
              setAddingEvent(false); setEditingEvent(null);
              showToast(editingEvent ? 'Event updated!' : 'Event added!', 'success');
            }}
            onClose={() => { setAddingEvent(false); setEditingEvent(null); }}
          />
        </Modal>
      )}

      {/* Copy event modal */}
      {copyingEvent && (
        <Modal title={'Copy: ' + copyingEvent.title} onClose={() => setCopyingEvent(null)}>
          <p style={{ fontSize:14, color:'#64748b', marginBottom:16 }}>
            Select a new start date to copy this event to:
          </p>
          <input
            type="date"
            defaultValue={copyingEvent.date}
            style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:14, marginBottom:16, boxSizing:'border-box' }}
            id="copy-date-input"
          />
          <div style={{ display:'flex', gap:8 }}>
            <Btn variant="ghost" onClick={() => setCopyingEvent(null)} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
            <Btn variant="primary" onClick={() => {
              const val = document.getElementById('copy-date-input').value;
              if (val) handleCopyEvent(copyingEvent, val);
            }} style={{ flex:1, justifyContent:'center' }}>
              <Copy size={14}/> Copy Event
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

const navBtn = { background:'#f1f5f9', border:'none', borderRadius:9, width:36, height:36, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#475569' };
const emptyCell = { minHeight:88, borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9', background:'#fafafa' };
