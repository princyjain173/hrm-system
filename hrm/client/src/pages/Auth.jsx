import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, register, clearError } from '../store';
import {
  IconShield,
  IconClock,
  IconCalendar,
  IconGraduation,
  IconCheck,
  IconUser,
  IconBriefcase
} from '../icons';

export default function Auth({ mode }) {
  const isRegister = mode === 'register';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector(s => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const setField = key => e => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const action = isRegister ? register : login;
    const res = await dispatch(action(form));
    if (!res.error) {
      navigate('/');
    }
  };

  const handleQuickLogin = async (email, roleName) => {
    dispatch(clearError());
    setForm({ ...form, email, password: 'Pass@123' });
    const res = await dispatch(login({ email, password: 'Pass@123' }));
    if (!res.error) {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      {/* Left Feature Showcase */}
      <div className="auth-hero">
        <div className="auth-hero-header">
          <div className="brand-logo-badge">
            <span>S</span>
          </div>
          <div>
            <h2 className="brand-title">StaffSync</h2>
            <span className="brand-subtitle">Modern Human Resource Management Solution</span>
          </div>
        </div>

        <div className="auth-hero-body">
          <h1 className="hero-headline">
            Automate & Elevate Your Organization's Workforce.
          </h1>
          <p className="hero-description">
            A centralized MERN platform that unifies attendance tracking, automated leave approvals,
            team directories, and employee development programs under robust role-based security.
          </p>

          <div className="hero-features-list">
            <div className="feature-item">
              <div className="feature-icon-box">
                <IconShield size={18} />
              </div>
              <div>
                <strong>Role-Based Access Control</strong>
                <p>Tailored portals and permission gates for HR, Team Managers, and Staff.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <IconClock size={18} />
              </div>
              <div>
                <strong>Precision Attendance Tracking</strong>
                <p>One-click check-in/out, live digital punch clock, and team daily reports.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <IconCalendar size={18} />
              </div>
              <div>
                <strong>Automated Leave Lifecycle</strong>
                <p>Self-service leave applications, quota deduction, and manager approval queues.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <IconGraduation size={18} />
              </div>
              <div>
                <strong>Training & Development Tracks</strong>
                <p>Skill development initiatives with instant enrollment and manager scheduling.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <span>Enterprise MERN Architecture • MongoDB • Express • React 18 • Node.js</span>
        </div>
      </div>

      {/* Right Login / Register Card */}
      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-card-head">
            <h2>{isRegister ? 'Create Your Account' : 'Welcome Back'}</h2>
            <p>
              {isRegister
                ? 'Join StaffSync as an employee to access your personal dashboard.'
                : 'Sign in to access your HR workspace and manage workforce workflows.'}
            </p>
          </div>

          {error && <div className="alert-box alert-error">{error}</div>}

          {/* Quick 1-Click Demo Login Bar */}
          {!isRegister && (
            <div className="demo-accounts-box">
              <span className="demo-accounts-title">Quick Demo Sign-In (1-Click):</span>
              <div className="demo-buttons-grid">
                <button
                  type="button"
                  className="btn-demo-account hr-demo"
                  onClick={() => handleQuickLogin('hr@hrm.com', 'HR')}
                >
                  <div className="demo-role-badge">HR Admin</div>
                  <div className="demo-user-name">Anita Verma</div>
                  <small>Full HR & Employee Controls</small>
                </button>

                <button
                  type="button"
                  className="btn-demo-account mgr-demo"
                  onClick={() => handleQuickLogin('mgr@hrm.com', 'Manager')}
                >
                  <div className="demo-role-badge">Manager</div>
                  <div className="demo-user-name">Rohan Mehta</div>
                  <small>Team Approvals & Trainings</small>
                </button>

                <button
                  type="button"
                  className="btn-demo-account emp-demo"
                  onClick={() => handleQuickLogin('emp@hrm.com', 'Employee')}
                >
                  <div className="demo-role-badge">Employee</div>
                  <div className="demo-user-name">Priya Sharma</div>
                  <small>Punch Clock & Leave Balance</small>
                </button>
              </div>
              <div className="demo-accounts-hint">
                Default password for all accounts: <code>Pass@123</code>
              </div>
            </div>
          )}

          <div className="form-divider">
            <span>{isRegister ? 'Fill in details' : 'Or sign in with email'}</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-field">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <IconUser className="input-icon" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={setField('name')}
                  />
                </div>
              </div>
            )}

            <div className="form-field">
              <label>Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">@</span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={setField('email')}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className="input-with-icon">
                <IconShield className="input-icon" size={16} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter your password (min 6 chars)"
                  value={form.password}
                  onChange={setField('password')}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary-large" disabled={loading}>
              {loading ? (
                <span>Signing in...</span>
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Sign In to StaffSync'
              )}
            </button>
          </form>

          <div className="auth-card-footer">
            <p>
              {isRegister ? 'Already registered?' : "Don't have an account yet?"}{' '}
              <Link
                to={isRegister ? '/login' : '/register'}
                onClick={() => dispatch(clearError())}
                className="auth-link"
              >
                {isRegister ? 'Sign In' : 'Create an Account'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
