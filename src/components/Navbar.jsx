import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaLeaf, 
  FaSearch, 
  FaUser, 
  FaBars, 
  FaTimes,
  FaChevronDown,
  FaBookmark,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt,
  FaImages,
  FaBook,
  FaEnvelope,
  FaHome
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [location]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/plants', label: 'Plants', icon: FaLeaf },
    { path: '/case-studies', label: 'Case Studies', icon: FaBook },
    { path: '/gallery', label: 'Gallery', icon: FaImages },
    { path: '/feedback', label: 'Feedback', icon: FaEnvelope },
  ];

  return (
    <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <FaLeaf />
          </div>
          <div className="logo-text">
            <span className="logo-title">Phyto Drug</span>
            <span className="logo-subtitle">Finder</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <link.icon className="nav-icon" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search plants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        {/* User Section */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                <FaChevronDown className={`chevron ${isUserDropdownOpen ? 'rotate' : ''}`} />
              </button>

              {isUserDropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-name">{user?.name}</span>
                      <span className="dropdown-email">{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <div className="dropdown-menu">
                    {isAdmin() && (
                      <Link to="/admin/dashboard" className="dropdown-item">
                        <FaTachometerAlt />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link to="/profile" className="dropdown-item">
                      <FaUser />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/bookmarks" className="dropdown-item">
                      <FaBookmark />
                      <span>Bookmarks</span>
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <FaCog />
                      <span>Settings</span>
                    </Link>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        {/* Mobile Search */}
        <form className="mobile-search" onSubmit={handleSearch}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search plants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Mobile Nav Links */}
        <nav className="mobile-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
              }
            >
              <link.icon />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile Auth */}
        {!isAuthenticated && (
          <div className="mobile-auth">
            <Link to="/login" className="btn btn-outline btn-block">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-block">
              Register
            </Link>
          </div>
        )}

        {/* Mobile User Menu */}
        {isAuthenticated && (
          <div className="mobile-user-section">
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="mobile-user-name">{user?.name}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
            </div>
            <div className="mobile-user-links">
              {isAdmin() && (
                <Link to="/admin/dashboard" className="mobile-nav-link">
                  <FaTachometerAlt />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <Link to="/profile" className="mobile-nav-link">
                <FaUser />
                <span>My Profile</span>
              </Link>
              <Link to="/bookmarks" className="mobile-nav-link">
                <FaBookmark />
                <span>Bookmarks</span>
              </Link>
              <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Navbar;