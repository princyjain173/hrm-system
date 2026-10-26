import { useState } from 'react';
import { useSelector } from 'react-redux';
import api, { useList, fmt, tm, msg } from '../api';
import { Head, Pager, Empty } from '../ui';
export default function Attendance() {
  const { user } = useSelector(s => s.auth), mine = useList('/attendance/mine'), [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const team = useList(user.role !== 'employee' ? '/attendance/team' : '/attendance/mine', { date }), [err, setErr] = useState('');
  const act = p => api.post(`/attendance/${p}`).then(() => { setErr(''); mine.reload(); }).catch(e => setErr(msg(e)));
  const t = mine.today;
  return (<>
    <Head title="Attendance" sub="Check in when you start and check out when you finish." />
    <section className="card today"><div><small>Today</small><h2>{t ? (t.checkOut ? 'Day complete' : 'You are checked in') : 'Not checked in yet'}</h2>
      <p>{t ? `In ${tm(t.checkIn)}${t.checkOut ? `, out ${tm(t.checkOut)}` : ''}` : 'Start your day when you are ready.'}</p>{err && <div className="alert">{err}</div>}</div>
      <div className="row"><button className="btn" disabled={!!t} onClick={() => act('check-in')}>Check in</button><button className="btn dark" disabled={!t || !!t.checkOut} onClick={() => act('check-out')}>Check out</button></div></section>
    <section className="card"><h3>My history</h3>
      {mine.items.length ? <div className="scroll"><table><thead><tr><th>Date</th><th>In</th><th>Out</th></tr></thead><tbody>{mine.items.map(a => <tr key={a._id}><td>{fmt(a.date)}</td><td>{tm(a.checkIn)}</td><td>{tm(a.checkOut)}</td></tr>)}</tbody></table></div> : <Empty>No records yet. Your first check in will show up here.</Empty>}
      <Pager {...mine} /></section>
    {user.role !== 'employee' && <section className="card"><div className="split"><h3>{user.role === 'hr' ? 'Everyone' : 'My team'} on</h3><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      {team.items.length ? <div className="scroll"><table><thead><tr><th>Name</th><th>In</th><th>Out</th></tr></thead><tbody>{team.items.map(a => <tr key={a._id}><td>{a.user?.name}</td><td>{tm(a.checkIn)}</td><td>{tm(a.checkOut)}</td></tr>)}</tbody></table></div> : <Empty>Nobody checked in on this date.</Empty>}
      <Pager {...team} /></section>}
  </>);
}
