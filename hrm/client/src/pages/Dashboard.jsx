import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api, { fmt } from '../api';
import { Head, StatCard, Empty, Avatar, RoleBadge } from '../ui';
import {
  IconUsers,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconGraduation,
  IconMegaphone,
  IconAlertCircle,
  IconBuilding,
  IconPlus,
  IconChevronRight
} from '../icons';

export default function Dashboard() {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/stats'),
      api.get('/announcements?limit=4'),
      api.get('/trainings')
    ])
      .then(([statsRes, newsRes, trainRes]) => {
        setStats(statsRes.data);
        setNews(newsRes.data || []);
        setTrainings((trainRes.data || []).slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const roleMeta = {
    hr: {
      badge: 'HR Command Center',
      sub: 'Monitor workforce metrics, pending approvals, and department headcounts.',
      icons: [IconUsers, IconCalendar, IconCheckCircle, IconClock],
      colors: ['indigo', 'amber', 'emerald', 'rose']
    },
    manager: {
      badge: 'Team Management Hub',
      sub: 'Review pending team leaves, track daily attendance, and coordinate development programs.',
      icons: [IconUsers, IconCalendar, IconCheckCircle, IconGraduation],
      colors: ['indigo', 'amber', 'emerald', 'sky']
    },
    employee: {
      badge: 'Employee Workspace',
      sub: 'Track your daily check-in status, annual leave balance, and skill enrollments.',
      icons: [IconClock, IconCalendar, IconAlertCircle, IconGraduation],
      colors: ['emerald', 'indigo', 'amber', 'sky']
    }
  }[user.role] || {
    badge: 'Workspace',
    sub: 'Your organizational overview.',
    icons: [IconClock, IconCalendar, IconCheckCircle, IconGraduation],
    colors: ['indigo', 'amber', 'emerald', 'sky']
  };

  const cards = stats?.cards || [];
  const departments = stats?.departments || [];
  const maxDept = Math.max(1, ...departments.map(d => d.n));

  return (
    <div className="dashboard-page">
      <Head
        title={`${getGreeting()}, ${user.name.split(' ')[0]}`}
        sub={roleMeta.sub}
        badge={roleMeta.badge}
      >
        <div className="header-quick-links">
          <Link to="/attendance" className="btn-action-outline">
            <IconClock size={16} /> Punch Attendance
          </Link>
          <Link to="/leaves" className="btn-action-primary">
            <IconCalendar size={16} /> Request Leave
          </Link>
        </div>
      </Head>

      {/* KPI Stats Grid */}
      <div className="stats-kpi-grid">
        {cards.map(([label, value], i) => {
          const Icon = roleMeta.icons[i] || IconCheckCircle;
          const color = roleMeta.colors[i] || 'indigo';
          return (
            <StatCard
              key={i}
              label={label}
              value={loading ? '...' : value}
              icon={Icon}
              color={color}
              subtext={user.role === 'hr' ? 'Live Organization Stat' : 'Updated just now'}
            />
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-grid-layout">
        {/* Left Column: Department Distribution or Upcoming Trainings */}
        <div className="dashboard-main-col">
          {user.role === 'hr' && departments.length > 0 && (
            <section className="ui-card mb-4">
              <div className="card-header-row">
                <div className="card-title-group">
                  <IconBuilding size={18} className="text-primary" />
                  <h3>Workforce by Department</h3>
                </div>
                <Link to="/employees" className="card-link">
                  View Directory →
                </Link>
              </div>

              <div className="departments-list">
                {departments.map(item => {
                  const pct = Math.round((item.n / maxDept) * 100);
                  return (
                    <div key={item._id} className="dept-stat-row">
                      <div className="dept-meta">
                        <span className="dept-name">{item._id || 'General'}</span>
                        <span className="dept-count">{item.n} {item.n === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div className="dept-progress-track">
                        <div
                          className="dept-progress-bar"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Upcoming Training Programs */}
          <section className="ui-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <IconGraduation size={18} className="text-primary" />
                <h3>Active Training & Upskilling</h3>
              </div>
              <Link to="/trainings" className="card-link">
                All Programs →
              </Link>
            </div>

            <div className="trainings-quick-list">
              {trainings.length ? (
                trainings.map(t => (
                  <div key={t._id} className="training-item-card">
                    <div className="training-item-main">
                      <span className="training-pill">
                        {t.hours ? `${t.hours} hrs session` : 'Workshop'}
                      </span>
                      <h4>{t.title}</h4>
                      <p>{t.description || 'Professional skills enhancement workshop.'}</p>
                    </div>
                    <div className="training-item-action">
                      <Link to="/trainings" className="btn-enroll-preview">
                        {t.joined ? 'Enrolled ✓' : 'Details'}
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <Empty title="No training sessions" description="New workshops will appear here soon." />
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Company Announcements & Quick Highlights */}
        <div className="dashboard-side-col">
          <section className="ui-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <IconMegaphone size={18} className="text-primary" />
                <h3>Company Announcements</h3>
              </div>
              <Link to="/announcements" className="card-link">
                View All →
              </Link>
            </div>

            <div className="announcements-stream">
              {news.length ? (
                news.map(item => (
                  <article key={item._id} className="announcement-card-mini">
                    <div className="announcement-mini-top">
                      <span className="bullet-indicator" />
                      <h4 className="announcement-mini-title">{item.title}</h4>
                    </div>
                    <p className="announcement-mini-body">{item.body}</p>
                    <div className="announcement-mini-meta">
                      <span>Posted by {item.author?.name || 'HR Team'}</span>
                      <span>•</span>
                      <span>{fmt(item.createdAt)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <Empty title="No recent news" description="Check back later for company updates." />
              )}
            </div>
          </section>

          {/* Quick Help / System Info Card */}
          <div className="system-feature-card">
            <div className="feature-card-header">
              <span className="feature-tag">StaffSync v2.0</span>
              <h4>Enterprise Self-Service</h4>
            </div>
            <p>
              Need to take sick time or casual leave? Apply with one click and your manager will be instantly notified.
            </p>
            <Link to="/leaves" className="feature-btn">
              Open Leave Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
