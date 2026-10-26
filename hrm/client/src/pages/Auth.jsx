import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, register, clearError } from '../store';
export default function Auth({ mode }) {
  const reg = mode === 'register', d = useDispatch(), go = useNavigate(), { error, loading } = useSelector(s => s.auth);
  const [f, setF] = useState({ name: '', email: '', password: '' }), set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => { e.preventDefault(); const r = await d((reg ? register : login)(f)); if (!r.error) go('/'); };
  return (
    <div className="auth">
      <section className="auth-art"><div className="brand"><span className="mark">H</span>HRM Portal</div>
        <h1>Attendance, leave and training in one place.</h1><p>Employees check in, managers approve requests, and HR sees the whole organisation at a glance.</p></section>
      <form className="auth-form" onSubmit={submit}>
        <h2>{reg ? 'Create your account' : 'Sign in'}</h2>
        {error && <div className="alert">{error}</div>}
        {reg && <label>Full name<input required value={f.name} onChange={set('name')} /></label>}
        <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={6} value={f.password} onChange={set('password')} /></label>
        <button className="btn" disabled={loading}>{loading ? 'Please wait' : reg ? 'Create account' : 'Sign in'}</button>
        <p className="alt">{reg ? 'Already registered?' : 'New here?'} <Link to={reg ? '/login' : '/register'} onClick={() => d(clearError())}>{reg ? 'Sign in' : 'Create an account'}</Link></p>
        {!reg && <p className="demo">Demo: hr@hrm.com, mgr@hrm.com or emp@hrm.com with Pass@123</p>}
      </form>
    </div>
  );
}
