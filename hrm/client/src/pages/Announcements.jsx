import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api, { fmt, msg } from '../api';
import { Head, Empty } from '../ui';
export default function Announcements() {
  const { user } = useSelector(s => s.auth), [list, setList] = useState([]), [f, setF] = useState({ title: '', body: '' }), [err, setErr] = useState('');
  const load = () => api.get('/announcements').then(r => setList(r.data)); useEffect(() => { load(); }, []);
  const post = e => { e.preventDefault(); api.post('/announcements', f).then(() => { setF({ title: '', body: '' }); setErr(''); load(); }).catch(x => setErr(msg(x))); };
  return (<>
    <Head title="Announcements" sub="News and updates from HR." />
    {user.role === 'hr' && <form className="card form" onSubmit={post}><h3>Post an announcement</h3>{err && <div className="alert">{err}</div>}
      <label>Title<input required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></label>
      <label>Message<textarea required rows={3} value={f.body} onChange={e => setF({ ...f, body: e.target.value })} /></label><button className="btn">Publish</button></form>}
    <section className="card">{list.length ? list.map(n => <article className="note" key={n._id}><div className="split"><b>{n.title}</b>
      {user.role === 'hr' && <button className="btn ghost sm" onClick={() => api.delete(`/announcements/${n._id}`).then(load)}>Delete</button>}</div><p>{n.body}</p><small>{n.author?.name}, {fmt(n.createdAt)}</small></article>) : <Empty>No announcements yet.</Empty>}</section>
  </>);
}
