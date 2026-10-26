import { useState } from 'react';
import { useSelector } from 'react-redux';
import api, { useList, fmt, msg } from '../api';
import { Head, Pager, Empty, Badge } from '../ui';
export default function Leaves() {
  const { user } = useSelector(s => s.auth), mine = useList('/leaves/mine'), [status, setStatus] = useState('pending');
  const review = useList(user.role !== 'employee' ? '/leaves/review' : '/leaves/mine', { status });
  const blank = { type: 'Casual', from: '', to: '', reason: '' }, [f, setF] = useState(blank), [err, setErr] = useState(''), set = k => e => setF({ ...f, [k]: e.target.value });
  const apply = e => { e.preventDefault(); api.post('/leaves', f).then(() => { setF(blank); setErr(''); mine.reload(); }).catch(x => setErr(msg(x))); };
  const decide = (id, s) => api.patch(`/leaves/${id}`, { status: s }).then(review.reload).catch(x => alert(msg(x)));
  return (<>
    <Head title="Leave" sub="Request time off and follow its status." />
    <div className="two">
      <form className="card form" onSubmit={apply}><h3>Apply for leave</h3>{err && <div className="alert">{err}</div>}
        <label>Type<select value={f.type} onChange={set('type')}>{['Casual', 'Sick', 'Earned', 'Unpaid'].map(t => <option key={t}>{t}</option>)}</select></label>
        <div className="row"><label>From<input type="date" required value={f.from} onChange={set('from')} /></label><label>To<input type="date" required value={f.to} min={f.from} onChange={set('to')} /></label></div>
        <label>Reason<textarea required maxLength={400} rows={3} value={f.reason} onChange={set('reason')} /></label><button className="btn">Send request</button></form>
      <section className="card"><h3>My requests</h3>
        {mine.items.length ? mine.items.map(l => <div className="line" key={l._id}><div><b>{l.type}, {l.days} day{l.days > 1 ? 's' : ''}</b><small>{fmt(l.from)} to {fmt(l.to)}</small></div><Badge s={l.status} /></div>) : <Empty>No requests yet.</Empty>}
        <Pager {...mine} /></section></div>
    {user.role !== 'employee' && <section className="card"><div className="split"><h3>Requests to review</h3>
      <select value={status} onChange={e => setStatus(e.target.value)}><option value="pending">Waiting</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>
      {review.items.length ? review.items.map(l => <div className="line" key={l._id}><div><b>{l.user?.name}: {l.type}, {l.days} day{l.days > 1 ? 's' : ''}</b><small>{fmt(l.from)} to {fmt(l.to)}. {l.reason}</small></div>
        {l.status === 'pending' ? <div className="row"><button className="btn sm" onClick={() => decide(l._id, 'approved')}>Approve</button><button className="btn ghost sm" onClick={() => decide(l._id, 'rejected')}>Reject</button></div> : <Badge s={l.status} />}</div>) : <Empty>No {status === 'pending' ? 'waiting' : status} requests.</Empty>}
      <Pager {...review} /></section>}
  </>);
}
