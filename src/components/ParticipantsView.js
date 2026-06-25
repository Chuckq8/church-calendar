// components/ParticipantsView.js

import { useState } from 'react';
import { Search, Edit2, Trash2, Users, ChevronDown, ChevronUp, UserPlus, FolderPlus, Shuffle } from 'lucide-react';
import { Modal, Btn, Field, inputStyle } from './UI';
import { uid } from '../utils';

function MemberForm({ member, onSave, onClose }) {
  const [name, setName]       = useState(member?.name || '');
  const [role, setRole]       = useState(member?.role || '');
  const [email, setEmail]     = useState(member?.email || '');
  const [isActive, setActive] = useState(member?.isActive ?? true);

  const save = () => {
    if (!name.trim()) return;
    onSave({ id: member?.id || uid(), name: name.trim(), role: role.trim(), email: email.trim(), isActive });
    onClose();
  };

  return (
    <div>
      <Field label="Full Name *">
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bro. Juan dela Cruz"/>
      </Field>
      <Field label="Role / Position">
        <input style={inputStyle} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Elder, Deacon, Worship Leader"/>
      </Field>
      <Field label="Email">
        <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@church.org"/>
      </Field>
      <Field label="Status">
        <div style={{ display:'flex', gap:10 }}>
          {[true, false].map(v => (
            <button key={String(v)} onClick={() => setActive(v)} style={{
              flex:1, padding:'8px', borderRadius:8, border:'1.5px solid',
              borderColor: isActive === v ? '#4f46e5' : '#e2e8f0',
              background: isActive === v ? '#eff0ff' : '#fff',
              color: isActive === v ? '#4f46e5' : '#64748b',
              fontWeight:600, fontSize:13, cursor:'pointer',
            }}>{v ? 'Active' : 'Inactive'}</button>
          ))}
        </div>
      </Field>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
        <Btn variant="primary" onClick={save} style={{ flex:1, justifyContent:'center' }}>Save Member</Btn>
      </div>
    </div>
  );
}

