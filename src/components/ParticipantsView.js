// components/ParticipantsView.js
import { useState } from 'react';
import { Plus, Edit2, Trash2, Shuffle, Eye, Search, Users } from 'lucide-react';
import { EVENT_TYPES } from '../constants';
import { formatDate, formatTime } from '../utils';
import { Modal, ConfirmModal, Field, inputStyle, Btn, Badge, Avatar, EmptyState } from './UI';

function ParticipantForm({ participant, onSave, onClose }) {
  const [form, setForm] = useState({
    name:     participant?.name     || '',
    role:     participant?.role     || '',
    email:    participant?.email    || '',
    isActive: participant?.isActive !== false,
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.role.trim()) { setError('Role is required.'); return; }
    onSave({ ...participant, ...form, id: participant?.id || ('p' + Date.now()) });
  };

  return (
    <div>
      {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13 }}>{error}</div>}
      <Field label="Full Name" required>
        <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Sis. Maria Santos"/>
      </Field>
      <Field label="Role / Ministry" required>
        <input style={inputStyle} value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Song Leader, Elder, Deacon…"/>
      </Field>
      <Field label="Email">
        <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@church.org"/>
      </Field>
      <Field label="Status">
        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ width:16, height:16, accentColor:'#4f46e5' }}/>
          <span style={{ fontSize:14, color:'#374151' }}>Active church member</span>
        </label>
      </Field>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSave}>{participant?.id ? 'Save Changes' : 'Add Member'}</Btn>
      </div>
    </div>
  );
}

export default function ParticipantsView({ participants, events, isAdmin, onAdd, onEdit, onDelete, onShuffle, showToast }) {
  const [editingP,      setEditingP]      = useState(null);
  const [addingP,       setAddingP]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewSchedule,  setViewSchedule]  = useState(null);
  const [shuffleModal,  setShuffleModal]  = useState(false);
  const [search,        setSearch]        = useState('');

  const filtered = participants.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase())
  );

  const getParticipantEvents = pid =>
    events.filter(e => (e.participants || []).includes(pid)).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      {/* Controls */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:9, padding:'7px 12px', flex:1, minWidth:200 }}>
          <Search size={14} color="#94a3b8"/>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search members…"
            style={{ border:'none', background:'none', outline:'none', fontSize:14, color:'#1e293b', width:'100%' }}
          />
        </div>
        {isAdmin && (
          <>
            <Btn variant="warning" onClick={() => setShuffleModal(true)}>
              <Shuffle size={15}/> Shuffle
            </Btn>
            <Btn variant="primary" onClick={() => setAddingP(true)}>
              <Plus size={15}/> Add Member
            </Btn>
          </>
        )}
      </div>

      {/* Cards grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px, 1fr))', gap:14 }}>
        {filtered.map(p => {
          const pEvents = getParticipantEvents(p.id);
          return (
            <div key={p.id} style={{ background:'#fff', borderRadius:14, padding:18, border:'1.5px solid #e2e8f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <Avatar name={p.name} size={46} inactive={!p.isActive}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1e293b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize:12, color:'#64748b' }}>{p.role}</div>
                </div>
                <Badge color={p.isActive ? '#16a34a' : '#94a3b8'} bg={p.isActive ? '#dcfce7' : '#f1f5f9'}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div style={{ fontSize:12, color:'#94a3b8', marginBottom:12, display:'flex', flexDirection:'column', gap:3 }}>
                {p.email && <span>✉ {p.email}</span>}
                <span>📅 {pEvents.length} event{pEvents.length !== 1 ? 's' : ''} assigned</span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setViewSchedule(p)} style={iconBtn('#f8fafc','#475569','#e2e8f0', true)}>
                  <Eye size={13}/> Schedule
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => setEditingP(p)} style={iconBtn('#eff6ff','#2563eb','#dbeafe')}><Edit2 size={13}/></button>
                    <button onClick={() => setConfirmDelete(p)} style={iconBtn('#fff5f5','#dc2626','#fee2e2')}><Trash2 size={13}/></button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <EmptyState icon={Users} title="No members found" subtitle="Try a different search or add a new member"/>}

      {/* Schedule modal */}
      {viewSchedule && (
        <Modal title={`${viewSchedule.name} — Schedule`} onClose={() => setViewSchedule(null)} wide>
          <p style={{ color:'#64748b', fontSize:13, marginBottom:14 }}>Role: <strong>{viewSchedule.role}</strong></p>
          {getParticipantEvents(viewSchedule.id).length === 0 ? (
            <p style={{ color:'#94a3b8', fontSize:14 }}>No events assigned yet.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {getParticipantEvents(viewSchedule.id).map(ev => {
                const t = EVENT_TYPES[ev.type] || EVENT_TYPES.event;
                return (
                  <div key={ev.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'11px 14px', background:'#f8fafc', borderRadius:10, border:'1px solid #e2e8f0' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:t.color, flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{ev.title}</div>
                      <div style={{ fontSize:11, color:'#94a3b8' }}>{formatDate(ev.date)}{ev.time ? ` · ${formatTime(ev.time)}` : ''}</div>
                    </div>
                    <Badge color={t.color} bg={t.bg} border={t.border}>{t.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}

      {/* Shuffle confirm */}
      {shuffleModal && (
        <ConfirmModal
          title="Reshuffle Participants"
          message="This will randomly reassign active members to all upcoming Sabbath gatherings using a fair distribution algorithm. Previous assignments will be replaced. Continue?"
          confirmLabel="Yes, Shuffle Now"
          variant="warning"
          onConfirm={() => { onShuffle(); showToast('Participants reshuffled!', 'success'); }}
          onClose={() => setShuffleModal(false)}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <ConfirmModal
          title="Remove Member"
          message={`Are you sure you want to remove ${confirmDelete.name}? They will be unassigned from all events.`}
          confirmLabel="Remove"
          variant="danger"
          onConfirm={() => { onDelete(confirmDelete.id); showToast('Member removed', 'success'); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {/* Add/Edit modal */}
      {(addingP || editingP) && (
        <Modal title={editingP ? 'Edit Member' : 'Add New Member'} onClose={() => { setAddingP(false); setEditingP(null); }}>
          <ParticipantForm
            participant={editingP}
            onSave={p => {
              editingP ? onEdit(p) : onAdd(p);
              setAddingP(false); setEditingP(null);
              showToast(editingP ? 'Member updated!' : 'Member added!', 'success');
            }}
            onClose={() => { setAddingP(false); setEditingP(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

function iconBtn(bg, color, border, wide) {
  return {
    display:'flex', alignItems:'center', gap:5,
    padding: wide ? '7px 12px' : '7px 10px',
    border:`1.5px solid ${border}`,
    borderRadius:8, background:bg,
    cursor:'pointer', fontSize:12, fontWeight:600, color,
    flex: wide ? 1 : undefined,
    justifyContent: wide ? 'center' : undefined,
  };
}
