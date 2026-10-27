import React from 'react';
import { IconAlertCircle } from './icons';

export const RoleBadge = ({ role }) => {
  const map = {
    hr: { label: 'HR Administrator', cls: 'badge-hr' },
    manager: { label: 'Team Manager', cls: 'badge-manager' },
    employee: { label: 'Employee', cls: 'badge-employee' }
  };
  const item = map[role] || { label: role || 'Member', cls: 'badge-employee' };
  return <span className={`role-pill ${item.cls}`}>{item.label}</span>;
};

export const Badge = ({ s, type = 'status' }) => {
  const norm = String(s || '').toLowerCase();
  let cls = 'badge-neutral';
  if (norm === 'approved' || norm === 'completed' || norm === 'active') cls = 'badge-success';
  else if (norm === 'pending' || norm === 'in-progress' || norm === 'waiting') cls = 'badge-warning';
  else if (norm === 'rejected' || norm === 'absent' || norm === 'cancelled') cls = 'badge-danger';
  else if (norm === 'casual' || norm === 'sick' || norm === 'earned') cls = 'badge-info';

  return <span className={`status-badge ${cls}`}>{s}</span>;
};

export const Avatar = ({ name = 'User', size = 38, className = '' }) => {
  const initials = (name || 'U')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const colors = [
    'linear-gradient(135deg, #4f46e5, #7c3aed)',
    'linear-gradient(135deg, #059669, #10b981)',
    'linear-gradient(135deg, #0284c7, #38bdf8)',
    'linear-gradient(135deg, #d97706, #fbbf24)',
    'linear-gradient(135deg, #e11d48, #fb7185)',
    'linear-gradient(135deg, #7c2d12, #ea580c)'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const bg = colors[Math.abs(hash) % colors.length];

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: bg,
        fontSize: size * 0.38
      }}
      title={name}
    >
      {initials}
    </div>
  );
};

export const Empty = ({ title = 'No records found', description = 'There is no data to display right now.', icon: Icon, children }) => (
  <div className="empty-state">
    <div className="empty-state-icon">
      {Icon ? <Icon size={28} /> : <IconAlertCircle size={28} />}
    </div>
    <h4>{title}</h4>
    <p>{description}</p>
    {children}
  </div>
);

export const Pager = ({ page, pages, setPage }) => {
  if (!pages || pages <= 1) return null;
  return (
    <div className="pagination-bar">
      <button
        className="btn-pager"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        ← Previous
      </button>
      <div className="pager-indicator">
        Page <strong>{page}</strong> of <strong>{pages}</strong>
      </div>
      <button
        className="btn-pager"
        disabled={page >= pages}
        onClick={() => setPage(page + 1)}
      >
        Next →
      </button>
    </div>
  );
};

export const Head = ({ title, sub, badge, actions, children }) => (
  <header className="page-header">
    <div className="page-header-info">
      <div className="page-header-title-row">
        <h1>{title}</h1>
        {badge && <span className="header-pill">{badge}</span>}
      </div>
      {sub && <p className="page-header-sub">{sub}</p>}
    </div>
    <div className="page-header-actions">
      {children}
      {actions}
    </div>
  </header>
);

export const StatCard = ({ label, value, icon: Icon, color = 'indigo', subtext, trend }) => {
  return (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        {Icon && (
          <div className={`metric-icon-box box-${color}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="metric-value-row">
        <span className="metric-value">{value ?? '—'}</span>
        {trend && <span className="metric-trend">{trend}</span>}
      </div>
      {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};