function GroupForm({ group, participants, onSave, onClose }) {
  const [name, setName]         = useState(group?.name || '');
  const [description, setDesc]  = useState(group?.description || '');
  const [memberIds, setMembers] = useState(group?.memberIds || []);
  const [search, setSearch]     = useState('');

  const toggleMember = id => setMembers(ms => ms.includes(id) ? ms.filter(m => m !== id) : [...ms, id]);

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const save = () => {
    if (!name.trim()) return;
    onSave({ id: group?.id || uid(), name: name.trim(), description: description.trim(), memberIds, color: group?.color || '#4f46e5' });
    onClose();
  };

  return (
    <div>
      <Field label="Group Name *">
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Worship Team, Deacons Board"/>
      </Field>
      <Field label="Description">
        <input style={inputStyle} value={description} onChange={e => setDesc(e.target.value)} placeholder="Short description (optional)"/>
      </Field>
      <Field label={`Members (${memberIds.length} selected)`}>
        <div style={{ border:'1.5px solid #e2e8f0', borderRadius:10, overflow:'hidden' }}>
          <div style={{ padding:'8px 10px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:6, background:'#f8fafc' }}>
            <Search size={13} color="#94a3b8"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…"
              style={{ border:'none', background:'none', outline:'none', fontSize:13, color:'#1e293b', flex:1 }}/>
          </div>
          <div style={{ maxHeight:200, overflowY:'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding:'20px', textAlign:'center', color:'#94a3b8', fontSize:13 }}>No members found</div>
              : filtered.map(p => (
                <div key={p.id} onClick={() => toggleMember(p.id)} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                  cursor:'pointer', borderBottom:'1px solid #f8fafc',
                  background: memberIds.includes(p.id) ? '#eff0ff' : '#fff',
                }}>
                  <div style={{
                    width:18, height:18, borderRadius:4, border:'2px solid',
                    borderColor: memberIds.includes(p.id) ? '#4f46e5' : '#cbd5e1',
                    background: memberIds.includes(p.id) ? '#4f46e5' : '#fff',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    {memberIds.includes(p.id) && <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>✓</span>}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{p.name}</div>
                    {p.role && <div style={{ fontSize:11, color:'#94a3b8' }}>{p.role}</div>}
                  </div>
                  {!p.isActive && <span style={{ marginLeft:'auto', fontSize:10, color:'#94a3b8', background:'#f1f5f9', borderRadius:4, padding:'2px 6px' }}>Inactive</span>}
                </div>
              ))
            }
          </div>
        </div>
      </Field>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
        <Btn variant="primary" onClick={save} style={{ flex:1, justifyContent:'center' }}>Save Group</Btn>
      </div>
    </div>
  );
}

function GroupCard({ group, participants, isAdmin, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const members = participants.filter(p => (group.memberIds || []).includes(p.id));
  const total = participants.length > 0
    ? Math.round((members.length / participants.length) * 100)
    : 0;

  return (
    <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e2e8f0', overflow:'hidden', marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', cursor:'pointer' }} onClick={() => setExpanded(v => !v)}>
        <div style={{ width:40, height:40, borderRadius:10, background:'#eff0ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Users size={18} color="#4f46e5"/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1e293b' }}>{group.name}</div>
            <span style={{ fontSize:12, fontWeight:700, background:'#eff0ff', color:'#4f46e5', borderRadius:20, padding:'1px 9px' }}>
              {members.length}
            </span>
          </div>
          {group.description && <div style={{ fontSize:12, color:'#94a3b8', marginTop:1 }}>{group.description}</div>}
          {/* Distribution bar */}
          <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ flex:1, height:4, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
              <div style={{ width: total + '%', height:'100%', background:'#4f46e5', borderRadius:4, transition:'width 0.3s' }}/>
            </div>
            <span style={{ fontSize:10, color:'#94a3b8', whiteSpace:'nowrap' }}>{total}% of members</span>
          </div>
        </div>
        {isAdmin && (
          <div style={{ display:'flex', gap:6 }} onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} style={{ background:'#f1f5f9', border:'none', borderRadius:7, padding:'6px 8px', cursor:'pointer', color:'#4f46e5' }}>
              <Edit2 size={14}/>
            </button>
            <button onClick={onDelete} style={{ background:'#fef2f2', border:'none', borderRadius:7, padding:'6px 8px', cursor:'pointer', color:'#dc2626' }}>
              <Trash2 size={14}/>
            </button>
          </div>
        )}
        <div style={{ color:'#94a3b8' }}>
          {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop:'1px solid #f1f5f9', padding:'12px 16px' }}>
          {members.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'12px 0' }}>No members in this group yet</div>
            : <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {members.map(p => (
                  <div key={p.id} style={{
                    display:'flex', alignItems:'center', gap:7,
                    background:'#f8fafc', borderRadius:20, padding:'5px 12px 5px 6px',
                    border:'1px solid #e2e8f0',
                  }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:'#4f46e5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {p.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'#1e293b', lineHeight:1.2 }}>{p.name}</div>
                      {p.role && <div style={{ fontSize:10, color:'#94a3b8' }}>{p.role}</div>}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}
    </div>
  );
}

function ShuffleHistory({ history, onClearHistory }) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div style={{ background:'#f8fafc', borderRadius:12, border:'1.5px solid #e2e8f0', padding:'14px 16px', marginTop:20 }}>
      <div style={{ display:'flex', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', letterSpacing:'0.05em', flex:1 }}>SHUFFLE HISTORY</div>
        {history && history.length > 0 && (
          !confirmClear
            ? <button onClick={() => setConfirmClear(true)} style={{ fontSize:11, color:'#dc2626', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, padding:'3px 10px', cursor:'pointer', fontWeight:600 }}>
                🗑 Clear History
              </button>
            : <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ fontSize:12, color:'#64748b' }}>Sure?</span>
                <button onClick={() => { onClearHistory(); setConfirmClear(false); }} style={{ fontSize:11, color:'#fff', background:'#dc2626', border:'none', borderRadius:6, padding:'3px 10px', cursor:'pointer', fontWeight:600 }}>Yes, clear</button>
                <button onClick={() => setConfirmClear(false)} style={{ fontSize:11, color:'#64748b', background:'#f1f5f9', border:'none', borderRadius:6, padding:'3px 10px', cursor:'pointer', fontWeight:600 }}>Cancel</button>
              </div>
        )}
      </div>
      {!history || history.length === 0
        ? <div style={{ textAlign:'center', color:'#94a3b8', fontSize:13, padding:'8px 0' }}>No shuffle history yet</div>
        : <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[...history].reverse().map((h, i) => {
              const date = new Date(h.date);
              const dateLabel = date.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
              const timeLabel = date.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true });
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'#fff', borderRadius:9, border:'1px solid #f1f5f9' }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:'#eff0ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🔀</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>
                      {h.groups} group{h.groups !== 1 ? 's' : ''} · {h.participants} member{h.participants !== 1 ? 's' : ''} reshuffled
                    </div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{dateLabel} at {timeLabel}</div>
                  </div>
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

export default function ParticipantsView({
  participants, events, groups, isAdmin,
  onAdd, onEdit, onDelete,
  onAddGroup, onEditGroup, onDeleteGroup,
  onShuffle, shuffleHistory, onClearHistory, showToast,
}) {
  const [viewTab, setViewTab]           = useState('members');
  const [search, setSearch]             = useState('');
  const [addingMember, setAddMember]    = useState(false);
  const [editingMember, setEditMember]  = useState(null);
  const [addingGroup, setAddGroup]      = useState(false);
  const [editingGroup, setEditGroup]    = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const activeCount   = participants.filter(p => p.isActive).length;
  const inactiveCount = participants.length - activeCount;

  const autoDistribute = () => {
    if (groups.length === 0) { showToast('Create some groups first', 'error'); return; }
    const active = participants.filter(p => p.isActive);
    if (active.length === 0) { showToast('No active members to distribute', 'error'); return; }

    // True even distribution: use round-robin so sizes differ by at most 1
    const shuffled = [...active].sort(() => Math.random() - 0.5);
    const updatedGroups = groups.map(g => ({ ...g, memberIds: [] }));
    shuffled.forEach((p, i) => {
      updatedGroups[i % groups.length].memberIds.push(p.id);
    });
    updatedGroups.forEach(g => onEditGroup(g));
    const perGroup = Math.floor(active.length / groups.length);
    const extras = active.length % groups.length;
    showToast(
      'Distributed ' + active.length + ' members across ' + groups.length + ' groups (' +
      (extras > 0 ? extras + ' groups with ' + (perGroup + 1) + ', rest with ' + perGroup : 'exactly ' + perGroup + ' each') + ')',
      'success'
    );
  };

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'member') {
      onDelete(confirmDelete.id);
      showToast('Member removed', 'success');
    } else {
      onDeleteGroup(confirmDelete.id);
      showToast('Group deleted', 'success');
    }
    setConfirmDelete(null);
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'#f1f5f9', borderRadius:12, padding:4, width:'fit-content' }}>
        {[['members','Members'], ['groups','Groups']].map(([id, label]) => (
          <button key={id} onClick={() => setViewTab(id)} style={{
            padding:'8px 20px', borderRadius:9, border:'none', cursor:'pointer',
            fontSize:13, fontWeight:700,
            background: viewTab === id ? '#fff' : 'transparent',
            color: viewTab === id ? '#4f46e5' : '#64748b',
            boxShadow: viewTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition:'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* ── MEMBERS TAB ── */}
      {viewTab === 'members' && (
        <div>
          {/* Member count summary */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:18 }}>
            {[
              { label:'Total Members', value: participants.length, color:'#4f46e5', bg:'#eff0ff' },
              { label:'Active',        value: activeCount,         color:'#059669', bg:'#f0fdf4' },
              { label:'Inactive',      value: inactiveCount,       color:'#94a3b8', bg:'#f8fafc' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius:12, padding:'14px', textAlign:'center', border:'1.5px solid #e2e8f0' }}>
                <div style={{ fontSize:28, fontWeight:800, color }}>{value}</div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:2, fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:9, padding:'7px 12px', flex:1, minWidth:200 }}>
              <Search size={14} color="#94a3b8"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…"
                style={{ border:'none', background:'none', outline:'none', fontSize:14, color:'#1e293b', flex:1 }}/>
            </div>
            {isAdmin && (
              <Btn variant="primary" onClick={() => setAddMember(true)}>
                <UserPlus size={15}/> Add Member
              </Btn>
            )}
          </div>

          {filtered.length === 0
            ? <div style={{ textAlign:'center', padding:'60px 20px', color:'#94a3b8' }}>
                <Users size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
                <div style={{ fontSize:15, fontWeight:600, color:'#64748b' }}>No members found</div>
                <div style={{ fontSize:13, marginTop:4 }}>
                  {isAdmin ? 'Tap "Add Member" to get started' : 'Try a different search'}
                </div>
              </div>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
                {filtered.map(p => {
                  const memberGroups = groups.filter(g => (g.memberIds || []).includes(p.id));
                  const memberEvents = events.filter(e =>
                    (e.participants || []).includes(p.id) ||
                    (e.groupIds || []).some(gid => {
                      const g = groups.find(gr => gr.id === gid);
                      return g && (g.memberIds || []).includes(p.id);
                    })
                  );
                  const initials = p.name.split(' ').map(w => w[0]).slice(0,2).join('');
                  return (
                    <div key={p.id} style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e2e8f0', padding:'16px', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                        <div style={{ width:44, height:44, borderRadius:'50%', background:'#4f46e5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff', flexShrink:0 }}>
                          {initials}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{p.name}</div>
                          {p.role && <div style={{ fontSize:12, color:'#64748b', marginTop:1 }}>{p.role}</div>}
                          <span style={{ display:'inline-block', marginTop:4, fontSize:11, fontWeight:700, borderRadius:20, padding:'2px 9px', background: p.isActive ? '#dcfce7' : '#f1f5f9', color: p.isActive ? '#166534' : '#64748b' }}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {isAdmin && (
                          <div style={{ display:'flex', gap:4 }}>
                            <button onClick={() => setEditMember(p)} style={{ background:'#f1f5f9', border:'none', borderRadius:7, padding:'5px 7px', cursor:'pointer', color:'#4f46e5' }}><Edit2 size={13}/></button>
                            <button onClick={() => setConfirmDelete({ type:'member', id:p.id, name:p.name })} style={{ background:'#fef2f2', border:'none', borderRadius:7, padding:'5px 7px', cursor:'pointer', color:'#dc2626' }}><Trash2 size={13}/></button>
                          </div>
                        )}
                      </div>
                      {p.email && <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>✉ {p.email}</div>}
                      <div style={{ fontSize:12, color:'#94a3b8', marginBottom: memberGroups.length > 0 ? 8 : 0 }}>
                        📅 {memberEvents.length} event{memberEvents.length !== 1 ? 's' : ''} assigned
                      </div>
                      {memberGroups.length > 0 && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                          {memberGroups.map(g => (
                            <span key={g.id} style={{ fontSize:10, fontWeight:700, background:'#eff0ff', color:'#4f46e5', borderRadius:20, padding:'2px 8px' }}>{g.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          }
        </div>
      )}

      {/* ── GROUPS TAB ── */}
      {viewTab === 'groups' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ flex:1, fontSize:14, color:'#64748b' }}>
              {groups.length} group{groups.length !== 1 ? 's' : ''} · {participants.length} total members
            </div>
            {isAdmin && (
              <div style={{ display:'flex', gap:8 }}>
                <Btn variant="ghost" onClick={autoDistribute} style={{ gap:6 }}>
                  ⚡ Auto-distribute
                </Btn>
                <Btn variant="ghost" onClick={onShuffle} style={{ gap:6, color:'#7c3aed', borderColor:'#c4b5fd' }}>
                  <Shuffle size={14}/> Reshuffle
                </Btn>
                <Btn variant="primary" onClick={() => setAddGroup(true)}>
                  <FolderPlus size={15}/> Create Group
                </Btn>
              </div>
            )}
          </div>

          {/* Distribution summary */}
          {groups.length > 0 && participants.length > 0 && (
            <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid #e2e8f0', padding:'14px 16px', marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', letterSpacing:'0.05em', marginBottom:10 }}>MEMBER DISTRIBUTION</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {groups.map(g => {
                  const count = (g.memberIds || []).length;
                  const pct = participants.length > 0 ? Math.round((count / participants.length) * 100) : 0;
                  const ideal = Math.ceil(participants.length / groups.length);
                  const isBalanced = Math.abs(count - ideal) <= 1;
                  return (
                    <div key={g.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:80, fontSize:12, fontWeight:600, color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{g.name}</div>
                      <div style={{ flex:1, height:8, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ width: pct + '%', height:'100%', background: isBalanced ? '#4f46e5' : '#f59e0b', borderRadius:4, transition:'width 0.3s' }}/>
                      </div>
                      <div style={{ width:60, fontSize:12, color:'#64748b', textAlign:'right' }}>
                        {count} <span style={{ color: isBalanced ? '#059669' : '#f59e0b', fontWeight:700 }}>({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:10, fontSize:11, color:'#94a3b8' }}>
                Ideal: ~{Math.ceil(participants.length / groups.length)} per group · <span style={{ color:'#4f46e5' }}>■</span> balanced · <span style={{ color:'#f59e0b' }}>■</span> uneven
              </div>
            </div>
          )}

          {isAdmin && participants.filter(p => p.isActive).length > 0 && groups.length > 0 && (
            <div style={{ background:'#eff0ff', border:'1.5px solid #c7d2fe', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#4338ca' }}>
              💡 <strong>Auto-distribute</strong> evenly splits all {participants.filter(p => p.isActive).length} active members across {groups.length} groups using round-robin (max 1 member difference per group).
            </div>
          )}

          {groups.length === 0
            ? <div style={{ textAlign:'center', padding:'60px 20px', color:'#94a3b8' }}>
                <Users size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }}/>
                <div style={{ fontSize:15, fontWeight:600, color:'#64748b' }}>No groups yet</div>
                <div style={{ fontSize:13, marginTop:4 }}>
                  {isAdmin ? 'Tap "Create Group" to organize your members' : 'No groups have been created yet'}
                </div>
              </div>
            : groups.map(g => (
                <GroupCard
                  key={g.id} group={g} participants={participants} isAdmin={isAdmin}
                  onEdit={() => setEditGroup(g)}
                  onDelete={() => setConfirmDelete({ type:'group', id:g.id, name:g.name })}
                />
              ))
          }

          <ShuffleHistory history={shuffleHistory} onClearHistory={onClearHistory} />
        </div>
      )}

      {/* ── MODALS ── */}
      {(addingMember || editingMember) && (
        <Modal title={editingMember ? 'Edit Member' : 'Add Member'} onClose={() => { setAddMember(false); setEditMember(null); }}>
          <MemberForm
            member={editingMember}
            onSave={p => { editingMember ? onEdit(p) : onAdd(p); showToast(editingMember ? 'Member updated!' : 'Member added!', 'success'); }}
            onClose={() => { setAddMember(false); setEditMember(null); }}
          />
        </Modal>
      )}

      {(addingGroup || editingGroup) && (
        <Modal title={editingGroup ? 'Edit Group' : 'Create Group'} onClose={() => { setAddGroup(false); setEditGroup(null); }}>
          <GroupForm
            group={editingGroup}
            participants={participants}
            onSave={g => { editingGroup ? onEditGroup(g) : onAddGroup(g); showToast(editingGroup ? 'Group updated!' : 'Group created!', 'success'); }}
            onClose={() => { setAddGroup(false); setEditGroup(null); }}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)}>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:20 }}>
            Are you sure you want to delete <strong>{confirmDelete.name}</strong>?
            {confirmDelete.type === 'group' ? ' This will also remove it from any assigned events.' : ' They will be removed from all events and groups.'}
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <Btn variant="ghost" onClick={() => setConfirmDelete(null)} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
            <Btn onClick={handleDeleteConfirm} style={{ flex:1, justifyContent:'center', background:'#dc2626', color:'#fff', border:'none', borderRadius:9, padding:'9px', cursor:'pointer', fontWeight:700 }}>Delete</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
