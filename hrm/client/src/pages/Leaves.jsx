import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import api, { useList, fmt, msg } from '../api';
import { Head, Pager, Empty, Badge, Avatar } from '../ui';
import {
  IconCalendar,
  IconClock,
  IconCheckCircle,
  IconXCircle,
  IconAlertCircle,
  IconPlus,
  IconCheck
} from '../icons';

export default function Leaves() {
  const { user } = useSelector(s => s.auth);
  const mine = useList('/leaves/mine');
  const [filterStatus, setFilterStatus] = useState('pending');
  const review = useList(user.role !== 'employee' ? '/leaves/review' : '/leaves/mine', { status: filterStatus });

  const initialForm = { type: 'Casual', from: '', to: '', reason: '' };
  const [form, setForm] = useState(initialForm);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, note: '' });

  const setField = key => e => setForm({ ...form, [key]: e.target.value });

  // Calculate requested days
  const calculateDays = () => {
    if (!form.from || !form.to) return null;
    const f = new Date(form.from);
    const t = new Date(form.to);
    if (isNaN(f) || isNaN(t) || t < f) return 0;
    return Math.round((t - f) / 864e5) + 1;
  };
  const daysCount = calculateDays();

  const handleApply = async e => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      await api.post('/leaves', form);
      setSuccessMsg('Your leave application has been submitted to your manager.');
      setForm(initialForm);
      mine.reload();
      if (user.role !== 'employee') review.reload();
    } catch (err) {
      setErrorMsg(msg(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (id, status, note = '') => {
    try {
      await api.patch(`/leaves/${id}`, { status, note });
      review.reload();
      mine.reload();
      setRejectModal({ open: false, id: null, note: '' });
    } catch (err) {
      alert(msg(err));
    }
  };

  const empData = user.employee || {};

  return (
    <div className="leaves-page">
      <Head
        title="Leave Management"
        sub="Submit leave requests, check your remaining allowance, and review team requests."
        badge="Self-Service Portal"
      />

      {/* Top Allowance Banner */}
      <div className="leave-allowance-banner">
        <div className="allowance-stat-item">
          <span className="allowance-label">Available Leave Balance</span>
          <div className="allowance-value">
            <strong>{empData.leaveBalance ?? 18}</strong>
            <span>Days Remaining</span>
          </div>
        </div>
        <div className="allowance-divider" />
        <div className="allowance-stat-item">
          <span className="allowance-label">Active / Pending Requests</span>
          <div className="allowance-value">
            <strong>{mine.items.filter(i => i.status === 'pending').length}</strong>
            <span>Awaiting Review</span>
          </div>
        </div>
        <div className="allowance-divider" />
        <div className="allowance-stat-item">
          <span className="allowance-label">Approved Days (This Year)</span>
          <div className="allowance-value">
            <strong>
              {mine.items
                .filter(i => i.status === 'approved')
                .reduce((acc, curr) => acc + (curr.days || 0), 0)}
            </strong>
            <span>Days Approved</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-layout">
        {/* Left Column: Apply for Leave Form */}
        <div className="dashboard-main-col">
          <section className="ui-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <IconPlus size={18} className="text-primary" />
                <h3>Apply for Leave</h3>
              </div>
              <span className="badge-pill-soft">Automated Quota Deduction</span>
            </div>

            {errorMsg && <div className="alert-box alert-error mb-3">{errorMsg}</div>}
            {successMsg && <div className="alert-box alert-success mb-3">{successMsg}</div>}

            <form className="staffsync-form" onSubmit={handleApply}>
              <div className="form-field">
                <label>Leave Category</label>
                <select value={form.type} onChange={setField('type')} className="custom-select">
                  <option value="Casual">Casual Leave (Personal & Family)</option>
                  <option value="Sick">Sick Leave (Health & Medical)</option>
                  <option value="Earned">Earned / Privilege Leave</option>
                  <option value="Unpaid">Unpaid Leave of Absence</option>
                </select>
              </div>

              <div className="form-row-two">
                <div className="form-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.from}
                    onChange={setField('from')}
                    className="date-input"
                  />
                </div>
                <div className="form-field">
                  <label>End Date</label>
                  <input
                    type="date"
                    required
                    min={form.from}
                    value={form.to}
                    onChange={setField('to')}
                    className="date-input"
                  />
                </div>
              </div>

              {daysCount > 0 && (
                <div className="days-calc-badge">
                  <IconCalendar size={15} />
                  <span>
                    Total Duration: <strong>{daysCount} {daysCount === 1 ? 'Day' : 'Days'}</strong>
                  </span>
                </div>
              )}

              <div className="form-field">
                <label>Reason / Handover Notes</label>
                <textarea
                  required
                  rows={3}
                  maxLength={400}
                  placeholder="State the reason for leave and any team handover details..."
                  value={form.reason}
                  onChange={setField('reason')}
                  className="custom-textarea"
                />
                <small className="char-count">{form.reason.length}/400 characters</small>
              </div>

              <button type="submit" className="btn-primary-large" disabled={submitting}>
                {submitting ? 'Submitting Application...' : 'Submit Leave Application'}
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: My Leave History */}
        <div className="dashboard-side-col">
          <section className="ui-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <IconCalendar size={18} className="text-primary" />
                <h3>My Leave Applications</h3>
              </div>
            </div>

            <div className="leaves-stream">
              {mine.items.length ? (
                mine.items.map(l => (
                  <div key={l._id} className="leave-item-card">
                    <div className="leave-item-top">
                      <div>
                        <strong>{l.type} Leave</strong>
                        <span className="leave-days-tag">
                          {l.days} {l.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <Badge s={l.status} />
                    </div>
                    <div className="leave-item-dates">
                      <IconCalendar size={13} />
                      <span>{fmt(l.from)} — {fmt(l.to)}</span>
                    </div>
                    <p className="leave-item-reason">"{l.reason}"</p>
                    {l.note && (
                      <div className="reviewer-note-box">
                        <small>Manager Remark: {l.note}</small>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <Empty
                  title="No Leave History"
                  description="Your leave applications will be tracked here."
                  icon={IconCalendar}
                />
              )}
            </div>

            <Pager {...mine} />
          </section>
        </div>
      </div>

      {/* Leave Review & Approval Queue for HR & Managers */}
      {user.role !== 'employee' && (
        <section className="ui-card mt-4">
          <div className="card-header-row">
            <div className="card-title-group">
              <IconCheckCircle size={18} className="text-primary" />
              <h3>{user.role === 'hr' ? 'Workforce Leave Approval Queue' : 'Team Leave Requests to Review'}</h3>
            </div>

            <div className="filter-tabs">
              {['pending', 'approved', 'rejected'].map(st => (
                <button
                  key={st}
                  className={`filter-tab-btn ${filterStatus === st ? 'active' : ''}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {review.items.length ? (
            <div className="table-responsive">
              <table className="staffsync-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    {filterStatus === 'pending' && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {review.items.map(l => (
                    <tr key={l._id}>
                      <td>
                        <div className="table-user-cell">
                          <Avatar name={l.user?.name || 'Employee'} size={32} />
                          <div>
                            <strong>{l.user?.name || 'Staff Member'}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="type-badge">{l.type}</span>
                      </td>
                      <td>
                        <strong>{l.days} {l.days === 1 ? 'day' : 'days'}</strong>
                      </td>
                      <td>
                        <small>{fmt(l.from)} to {fmt(l.to)}</small>
                      </td>
                      <td className="max-w-reason">
                        <span>{l.reason}</span>
                      </td>
                      <td>
                        <Badge s={l.status} />
                      </td>
                      {filterStatus === 'pending' && (
                        <td>
                          <div className="action-buttons-cell">
                            <button
                              className="btn-action-approve"
                              onClick={() => handleDecision(l._id, 'approved')}
                              title="Approve Leave"
                            >
                              <IconCheck size={14} /> Approve
                            </button>
                            <button
                              className="btn-action-reject"
                              onClick={() => setRejectModal({ open: true, id: l._id, note: '' })}
                              title="Reject Leave"
                            >
                              <IconXCircle size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title={`No ${filterStatus} requests`}
              description={`There are currently no leave requests marked as ${filterStatus}.`}
              icon={IconCheckCircle}
            />
          )}

          <Pager {...review} />
        </section>
      )}

      {/* Reject Reason Dialog */}
      {rejectModal.open && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-head">
              <h3>Reject Leave Application</h3>
              <button
                className="modal-close"
                onClick={() => setRejectModal({ open: false, id: null, note: '' })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason or note for rejecting this leave request:</p>
              <textarea
                rows={3}
                placeholder="Reason for rejection (e.g., project deadline conflict)..."
                value={rejectModal.note}
                onChange={e => setRejectModal({ ...rejectModal, note: e.target.value })}
                className="custom-textarea mb-3"
              />
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setRejectModal({ open: false, id: null, note: '' })}
                >
                  Cancel
                </button>
                <button
                  className="btn-action-reject"
                  onClick={() => handleDecision(rejectModal.id, 'rejected', rejectModal.note)}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
