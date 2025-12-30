import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaLeaf, 
  FaUser,
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaArrowRight,
  FaExclamationCircle,
  FaCheck,
  FaUniversity
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { ButtonLoader } from '../components/Loader';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        institution: formData.institution
      });
      
      if (result.success) {
        navigate('/login', { 
          state: { message: 'Registration successful! Please login.' }
        });
      } else {
        setErrors({ general: result.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="auth-branding-content">
            <Link to="/" className="auth-logo">
              <div className="auth-logo-icon">
                <FaLeaf />
              </div>
              <div className="auth-logo-text">
                <span className="logo-title">Phyto Drug</span>
                <span className="logo-subtitle">Finder</span>
              </div>
            </Link>
            
            <h1>Join Our Community</h1>
            <p>
              Create an account to contribute to the world's largest 
              medicinal plant database and connect with researchers worldwide.
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-check">✓</span>
                <span>Free forever for researchers</span>
              </div>
              <div className="auth-feature">
                <span className="feature-check">✓</span>
                <span>Submit unlimited case studies</span>
              </div>
              <div className="auth-feature">
                <span className="feature-check">✓</span>
                <span>Get published with proper credits</span>
              </div>
              <div className="auth-feature">
                <span className="feature-check">✓</span>
                <span>Access exclusive research data</span>
              </div>
            </div>
          </div>
          
          <div className="auth-branding-footer">
            <p>Already have an account?</p>
            <Link to="/login" className="btn btn-outline">
              Sign In <FaArrowRight />
            </Link>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="auth-error-banner">
                <FaExclamationCircle />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Full Name Field */}
              <div className="form-group">
                <label className="form-label required" htmlFor="name">
                  Full Name
                </label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <span className="form-error">{errors.name}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label required" htmlFor="email">
                  Email Address
                </label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="form-error">{errors.email}</span>
                )}
              </div>

              {/* Institution Field (Optional) */}
              <div className="form-group">
                <label className="form-label" htmlFor="institution">
                  Institution / University (Optional)
                </label>
                <div className="input-with-icon">
                  <FaUniversity className="input-icon" />
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Your institution name"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label required" htmlFor="password">
                  Password
                </label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="form-error">{errors.password}</span>
                )}
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className={`strength-bar ${i < passwordStrength ? 'active' : ''}`}
                          style={{ 
                            backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : '' 
                          }}
                        ></div>
                      ))}
                    </div>
                    <span 
                      className="strength-label"
                      style={{ color: strengthColors[passwordStrength - 1] }}
                    >
                      {strengthLabels[passwordStrength - 1] || 'Too Short'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label className="form-label required" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <FaCheck className="input-success-icon" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <span className="form-error">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="form-group">
                <label className={`checkbox-label ${errors.agreeTerms ? 'error' : ''}`}>
                  <input 
                    type="checkbox" 
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" target="_blank">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" target="_blank">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <span className="form-error">{errors.agreeTerms}</span>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary btn-block btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <ButtonLoader /> Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Mobile Login Link */}
            <div className="auth-mobile-link">
              <p>
                Already have an account?{' '}
                <Link to="/login">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;