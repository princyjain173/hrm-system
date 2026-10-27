import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api, { fmt, msg } from '../api';
import { Head, Empty } from '../ui';
import {
  IconGraduation,
  IconClock,
  IconCalendar,
  IconUsers,
  IconPlus,
  IconCheck,
  IconAward
} from '../icons';

export default function Trainings() {
  const { user } = useSelector(s => s.auth);
  const [trainingsList, setTrainingsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialForm = { title: '', description: '', startDate: '', hours: '' };
  const [form, setForm] = useState(initialForm);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(null);

  const loadTrainings = () => {
    setLoading(true);
    api.get('/trainings')
      .then(r => setTrainingsList(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const handleCreate = async e => {
    e.preventDefault();
    try {
      setCreating(true);
      setErrorMsg('');
      await api.post('/trainings', form);
      setSuccessMsg('Training program created successfully.');
      setForm(initialForm);
      setShowCreateModal(false);
      loadTrainings();
    } catch (err) {
      setErrorMsg(msg(err));
    } finally {
      setCreating(false);
    }
  };

  const handleEnroll = async id => {
    try {
      setEnrollLoading(id);
      await api.post(`/trainings/${id}/enroll`);
      loadTrainings();
    } catch (err) {
      alert(msg(err));
    } finally {
      setEnrollLoading(null);
    }
  };

  const setField = key => e => setForm({ ...form, [key]: e.target.value });
  const canCreate = user.role === 'hr' || user.role === 'manager';

  return (
    <div className="trainings-page">
      <Head
        title="Training & Skill Development"
        sub="Explore curated corporate learning tracks, join technical workshops, and advance your capabilities."
        badge="Learning Hub"
      >
        {canCreate && (
          <button
            className="btn-action-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <IconPlus size={16} /> Create Training Program
          </button>
        )}
      </Head>

      {successMsg && <div className="alert-box alert-success mb-3">{successMsg}</div>}

      {/* Program Catalog Grid */}
      <div className="trainings-catalog-grid">
        {trainingsList.length ? (
          trainingsList.map(t => (
            <div key={t._id} className="training-catalog-card">
              <div className="training-card-banner">
                <div className="training-icon-badge">
                  <IconAward size={22} />
                </div>
                <div className="training-hours-chip">
                  <IconClock size={13} />
                  <span>{t.hours ? `${t.hours} Hours` : 'Flexible'}</span>
                </div>
              </div>

              <div className="training-card-body">
                <h3 className="training-title">{t.title}</h3>
                <p className="training-desc">{t.description || 'No detailed syllabus provided.'}</p>

                <div className="training-meta-list">
                  <div className="training-meta-item">
                    <IconCalendar size={14} />
                    <span>Starts: {t.startDate ? fmt(t.startDate) : 'To Be Scheduled'}</span>
                  </div>
                  <div className="training-meta-item">
                    <IconUsers size={14} />
                    <span>{t.count} {t.count === 1 ? 'colleague' : 'colleagues'} enrolled</span>
                  </div>
                  {t.createdBy && (
                    <div className="training-meta-item">
                      <small>Instructor: {t.createdBy.name}</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="training-card-footer">
                <button
                  className={`btn-enroll-action ${t.joined ? 'enrolled' : ''}`}
                  disabled={t.joined || enrollLoading === t._id}
                  onClick={() => handleEnroll(t._id)}
                >
                  {enrollLoading === t._id ? (
                    'Enrolling...'
                  ) : t.joined ? (
                    <>
                      <IconCheck size={16} /> Enrolled
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="w-100">
            <Empty
              title="No Training Programs Yet"
              description="New training workshops and skills development sessions will be published soon."
              icon={IconGraduation}
            />
          </div>
        )}
      </div>

      {/* Create Training Modal for HR / Managers */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-head">
              <h3>Schedule New Training Program</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {errorMsg && <div className="alert-box alert-error mb-3">{errorMsg}</div>}
              <form className="staffsync-form" onSubmit={handleCreate}>
                <div className="form-field">
                  <label>Training Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scalable System Architecture"
                    value={form.title}
                    onChange={setField('title')}
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-field">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={setField('startDate')}
                      className="date-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>Duration (Hours)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 6"
                      value={form.hours}
                      onChange={setField('hours')}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Syllabus & Details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what employees will learn in this session..."
                    value={form.description}
                    onChange={setField('description')}
                    className="custom-textarea"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-large"
                    disabled={creating}
                  >
                    {creating ? 'Publishing...' : 'Publish Training'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
