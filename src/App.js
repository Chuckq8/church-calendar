// App.js

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Settings, Bell, LogIn, LogOut, Shield, Eye, EyeOff } from 'lucide-react';
import { storageGet, storageSet } from './storage';
import { DEFAULT_HOLIDAYS, DEFAULT_PARTICIPANTS, generateSabbaths, ADMIN_CREDENTIALS, EVENT_TYPES } from './constants';
import { todayStr, fisherYates } from './utils';
import { Toast, Modal, Field, inputStyle, Btn } from './components/UI';
import CalendarView from './components/CalendarView';
import ParticipantsView from './components/ParticipantsView';
import AdminDashboard from './components/AdminDashboard';

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
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

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('calendar');
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [shuffleHistory, setShuffleHistory] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => setToast({ message, type }), []);

  // ── Bootstrap data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const savedEvents = storageGet('church-events');
    const savedParticipants = storageGet('church-participants');
    const savedHistory = storageGet('church-shuffle-history');

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

    if (savedHistory) setShuffleHistory(savedHistory);
    setLoaded(true);
  }, []);

  // ── Persist on change ───────────────────────────────────────────────────────
  useEffect(() => { if (loaded) storageSet('church-events', events); }, [events, loaded]);
  useEffect(() => { if (loaded) storageSet('church-participants', participants); }, [participants, loaded]);
  useEffect(() => { if (loaded) storageSet('church-shuffle-history', shuffleHistory); }, [shuffleHistory, loaded]);

  // ── Event CRUD ──────────────────────────────────────────────────────────────
  const addEvent = useCallback(ev => setEvents(es => [...es, ev]), []);
  const editEvent = useCallback(ev => setEvents(es => es.map(e => e.id === ev.id ? ev : e)), []);
  const deleteEvent = useCallback(id => setEvents(es => es.filter(e => e.id !== id)), []);

  // ── Participant CRUD ────────────────────────────────────────────────────────
  const addParticipant = useCallback(p => setParticipants(ps => [...ps, p]), []);
  const editParticipant = useCallback(p => setParticipants(ps => ps.map(x => x.id === p.id ? p : x)), []);
  const deleteParticipant = useCallback(id => {
    setParticipants(ps => ps.filter(p => p.id !== id));
    setEvents(es => es.map(e => ({ ...e, participants: (e.participants || []).filter(pid => pid !== id) })));
  }, []);

  // ── Shuffle ─────────────────────────────────────────────────────────────────
  const doShuffle = useCallback(() => {
    const today = todayStr();
    const active = participants.filter(p => p.isActive);
    if (!active.length) { showToast('No active members to shuffle', 'error'); return; }

    const sabbaths = events
      .filter(e => e.type === 'sabbath' && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (!sabbaths.length) { showToast('No upcoming Sabbath gatherings found', 'error'); return; }

    const perEvent = Math.min(active.length, 5);
    const updated = sabbaths.map(sab => ({
      ...sab,
      participants: fisherYates(active).slice(0, perEvent).map(p => p.id),
    }));

    setEvents(es => es.map(e => updated.find(s => s.id === e.id) || e));
    setShuffleHistory(h => [...h, { date: today, count: sabbaths.length, participants: active.length }]);
  }, [events, participants, showToast]);

  // ── Export ──────────────────────────────────────────────────────────────────
  const doExport = useCallback((format) => {
    let content, type, filename;

    if (format === 'csv') {
      const rows = [['Title','Date','Time','Type','Description','Participants']];
      events.forEach(e => {
        const names = (e.participants || [])
          .map(pid => participants.find(p => p.id === pid)?.name || '')
          .filter(Boolean).join('; ');
        rows.push([e.title, e.date, e.time||'', EVENT_TYPES[e.type]?.label||e.type, e.description||'', names]);
      });
      content = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
      type = 'text/csv';
      filename = 'church-calendar.csv';
    } else {
      content = JSON.stringify({ events, participants, shuffleHistory }, null, 2);
      type = 'application/json';
      filename = 'church-calendar.json';
    }

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
    showToast(`${format.toUpperCase()} exported!`, 'success');
  }, [events, participants, shuffleHistory, showToast]);

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const tabs = [
    { id:'calendar', label:'Calendar', icon:Calendar },
    { id:'participants', label:'Members', icon:Users },
    { id:'admin', label:'Dashboard', icon:Settings },
  ];

  if (!loaded) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{
          width:44, height:44, margin:'0 auto 16px',
          border:'3px solid #4f46e5', borderTopColor:'transparent',
          borderRadius:'50%', animation:'spin 0.8s linear infinite',
        }}/>
        <p style={{ color:'#94a3b8', fontSize:14, margin:0 }}>Loading church calendar…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Inter', system-ui, sans-serif" }}>
      {/* ── Header ── */}
      <header style={{
        background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        position:'sticky', top:0, zIndex:100,
        boxShadow:'0 2px 16px rgba(79,70,229,0.28)',
      }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', height:62, gap:10 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Bell size={19} color="#fff"/>
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:15, fontWeight:800, color:'#fff', lineHeight:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                Church Calendar
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.65)', marginTop:1 }}>
                Lakeland Fellowship Church
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display:'flex', gap:2 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'7px 11px', borderRadius:9, border:'none', cursor:'pointer',
                fontSize:13, fontWeight:600,
                background: tab === t.id ? 'rgba(255,255,255,0.22)' : 'transparent',
                color:'#fff', transition:'background 0.15s',
              }}>
                <t.icon size={15}/>
                <span className="nav-label">{t.label}</span>
              </button>
            ))}
          </nav>

          {/* Admin toggle */}
          <button onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)} style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'7px 12px', border:'1.5px solid rgba(255,255,255,0.4)',
            borderRadius:9, background:'transparent', color:'#fff',
            cursor:'pointer', fontSize:12, fontWeight:700, flexShrink:0,
          }}>
            {isAdmin ? <><LogOut size={13}/> Exit Admin</> : <><LogIn size={13}/> Admin</>}
          </button>
        </div>
      </header>

      {/* ── Admin banner ── */}
      {isAdmin && (
        <div style={{ background:'#fef3c7', borderBottom:'1.5px solid #fde68a', padding:'9px 20px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#92400e' }}>
            <Shield size={14}/>
            <strong>Admin Mode</strong> — You can add, edit, and delete events; manage members; and trigger shuffles.
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
        {tab === 'calendar' && (
          <CalendarView
            events={events} participants={participants} isAdmin={isAdmin}
            onAddEvent={addEvent} onEditEvent={editEvent} onDeleteEvent={deleteEvent}
            showToast={showToast}
          />
        )}
        {tab === 'participants' && (
          <ParticipantsView
            participants={participants} events={events} isAdmin={isAdmin}
            onAdd={addParticipant} onEdit={editParticipant} onDelete={deleteParticipant}
            onShuffle={doShuffle} showToast={showToast}
          />
        )}
        {tab === 'admin' && (
          <AdminDashboard
            events={events} participants={participants}
            shuffleHistory={shuffleHistory} onExport={doExport}
          />
        )}
      </main>

      {/* ── Modals / Toasts ── */}
      {showLogin && (
        <LoginModal
          onLogin={() => { setIsAdmin(true); setShowLogin(false); showToast('Welcome, Admin!', 'success'); }}
          onClose={() => setShowLogin(false)}
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
