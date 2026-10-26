import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api, { fmt, msg } from '../api';
import { Head, Empty } from '../ui';
export default function Trainings() {
  const { user } = useSelector(s => s.auth), [list, setList] = useState([]), blank = { title: '', description: '', startDate: '', hours: '' }, [f, setF] = useState(blank), [err, setErr] = useState('');
  const load = () => api.get('/trainings').then(r => setList(r.data)); useEffect(() => { load(); }, []);
  const add = e => { e.preventDefault(); api.post('/trainings', f).then(() => { setF(blank); setErr(''); load(); }).catch(x => setErr(msg(x))); };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return (<>
    <Head title="Training" sub="Programs you can join to grow your skills." />
    {user.role !== 'employee' && <form className="card form" onSubmit={add}><h3>Create a program</h3>{err && <div className="alert">{err}</div>}
      <div className="row"><label>Title<input required value={f.title} onChange={set('title')} /></label><label>Start date<input type="date" value={f.startDate} onChange={set('startDate')} /></label><label>Hours<input type="number" min="1" value={f.hours} onChange={set('hours')} /></label></div>
      <label>Description<textarea rows={2} value={f.description} onChange={set('description')} /></label><button className="btn">Create program</button></form>}
    <div className="grid">{list.length ? list.map(t => <section className="card" key={t._id}><h3>{t.title}</h3><p>{t.description}</p>
      <small>{t.startDate ? `Starts ${fmt(t.startDate)}` : 'Date to be announced'}{t.hours ? `, ${t.hours} hours` : ''}. {t.count} joined.</small>
      <button className="btn" disabled={t.joined} onClick={() => api.post(`/trainings/${t._id}/enroll`).then(load)}>{t.joined ? 'You are enrolled' : 'Join program'}</button></section>) : <Empty>No programs scheduled yet.</Empty>}</div>
  </>);
}
