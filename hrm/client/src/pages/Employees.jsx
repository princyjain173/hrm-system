import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api, { useList, msg } from '../api';
import { Head, Pager, Empty } from '../ui';
export default function Employees() {
  const { user } = useSelector(s => s.auth), [q, setQ] = useState(''), [term, setTerm] = useState(''), l = useList('/employees', { q: term });
  const [mgrs, setMgrs] = useState([]), [edit, setEdit] = useState(null), hr = user.role === 'hr';
  useEffect(() => { if (hr) api.get('/managers').then(r => setMgrs(r.data)); }, [hr]);
  useEffect(() => { const t = setTimeout(() => setTerm(q), 350); return () => clearTimeout(t); }, [q]);
  const save = () => api.patch(`/employees/${edit._id}`, edit).then(() => { setEdit(null); l.reload(); }).catch(e => alert(msg(e)));
  const set = k => e => setEdit({ ...edit, [k]: e.target.value });
  return (<>
    <Head title="People" sub={hr ? 'Manage every employee and manager.' : 'The people in your team.'}><input placeholder="Search by name" value={q} onChange={e => setQ(e.target.value)} /></Head>
    <section className="card">{l.items.length ? <div className="scroll"><table><thead><tr><th>Name</th><th>Department</th><th>Designation</th><th>Role</th><th>Manager</th>{hr && <th />}</tr></thead><tbody>
      {l.items.map(e => edit?._id === e._id ? <tr key={e._id}><td>{e.user?.name}</td><td><input value={edit.department} onChange={set('department')} /></td><td><input value={edit.designation} onChange={set('designation')} /></td>
        <td><select value={edit.role} onChange={set('role')}>{['employee', 'manager', 'hr'].map(r => <option key={r}>{r}</option>)}</select></td>
        <td><select value={edit.manager || ''} onChange={set('manager')}><option value="">None</option>{mgrs.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}</select></td>
        <td className="row"><button className="btn sm" onClick={save}>Save</button><button className="btn ghost sm" onClick={() => setEdit(null)}>Cancel</button></td></tr>
        : <tr key={e._id}><td><b>{e.user?.name}</b><small>{e.user?.email}</small></td><td>{e.department}</td><td>{e.designation}</td><td className="cap">{e.user?.role}</td><td>{e.manager?.name || '-'}</td>
          {hr && <td><button className="btn ghost sm" onClick={() => setEdit({ _id: e._id, department: e.department, designation: e.designation, role: e.user.role, manager: e.manager?._id })}>Edit</button></td>}</tr>)}</tbody></table></div> : <Empty>No people found.</Empty>}
      <Pager {...l} /></section></>);
}
