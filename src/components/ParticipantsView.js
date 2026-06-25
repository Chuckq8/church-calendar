// components/ParticipantsView.js

import { useState } from 'react';
import { Search, Edit2, Trash2, Users, ChevronDown, ChevronUp, UserPlus, FolderPlus, Shuffle } from 'lucide-react';
import { Modal, Btn, Field, inputStyle } from './UI';
import { uid } from '../utils';

// ── Member Form ───────────────────────────────────────────────────────────────
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

// ── Group Form ────────────────────────────────────────────────────────────────
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
                  transition:'background 0.1s',
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

// ── Group Card ────────────────────────────────────────────────────────────────
function GroupCard({ group, participants, isAdmin, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const members = participants.filter(p => (group.memberIds || []).includes(p.id));

  return (
    <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #e2e8f0', overflow:'hidden', marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', cursor:'pointer' }} onClick={() => setExpanded(v => !v)}>
        <div style={{ width:40, height:40, borderRadius:10, background:'#eff0ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Users size={18} color="#4f46e5"/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#1e293b' }}>{group.name}</div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:1 }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
            {group.description ? ` · ${group.description}` : ''}
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

// ── Shuffle History ───────────────────────────────────────────────────────────
function ShuffleHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div style={{ background:'#f8fafc', borderRadius:12, border:'1.5px solid #e2e8f0', padding:'14px 16px', marginTop:20 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', letterSpacing:'0.05em', marginBottom:10 }}>SHUFFLE HISTORY</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {[...history].reverse().slice(0, 5).map((h, i) => {
          const date = new Date(h.date);
          const dateLabel = date.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
          const timeLabel = date.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true });
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'#fff', borderRadius:9, border:'1px solid #f1f5f9' }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'#eff0ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                🔀
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>
                  {h.groups} group{h.groups !== 1 ? 's' : ''} · {h.participants} member{h.participants !== 1 ? 's' : ''} shuffled
                </div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>{dateLabel} at {timeLabel}</div>
              </div>
              <div style={{ fontSize:11, fontWeight:700, background:'#dcfce7', color:'#166534', borderRadius:20, padding:'2px 9px' }}>
                {h.count} Sabbath{h.count !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>
      {history.length > 5 && (
        <div style={{ fontSize:12, color:'#94a3b8', textAlign:'center', marginTop:8 }}>
          + {history.length - 5} older shuffles
        </div>
      )}
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────
export default function ParticipantsView({
  participants, events, groups, isAdmin,
  onAdd, onEdit, onDelete,
  onAddGroup, onEditGroup, onDeleteGroup,
  onShuffle, shuffleHistory, showToast,
}) {
  const [viewTab, setViewTab]           = useState('members');
  const [search, setSearch]             = useState('');
  const [addingMember, setAddMember]    = useState(false);
  const [editingMember, setEditMember]  = useState(null);
  const [addingGroup, setAddGroup]      = useState(false);
  const [editingGroup, setEditGroup]    = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Auto-distribute all active members evenly across groups
  const autoDistribute = () => {
    if (groups.length === 0) { showToast('Create some groups first', 'error'); return; }
    const active = participants.filter(p => p.isActive);
    if (active.length === 0) { showToast('No active members to distribute', 'error'); return; }

    // Shuffle members randomly then split evenly across groups
    const shuffled = [...active].sort(() => Math.random() - 0.5);
    const perGroup = Math.ceil(shuffled.length / groups.length);
    const updatedGroups = groups.map((g, i) => ({
      ...g,
      memberIds: shuffled.slice(i * perGroup, (i + 1) * perGroup).map(p => p.id),
    }));
    updatedGroups.forEach(g => onEditGroup(g));
    showToast(`✅ ${active.length} members distributed evenly across ${groups.length} groups!`, 'success');
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
                  {isAdmin ? 'Tap "Add Member" to get started' : 'Try a different search or add a new member'}
                </div>
              </div>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
                {filtered.map(p => {
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
                      <div style={{ fontSize:12, color:'#94a3b8' }}>📅 {memberEvents.length} event{memberEvents.length !== 1 ? 's' : ''} assigned</div>
                      {groups.filter(g => (g.memberIds||[]).includes(p.id)).length > 0 && (
                        <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:4 }}>
                          {groups.filter(g => (g.memberIds||[]).includes(p.id)).map(g => (
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
          {/* Toolbar */}
          <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ flex:1, fontSize:14, color:'#64748b' }}>
              {groups.length} group{groups.length !== 1 ? 's' : ''} · {participants.length} total members
            </div>
            {isAdmin && (
              <div style={{ display:'flex', gap:8 }}>
                <Btn variant="ghost" onClick={autoDistribute} style={{ gap:6 }}>
                  ⚡ Auto-distribute Members
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

          {/* Info box */}
          {isAdmin && participants.filter(p => p.isActive).length > 0 && groups.length > 0 && (
            <div style={{ background:'#eff0ff', border:'1.5px solid #c7d2fe', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#4338ca' }}>
              💡 <strong>Auto-distribute</strong> will evenly split all {participants.filter(p=>p.isActive).length} active members across {groups.length} groups
              (~{Math.ceil(participants.filter(p=>p.isActive).length / groups.length)} per group). <strong>Reshuffle</strong> re-randomizes members across upcoming Sabbath events.
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

          {/* Shuffle History */}
          <ShuffleHistory history={shuffleHistory} />
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
