import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUsers, toggleUserStatus, deleteUser } from '../../../services/adminService';
import { IconUser, IconTrash } from '../../common/Icons';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load registered users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.active;
      await toggleUserStatus(user.id, newStatus);
      toast.success(`User ${newStatus ? 'activated' : 'suspended'}`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: newStatus } : u));
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Safely deactivate this user account?')) {
      return;
    }
    try {
      await deleteUser(userId);
      toast.success('User deactivated');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: false } : u));
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container-fluid py-3 px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
            Users
          </h3>
          <p className="text-muted small m-0 mt-1">Platform customer and restaurant partner directory</p>
        </div>
        <div>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '220px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        </div>
      ) : (
        <div className="card border rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted small">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{u.name}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{u.id}</div>
                      </td>
                      <td>
                        <div className="text-dark small">{u.email}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{u.phone || 'No phone'}</div>
                      </td>
                      <td>
                        {u.role === 'ROLE_ADMIN' ? (
                          <span className="badge bg-dark text-white fw-semibold px-2.5 py-1">Admin</span>
                        ) : u.role === 'ROLE_RESTAURANT' ? (
                          <span className="badge border fw-semibold px-2.5 py-1" style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}>Partner</span>
                        ) : (
                          <span className="badge border fw-semibold px-2.5 py-1" style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#e2e8f0' }}>Customer</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${u.active ? 'badge-success-subtle' : 'badge-danger-subtle'}`}>
                          {u.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="text-end">
                        {u.role !== 'ROLE_ADMIN' && (
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-secondary"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleToggleStatus(u)}
                            >
                              {u.active ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleDelete(u.id)}
                            >
                              Deactivate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
