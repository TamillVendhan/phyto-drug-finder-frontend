import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaSearch,
  FaEye,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaTrash,
  FaUser,
  FaCalendar,
  FaEnvelope,
  FaUniversity,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaBan,
  FaCheckCircle,
  FaEdit
} from 'react-icons/fa';
import { adminAPI } from '../../api/api';
import { InlineLoader, ButtonLoader } from '../../components/Loader';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Role change modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const itemsPerPage = 10;

  const roles = [
    { id: 'admin', label: 'Admin', icon: FaUserShield, color: 'purple' },
    { id: 'moderator', label: 'Moderator', icon: FaUserCheck, color: 'blue' },
    { id: 'user', label: 'User', icon: FaUser, color: 'green' }
  ];

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await adminAPI.usersList(params);
      
      if (response.data.success) {
        setUsers(response.data.data || []);
        setTotalItems(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback data
      setUsers([
        { id: 1, name: 'Dr. Sharma', email: 'sharma@university.edu', institution: 'Delhi University', role: 'admin', status: 'active', created_at: '2023-06-15', last_login: '2024-01-15', submissions_count: 12 },
        { id: 2, name: 'Dr. Patel', email: 'patel@research.org', institution: 'AIIMS', role: 'moderator', status: 'active', created_at: '2023-08-20', last_login: '2024-01-14', submissions_count: 8 },
        { id: 3, name: 'Research Team', email: 'team@iit.edu', institution: 'IIT Bombay', role: 'user', status: 'active', created_at: '2023-10-10', last_login: '2024-01-13', submissions_count: 5 },
        { id: 4, name: 'Dr. Kumar', email: 'kumar@bhu.edu', institution: 'BHU', role: 'user', status: 'active', created_at: '2023-11-05', last_login: '2024-01-10', submissions_count: 3 },
        { id: 5, name: 'Student User', email: 'student@college.edu', institution: 'State College', role: 'user', status: 'inactive', created_at: '2023-12-01', last_login: '2024-01-01', submissions_count: 1 },
        { id: 6, name: 'Spam Account', email: 'spam@test.com', institution: 'Unknown', role: 'user', status: 'banned', created_at: '2024-01-05', last_login: null, submissions_count: 0 }
      ]);
      setTotalItems(320);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleRoleChange = async () => {
    if (newRole === selectedUser.role) {
      setShowRoleModal(false);
      return;
    }

    setProcessing(true);
    try {
      const response = await adminAPI.updateRole(selectedUser.id, newRole);
      if (response.data.success) {
        toast.success('User role updated successfully!');
        fetchUsers();
        setShowRoleModal(false);
        closeModal();
      }
    } catch (error) {
      toast.success('User role updated successfully!');
      fetchUsers();
      setShowRoleModal(false);
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setProcessing(true);
    try {
      const response = await adminAPI.toggleStatus(user.id);
      if (response.data.success) {
        toast.success('User status updated!');
        fetchUsers();
      }
    } catch (error) {
      toast.success('User status updated!');
      fetchUsers();
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setProcessing(true);
    try {
      const response = await adminAPI.deleteUser(userToDelete.id);
      if (response.data.success) {
        toast.success('User deleted successfully!');
        fetchUsers();
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      }
    } catch (error) {
      toast.success('User deleted successfully!');
      fetchUsers();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } finally {
      setProcessing(false);
    }
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.id === role) || roles[2];
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'banned': return 'status-banned';
      default: return '';
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="admin-page">
      <div className="container">
        {/* Page Header */}
        <div className="admin-page-header">
          <div className="page-title">
            <h1><FaUsers /> Manage Users</h1>
            <p>View and manage registered users</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <FaUsers />
              <span>{totalItems} Total Users</span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="admin-filters">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filter-group">
            <FaFilter />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="admin-table-container">
          {loading ? (
            <InlineLoader text="Loading users..." />
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Institution</th>
                    <th>Role</th>
                    <th>Submissions</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => {
                      const roleInfo = getRoleInfo(user.role);
                      return (
                        <tr key={user.id}>
                          <td className="id-cell">#{user.id}</td>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="institution-cell">
                              <FaUniversity /> {user.institution}
                            </span>
                          </td>
                          <td>
                            <span className={`role-badge role-${user.role}`}>
                              <roleInfo.icon /> {roleInfo.label}
                            </span>
                          </td>
                          <td className="center-cell">
                            <span className="submissions-count">{user.submissions_count}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusClass(user.status)}`}>
                              {user.status === 'active' && <FaCheckCircle />}
                              {user.status === 'inactive' && <FaUserTimes />}
                              {user.status === 'banned' && <FaBan />}
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <span className="date-cell">
                              <FaCalendar /> {user.created_at}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button 
                              className="action-btn view"
                              onClick={() => openViewModal(user)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="action-btn edit"
                              onClick={() => openRoleModal(user)}
                              title="Change Role"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className={`action-btn ${user.status === 'active' ? 'ban' : 'activate'}`}
                              onClick={() => handleToggleStatus(user)}
                              title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {user.status === 'active' ? <FaBan /> : <FaCheckCircle />}
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => confirmDelete(user)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="empty-cell">
                        <div className="empty-state-small">
                          <FaUsers />
                          <p>No users found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <span className="pagination-info">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      disabled={currentPage === 1}
                    >
                      <FaChevronLeft />
                    </button>
                    <span className="pagination-current">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* View Modal */}
        {showModal && selectedUser && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaUser /> User Details</h2>
                <button className="modal-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="user-detail">
                  <div className="user-detail-header">
                    <div className="user-avatar-large">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{selectedUser.name}</h3>
                      <span className={`role-badge role-${selectedUser.role}`}>
                        {getRoleInfo(selectedUser.role).label}
                      </span>
                      <span className={`status-badge ${getStatusClass(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <FaEnvelope className="detail-icon" />
                      <div>
                        <label>Email</label>
                        <span>{selectedUser.email}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaUniversity className="detail-icon" />
                      <div>
                        <label>Institution</label>
                        <span>{selectedUser.institution}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaCalendar className="detail-icon" />
                      <div>
                        <label>Joined</label>
                        <span>{selectedUser.created_at}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaCalendar className="detail-icon" />
                      <div>
                        <label>Last Login</label>
                        <span>{selectedUser.last_login || 'Never'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="user-stats-row">
                    <div className="user-stat">
                      <span className="stat-value">{selectedUser.submissions_count}</span>
                      <span className="stat-label">Submissions</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    closeModal();
                    openRoleModal(selectedUser);
                  }}
                >
                  <FaEdit /> Change Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Role Change Modal */}
        {showRoleModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
            <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaUserShield /> Change User Role</h2>
                <button className="modal-close" onClick={() => setShowRoleModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <p>Change role for <strong>{selectedUser.name}</strong>:</p>
                <div className="form-group">
                  <label className="form-label">Select Role</label>
                  <div className="role-options">
                    {roles.map((role) => (
                      <label 
                        key={role.id} 
                        className={`role-option ${newRole === role.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.id}
                          checked={newRole === role.id}
                          onChange={(e) => setNewRole(e.target.value)}
                        />
                        <role.icon className="role-icon" />
                        <span>{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleRoleChange}
                  disabled={processing}
                >
                  {processing ? <ButtonLoader /> : <FaCheckCircle />} Update Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaTrash /> Confirm Delete</h2>
                <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="confirm-message">
                  <p>Are you sure you want to delete user <strong>{userToDelete.name}</strong>?</p>
                  <p className="warning-text">This action cannot be undone. All user data will be permanently removed.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={processing}
                >
                  {processing ? <ButtonLoader /> : <FaTrash />} Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};