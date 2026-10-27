import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api, { fmt, msg } from '../api';
import { loadMe } from '../store';
import { Head, Avatar, RoleBadge } from '../ui';
import {
  IconUser,
  IconBriefcase,
  IconMail,
  IconPhone,
  IconCalendar,
  IconShield,
  IconCheck
} from '../icons';

export default function Profile() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const emp = user.employee || {};

  const [form, setForm] = useState({ name: user.name, phone: emp.phone || '' });
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(loadMe());
  }, [dispatch]);

  const handleSave = async e => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback({ type: '', text: '' });
      await api.patch('/me', form);
      setFeedback({ type: 'success', text: 'Personal details saved successfully.' });
      dispatch(loadMe());
    } catch (err) {
      setFeedback({ type: 'error', text: msg(err) });
    } finally {
      setSaving(false);
    }
  };

  const getPermissionsList = role => {
    if (role === 'hr') {
      return [
        'Full management of company employees & directory',
        'Approve or reject leave requests across all departments',
        'Review global attendance logs and daily workforce roster',
        'Publish company-wide official announcements',
        'Schedule and oversee corporate training programs'
      ];
    }
    if (role === 'manager') {
      return [
        'Review and approve leave applications for reporting team members',
        'Track daily punch-in/out attendance for your direct team',
        'Create and facilitate team training and development tracks',
        'View team colleagues directory'
      ];
    }
    return [
      'Digital punch clock check-in and check-out tracking',
      'Submit casual, sick, earned, or unpaid leave requests',
      'Monitor annual leave balance quota',
      'Enroll in corporate development and training programs',
      'Receive official HR bulletins and notifications'
    ];
  };

  return (
    <div className="profile-page">
      <Head
        title="My Profile"
        sub="Manage your personal contact information and review your employment credentials."
        badge="Account Center"
      />

      {/* Hero Profile Banner */}
      <div className="profile-hero-card">
        <div className="profile-hero-content">
          <Avatar name={user.name} size={76} className="profile-large-avatar" />
          <div className="profile-hero-meta">
            <h2>{user.name}</h2>
            <div className="profile-badges-row">
              <RoleBadge role={user.role} />
              <span className="profile-dept-badge">{emp.department || 'General Workforce'}</span>
              <span className="profile-title-text">{emp.designation || 'Staff Member'}</span>
            </div>
            <div className="profile-contact-row">
              <span className="profile-contact-chip">
                <IconMail size={14} /> {user.email}
              </span>
              {emp.phone && (
                <span className="profile-contact-chip">
                  <IconPhone size={14} /> {emp.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-layout">
        {/* Left Column: Edit Personal Details */}
        <div className="dashboard-main-col">
          <section className="ui-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <IconUser size={18} className="text-primary" />
                <h3>Personal Information</h3>
              </div>
            </div>

            {feedback.text && (
              <div
                className={`alert-box ${
                  feedback.type === 'success' ? 'alert-success' : 'alert-error'
                } mb-3`}
              >
                {feedback.text}
              </div>
            )}

            <form className="staffsync-form" onSubmit={handleSave}>
              <div className="form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Contact Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Email Address (Managed by System)</label>
                <input type="email" disabled value={user.email} className="input-disabled" />
                <small className="field-hint">Email address cannot be changed directly.</small>
              </div>

              <button type="submit" className="btn-primary-large" disabled={saving}>
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: Work Details & Role Permissions */}
        <div className="dashboard-side-col">
          <section className="ui-card mb-4">
            <div className="card-header-row">
              <div className="card-title-group">
                <IconBriefcase size={18} className="text-primary" />
                <h3>Employment Details</h3>
              </div>
            </div>

            <div className="employment-facts-list">
              <div className="fact-line">
                <span className="fact-label">Department</span>
                <strong className="fact-val">{emp.department || 'Unassigned'}</strong>
              </div>
              <div className="fact-line">
                <span className="fact-label">Designation</span>
                <strong className="fact-val">{emp.designation || 'Team Member'}</strong>
              </div>
              <div className="fact-line">
                <span className="fact-label">Reporting Manager</span>
                <strong className="fact-val">{emp.manager?.name || 'Top-level Leadership'}</strong>
              </div>
              <div className="fact-line">
                <span className="fact-label">Joined Organization</span>
                <strong className="fact-val">{fmt(emp.joinDate)}</strong>
              </div>
              <div className="fact-line">
                <span className="fact-label">Remaining Leave Quota</span>
                <strong className="fact-val text-primary">{emp.leaveBalance ?? 18} Days</strong>
              </div>
            </div>
          </section>

          {/* Permissions Overview */}
          <section className="ui-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <IconShield size={18} className="text-primary" />
                <h3>Your Role Privileges</h3>
              </div>
            </div>

            <ul className="privileges-list">
              {getPermissionsList(user.role).map((p, i) => (
                <li key={i} className="privilege-item">
                  <IconCheck size={15} className="text-success" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
