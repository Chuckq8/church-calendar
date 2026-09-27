// components/EventForm.js

import { useState } from 'react';
import { EVENT_TYPES } from '../constants';
import { uid } from '../utils';
import { Field, inputStyle, Btn } from './UI';

const RECUR_OPTIONS = [
  { value: 'none',     label: 'Does not repeat' },
  { value: 'weekly',   label: 'Every week (same day)' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly',  label: 'Every month (same date)' },
  { value: 'yearly',   label: 'Every year (same date)' },
];

function generateRecurringDates(startDate, recurrence, untilDate, noEndDate) {
  if (!startDate || recurrence === 'none') return [startDate];

  let endDateStr = untilDate;
  if (noEndDate) {
    const start = new Date(startDate + 'T00:00:00');
    const autoEnd = new Date(start);
    autoEnd.setFullYear(autoEnd.getFullYear() + 10);
    endDateStr = autoEnd.getFullYear() + '-' +
      String(autoEnd.getMonth() + 1).padStart(2, '0') + '-' +
      String(autoEnd.getDate()).padStart(2, '0');
  }

  if (!endDateStr) return [startDate];

  const dates = [];
  const cur = new Date(startDate + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (cur > end) return [startDate];

  while (cur <= end) {
    const ds = cur.getFullYear() + '-' +
      String(cur.getMonth() + 1).padStart(2, '0') + '-' +
      String(cur.getDate()).padStart(2, '0');
    dates.push(ds);
    if (recurrence === 'weekly')        cur.setDate(cur.getDate() + 7);
    else if (recurrence === 'biweekly') cur.setDate(cur.getDate() + 14);
    else if (recurrence === 'monthly')  cur.setMonth(cur.getMonth() + 1);
    else if (recurrence === 'yearly')   cur.setFullYear(cur.getFullYear() + 1);
    else break;
  }
  return dates;
}

function Toggle({ on, onToggle, label }) {
  return (
    <button
      onClick={onToggle}
      style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0 }}
    >
      <div style={{
        width:36, height:20, borderRadius:10, position:'relative',
        transition:'background 0.2s', background: on ? '#4f46e5' : '#e2e8f0',
        flexShrink:0,
      }}>
        <div style={{
          width:16, height:16, borderRadius:'50%', background:'#fff',
          position:'absolute', top:2, transition:'left 0.2s',
          left: on ? 18 : 2, boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
        }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:600, color: on ? '#4f46e5' : '#475569' }}>{label}</span>
    </button>
  );
}

