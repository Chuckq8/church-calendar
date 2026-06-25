// components/EventDetail.js

import { EVENT_TYPES } from '../constants';
import { Btn } from './UI';

export default function EventDetail({ event, participants, groups, isAdmin, onEdit, onDelete, onClose }) {
  const typeInfo = EVENT_TYPES[event.type] || EVENT_TYPES.event;

  const todayStr = new Date().toISOString().slice(0, 10);
  const isPast = event.date < todayStr;

  // Individual participants (directly stored)
  const directMembers = (event.participants || [])
    .map(function(pid) { return participants.find(function(p) { return p.id === pid; }); })
    .filter(Boolean);

  // Live group participants (future events only)
  const assignedGroups = (event.groupIds || [])
    .map(function(gid) { return groups && groups.find(function(g) { return g.id === gid; }); })
    .filter(Boolean);

  const groupMemberIds = assignedGroups.flatMap(function(g) { return g.memberIds || []; });
  const allMemberIds = [...new Set([...(event.participants || []), ...groupMemberIds])];
  const allMembers = allMemberIds
    .map(function(id) { return participants.find(function(p) { return p.id === id; }); })
    .filter(Boolean);

  return (
    <div>
      {/* Type badge + date */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <span style={{ fontSize:12, fontWeight:700, borderRadius:20, padding:'3px 12px', background:typeInfo.bg, color:typeInfo.color, border:'1px solid ' + typeInfo.border }}>
          {typeInfo.label}
        </span>
        <span style={{ fontSize:13, color:'#64748b' }}>📅 {event.date}{event.time ? ' · ' + event.time : ''}</span>
        {isPast && (
          <span style={{ fontSize:11, fontWeight:700, background:'#f1f5f9', color:'#64748b', borderRadius:20, padding:'2px 10px', border:'1px solid #e2e8f0' }}>
            ✅ Completed
          </span>
        )}
      </div>

      {event.description && (
        <p style={{ fontSize:14, color:'#475569', marginBottom:16, lineHeight:1.6 }}>{event.description}</p>
      )}

      {/* Assigned Groups (future events) */}
      {assignedGroups.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', letterSpacing:'0.05em', marginBottom:8 }}>ASSIGNED GROUPS</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {assignedGroups.map(function(g) {
              return (
                <div key={g.id} style={{ display:'flex', alignItems:'center', gap:6, background:'#eff0ff', borderRadius:20, padding:'4px 12px', border:'1px solid #c7d2fe' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#4f46e5' }}>👥 {g.name}</span>
                  <span style={{ fontSize:11, color:'#6366f1' }}>({(g.memberIds || []).length} members)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Frozen notice for past events */}
      {isPast && directMembers.length > 0 && (
        <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 12px', marginBottom:12, fontSize:12, color:'#64748b', display:'flex', alignItems:'center', gap:6 }}>
          🔒 Participant list is frozen — this event has already passed
        </div>
      )}

      {/* All participants */}
      {allMembers.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', letterSpacing:'0.05em', marginBottom:8 }}>
            PARTICIPANTS ({allMembers.length})
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {allMembers.map(function(p) {
              const viaGroup = groupMemberIds.includes(p.id) && !(event.participants || []).includes(p.id);
              const groupNames = assignedGroups
                .filter(function(g) { return (g.memberIds || []).includes(p.id); })
                .map(function(g) { return g.name; });
              return (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, background:'#f8fafc', borderRadius:10, padding:'8px 12px' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'#4f46e5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {p.name.split(' ').map(function(w) { return w[0]; }).slice(0,2).join('')}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{p.name}</div>
                    {p.role && <div style={{ fontSize:11, color:'#94a3b8' }}>{p.role}</div>}
                  </div>
                  {viaGroup && (
                    <span style={{ fontSize:10, fontWeight:700, background:'#eff0ff', color:'#4f46e5', borderRadius:20, padding:'2px 8px', whiteSpace:'nowrap' }}>
                      via {groupNames[0]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {allMembers.length === 0 && assignedGroups.length === 0 && (
        <div style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'16px 0' }}>No participants assigned yet</div>
      )}

      {isAdmin && (
        <div style={{ display:'flex', gap:8, marginTop:20, paddingTop:16, borderTop:'1px solid #f1f5f9' }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Close</Btn>
          <Btn variant="ghost" onClick={onEdit} style={{ flex:1, justifyContent:'center', color:'#4f46e5' }}>✏️ Edit</Btn>
          <Btn variant="ghost" onClick={onDelete} style={{ flex:1, justifyContent:'center', color:'#dc2626' }}>🗑 Delete</Btn>
        </div>
      )}
      {!isAdmin && (
        <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid #f1f5f9' }}>
          <Btn variant="ghost" onClick={onClose} style={{ width:'100%', justifyContent:'center' }}>Close</Btn>
        </div>
      )}
    </div>
  );
}
