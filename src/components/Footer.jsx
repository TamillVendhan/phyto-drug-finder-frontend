import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLeaf, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart,
  FaArrowUp
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/plants', label: 'Browse Plants' },
    { path: '/case-studies', label: 'Case Studies' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/feedback', label: 'Contact Us' },
  ];

  const resourceLinks = [
    { path: '/about', label: 'About Project' },
    { path: '/methodology', label: 'Methodology' },
    { path: '/references', label: 'References' },
    { path: '/faq', label: 'FAQ' },
    { path: '/privacy', label: 'Privacy Policy' },
  ];

  const plantCategories = [
    { path: '/plants?family=Fabaceae', label: 'Fabaceae' },
    { path: '/plants?family=Lamiaceae', label: 'Lamiaceae' },
    { path: '/plants?family=Asteraceae', label: 'Asteraceae' },
    { path: '/plants?family=Apiaceae', label: 'Apiaceae' },
    { path: '/plants?family=Solanaceae', label: 'Solanaceae' },
  ];

  return (
    <footer className="footer">
      {/* Scroll to Top Button */}
      <button className="scroll-to-top" onClick={scrollToTop} aria-label="Scroll to top">
        <FaArrowUp />
      </button>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="footer-logo-icon">
                  <FaLeaf />
                </div>
                <div className="footer-logo-text">
                  <span className="footer-logo-title">Phyto Drug</span>
                  <span className="footer-logo-subtitle">Finder</span>
                </div>
              </Link>
              <p className="footer-description">
                A comprehensive database of medicinal plants, bioactive compounds, 
                and phytochemical research. Bridging traditional knowledge with 
                modern drug discovery.
              </p>
              <div className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                  <FaFacebookF />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                  <FaLinkedinIn />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                  <FaGithub />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-links">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-menu">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plant Families */}
            <div className="footer-links">
              <h4 className="footer-heading">Plant Families</h4>
              <ul className="footer-menu">
                {plantCategories.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-links">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-menu">
                {resourceLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-contact">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="contact-list">
                <li>
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>Department of Bioinformatics<br />University Name, City</span>
                </li>
                <li>
                  <FaEnvelope className="contact-icon" />
                  <a href="mailto:info@phytodrugfinder.com">info@phytodrugfinder.com</a>
                </li>
                <li>
                  <FaPhone className="contact-icon" />
                  <a href="tel:+911234567890">+91 12345 67890</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Phyto Drug Finder. All rights reserved.
            </p>
            <p className="made-with">
              Made with <FaHeart className="heart-icon" /> for MSc Bioinformatics Project
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="footer-disclaimer">
        <div className="container">
          <p>
            <strong>Disclaimer:</strong> The information provided on this website is for 
            educational and research purposes only. It is not intended as medical advice. 
            Always consult a healthcare professional before using any medicinal plants.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;