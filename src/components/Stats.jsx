import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLeaf, 
  FaFlask, 
  FaBook, 
  FaUsers,
  FaImages,
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { statsAPI } from '../api/api';
import CountUp from 'react-countup';

// Simple CountUp component if you don't want to install the package
const SimpleCountUp = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  suffix = '',
  trend,
  trendValue,
  color = 'primary',
  link 
}) => {
  const colorClasses = {
    primary: 'stat-card-primary',
    success: 'stat-card-success',
    warning: 'stat-card-warning',
    info: 'stat-card-info',
    purple: 'stat-card-purple',
  };

  const content = (
    <div className={`stat-card ${colorClasses[color]}`}>
      <div className="stat-card-icon">
        <Icon />
      </div>
      <div className="stat-card-content">
        <span className="stat-card-value">
          <SimpleCountUp end={value} suffix={suffix} />
        </span>
        <span className="stat-card-label">{label}</span>
      </div>
      {trend && (
        <div className={`stat-card-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
          {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
          <span>{trendValue}%</span>
        </div>
      )}
    </div>
  );

  if (link) {
    return <Link to={link} className="stat-card-link">{content}</Link>;
  }

  return content;
};

// Main Stats Component
const Stats = ({ variant = 'home' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [variant]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = variant === 'home' 
        ? await statsAPI.home()
        : await statsAPI.dashboard();
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      console.error('Stats error:', err);
      // Use fallback data for development
      setStats({
        total_plants: 150,
        total_compounds: 2500,
        total_case_studies: 45,
        total_users: 320,
        total_images: 890,
        pending_case_studies: 12,
        pending_images: 8,
        unread_feedback: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  // Home Page Stats
  if (variant === 'home') {
    if (loading) {
      return (
        <div className="stats-section">
          <div className="stats-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card stat-card-skeleton">
                <div className="skeleton-icon"></div>
                <div className="skeleton-content">
                  <div className="skeleton-value"></div>
                  <div className="skeleton-label"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }


  }

  // Dashboard Stats
  if (variant === 'dashboard') {
    if (loading) {
      return <div className="stats-loading">Loading dashboard stats...</div>;
    }

    return (
      <div className="dashboard-stats">
        <div className="stats-grid stats-grid-dashboard">
          <StatCard 
            icon={FaLeaf}
            label="Total Plants"
            value={stats?.total_plants || 0}
            color="primary"
            trend="up"
            trendValue={12}
          />
          <StatCard 
            icon={FaFlask}
            label="Compounds"
            value={stats?.total_compounds || 0}
            color="info"
            trend="up"
            trendValue={8}
          />
          <StatCard 
            icon={FaBook}
            label="Case Studies"
            value={stats?.total_case_studies || 0}
            suffix=""
            color="success"
          />
          <StatCard 
            icon={FaUsers}
            label="Registered Users"
            value={stats?.total_users || 0}
            color="purple"
            trend="up"
            trendValue={15}
          />
        </div>

        {/* Pending Items */}
        <div className="pending-stats">
          <h3>Pending Approvals</h3>
          <div className="pending-grid">
            <div className="pending-item">
              <span className="pending-count">{stats?.pending_case_studies || 0}</span>
              <span className="pending-label">Case Studies</span>
            </div>
            <div className="pending-item">
              <span className="pending-count">{stats?.pending_images || 0}</span>
              <span className="pending-label">Images</span>
            </div>
            <div className="pending-item">
              <span className="pending-count">{stats?.unread_feedback || 0}</span>
              <span className="pending-label">Feedback</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Mini Stats for inline use
export const MiniStats = ({ plants, compounds, caseStudies }) => {
  return (
    <div className="mini-stats">
      <div className="mini-stat">
        <FaLeaf className="mini-stat-icon" />
        <span className="mini-stat-value">{plants}</span>
        <span className="mini-stat-label">Plants</span>
      </div>
      <div className="mini-stat">
        <FaFlask className="mini-stat-icon" />
        <span className="mini-stat-value">{compounds}</span>
        <span className="mini-stat-label">Compounds</span>
      </div>
      <div className="mini-stat">
        <FaBook className="mini-stat-icon" />
        <span className="mini-stat-value">{caseStudies}</span>
        <span className="mini-stat-label">Studies</span>
      </div>
    </div>
  );
};

export default Stats;