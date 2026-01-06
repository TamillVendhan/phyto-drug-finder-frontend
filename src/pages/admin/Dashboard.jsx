import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTachometerAlt, FaLeaf, FaFlask, FaBook, FaUsers, FaImages, 
  FaEnvelope, FaClock, FaCheckCircle, FaEye, FaChevronRight, 
  FaPlus, FaChartLine, FaExclamationTriangle 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { statsAPI, caseStudiesAPI, imagesAPI, feedbackAPI } from '../../api/api';
import { InlineLoader } from '../../components/Loader';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({});
  const [pendingCaseStudies, setPendingCaseStudies] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const [unreadFeedback, setUnreadFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(false);

      const [statsRes, casesRes, imagesRes, feedbackRes] = await Promise.all([
        statsAPI.dashboard(),
        caseStudiesAPI.pending(),
        imagesAPI.pending(),
        feedbackAPI.unread()
      ]);

      if (statsRes.success) {
        setStats(statsRes.data || {});
      }

      setPendingCaseStudies(casesRes.success ? casesRes.data || [] : []);
      setPendingImages(imagesRes.success ? imagesRes.data || [] : []);
      setUnreadFeedback(feedbackRes.success ? feedbackRes.data || [] : []);

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(true);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, link }) => (
    <Link to={link || '#'} className={`admin-stat-card ${color}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <span className="stat-value">{value ?? 0}</span>
        <span className="stat-label">{label}</span>
      </div>
      <FaChevronRight className="stat-arrow" />
    </Link>
  );

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <InlineLoader text="Loading admin dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="alert alert-danger">
            <FaExclamationTriangle />
            <strong>Connection Error</strong>
            <p>Failed to load dashboard. Please check your connection and refresh.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1><FaTachometerAlt /> Admin Dashboard</h1>
            <p>Welcome back, {user?.name || 'Admin'}! Here's what's happening today.</p>
          </div>
          <div className="dashboard-actions">
            <Link to="/admin/plants/add" className="btn btn-primary">
              <FaPlus /> Add New Plant
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <StatCard icon={FaLeaf} label="Total Plants" value={stats.total_plants} color="green" link="/admin/plants" />
          <StatCard icon={FaFlask} label="Total Compounds" value={stats.total_compounds} color="blue" link="/admin/compounds" />
          <StatCard icon={FaBook} label="Total Case Studies" value={stats.total_case_studies} color="purple" link="/admin/case-studies" />
          <StatCard icon={FaUsers} label="Total Users" value={stats.total_users} color="orange" link="/admin/users" />
          <StatCard icon={FaImages} label="Total Images" value={stats.total_images} color="teal" link="/admin/images" />
          <StatCard icon={FaEnvelope} label="Unread Feedback" value={unreadFeedback.length} color="red" link="/admin/feedback" />
        </div>

        {/* Pending Approvals */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2><FaClock /> Pending for Review</h2>
          </div>

          <div className="pending-grid">
            {/* Pending Case Studies */}
            <div className="pending-card">
              <div className="pending-header">
                <h3><FaBook /> Case Studies ({pendingCaseStudies.length})</h3>
              </div>
              <div className="pending-list">
                {pendingCaseStudies.length > 0 ? (
                  pendingCaseStudies.slice(0, 4).map(study => (
                    <div key={study.id} className="pending-item">
                      <div className="pending-info">
                        <div className="pending-title">{study.title}</div>
                        <div className="pending-meta">
                          by {study.author_name} • {study.created_at_formatted || new Date(study.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Link to={`/admin/case-studies/review/${study.id}`} className="btn btn-sm btn-primary">
                        <FaEye /> Review
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="pending-empty">
                    <FaCheckCircle /> All caught up!
                  </div>
                )}
              </div>
            </div>

            {/* Pending Images */}
            <div className="pending-card">
              <div className="pending-header">
                <h3><FaImages /> Images ({pendingImages.length})</h3>
              </div>
              <div className="pending-list">
                {pendingImages.length > 0 ? (
                  pendingImages.slice(0, 4).map(img => (
                    <div key={img.id} className="pending-item">
                      <div className="pending-info">
                        <div className="pending-title">{img.caption || img.original_filename || 'Untitled'}</div>
                        <div className="pending-meta">
                          {img.plant_name ? `for ${img.plant_name}` : ''} • by {img.uploader_name || 'User'}
                        </div>
                      </div>
                      <Link to={`/admin/images/review/${img.id}`} className="btn btn-sm btn-primary">
                        <FaEye /> Review
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="pending-empty">
                    <FaCheckCircle /> All caught up!
                  </div>
                )}
              </div>
            </div>

            {/* Unread Feedback */}
            <div className="pending-card">
              <div className="pending-header">
                <h3><FaEnvelope /> Unread Feedback ({unreadFeedback.length})</h3>
              </div>
              <div className="pending-list">
                {unreadFeedback.length > 0 ? (
                  unreadFeedback.slice(0, 4).map(fb => (
                    <div key={fb.id} className="pending-item">
                      <div className="pending-info">
                        <div className="pending-title">{fb.subject_preview || 'No subject'}</div>
                        <div className="pending-meta">
                          {fb.type_label} • from {fb.name || fb.email}
                        </div>
                      </div>
                      <Link to={`/admin/feedback/${fb.id}`} className="btn btn-sm btn-primary">
                        <FaEye /> View
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="pending-empty">
                    <FaCheckCircle /> No new messages
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2><FaChartLine /> Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            <Link to="/admin/plants/add" className="quick-action-card"><FaLeaf /><span>Add Plant</span></Link>
            <Link to="/admin/compounds/add" className="quick-action-card"><FaFlask /><span>Add Compound</span></Link>
            <Link to="/admin/case-studies?status=pending" className="quick-action-card"><FaBook /><span>Review Cases</span></Link>
            <Link to="/admin/images?status=pending" className="quick-action-card"><FaImages /><span>Review Images</span></Link>
            <Link to="/admin/users" className="quick-action-card"><FaUsers /><span>Manage Users</span></Link>
            <Link to="/admin/feedback" className="quick-action-card"><FaEnvelope /><span>Feedback</span></Link>
          </div>
        </div>

        {/* Alert for high pending */}
        {(pendingCaseStudies.length > 3 || pendingImages.length > 5) && (
          <div className="alert alert-warning">
            <FaExclamationTriangle />
            <strong>Action Needed:</strong> {pendingCaseStudies.length} case studies and {pendingImages.length} images awaiting review.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;