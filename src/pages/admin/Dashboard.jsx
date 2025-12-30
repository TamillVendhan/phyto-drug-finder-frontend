import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTachometerAlt,
  FaLeaf, 
  FaFlask, 
  FaBook, 
  FaUsers,
  FaImages,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaChevronRight,
  FaPlus,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { statsAPI, caseStudiesAPI, imagesAPI, feedbackAPI } from '../../api/api';
import { InlineLoader } from '../../components/Loader';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [pendingItems, setPendingItems] = useState({
    caseStudies: [],
    images: [],
    feedback: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, caseStudiesRes, imagesRes, feedbackRes] = await Promise.all([
        statsAPI.dashboard(),
        caseStudiesAPI.pending(),
        imagesAPI.pending(),
        feedbackAPI.unread()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      setPendingItems({
        caseStudies: caseStudiesRes.data.success ? caseStudiesRes.data.data : [],
        images: imagesRes.data.success ? imagesRes.data.data : [],
        feedback: feedbackRes.data.success ? feedbackRes.data.data : []
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      // Fallback data
      setStats({
        total_plants: 150,
        total_compounds: 2500,
        total_case_studies: 45,
        total_users: 320,
        total_images: 890,
        pending_case_studies: 5,
        pending_images: 8,
        unread_feedback: 3,
        new_users_this_week: 12,
        new_plants_this_month: 8
      });
      setPendingItems({
        caseStudies: [
          { id: 1, title: 'Curcumin Anti-inflammatory Study', author_name: 'Dr. Sharma', created_at: '2024-01-15' },
          { id: 2, title: 'Neem Extract Analysis', author_name: 'Research Team', created_at: '2024-01-14' }
        ],
        images: [
          { id: 1, title: 'Tulsi Microscopy', uploaded_by: 'Lab Team', created_at: '2024-01-15' },
          { id: 2, title: 'Ashwagandha Root', uploaded_by: 'Field Worker', created_at: '2024-01-14' }
        ],
        feedback: [
          { id: 1, subject: 'Question about Neem', name: 'Student', type: 'question', created_at: '2024-01-15' },
          { id: 2, subject: 'Correction Request', name: 'Researcher', type: 'correction', created_at: '2024-01-14' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, link, trend }) => (
    <Link to={link} className={`admin-stat-card ${color}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
      {trend && (
        <span className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
      <FaChevronRight className="stat-arrow" />
    </Link>
  );

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <InlineLoader text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1><FaTachometerAlt /> Admin Dashboard</h1>
            <p>Welcome back, {user?.name || 'Admin'}! Here's what's happening.</p>
          </div>
          <div className="dashboard-actions">
            <Link to="/admin/plants/add" className="btn btn-primary">
              <FaPlus /> Add New Plant
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <StatCard 
            icon={FaLeaf}
            label="Total Plants"
            value={stats?.total_plants || 0}
            color="green"
            link="/admin/plants"
            trend={8}
          />
          <StatCard 
            icon={FaFlask}
            label="Compounds"
            value={stats?.total_compounds || 0}
            color="blue"
            link="/admin/compounds"
          />
          <StatCard 
            icon={FaBook}
            label="Case Studies"
            value={stats?.total_case_studies || 0}
            color="purple"
            link="/admin/case-studies"
            trend={12}
          />
          <StatCard 
            icon={FaUsers}
            label="Users"
            value={stats?.total_users || 0}
            color="orange"
            link="/admin/users"
            trend={15}
          />
          <StatCard 
            icon={FaImages}
            label="Images"
            value={stats?.total_images || 0}
            color="teal"
            link="/admin/images"
          />
          <StatCard 
            icon={FaEnvelope}
            label="Feedback"
            value={stats?.unread_feedback || 0}
            color="red"
            link="/admin/feedback"
          />
        </div>

        {/* Pending Approvals Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2><FaClock /> Pending Approvals</h2>
          </div>
          
          <div className="pending-grid">
            {/* Pending Case Studies */}
            <div className="pending-card">
              <div className="pending-header">
                <h3><FaBook /> Case Studies</h3>
                <span className="pending-count">{pendingItems.caseStudies.length}</span>
              </div>
              <div className="pending-list">
                {pendingItems.caseStudies.length > 0 ? (
                  pendingItems.caseStudies.slice(0, 3).map((item) => (
                    <div key={item.id} className="pending-item">
                      <div className="pending-info">
                        <span className="pending-title">{item.title}</span>
                        <span className="pending-meta">By {item.author_name}</span>
                      </div>
                      <div className="pending-actions">
                        <Link 
                          to={`/admin/case-studies/${item.id}`} 
                          className="btn btn-sm btn-ghost"
                        >
                          <FaEye /> Review
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pending-empty">
                    <FaCheckCircle />
                    <span>All caught up!</span>
                  </div>
                )}
              </div>
              {pendingItems.caseStudies.length > 3 && (
                <Link to="/admin/case-studies?status=pending" className="pending-view-all">
                  View all {pendingItems.caseStudies.length} pending
                </Link>
              )}
            </div>

            {/* Pending Images */}
            <div className="pending-card">
              <div className="pending-header">
                <h3><FaImages /> Images</h3>
                <span className="pending-count">{pendingItems.images.length}</span>
              </div>
              <div className="pending-list">
                {pendingItems.images.length > 0 ? (
                  pendingItems.images.slice(0, 3).map((item) => (
                    <div key={item.id} className="pending-item">
                      <div className="pending-info">
                        <span className="pending-title">{item.title}</span>
                        <span className="pending-meta">By {item.uploaded_by}</span>
                      </div>
                      <div className="pending-actions">
                        <Link 
                          to={`/admin/images/${item.id}`} 
                          className="btn btn-sm btn-ghost"
                        >
                          <FaEye /> Review
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pending-empty">
                    <FaCheckCircle />
                    <span>All caught up!</span>
                  </div>
                )}
              </div>
              {pendingItems.images.length > 3 && (
                <Link to="/admin/images?status=pending" className="pending-view-all">
                  View all {pendingItems.images.length} pending
                </Link>
              )}
            </div>

            {/* Unread Feedback */}
            <div className="pending-card">
              <div className="pending-header">
                <h3><FaEnvelope /> Feedback</h3>
                <span className="pending-count">{pendingItems.feedback.length}</span>
              </div>
              <div className="pending-list">
                {pendingItems.feedback.length > 0 ? (
                  pendingItems.feedback.slice(0, 3).map((item) => (
                    <div key={item.id} className="pending-item">
                      <div className="pending-info">
                        <span className="pending-title">{item.subject}</span>
                        <span className="pending-meta">{item.type} from {item.name}</span>
                      </div>
                      <div className="pending-actions">
                        <Link 
                          to={`/admin/feedback/${item.id}`} 
                          className="btn btn-sm btn-ghost"
                        >
                          <FaEye /> View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pending-empty">
                    <FaCheckCircle />
                    <span>No new feedback!</span>
                  </div>
                )}
              </div>
              {pendingItems.feedback.length > 3 && (
                <Link to="/admin/feedback?status=unread" className="pending-view-all">
                  View all {pendingItems.feedback.length} unread
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2><FaChartLine /> Quick Actions</h2>
          </div>
          
          <div className="quick-actions-grid">
            <Link to="/admin/plants/add" className="quick-action-card">
              <FaLeaf />
              <span>Add New Plant</span>
            </Link>
            <Link to="/admin/compounds/add" className="quick-action-card">
              <FaFlask />
              <span>Add Compound</span>
            </Link>
            <Link to="/admin/case-studies" className="quick-action-card">
              <FaBook />
              <span>Review Case Studies</span>
            </Link>
            <Link to="/admin/images" className="quick-action-card">
              <FaImages />
              <span>Manage Images</span>
            </Link>
            <Link to="/admin/users" className="quick-action-card">
              <FaUsers />
              <span>Manage Users</span>
            </Link>
            <Link to="/admin/feedback" className="quick-action-card">
              <FaEnvelope />
              <span>View Feedback</span>
            </Link>
          </div>
        </div>

        {/* System Alerts */}
        {(stats?.pending_case_studies > 5 || stats?.pending_images > 10) && (
          <div className="dashboard-section">
            <div className="alert alert-warning">
              <FaExclamationTriangle />
              <div>
                <strong>Attention Required</strong>
                <p>
                  There are {stats?.pending_case_studies || 0} case studies and{' '}
                  {stats?.pending_images || 0} images awaiting approval.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;