import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api, { useList, msg } from '../api';
import { Head, Pager, Empty, Avatar, RoleBadge } from '../ui';
import {
  IconUsers,
  IconSearch,
  IconEdit,
  IconCheck,
  IconXCircle,
  IconBriefcase,
  IconPhone,
  IconMail
} from '../icons';

export default function Employees() {
  const { user } = useSelector(s => s.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const employeeList = useList('/employees', { q: searchTerm });
  const [managers, setManagers] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const isHR = user.role === 'hr';

  useEffect(() => {
    if (isHR) {
      api.get('/managers').then(r => setManagers(r.data || [])).catch(() => {});
    }
  }, [isHR]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchQuery), 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSaveEdit = async () => {
    try {
      setSaveLoading(true);
      await api.patch(`/employees/${editingEmployee._id}`, editingEmployee);
      setEditingEmployee(null);
      employeeList.reload();
    } catch (e) {
      alert(msg(e));
    } finally {
      setSaveLoading(false);
    }
  };

  const setEditField = key => e => setEditingEmployee({ ...editingEmployee, [key]: e.target.value });

  return (
    <div className="employees-page">
      <Head
        title="People Directory"
        sub={isHR ? 'Oversee all staff, modify designations, departments, and managerial hierarchies.' : 'Directory of colleagues reporting in your team.'}
        badge={isHR ? 'Full HR Access' : 'Team Directory'}
      >
        <div className="directory-header-controls">
          <div className="search-input-box">
            <IconSearch size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-field"
            />
          </div>

          <div className="view-mode-toggle">
            <button
              className={`btn-toggle-view ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              Table
            </button>
            <button
              className={`btn-toggle-view ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              Cards
            </button>
          </div>
        </div>
      </Head>

      {/* Directory Content */}
      <section className="ui-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <IconUsers size={18} className="text-primary" />
            <h3>Workforce Roster ({employeeList.total || employeeList.items.length} records)</h3>
          </div>
          {isHR && (
            <span className="badge-pill-soft">Click 'Edit' to change roles or departments</span>
          )}
        </div>

        {employeeList.items.length ? (
          viewMode === 'table' ? (
            <div className="table-responsive">
              <table className="staffsync-table">
                <thead>
                  <tr>
                    <th>Colleague</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>System Role</th>
                    <th>Reporting Manager</th>
                    <th>Leave Balance</th>
                    {isHR && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {employeeList.items.map(emp => {
                    const isEditing = editingEmployee?._id === emp._id;
                    if (isEditing) {
                      return (
                        <tr key={emp._id} className="row-editing">
                          <td>
                            <strong>{emp.user?.name}</strong>
                            <small>{emp.user?.email}</small>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input-inline"
                              value={editingEmployee.department}
                              onChange={setEditField('department')}
                              placeholder="Department"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input-inline"
                              value={editingEmployee.designation}
                              onChange={setEditField('designation')}
                              placeholder="Designation"
                            />
                          </td>
                          <td>
                            <select
                              className="select-inline"
                              value={editingEmployee.role}
                              onChange={setEditField('role')}
                            >
                              <option value="employee">Employee</option>
                              <option value="manager">Manager</option>
                              <option value="hr">HR</option>
                            </select>
                          </td>
                          <td>
                            <select
                              className="select-inline"
                              value={editingEmployee.manager || ''}
                              onChange={setEditField('manager')}
                            >
                              <option value="">None (Top Level)</option>
                              {managers.map(m => (
                                <option key={m._id} value={m._id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>{emp.leaveBalance ?? 18} d</td>
                          <td>
                            <div className="action-buttons-cell">
                              <button
                                className="btn-action-approve"
                                onClick={handleSaveEdit}
                                disabled={saveLoading}
                              >
                                <IconCheck size={14} /> Save
                              </button>
                              <button
                                className="btn-action-reject"
                                onClick={() => setEditingEmployee(null)}
                              >
                                <IconXCircle size={14} /> Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={emp._id}>
                        <td>
                          <div className="table-user-cell">
                            <Avatar name={emp.user?.name || 'User'} size={36} />
                            <div>
                              <strong>{emp.user?.name}</strong>
                              <small>{emp.user?.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="dept-tag">{emp.department || 'General'}</span>
                        </td>
                        <td>
                          <span className="designation-text">{emp.designation || 'Staff'}</span>
                        </td>
                        <td>
                          <RoleBadge role={emp.user?.role} />
                        </td>
                        <td>
                          <span className="manager-text">{emp.manager?.name || '—'}</span>
                        </td>
                        <td>
                          <strong className="balance-text">{emp.leaveBalance ?? 18} days</strong>
                        </td>
                        {isHR && (
                          <td>
                            <button
                              className="btn-action-edit"
                              onClick={() =>
                                setEditingEmployee({
                                  _id: emp._id,
                                  department: emp.department || '',
                                  designation: emp.designation || '',
                                  role: emp.user?.role || 'employee',
                                  manager: emp.manager?._id || ''
                                })
                              }
                            >
                              <IconEdit size={14} /> Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card Grid View */
            <div className="employee-cards-grid">
              {employeeList.items.map(emp => (
                <div key={emp._id} className="employee-profile-card">
                  <div className="emp-card-top">
                    <Avatar name={emp.user?.name || 'User'} size={52} />
                    <RoleBadge role={emp.user?.role} />
                  </div>
                  <h4 className="emp-card-name">{emp.user?.name}</h4>
                  <span className="emp-card-title">{emp.designation}</span>
                  <span className="dept-tag mt-2">{emp.department}</span>

                  <div className="emp-card-meta">
                    <div className="meta-line">
                      <IconMail size={13} />
                      <span>{emp.user?.email}</span>
                    </div>
                    {emp.phone && (
                      <div className="meta-line">
                        <IconPhone size={13} />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                    <div className="meta-line">
                      <IconBriefcase size={13} />
                      <span>Reports to: {emp.manager?.name || 'Direct'}</span>
                    </div>
                  </div>

                  <div className="emp-card-footer">
                    <span className="leave-quota">Balance: {emp.leaveBalance ?? 18} days</span>
                    {isHR && (
                      <button
                        className="btn-action-edit"
                        onClick={() => {
                          setViewMode('table');
                          setEditingEmployee({
                            _id: emp._id,
                            department: emp.department || '',
                            designation: emp.designation || '',
                            role: emp.user?.role || 'employee',
                            manager: emp.manager?._id || ''
                          });
                        }}
                      >
                        <IconEdit size={13} /> Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <Empty
            title="No Staff Found"
            description={searchTerm ? `No employee matches "${searchTerm}".` : 'No employees in this list.'}
            icon={IconUsers}
          />
        )}

        <Pager {...employeeList} />
      </section>
    </div>
  );
}
