import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadMe } from './store';
import Layout from './Layout';
const Auth = lazy(() => import('./pages/Auth')), Dashboard = lazy(() => import('./pages/Dashboard')), Attendance = lazy(() => import('./pages/Attendance')),
  Leaves = lazy(() => import('./pages/Leaves')), Announcements = lazy(() => import('./pages/Announcements')), Trainings = lazy(() => import('./pages/Trainings')),
  Employees = lazy(() => import('./pages/Employees')), Profile = lazy(() => import('./pages/Profile'));
function Guard({ roles, children }) {
  const { user, ready } = useSelector(s => s.auth);
  if (!ready) return <div className="boot">Loading your workspace</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
export default function App() {
  const d = useDispatch();
  useEffect(() => { if (localStorage.getItem('token')) d(loadMe()); }, [d]);
  return (
    <Suspense fallback={<div className="boot">Loading</div>}>
      <Routes>
        <Route path="/login" element={<Auth mode="login" />} /><Route path="/register" element={<Auth mode="register" />} />
        <Route element={<Guard><Layout /></Guard>}>
          <Route index element={<Dashboard />} /><Route path="attendance" element={<Attendance />} /><Route path="leaves" element={<Leaves />} />
          <Route path="announcements" element={<Announcements />} /><Route path="trainings" element={<Trainings />} /><Route path="profile" element={<Profile />} />
          <Route path="employees" element={<Guard roles={['hr', 'manager']}><Employees /></Guard>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
