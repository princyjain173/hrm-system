import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api, { fmt } from '../api';
import { Head, Empty } from '../ui';
export default function Dashboard() {
  const { user } = useSelector(s => s.auth), [s, setS] = useState(null), [news, setNews] = useState([]);
  useEffect(() => { api.get('/stats').then(r => setS(r.data)); api.get('/announcements?limit=3').then(r => setNews(r.data)); }, []);
  const max = Math.max(1, ...(s?.departments || []).map(x => x.n));
  const title = { hr: 'HR overview', manager: 'Your team today', employee: 'Your month at a glance' }[user.role];
  return (<>
    <Head title={`Hello, ${user.name.split(' ')[0]}`} sub={title} />
    <div className="stats">{(s?.cards || [[], [], [], []]).map(([l, v], i) => <div className={`stat s${i}`} key={i}><strong>{v ?? '...'}</strong><span>{l}</span></div>)}</div>
    <div className="two">
      {s?.departments && <section className="card"><h3>People by department</h3>{s.departments.map(x => <div className="bar" key={x._id}><span>{x._id}</span><div><i style={{ width: `${(x.n / max) * 100}%` }} /></div><b>{x.n}</b></div>)}</section>}
      <section className="card"><h3>Latest announcements</h3>{news.length ? news.map(n => <article key={n._id} className="note"><b>{n.title}</b><p>{n.body}</p><small>{n.author?.name}, {fmt(n.createdAt)}</small></article>) : <Empty>Nothing posted yet.</Empty>}
        <Link to="/announcements">See all announcements</Link></section>
    </div></>);
}
