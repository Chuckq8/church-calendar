import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Users, Settings, Bell, LogIn, LogOut, Shield, Eye, EyeOff } from 'lucide-react';
import { DEFAULT_HOLIDAYS, DEFAULT_PARTICIPANTS, DEFAULT_GROUPS, generateSabbaths, ADMIN_CREDENTIALS, EVENT_TYPES } from './constants';
import { listenToAll, saveEvents, saveParticipants, saveGroups, saveShuffleHistory, saveAll } from './firestore';
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
      setError('Invalid credentials.');
    }
  };

  return (
    <Modal title="Admin Login" onClose={onClose}>
      <Field label="Username">
        <input style={inputStyle} value={user} onChange={e => setUser(e.target.value)} placeholder="Username" autoComplete="username"/>
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
      <Btn variant="primary" onClick={submit} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>Sign In</Btn>
    </Modal>
  );
}

function ShuffleConfirmModal({ groups, onConfirm, onClose }) {
  const allMemberIds = [...new Set(groups.flatMap(g => g.memberIds || []))];
  const perGroup = groups.length > 0 ? Math.floor(allMemberIds.length / groups.length) : 0;
  const extras = groups.length > 0 ? allMemberIds.length % groups.length : 0;

  return (
    <Modal title="Reshuffle Groups" onClose={onClose}>
      <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:10, padding:'12px 14px', marginBottom:18 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#92400e', marginBottom:4 }}>This will reassign members across groups</div>
        <div style={{ fontSize:13, color:'#78350f' }}>
          All members will be pooled and randomly redistributed evenly. Past events will be frozen first.
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
        <div style={{ background:'#f8fafc', borderRadius:10, padding:'12px', textAlign:'center', border:'1.5px solid #e2e8f0' }}>
          <div style={{ fontSize:22, fontWeight:800, color:'#4f46e5' }}>{groups.length}</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Groups</div>
        </div>
        <div style={{ background:'#f8fafc', borderRadius:10, padding:'12px', textAlign:'center', border:'1.5px solid #e2e8f0' }}>
          <div style={{ fontSize:22, fontWeight:800, color:'#4f46e5' }}>{allMemberIds.length}</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Members to Shuffle</div>
        </div>
      </div>
      {groups.length > 0 && (
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', marginBottom:8, letterSpacing:'0.05em' }}>EXPECTED RESULT</div>
          {groups.map((g, i) => (
            <div key={g.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'#eff0ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>👥</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{g.name}</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>{i < extras ? perGroup + 1 : perGroup} members after shuffle</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:'flex', gap:8 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
        <Btn variant="primary" onClick={onConfirm} style={{ flex:1, justifyContent:'center' }}>Reshuffle Now</Btn>
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
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const isFirstLoad = useRef(true);

  const showToast = useCallback((message, type) => {
    setToast({ message, type: type || 'info' });
  }, []);

  useEffect(() => {
    const unsub = listenToAll(function(data) {
      if (isFirstLoad.current && data.events.length === 0) {
        const base = [...DEFAULT_HOLIDAYS, ...generateSabbaths()];
        const initialData = {
          events:         base,
          participants:   DEFAULT_PARTICIPANTS,
          groups:         DEFAULT_GROUPS,
          shuffleHistory: [],
        };
        saveAll(initialData);
        setEvents(base);
        setParticipants(DEFAULT_PARTICIPANTS);
        setGroups(DEFAULT_GROUPS);
        setShuffleHistory([]);
      } else {
        setEvents(data.events);
        setParticipants(data.participants);
        setGroups(data.groups);
        setShuffleHistory(data.shuffleHistory);
      }
      isFirstLoad.current = false;
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  const addEvent = useCallback(ev => {
    setEvents(es => {
      const next = [...es, ev];
      saveEvents(next);
      return next;
    });
  }, []);

  const editEvent = useCallback(ev => {
    setEvents(es => {
      const next = es.map(e => e.id === ev.id ? ev : e);
      saveEvents(next);
      return next;
    });
  }, []);

  const deleteEvent = useCallback(id => {
    setEvents(es => {
      const next = es.filter(e => e.id !== id);
      saveEvents(next);
      return next;
    });
  }, []);

  const addParticipant = useCallback(p => {
    setParticipants(ps => {
      const next = [...ps, p];
      saveParticipants(next);
      return next;
    });
  }, []);

  const editParticipant = useCallback(p => {
    setParticipants(ps => {
      const next = ps.map(x => x.id === p.id ? p : x);
      saveParticipants(next);
      return next;
    });
  }, []);

  const deleteParticipant = useCallback(id => {
    setParticipants(ps => {
      const next = ps.filter(p => p.id !== id);
      saveParticipants(next);
      return next;
    });
    setEvents(es => {
      const next = es.map(e => ({ ...e, participants: (e.participants || []).filter(pid => pid !== id) }));
      saveEvents(next);
      return next;
    });
    setGroups(gs => {
      const next = gs.map(g => ({ ...g, memberIds: (g.memberIds || []).filter(mid => mid !== id) }));
      saveGroups(next);
      return next;
    });
  }, []);

  const addGroup = useCallback(g => {
    setGroups(gs => {
      const next = [...gs, g];
      saveGroups(next);
      return next;
    });
  }, []);

  const editGroup = useCallback(g => {
    setGroups(gs => {
      const next = gs.map(x => x.id === g.id ? g : x);
      saveGroups(next);
      return next;
    });
  }, []);

  const deleteGroup = useCallback(id => {
    setGroups(gs => {
      const next = gs.filter(g => g.id !== id);
      saveGroups(next);
      return next;
    });
    setEvents(es => {
      const next = es.map(e => ({ ...e, groupIds: (e.groupIds || []).filter(gid => gid !== id) }));
      saveEvents(next);
      return next;
    });
  }, []);

  const doShuffle = useCallback(() => { setShowShuffleConfirm(true); }, []);

  const confirmShuffle = useCallback(() => {
    if (groups.length === 0) {
      showToast('No groups to shuffle', 'error');
      setShowShuffleConfirm(false);
      return;
    }

    const allMemberIds = [...new Set(groups.flatMap(g => g.memberIds || []))];

    if (allMemberIds.length === 0) {
      showToast('No members in any group to shuffle', 'error');
      setShowShuffleConfirm(false);
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    const frozenEvents = events.map(e => {
      if (e.date >= todayStr) return e;
      if (!e.groupIds || e.groupIds.length === 0) return e;
      const seenIds = {};
      const snapshotIds = [];
      (e.groupIds || []).forEach(gid => {
        const grp = groups.find(g => g.id === gid);
        if (grp) {
          (grp.memberIds || []).forEach(mid => {
            if (!seenIds[mid]) { seenIds[mid] = true; snapshotIds.push(mid); }
          });
        }
      });
      (e.participants || []).forEach(pid => {
        if (!seenIds[pid]) { seenIds[pid] = true; snapshotIds.push(pid); }
      });
      return { ...e, participants: snapshotIds, groupIds: [] };
    });

    const pool = [...allMemberIds];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const buckets = groups.map(() => []);
    pool.forEach((id, idx) => { buckets[idx % groups.length].push(id); });
    const updatedGroups = groups.map((g, i) => ({ ...g, memberIds: buckets[i] }));

    const newHistory = [...shuffleHistory, {
      date: new Date().toISOString(),
      groups: groups.length,
      participants: allMemberIds.length,
    }];

    setSyncing(true);
    saveAll({
      events: frozenEvents,
      participants,
      groups: updatedGroups,
      shuffleHistory: newHistory,
    }).then(() => setSyncing(false));

    setEvents(frozenEvents);
    setGroups(updatedGroups);
    setShuffleHistory(newHistory);
    setShowShuffleConfirm(false);
    showToast('Members reshuffled! Past events frozen.', 'success');
  }, [groups, events, participants, shuffleHistory, showToast]);

  const doExport = useCallback((format) => {
    let content, type, filename;
    if (format === 'csv') {
      const rows = [['Title','Date','Time','Type','Description','Participants','Groups']];
      events.forEach(e => {
        const names = (e.participants || []).map(pid => { const p = participants.find(p => p.id === pid); return p ? p.name : ''; }).filter(Boolean).join('; ');
        const grpNames = (e.groupIds || []).map(gid => { const g = groups.find(g => g.id === gid); return g ? g.name : ''; }).filter(Boolean).join('; ');
        rows.push([e.title, e.date, e.time || '', EVENT_TYPES[e.type] ? EVENT_TYPES[e.type].label : e.type, e.description || '', names, grpNames]);
      });
      content = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
      type = 'text/csv'; filename = 'church-calendar.csv';
    } else {
      content = JSON.stringify({ events, participants, groups, shuffleHistory }, null, 2);
      type = 'application/json'; filename = 'church-calendar.json';
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename; a.click();
    showToast(format.toUpperCase() + ' exported!', 'success');
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
        <p style={{ color:'#94a3b8', fontSize:14, margin:0 }}>Connecting to church database...</p>
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
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {syncing && (
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#fbbf24', animation:'pulse 1s infinite' }} title="Syncing..."/>
            )}
            <button onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)} style={{
              display:'flex', alignItems:'center', gap:5, padding:'7px 12px', border:'1.5px solid rgba(255,255,255,0.4)',
              borderRadius:9, background:'transparent', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700, flexShrink:0,
            }}>
              {isAdmin ? <><LogOut size={13}/> Exit Admin</> : <><LogIn size={13}/> Admin</>}
            </button>
          </div>
        </div>
      </header>

      {isAdmin && (
        <div style={{ background:'#fef3c7', borderBottom:'1.5px solid #fde68a', padding:'9px 20px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#92400e' }}>
            <Shield size={14}/>
            <strong>Admin Mode</strong> — Changes sync live to all devices instantly.
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
            onShuffle={doShuffle} shuffleHistory={shuffleHistory}
            onClearHistory={() => { setShuffleHistory([]); saveShuffleHistory([]); }}
            showToast={showToast}
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
          onConfirm={confirmShuffle}
          onClose={() => setShowShuffleConfirm(false)}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 480px) { .nav-label { display: none; } }
      `}</style>
    </div>
  );
}
