import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api, { useList, fmt, tm, msg } from '../api';
import { Head, Pager, Empty, Badge, Avatar } from '../ui';
import {
  IconClock,
  IconCheckCircle,
  IconCalendar,
  IconUsers,
  IconSun,
  IconAlertCircle,
  IconTrendingUp
} from '../icons';

export default function Attendance() {
  const { user } = useSelector(s => s.auth);
  const mine = useList('/attendance/mine');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const team = useList(user.role !== 'employee' ? '/attendance/team' : '/attendance/mine', { date: selectedDate });
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [nowTime, setNowTime] = useState(new Date());

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async type => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await api.post(`/attendance/${type}`);
      mine.reload();
      if (user.role !== 'employee') team.reload();
    } catch (e) {
      setErrorMsg(msg(e));
    } finally {
      setActionLoading(false);
    }
  };

  const todayRecord = mine.today;
  const isCheckedIn = !!todayRecord;
  const isCheckedOut = !!todayRecord?.checkOut;

  // Calculate working duration if checked in
  const calculateDuration = (inTime, outTime) => {
    if (!inTime) return null;
    const start = new Date(inTime);
    const end = outTime ? new Date(outTime) : nowTime;
    const diffMs = Math.max(0, end - start);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const activeDuration = todayRecord ? calculateDuration(todayRecord.checkIn, todayRecord.checkOut) : null;

  return (
    <div className="attendance-page">
      <Head
        title="Attendance & Time Clock"
        sub="Punch in when starting your shift and punch out when concluding work."
        badge="Live Attendance"
      />

      {/* Hero Live Digital Punch Card */}
      <section className="live-punch-card">
        <div className="punch-clock-visual">
          <div className="punch-time-badge">
            <IconClock size={16} /> LIVE CLOCK
          </div>
          <div className="punch-digital-time">
            {nowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="punch-digital-date">
            {nowTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="punch-status-section">
          <div className="punch-status-badge-row">
            <span className="punch-status-label">Your Status Today:</span>
            {isCheckedOut ? (
              <span className="status-pill status-completed">
                <IconCheckCircle size={14} /> Shift Completed
              </span>
            ) : isCheckedIn ? (
              <span className="status-pill status-active">
                <span className="pulse-indicator" /> Working Now
              </span>
            ) : (
              <span className="status-pill status-pending">
                <IconAlertCircle size={14} /> Not Checked In
              </span>
            )}
          </div>

          <div className="punch-details-row">
            {todayRecord ? (
              <div className="punch-timestamps-grid">
                <div className="punch-timestamp-box">
                  <small>Punch In Time</small>
                  <strong>{tm(todayRecord.checkIn)}</strong>
                </div>
                <div className="punch-timestamp-box">
                  <small>Punch Out Time</small>
                  <strong>{todayRecord.checkOut ? tm(todayRecord.checkOut) : '—'}</strong>
                </div>
                <div className="punch-timestamp-box">
                  <small>Elapsed Duration</small>
                  <strong>{activeDuration}</strong>
                </div>
              </div>
            ) : (
              <p className="punch-hint-text">
                Begin your work day by clicking <strong>Punch In</strong> below. Your working hours will be logged automatically.
              </p>
            )}
          </div>

          {errorMsg && <div className="alert-box alert-error">{errorMsg}</div>}

          <div className="punch-buttons-row">
            <button
              className="btn-punch in"
              disabled={isCheckedIn || actionLoading}
              onClick={() => handleAction('check-in')}
            >
              <IconCheckCircle size={18} />
              <span>Punch In</span>
            </button>

            <button
              className="btn-punch out"
              disabled={!isCheckedIn || isCheckedOut || actionLoading}
              onClick={() => handleAction('check-out')}
            >
              <IconClock size={18} />
              <span>Punch Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* Personal Attendance History */}
      <section className="ui-card mb-4">
        <div className="card-header-row">
          <div className="card-title-group">
            <IconCalendar size={18} className="text-primary" />
            <h3>My Attendance History</h3>
          </div>
          <span className="table-subtitle">Records of your daily work logs</span>
        </div>

        {mine.items.length ? (
          <div className="table-responsive">
            <table className="staffsync-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mine.items.map(a => {
                  const duration = calculateDuration(a.checkIn, a.checkOut);
                  return (
                    <tr key={a._id}>
                      <td>
                        <strong>{fmt(a.date)}</strong>
                      </td>
                      <td>{tm(a.checkIn)}</td>
                      <td>{a.checkOut ? tm(a.checkOut) : '—'}</td>
                      <td>
                        <span className="duration-tag">{duration || '—'}</span>
                      </td>
                      <td>
                        {a.checkOut ? (
                          <Badge s="Completed" />
                        ) : (
                          <Badge s="In-Progress" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No Attendance History"
            description="Your check-in records will be recorded and shown here."
            icon={IconClock}
          />
        )}

        <Pager {...mine} />
      </section>

      {/* Team Attendance View for HR and Managers */}
      {user.role !== 'employee' && (
        <section className="ui-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <IconUsers size={18} className="text-primary" />
              <h3>{user.role === 'hr' ? 'All Workforce Attendance' : 'My Team Attendance'}</h3>
            </div>
            <div className="date-filter-picker">
              <label htmlFor="team-date">Inspect Date:</label>
              <input
                id="team-date"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>

          <div className="team-attendance-summary-bar">
            <span>
              Total records for <strong>{fmt(selectedDate)}</strong>:{' '}
              <strong className="text-primary">{team.items.length} Present</strong>
            </span>
          </div>

          {team.items.length ? (
            <div className="table-responsive">
              <table className="staffsync-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Punch In</th>
                    <th>Punch Out</th>
                    <th>Shift Duration</th>
                    <th>Daily Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.items.map(a => (
                    <tr key={a._id}>
                      <td>
                        <div className="table-user-cell">
                          <Avatar name={a.user?.name || 'Staff'} size={32} />
                          <div>
                            <strong>{a.user?.name || 'Team Member'}</strong>
                          </div>
                        </div>
                      </td>
                      <td>{fmt(a.date)}</td>
                      <td>{tm(a.checkIn)}</td>
                      <td>{a.checkOut ? tm(a.checkOut) : '—'}</td>
                      <td>{calculateDuration(a.checkIn, a.checkOut) || 'In progress'}</td>
                      <td>
                        {a.checkOut ? (
                          <span className="status-badge badge-success">Completed</span>
                        ) : (
                          <span className="status-badge badge-warning">On Shift</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="No Team Check-ins Recorded"
              description={`Nobody checked in for ${fmt(selectedDate)} yet.`}
              icon={IconUsers}
            />
          )}

          <Pager {...team} />
        </section>
      )}
    </div>
  );
}
