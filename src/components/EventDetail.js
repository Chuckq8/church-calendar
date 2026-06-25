// components/EventDetail.js
import { Edit2, Trash2 } from 'lucide-react';
import { EVENT_TYPES } from '../constants';
import { formatDate, formatTime } from '../utils';
import { Badge, Avatar, Btn } from './UI';

export default function EventDetail({ event, participants, isAdmin, onEdit, onDelete, onClose }) {
  const evType = EVENT_TYPES[event.type] || EVENT_TYPES.event;
  const assigned = participants.filter(p => (event.participants || []).includes(p.id));

  return (
    <div>
      {/* Type badge */}
      <div style={{ marginBottom: 18 }}>
        <Badge color={evType.color} bg={evType.bg} border={evType.border}>
          {evType.label}
        </Badge>
      </div>

      {/* Meta */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr',
        gap: '10px 18px', marginBottom: 18,
        background: '#f8fafc', borderRadius: 10, padding: '14px 16px',
      }}>
        <span style={{ color:'#94a3b8', fontSize:13, fontWeight:600 }}>Date</span>
        <span style={{ color:'#1e293b', fontSize:14 }}>{formatDate(event.date)}</span>

        {event.time && <>
          <span style={{ color:'#94a3b8', fontSize:13, fontWeight:600 }}>Time</span>
          <span style={{ color:'#1e293b', fontSize:14 }}>{formatTime(event.time)}</span>
        </>}

        {event.description && <>
          <span style={{ color:'#94a3b8', fontSize:13, fontWeight:600, alignSelf:'start', paddingTop:2 }}>Details</span>
          <span style={{ color:'#475569', fontSize:14, lineHeight:1.6 }}>{event.description}</span>
        </>}
      </div>

      {/* Assigned participants */}
      {assigned.length > 0 && (
        <div>
          <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:700, color:'#374151' }}>
            Assigned Members ({assigned.length})
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {assigned.map(p => (
              <div key={p.id} style={{
                display:'flex', alignItems:'center', gap:12,
                background:'#f8fafc', borderRadius:10, padding:'10px 14px',
                border:'1px solid #e2e8f0',
              }}>
                <Avatar name={p.name} size={36} inactive={!p.isActive} />
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{p.name}</div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {assigned.length === 0 && (
        <p style={{ color:'#94a3b8', fontSize:13 }}>No members assigned to this event yet.</p>
      )}

      {/* Admin actions */}
      {isAdmin && (
        <div style={{
          display:'flex', gap:10, marginTop:22,
          paddingTop:18, borderTop:'1.5px solid #f1f5f9',
        }}>
          <Btn variant="outline" onClick={onEdit} style={{ flex:1, justifyContent:'center' }}>
            <Edit2 size={14}/> Edit Event
          </Btn>
          <Btn variant="danger" onClick={onDelete}>
            <Trash2 size={14}/> Delete
          </Btn>
        </div>
      )}
    </div>
  );
}
