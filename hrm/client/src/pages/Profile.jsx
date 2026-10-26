import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api, { fmt, msg } from '../api';
import { loadMe } from '../store';
import { Head } from '../ui';
export default function Profile() {
  const { user } = useSelector(s => s.auth), d = useDispatch(), e = user.employee || {};
  const [f, setF] = useState({ name: user.name, phone: e.phone || '' }), [note, setNote] = useState('');
  useEffect(() => { d(loadMe()); }, [d]);
  const save = ev => { ev.preventDefault(); api.patch('/me', f).then(() => { setNote('Saved'); d(loadMe()); }).catch(x => setNote(msg(x))); };
  return (<>
    <Head title="My profile" sub="Keep your personal details up to date." />
    <div className="two"><form className="card form" onSubmit={save}><h3>Personal information</h3>{note && <div className="alert ok">{note}</div>}
      <label>Full name<input required value={f.name} onChange={x => setF({ ...f, name: x.target.value })} /></label>
      <label>Phone<input value={f.phone} onChange={x => setF({ ...f, phone: x.target.value })} /></label><label>Email<input disabled value={user.email} /></label><button className="btn">Save changes</button></form>
      <section className="card facts"><h3>Work details</h3>{[['Department', e.department], ['Designation', e.designation], ['Reports to', e.manager?.name || '-'], ['Joined', fmt(e.joinDate)], ['Leave balance', `${e.leaveBalance ?? 0} days`]].map(([k, v]) => <div className="line" key={k}><span>{k}</span><b>{v}</b></div>)}</section></div></>);
}
