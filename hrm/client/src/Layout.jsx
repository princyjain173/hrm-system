import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './store';
import api, { fmt } from './api';
const nav = [['/', 'Dashboard'], ['/attendance', 'Attendance'], ['/leaves', 'Leave'], ['/announcements', 'Announcements'], ['/trainings', 'Training'], ['/employees', 'People', ['hr', 'manager']], ['/profile', 'My profile']];
export default function Layout() {
  const { user } = useSelector(s => s.auth), d = useDispatch(), go = useNavigate();
  const [items, setItems] = useState([]), [open, setOpen] = useState(false);
  useEffect(() => { api.get('/notifications').then(r => setItems(r.data)); }, []);
  const unread = items.filter(i => !i.read).length;
  const toggle = () => { setOpen(!open); if (!open && unread) api.post('/notifications/read').then(() => setItems(items.map(i => ({ ...i, read: true })))); };
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><span className="mark">H</span>HRM Portal</div>
        <nav>{nav.filter(n => !n[2] || n[2].includes(user.role)).map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}</nav>
        <div className="me"><b>{user.name}</b><small>{user.role === 'hr' ? 'HR' : user.role}</small>
          <button className="btn ghost light" onClick={() => { d(logout()); go('/login'); }}>Sign out</button></div>
      </aside>
      <main className="main">
        <div className="bell"><button className="btn ghost" onClick={toggle} aria-label="Notifications">Notifications{unread > 0 && <i>{unread}</i>}</button>
          {open && <div className="pop">{items.length ? items.map(i => <p key={i._id}>{i.message}<small>{fmt(i.createdAt)}</small></p>) : <p>No notifications yet.</p>}</div>}</div>
        <Outlet />
      </main>
    </div>
  );
}
