// components/UI.js
import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1e293b',
  background: '#fff',
  fontFamily: 'inherit',
};

export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: '#16a34a',
    error:   '#dc2626',
    info:    '#2563eb',
  };
  const icons = {
    success: <CheckCircle size={16} />,
    error:   <AlertCircle size={16} />,
    info:    <Info size={16} />,
  };

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 16, left: 16,
      maxWidth: 380, margin: '0 auto',
      zIndex: 9999,
      background: colors[type] || colors.info,
      color: '#fff',
      padding: '13px 18px',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      fontSize: 14,
      fontWeight: 500,
      animation: 'fadeIn 0.2s ease',
    }}>
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6,
        color: '#fff', cursor: 'pointer', padding: '3px 5px', display: 'flex', alignItems: 'center',
      }}><X size={14} /></button>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.55)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 18,
        padding: '24px 24px 28px',
        width: '100%',
        maxWidth: wide ? 700 : 500,
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        animation: 'fadeIn 0.18s ease',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 22,
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', borderRadius: 8,
            width: 34, height: 34, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b',
          }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

export function Btn({ onClick, children, variant = 'primary', size = 'md', style: extraStyle = {}, disabled }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', fontWeight: 600, transition: 'opacity 0.15s',
    opacity: disabled ? 0.5 : 1,
    borderRadius: 9,
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '10px 18px', fontSize: 14 },
    lg: { padding: '13px 24px', fontSize: 15 },
  };
  const variants = {
    primary:  { background: '#4f46e5', color: '#fff' },
    success:  { background: '#16a34a', color: '#fff' },
    warning:  { background: '#d97706', color: '#fff' },
    danger:   { background: '#dc2626', color: '#fff' },
    ghost:    { background: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0' },
    outline:  { background: '#fff', color: '#4f46e5', border: '1.5px solid #4f46e5' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color, bg, border }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      color: color || '#475569',
      background: bg || '#f1f5f9',
      border: `1px solid ${border || '#e2e8f0'}`,
    }}>{children}</span>
  );
}

export function Avatar({ name, size = 40, color = '#4f46e5', inactive }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: inactive ? '#e2e8f0' : color,
      color: inactive ? '#94a3b8' : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: '#94a3b8' }}>
      <Icon size={44} style={{ marginBottom: 14, opacity: 0.35 }} />
      <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#64748b' }}>{title}</p>
      {subtitle && <p style={{ margin: '6px 0 0', fontSize: 13 }}>{subtitle}</p>}
    </div>
  );
}

export function ConfirmModal({ title, message, onConfirm, onClose, confirmLabel = 'Confirm', variant = 'danger' }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Btn>
      </div>
    </Modal>
  );
}
