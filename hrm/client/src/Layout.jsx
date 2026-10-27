import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, login } from './store';
import api, { fmt } from './api';
import { Avatar, RoleBadge } from './ui';
import {
  IconDashboard,
  IconClock,
  IconCalendar,
  IconUsers,
  IconGraduation,
  IconMegaphone,
  IconUser,
  IconBell,
  IconLogOut,
  IconCheck,
  IconBuilding,
  IconSun
} from './icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, exact: true },
  { to: '/attendance', label: 'Attendance', icon: IconClock },
  { to: '/leaves', label: 'Leave Requests', icon: IconCalendar },
  { to: '/employees', label: 'People Directory', icon: IconUsers, roles: ['hr', 'manager'] },
  { to: '/trainings', label: 'Training & Skills', icon: IconGraduation },
  { to: '/announcements', label: 'Announcements', icon: IconMegaphone },
  { to: '/profile', label: 'My Profile', icon: IconUser }
];

export default function Layout() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const bellRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = () => {
    api.get('/notifications').then(r => setNotifications(r.data || [])).catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle outside clicks to close bell popover
  useEffect(() => {
    const handleClickOutside = e => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(i => !i.read).length;

  const toggleBell = () => {
    const nextState = !bellOpen;
    setBellOpen(nextState);
    if (nextState && unreadCount > 0) {
      api.post('/notifications/read')
        .then(() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        })
        .catch(() => {});
    }
  };

  const switchAccount = async (email, roleLabel) => {
    await dispatch(login({ email, password: 'Pass@123' }));
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="staffsync-app">
      {/* Sidebar */}
      <aside className={`staffsync-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <span className="brand-logo-text">S</span>
          </div>
          <div className="brand-text">
            <h2>StaffSync</h2>
            <span className="brand-tagline">HR & Workforce Suite</span>
          </div>
        </div>

        {/* User preview widget in sidebar */}
        <div className="sidebar-user-card">
          <Avatar name={user.name} size={42} />
          <div className="sidebar-user-meta">
            <span className="user-name">{user.name}</span>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          <div className="nav-group-title">MAIN NAVIGATION</div>
          {navItems
            .filter(item => !item.roles || item.roles.includes(user.role))
            .map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </nav>

        {/* Demo Role Switcher in Sidebar */}
        <div className="sidebar-role-switcher">
          <span className="switcher-title">Switch Demo Persona:</span>
          <div className="switcher-buttons">
            <button
              className={`btn-switcher ${user.email === 'hr@hrm.com' ? 'active' : ''}`}
              onClick={() => switchAccount('hr@hrm.com', 'HR')}
              title="Switch to Anita Verma (HR Lead)"
            >
              HR Lead
            </button>
            <button
              className={`btn-switcher ${user.email === 'mgr@hrm.com' ? 'active' : ''}`}
              onClick={() => switchAccount('mgr@hrm.com', 'Manager')}
              title="Switch to Rohan Mehta (Manager)"
            >
              Manager
            </button>
            <button
              className={`btn-switcher ${user.email === 'emp@hrm.com' ? 'active' : ''}`}
              onClick={() => switchAccount('emp@hrm.com', 'Employee')}
              title="Switch to Priya Sharma (Employee)"
            >
              Employee
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="btn-signout" onClick={handleSignOut}>
            <IconLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="staffsync-main-wrapper">
        {/* Top Navbar */}
        <header className="top-navbar">
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <div className="navbar-breadcrumb">
            <span className="org-badge">
              <IconBuilding size={14} /> StaffSync Enterprise
            </span>
            <span className="breadcrumb-divider">/</span>
            <span className="time-pill">
              <IconClock size={14} /> {currentTime}
            </span>
          </div>

          <div className="navbar-right">
            {/* Notification Center */}
            <div className="bell-container" ref={bellRef}>
              <button
                className={`bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={toggleBell}
                aria-label="View notifications"
              >
                <IconBell size={18} />
                {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
              </button>

              {bellOpen && (
                <div className="notifications-popover">
                  <div className="notifications-head">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && <span className="unread-tag">{unreadCount} new</span>}
                  </div>
                  <div className="notifications-list">
                    {notifications.length ? (
                      notifications.map(item => (
                        <div key={item._id} className={`notification-item ${item.read ? 'read' : 'unread'}`}>
                          <div className="notification-dot" />
                          <div className="notification-content">
                            <p>{item.message}</p>
                            <small>{fmt(item.createdAt)}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-notifications">
                        <IconBell size={24} />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Pill in Topbar */}
            <div className="topbar-user">
              <Avatar name={user.name} size={32} />
              <div className="topbar-user-info">
                <span className="topbar-name">{user.name}</span>
                <span className="topbar-role">{user.role.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="staffsync-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
