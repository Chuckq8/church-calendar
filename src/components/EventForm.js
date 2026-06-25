// components/EventForm.js
import { useState } from 'react';
import { Field, inputStyle, Btn } from './UI';
import { EVENT_TYPES } from '../constants';
import { uid, todayStr } from '../utils';

export default function EventForm({ event, participants, onSave, onClose }) {
  const [form, setForm] = useState({
    title:        event?.title       || '',
    date:         event?.date        || todayStr(),
    time:         event?.time        || '',
    type:         event?.type        || 'event',
    description:  event?.description || '',
    participants: event?.participants || [],
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleP = id => set('participants',
    form.participants.includes(id)
      ? form.participants.filter(x => x !== id)
      : [...form.participants, id]
  );

  const handleSave = () => {
    if (!form.title.trim()) { setError('Event title is required.'); return; }
    if (!form.date)         { setError('Date is required.'); return; }
    onSave({ ...event, ...form, id: event?.id || uid() });
  };

  const active = participants.filter(p => p.isActive);

  return (
    <div>
      {error && (
        <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13 }}>
          {error}
        </div>
      )}

      <Field label="Event Title" required>
        <input
          style={inputStyle}
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="e.g. Sabbath Worship Service"
        />
      </Field>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="Date" required>
          <input type="date" style={inputStyle} value={form.date} onChange={e => set('date', e.target.value)} />
        </Field>
        <Field label="Time">
          <input type="time" style={inputStyle} value={form.time} onChange={e => set('time', e.target.value)} />
        </Field>
      </div>

      <Field label="Event Type" required>
        <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
          {Object.entries(EVENT_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Description">
        <textarea
          style={{ ...inputStyle, minHeight:80, resize:'vertical' }}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Brief description of this event…"
        />
      </Field>

      <Field label={`Assign Participants (${form.participants.length} selected)`}>
        <div style={{
          border:'1.5px solid #e2e8f0', borderRadius:8, padding:8,
          maxHeight:200, overflowY:'auto',
        }}>
          {active.length === 0 ? (
            <p style={{ color:'#94a3b8', fontSize:13, margin:'8px 4px' }}>
              No active participants yet. Add some in the Members tab.
            </p>
          ) : active.map(p => (
            <label key={p.id} style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'6px 4px', cursor:'pointer', borderRadius:6,
              userSelect:'none',
            }}>
              <input
                type="checkbox"
                checked={form.participants.includes(p.id)}
                onChange={() => toggleP(p.id)}
                style={{ width:15, height:15, accentColor:'#4f46e5' }}
              />
              <span style={{ fontSize:13, color:'#1e293b', fontWeight:500 }}>{p.name}</span>
              <span style={{ fontSize:11, color:'#94a3b8', marginLeft:'auto' }}>{p.role}</span>
            </label>
          ))}
        </div>
      </Field>

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSave}>
          {event?.id ? 'Save Changes' : 'Add Event'}
        </Btn>
      </div>
    </div>
  );
}
