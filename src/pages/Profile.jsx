import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaUniversity,
  FaCalendar,
  FaEdit,
  FaKey,
  FaBookmark,
  FaBook,
  FaUpload,
  FaSave,
  FaTimes,
  FaCamera
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { authAPI, bookmarksAPI, caseStudiesAPI, imagesAPI } from '../api/api';
import { InlineLoader, ButtonLoader } from '../components/Loader';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    bookmarks: 0,
    caseStudies: 0,
    uploads: 0
  });

  // Profile form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    institution: '',
    bio: ''
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        institution: user.institution || '',
        bio: user.bio || ''
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [bookmarksRes, caseStudiesRes, uploadsRes] = await Promise.all([
        bookmarksAPI.list(),
        caseStudiesAPI.mySubmissions(),
        imagesAPI.myUploads()
      ]);

      setStats({
        bookmarks: bookmarksRes.data.data?.length || 0,
        caseStudies: caseStudiesRes.data.data?.length || 0,
        uploads: uploadsRes.data.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ bookmarks: 5, caseStudies: 2, uploads: 8 });
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!profileData.name.trim()) newErrors.name = 'Name is required';
    if (!profileData.institution.trim()) newErrors.institution = 'Institution is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const result = await updateProfile({
        name: profileData.name,
        institution: profileData.institution,
        bio: profileData.bio
      });

      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      institution: user?.institution || '',
      bio: user?.bio || ''
    });
    setErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            {/* User Card */}
            <div className="profile-user-card">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button className="avatar-edit-btn" title="Change avatar">
                  <FaCamera />
                </button>
              </div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
              <span className="profile-role badge badge-primary">{user?.role || 'User'}</span>
            </div>

            {/* Stats */}
            <div className="profile-stats-card">
              <div className="profile-stat" onClick={() => navigate('/bookmarks')}>
                <FaBookmark className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats.bookmarks}</span>
                  <span className="stat-label">Bookmarks</span>
                </div>
              </div>
              <div className="profile-stat" onClick={() => navigate('/my-case-studies')}>
                <FaBook className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats.caseStudies}</span>
                  <span className="stat-label">Case Studies</span>
                </div>
              </div>
              <div className="profile-stat" onClick={() => navigate('/my-uploads')}>
                <FaUpload className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats.uploads}</span>
                  <span className="stat-label">Uploads</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="profile-nav">
              <button
                className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser /> Profile Information
              </button>
              <button
                className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <FaKey /> Security
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="profile-main">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="profile-section">
                <div className="section-header">
                  <h3>Profile Information</h3>
                  {!isEditing && (
                    <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                      <FaEdit /> Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            name="name"
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            value={profileData.name}
                            onChange={handleProfileChange}
                          />
                          {errors.name && <span className="form-error">{errors.name}</span>}
                        </>
                      ) : (
                        <p className="form-value">{profileData.name}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <p className="form-value">{profileData.email}</p>
                      <span className="form-hint">Email cannot be changed</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Institution / University</label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="institution"
                          className={`form-input ${errors.institution ? 'error' : ''}`}
                          value={profileData.institution}
                          onChange={handleProfileChange}
                        />
                        {errors.institution && <span className="form-error">{errors.institution}</span>}
                      </>
                    ) : (
                      <p className="form-value">{profileData.institution || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        className="form-textarea"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <p className="form-value">{profileData.bio || 'No bio added'}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Member Since</label>
                    <p className="form-value">
                      <FaCalendar /> {formatDate(user?.created_at)}
                    </p>
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <><ButtonLoader /> Saving...</> : <><FaSave /> Save Changes</>}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="profile-section">
                <div className="section-header">
                  <h3>Change Password</h3>
                </div>

                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                    />
                    {errors.currentPassword && (
                      <span className="form-error">{errors.currentPassword}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className={`form-input ${errors.newPassword ? 'error' : ''}`}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />
                    {errors.newPassword && (
                      <span className="form-error">{errors.newPassword}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                    />
                    {errors.confirmPassword && (
                      <span className="form-error">{errors.confirmPassword}</span>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                      {passwordLoading ? <><ButtonLoader /> Changing...</> : <><FaKey /> Change Password</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;