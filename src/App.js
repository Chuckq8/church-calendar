// App.js

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Settings, Bell, LogIn, LogOut, Shield, Eye, EyeOff } from 'lucide-react';
import { storageGet, storageSet } from './storage';
import { DEFAULT_HOLIDAYS, DEFAULT_PARTICIPANTS, DEFAULT_GROUPS, generateSabbaths, ADMIN_CREDENTIALS, EVENT_TYPES } from './constants';
import { todayStr, fisherYates } from './utils';
import { Toast, Modal, Field, inputStyle, Btn } from './components/UI';
import CalendarView from './components/CalendarView';
import ParticipantsView from './components/ParticipantsView';
import AdminDashboard from './components/AdminDashboard';

function LoginModal({ onLogin, onClose }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
      onLogin();
    } else {
      setError('Invalid credentials. Default: admin / church2024');
    }
  };

  return (
    <Modal title="Admin Login" onClose={onClose}>
      <div style={{ background:'#eff6ff', borderRadius:10, padding:'11px 14px', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
        <Shield size={15} color="#2563eb"/>
        <span style={{ fontSize:13, color:'#2563eb' }}>Default credentials: <strong>admin / church2024</strong></span>
      </div>
      <Field label="Username">
        <input style={inputStyle} value={user} onChange={e => setUser(e.target.value)} placeholder="admin" autoComplete="username"/>
      </Field>
      <Field label="Password">
        <div style={{ position:'relative' }}>
          <input
            type={showPass ? 'text' : 'password'}
            style={{ ...inputStyle, paddingRight:40 }}
            value={pass} onChange={e => setPass(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          <button onClick={() => setShowPass(v => !v)} style={{
            position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex',
          }}>
            {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        </div>
      </Field>
      {error && <div style={{ color:'#dc2626', fontSize:13, marginBottom:12 }}>{error}</div>}
      <Btn variant="primary" onClick={submit} style={{ width:'100%', justifyContent:'center' }}>Sign In</Btn>
    </Modal>
  );
}

// ── Shuffle Confirm Modal ─────────────────────────────────────────────────────
function ShuffleConfirmModal({ groups, participants, onConfirm, onClose }) {
  const activeGroups = groups.filter(g => (g.memberIds || []).length > 0);
  const totalMembers = activeGroups.reduce((sum, g) => sum + (g.memberIds || []).length, 0);
  const allMemberIds = [...new Set(groups.flatMap(g => g.memberIds || []))];
  const perGroup = groups.length > 0 ? Math.ceil(allMemberIds.length / groups.length) : 0;

  return (
    <Modal title="🔀 Reshuffle Groups" onClose={onClose}>
      <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:10, padding:'12px 14px', marginBottom:18 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#92400e', marginBottom:4 }}>⚠️ This will reassign members across groups</div>
        <div style={{ fontSize:13, color:'#78350f' }}>
          All members from all groups will be pooled together and randomly redistributed evenly. Events are not affected.
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
        {[
          { label:'Groups', value: groups.length },
          { label:'Members to Shuffle', value: totalMembers },
        ].map(({ label, value }) => (
          <div key={label} style={{ background:'#f8fafc', borderRadius:10, padding:'12px', textAlign:'center', border:'1.5px solid #e2e8f0' }}>
            <div style={{ fontSize:22, fontWeight:800, color:'#4f46e5' }}>{value}</div>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {groups.length > 0 && (
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', marginBottom:8, letterSpacing:'0.05em' }}>EXPECTED RESULT</div>
          {groups.map(g => (
            <div key={g.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'#eff0ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>👥</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{g.name}</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>~{perGroup} members after shuffle</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
        <Btn variant="primary" onClick={onConfirm} style={{ flex:1, justifyContent:'center' }}>
          🔀 Reshuffle Now
        </Btn>
      </div>
    </Modal>
  );
}

export default function App() {
  const [tab, setTab] = useState('calendar');
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [shuffleHistory, setShuffleHistory] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showShuffleConfirm, setShowShuffleConfirm] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => setToast({ message, type }), []);

  useEffect(() => {
    const savedEvents       = storageGet('church-events');
    const savedParticipants = storageGet('church-participants');
    const savedGroups       = storageGet('church-groups');
    const savedHistory      = storageGet('church-shuffle-history');

    if (savedEvents) {
      setEvents(savedEvents);
    } else {
      const base = [...DEFAULT_HOLIDAYS, ...generateSabbaths()];
      setEvents(base);
      storageSet('church-events', base);
    }

    if (savedParticipants) {
      setParticipants(savedParticipants);
    } else {
      setParticipants(DEFAULT_PARTICIPANTS);
      storageSet('church-participants', DEFAULT_PARTICIPANTS);
    }

    if (savedGroups) {
      setGroups(savedGroups);
    } else {
      setGroups(DEFAULT_GROUPS);
      storageSet('church-groups', DEFAULT_GROUPS);
    }

    if (savedHistory) setShuffleHistory(savedHistory);
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) storageSet('church-events', events); }, [events, loaded]);
  useEffect(() => { if (loaded) storageSet('church-participants', participants); }, [participants, loaded]);
  useEffect(() => { if (loaded) storageSet('church-groups', groups); }, [groups, loaded]);
  useEffect(() => { if (loaded) storageSet('church-shuffle-history', shuffleHistory); }, [shuffleHistory, loaded]);

  const addEvent    = useCallback(ev => setEvents(es => [...es, ev]), []);
  const editEvent   = useCallback(ev => setEvents(es => es.map(e => e.id === ev.id ? ev : e)), []);
  const deleteEvent = useCallback(id => setEvents(es => es.filter(e => e.id !== id)), []);

  const addParticipant    = useCallback(p  => setParticipants(ps => [...ps, p]), []);
  const editParticipant   = useCallback(p  => setParticipants(ps => ps.map(x => x.id === p.id ? p : x)), []);
  const deleteParticipant = useCallback(id => {
    setParticipants(ps => ps.filter(p => p.id !== id));
    setEvents(es => es.map(e => ({ ...e, participants: (e.participants || []).filter(pid => pid !== id) })));
    setGroups(gs => gs.map(g => ({ ...g, memberIds: (g.memberIds || []).filter(mid => mid !== id) })));
  }, []);

  const addGroup    = useCallback(g  => setGroups(gs => [...gs, g]), []);
  const editGroup   = useCallback(g  => setGroups(gs => gs.map(x => x.id === g.id ? g : x)), []);
  const deleteGroup = useCallback(id => {
    setGroups(gs => gs.filter(g => g.id !== id));
    setEvents(es => es.map(e => ({ ...e, groupIds: (e.groupIds || []).filter(gid => gid !== id) })));
  }, []);

  // ── Shuffle ─────────────────────────────────────────────────────────────────
  const doShuffle = useCallback(() => {
    setShowShuffleConfirm(true);
  }, []);

 const confirmShuffle = useCallback(() => {
    if (groups.length === 0) {
      showToast('No groups to shuffle', 'error');
      setShowShuffleConfirm(false);
      return;
    }

    // Pool ALL members from ALL groups together
    const allMemberIds = [...new Set(groups.flatMap(g => g.memberIds || []))];

    if (allMemberIds.length === 0) {
      showToast('No members in any group to shuffle', 'error');
      setShowShuffleConfirm(false);
      return;
    }

    // Fisher-Yates shuffle the full pool
    const pool = [...allMemberIds].sort(() => Math.random() - 0.5);
    const perGroup = Math.ceil(pool.length / groups.length);

    // Redistribute evenly across groups
    const updatedGroups = groups.map((g, i) => ({
      ...g,
      memberIds: pool.slice(i * perGroup, (i + 1) * perGroup),
    }));

    setGroups(updatedGroups);
    // NOTE: events are NOT touched

    setShuffleHistory(h => [...h, {
      date: new Date().toISOString(),
      groups: groups.length,
      participants: allMemberIds.length,
    }]);
    setShowShuffleConfirm(false);
    showToast(`✅ ${allMemberIds.length} members reshuffled across ${groups.length} groups!`, 'success');
  }, [groups, showToast]);
}

    // For each group: shuffle its members then distribute them evenly
    // across sabbaths using a round-robin rotation so no sabbath is overloaded
    const groupAssignments = activeGroups.map(g => {
      const shuffledMembers = fisherYates([...(g.memberIds || [])]);
      const perSabbath = Math.ceil(shuffledMembers.length / sabbaths.length);

      // Slice members into even chunks, one chunk per sabbath
      const chunks = sabbaths.map((_, i) =>
        shuffledMembers.slice(i * perSabbath, (i + 1) * perSabbath)
      );

      return { groupId: g.id, chunks };
    });

    // Build updated sabbath events — each gets a slice of each group's members
    const updatedSabbaths = sabbaths.map((sab, i) => {
      // Collect member IDs for this sabbath from all groups
      const memberIdsForSabbath = groupAssignments.flatMap(ga => ga.chunks[i] || []);
      return {
        ...sab,
        groupIds: activeGroups.map(g => g.id), // all groups assigned
        participants: memberIdsForSabbath,       // the specific members for this sabbath
      };
    });

    setEvents(es => es.map(e => updatedSabbaths.find(u => u.id === e.id) || e));
   setShuffleHistory(h => [...h, {
      date: new Date().toISOString(),
      count: sabbaths.length,
      groups: activeGroups.length,
      participants: activeGroups.reduce((sum, g) => sum + (g.memberIds || []).length, 0),
    }]);
    setShowShuffleConfirm(false);
    showToast(`✅ Shuffled ${activeGroups.length} groups across ${sabbaths.length} Sabbaths!`, 'success');
  }, [events, groups, showToast]);

  // ── Export ──────────────────────────────────────────────────────────────────
  const doExport = useCallback((format) => {
    let content, type, filename;
    if (format === 'csv') {
      const rows = [['Title','Date','Time','Type','Description','Participants','Groups']];
      events.forEach(e => {
        const names = (e.participants || []).map(pid => participants.find(p => p.id === pid)?.name || '').filter(Boolean).join('; ');
        const grpNames = (e.groupIds || []).map(gid => groups.find(g => g.id === gid)?.name || '').filter(Boolean).join('; ');
        rows.push([e.title, e.date, e.time||'', EVENT_TYPES[e.type]?.label||e.type, e.description||'', names, grpNames]);
      });
      content = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
      type = 'text/csv'; filename = 'church-calendar.csv';
    } else {
      content = JSON.stringify({ events, participants, groups, shuffleHistory }, null, 2);
      type = 'application/json'; filename = 'church-calendar.json';
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename; a.click();
    showToast(`${format.toUpperCase()} exported!`, 'success');
  }, [events, participants, groups, shuffleHistory, showToast]);

  const tabs = [
    { id:'calendar',     label:'Calendar',  icon:Calendar },
    { id:'participants', label:'Members',   icon:Users },
    { id:'admin',        label:'Dashboard', icon:Settings },
  ];

  if (!loaded) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, margin:'0 auto 16px', border:'3px solid #4f46e5', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
        <p style={{ color:'#94a3b8', fontSize:14, margin:0 }}>Loading church calendar…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Inter', system-ui, sans-serif" }}>
      <header style={{ background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 16px rgba(79,70,229,0.28)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', height:62, gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Bell size={19} color="#fff"/>
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:15, fontWeight:800, color:'#fff', lineHeight:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Church Calendar</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.65)', marginTop:1 }}>Lakeland Fellowship Church</div>
            </div>
          </div>
          <nav style={{ display:'flex', gap:2 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display:'flex', alignItems:'center', gap:5, padding:'7px 11px', borderRadius:9, border:'none', cursor:'pointer',
                fontSize:13, fontWeight:600, background: tab === t.id ? 'rgba(255,255,255,0.22)' : 'transparent', color:'#fff', transition:'background 0.15s',
              }}>
                <t.icon size={15}/>
                <span className="nav-label">{t.label}</span>
              </button>
            ))}
          </nav>
          <button onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)} style={{
            display:'flex', alignItems:'center', gap:5, padding:'7px 12px', border:'1.5px solid rgba(255,255,255,0.4)',
            borderRadius:9, background:'transparent', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700, flexShrink:0,
          }}>
            {isAdmin ? <><LogOut size={13}/> Exit Admin</> : <><LogIn size={13}/> Admin</>}
          </button>
        </div>
      </header>

      {isAdmin && (
        <div style={{ background:'#fef3c7', borderBottom:'1.5px solid #fde68a', padding:'9px 20px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#92400e' }}>
            <Shield size={14}/>
            <strong>Admin Mode</strong> — You can add, edit, and delete events; manage members and groups; and trigger shuffles.
          </div>
        </div>
      )}

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
        {tab === 'calendar' && (
          <CalendarView
            events={events} participants={participants} groups={groups} isAdmin={isAdmin}
            onAddEvent={addEvent} onEditEvent={editEvent} onDeleteEvent={deleteEvent}
            showToast={showToast}
          />
        )}
        {tab === 'participants' && (
          <ParticipantsView
            participants={participants} events={events} groups={groups} isAdmin={isAdmin}
            onAdd={addParticipant} onEdit={editParticipant} onDelete={deleteParticipant}
            onAddGroup={addGroup} onEditGroup={editGroup} onDeleteGroup={deleteGroup}
            onShuffle={doShuffle} shuffleHistory={shuffleHistory} showToast={showToast}
          />
        )}
        {tab === 'admin' && (
          <AdminDashboard
            events={events} participants={participants} groups={groups}
            shuffleHistory={shuffleHistory} onExport={doExport}
          />
        )}
      </main>

      {showLogin && (
        <LoginModal
          onLogin={() => { setIsAdmin(true); setShowLogin(false); showToast('Welcome, Admin!', 'success'); }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showShuffleConfirm && (
        <ShuffleConfirmModal
          groups={groups}
          participants={participants}
          events={events}
          onConfirm={confirmShuffle}
          onClose={() => setShowShuffleConfirm(false)}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 480px) { .nav-label { display: none; } }
      `}</style>
    </div>
  );
}
