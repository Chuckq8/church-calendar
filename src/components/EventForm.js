// components/EventForm.js

import { useState } from 'react';
import { EVENT_TYPES } from '../constants';
import { uid } from '../utils';
import { Field, inputStyle, Btn } from './UI';

export default function EventForm({ event, participants, groups, onSave, onClose }) {
  const [title, setTitle]       = useState(event?.title || '');
  const [date, setDate]         = useState(event?.date || '');
  const [time, setTime]         = useState(event?.time || '');
  const [type, setType]         = useState(event?.type || 'event');
  const [desc, setDesc]         = useState(event?.description || '');
  const [selParticipants, setSP] = useState(event?.participants || []);
  const [selGroups, setSG]       = useState(event?.groupIds || []);

  const toggleP = id => setSP(ps => ps.includes(id) ? ps.filter(x => x !== id) : [...ps, id]);
  const toggleG = id => setSG(gs => gs.includes(id) ? gs.filter(x => x !== id) : [...gs, id]);

  const save = () => {
    if (!title.trim() || !date) return;
    onSave({
      id: event?.id || uid(),
      title: title.trim(), date, time, type,
      description: desc.trim(),
      participants: selParticipants,
      groupIds: selGroups,
    });
  };

  return (
    <div>
      <Field label="Event Title *">
        <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title"/>
      </Field>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="Date *">
          <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)}/>
        </Field>
        <Field label="Time">
          <input style={inputStyle} type="time" value={time} onChange={e => setTime(e.target.value)}/>
        </Field>
      </div>
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
      <Field label="Description">
        <textarea style={{ ...inputStyle, height:72, resize:'vertical' }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional notes…"/>
      </Field>

      {/* Groups */}
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

      {/* Individual participants */}
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

      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
        <Btn variant="primary" onClick={save} style={{ flex:1, justifyContent:'center' }}>
          {event ? 'Save Changes' : 'Add Event'}
        </Btn>
      </div>
    </div>
  );
}