export default function EventForm({ event, participants, groups, onSave, onClose }) {
  const [title, setTitle]           = useState(event?.title || '');
  const [date, setDate]             = useState(event?.date || '');
  const [endDate, setEndDate]       = useState(event?.endDate || '');
  const [isMultiDay, setMultiDay]   = useState(!!(event?.endDate));
  const [time, setTime]             = useState(event?.time || '');
  const [type, setType]             = useState(event?.type || 'event');
  const [desc, setDesc]             = useState(event?.description || '');
  const [selParticipants, setSP]    = useState(event?.participants || []);
  const [selGroups, setSG]          = useState(event?.groupIds || []);
  const [recurrence, setRecur]      = useState(event?.recurrence || 'none');
  const [recurUntil, setRecurUntil] = useState(event?.recurUntil || '');
  const [noEndDate, setNoEndDate]   = useState(event?.noEndDate || false);

  const isEditing = !!event;

  const toggleP = id => setSP(ps => ps.includes(id) ? ps.filter(x => x !== id) : [...ps, id]);
  const toggleG = id => setSG(gs => gs.includes(id) ? gs.filter(x => x !== id) : [...gs, id]);

  const recurringCount = !isEditing && recurrence !== 'none' && (recurUntil || noEndDate) && date
    ? generateRecurringDates(date, recurrence, recurUntil, noEndDate).length
    : 0;

  const save = () => {
    if (!title.trim() || !date) return;

    const baseEvent = {
      title: title.trim(),
      date,
      endDate: (isMultiDay && endDate && endDate > date) ? endDate : null,
      time: time || null,
      type,
      description: desc.trim() || null,
      participants: selParticipants,
      groupIds: selGroups,
      recurrence: recurrence !== 'none' ? recurrence : null,
      recurUntil: (recurrence !== 'none' && recurUntil && !noEndDate) ? recurUntil : null,
      noEndDate: (recurrence !== 'none' && noEndDate) ? true : null,
    };

    if (!isEditing && recurrence !== 'none' && (recurUntil || noEndDate)) {
      const dates = generateRecurringDates(date, recurrence, recurUntil, noEndDate);
      const recurringEvents = dates.map(d => ({ ...baseEvent, id: uid(), date: d }));
      onSave(recurringEvents);
    } else {
      onSave({ ...baseEvent, id: event?.id || uid() });
    }
  };

  return (
    <div>

      {/* Title */}
      <Field label="Event Title *">
        <input
          style={inputStyle}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Event title"
        />
      </Field>

      {/* Multi-day toggle */}
      <div style={{ marginBottom:14 }}>
        <Toggle
          on={isMultiDay}
          onToggle={() => setMultiDay(v => !v)}
          label="Multi-day event"
        />
      </div>

      {/* Date fields */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label={isMultiDay ? 'Start Date *' : 'Date *'}>
          <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)}/>
        </Field>
        {isMultiDay ? (
          <Field label="End Date *">
            <input style={inputStyle} type="date" value={endDate} min={date} onChange={e => setEndDate(e.target.value)}/>
          </Field>
        ) : (
          <Field label="Time">
            <input style={inputStyle} type="time" value={time} onChange={e => setTime(e.target.value)}/>
          </Field>
        )}
      </div>

      {isMultiDay && (
        <Field label="Time">
          <input style={inputStyle} type="time" value={time} onChange={e => setTime(e.target.value)}/>
        </Field>
      )}

      {/* Repeat */}
      <Field label="Repeat">
        <select
          style={{ ...inputStyle, cursor:'pointer' }}
          value={recurrence}
          onChange={e => { setRecur(e.target.value); setNoEndDate(false); setRecurUntil(''); }}
        >
          {RECUR_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      {/* Repeat Until — only shows when a repeat is selected */}
           {/* Repeat Until — only shows when a repeat is selected */}
      {recurrence !== 'none' && (
        <Field label="Repeat Until">

          {/* No end date toggle — inline, no separate component */}
          <div
            onClick={() => { setNoEndDate(v => !v); setRecurUntil(''); }}
            style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, cursor:'pointer' }}
          >
            <div style={{
              width:36, height:20, borderRadius:10, position:'relative',
              background: noEndDate ? '#4f46e5' : '#e2e8f0', flexShrink:0,
            }}>
              <div style={{
                width:16, height:16, borderRadius:'50%', background:'#fff',
                position:'absolute', top:2,
                left: noEndDate ? 18 : 2,
                boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
              }}/>
            </div>
            <span style={{ fontSize:13, fontWeight:600, color: noEndDate ? '#4f46e5' : '#475569' }}>
              No end date (repeats for 10 years)
            </span>
          </div>

          {/* Date picker — hidden when no end date is on */}
          {!noEndDate && (
            <input
              type="date"
              value={recurUntil}
              min={date}
              onChange={e => setRecurUntil(e.target.value)}
              style={{ ...inputStyle }}
            />
          )}

          {/* Info messages */}
          {noEndDate && (
            <div style={{ marginTop:6, fontSize:12, color:'#4f46e5', fontWeight:600 }}>
              Will automatically repeat for 10 years from the start date
            </div>
          )}
          {recurringCount > 0 && !isEditing && (
            <div style={{ marginTop:6, fontSize:12, color:'#059669', fontWeight:600 }}>
              ✅ This will create {recurringCount} event{recurringCount !== 1 ? 's' : ''}
            </div>
          )}
          {isEditing && (
            <div style={{ marginTop:6, fontSize:12, color:'#f59e0b', fontWeight:600 }}>
              ⚠️ Editing only updates this single event
            </div>
          )}
        </Field>
      )}

      {/* Event Type */}
      <Field label="Event Type">
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {Object.entries(EVENT_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setType(k)} style={{
              padding:'5px 14px', borderRadius:20, border:'1.5px solid',
              borderColor: type === k ? v.color : '#e2e8f0',
              background: type === k ? v.bg : '#fff',
              color: type === k ? v.color : '#64748b',
              fontSize:12, fontWeight:700, cursor:'pointer',
            }}>{v.label}</button>
          ))}
        </div>
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea
          style={{ ...inputStyle, height:72, resize:'vertical' }}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Optional notes…"
        />
      </Field>

      {/* Assign Groups */}
      {groups && groups.length > 0 && (
        <Field label="Assign Groups">
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {groups.map(g => (
              <button key={g.id} onClick={() => toggleG(g.id)} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'5px 12px', borderRadius:20, border:'1.5px solid',
                borderColor: selGroups.includes(g.id) ? '#4f46e5' : '#e2e8f0',
                background: selGroups.includes(g.id) ? '#eff0ff' : '#fff',
                color: selGroups.includes(g.id) ? '#4f46e5' : '#64748b',
                fontSize:12, fontWeight:700, cursor:'pointer',
              }}>
                👥 {g.name}
                {selGroups.includes(g.id) && <span style={{ fontSize:10 }}>✓</span>}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Assign Individual Members */}
      {participants && participants.length > 0 && (
        <Field label="Assign Individual Members">
          <div style={{ border:'1.5px solid #e2e8f0', borderRadius:10, maxHeight:180, overflowY:'auto' }}>
            {participants.map(p => (
              <div key={p.id} onClick={() => toggleP(p.id)} style={{
                display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                cursor:'pointer', borderBottom:'1px solid #f8fafc',
                background: selParticipants.includes(p.id) ? '#eff0ff' : '#fff',
              }}>
                <div style={{
                  width:16, height:16, borderRadius:3, border:'2px solid',
                  borderColor: selParticipants.includes(p.id) ? '#4f46e5' : '#cbd5e1',
                  background: selParticipants.includes(p.id) ? '#4f46e5' : '#fff',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                  {selParticipants.includes(p.id) && <span style={{ color:'#fff', fontSize:10, fontWeight:800 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{p.name}</div>
                  {p.role && <div style={{ fontSize:11, color:'#94a3b8' }}>{p.role}</div>}
                </div>
              </div>
            ))}
          </div>
        </Field>
      )}

      {/* Buttons */}
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
        <Btn variant="primary" onClick={save} style={{ flex:1, justifyContent:'center' }}>
          {isEditing
            ? 'Save Changes'
            : recurringCount > 1
              ? 'Add ' + recurringCount + ' Events'
              : 'Add Event'
          }
        </Btn>
      </div>

    </div>
  );
}
