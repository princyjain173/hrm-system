import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api, { fmt, msg } from '../api';
import { Head, Empty, Avatar } from '../ui';
import {
  IconMegaphone,
  IconTrash,
  IconPlus,
  IconCalendar,
  IconCheck
} from '../icons';

export default function Announcements() {
  const { user } = useSelector(s => s.auth);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', body: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [publishing, setPublishing] = useState(false);
  const isHR = user.role === 'hr';

  const loadAnnouncements = () => {
    setLoading(true);
    api.get('/announcements')
      .then(r => setList(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handlePost = async e => {
    e.preventDefault();
    try {
      setPublishing(true);
      setErrorMsg('');
      setSuccessMsg('');
      await api.post('/announcements', form);
      setForm({ title: '', body: '' });
      setSuccessMsg('Announcement published to all employees.');
      loadAnnouncements();
    } catch (err) {
      setErrorMsg(msg(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      loadAnnouncements();
    } catch (err) {
      alert(msg(err));
    }
  };

  return (
    <div className="announcements-page">
      <Head
        title="Company Announcements"
        sub="Important company news, quarterly updates, and HR policy notices."
        badge="Official Notice Board"
      />

      <div className="dashboard-grid-layout">
        {/* Left / Composer for HR */}
        {isHR && (
          <div className="dashboard-main-col">
            <section className="ui-card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <IconMegaphone size={18} className="text-primary" />
                  <h3>Broadcast New Notice</h3>
                </div>
                <span className="badge-pill-soft">HR Admin Broadcast</span>
              </div>

              {errorMsg && <div className="alert-box alert-error mb-3">{errorMsg}</div>}
              {successMsg && <div className="alert-box alert-success mb-3">{successMsg}</div>}

              <form className="staffsync-form" onSubmit={handlePost}>
                <div className="form-field">
                  <label>Announcement Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 Townhall & Benefits Renewal"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Message Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Compose the full notice details for all staff members..."
                    value={form.body}
                    onChange={e => setForm({ ...form, body: e.target.value })}
                    className="custom-textarea"
                  />
                </div>

                <button type="submit" className="btn-primary-large" disabled={publishing}>
                  {publishing ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </form>
            </section>
          </div>
        )}

        {/* Right / Stream of Notices */}
        <div className={isHR ? 'dashboard-side-col' : 'w-100'}>
          <section className="ui-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <IconCalendar size={18} className="text-primary" />
                <h3>Recent Bulletins ({list.length})</h3>
              </div>
            </div>

            <div className="announcements-feed">
              {list.length ? (
                list.map(item => (
                  <article key={item._id} className="announcement-feed-card">
                    <div className="announcement-feed-head">
                      <div className="announcement-author-meta">
                        <Avatar name={item.author?.name || 'HR Admin'} size={38} />
                        <div>
                          <strong>{item.author?.name || 'People Operations'}</strong>
                          <small>Published {fmt(item.createdAt)}</small>
                        </div>
                      </div>
                      {isHR && (
                        <button
                          className="btn-delete-icon"
                          onClick={() => handleDelete(item._id)}
                          title="Delete Notice"
                        >
                          <IconTrash size={15} />
                        </button>
                      )}
                    </div>

                    <h3 className="announcement-feed-title">{item.title}</h3>
                    <div className="announcement-feed-body">
                      <p>{item.body}</p>
                    </div>
                  </article>
                ))
              ) : (
                <Empty
                  title="No Announcements Yet"
                  description="Check back later for company updates."
                  icon={IconMegaphone}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
