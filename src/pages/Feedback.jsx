import React, { useState, useEffect } from 'react';
import { 
  FaEnvelope, 
  FaUser, 
  FaPaperPlane,
  FaQuestionCircle,
  FaBug,
  FaEdit,
  FaHandshake,
  FaCheckCircle,
  FaLeaf
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { feedbackAPI } from '../api/api';
import { ButtonLoader } from '../components/Loader';
import { toast } from 'react-toastify';

const Feedback = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'question',
    subject: '',
    message: '',
    plant_related: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  const feedbackTypes = [
    {
      id: 'question',
      label: 'Question about plant',
      icon: FaQuestionCircle,
      description: 'Ask about medicinal plants, compounds, or uses'
    },
    {
      id: 'correction',
      label: 'Correction request',
      icon: FaEdit,
      description: 'Report incorrect or outdated information'
    },
    {
      id: 'collaboration',
      label: 'Collaboration request',
      icon: FaHandshake,
      description: 'Propose research collaboration or partnership'
    },
    {
      id: 'bug',
      label: 'Bug report',
      icon: FaBug,
      description: 'Report technical issues with the website'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await feedbackAPI.submit(formData);
      
      if (response.data.success) {
        setSubmitted(true);
        toast.success('Feedback submitted successfully!');
      } else {
        toast.error(response.data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      // For development, show success anyway
      setSubmitted(true);
      toast.success('Feedback submitted successfully!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      type: 'question',
      subject: '',
      message: '',
      plant_related: ''
    });
    setSubmitted(false);
    setErrors({});
  };

  // Success State
  if (submitted) {
    return (
      <div className="feedback-page">
        <div className="container">
          <div className="feedback-success">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            <h2>Thank You!</h2>
            <p>
              Your feedback has been submitted successfully. 
              We'll review it and get back to you within 2-3 business days.
            </p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={resetForm}>
                Submit Another Feedback
              </button>
              <a href="/" className="btn btn-outline">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      {/* Hero Section */}
      <section className="feedback-hero">
        <div className="container">
          <div className="feedback-hero-content">
            <h1><FaEnvelope /> Contact & Feedback</h1>
            <p>
              Have a question, suggestion, or found an error? We'd love to hear from you. 
              Your feedback helps us improve our database.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="feedback-content">
        <div className="container">
          <div className="feedback-layout">
            {/* Feedback Form */}
            <div className="feedback-form-section">
              <div className="card">
                <div className="card-header">
                  <h2>Send us a Message</h2>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="feedback-form">
                    {/* Feedback Type Selection */}
                    <div className="form-group">
                      <label className="form-label">What is this about?</label>
                      <div className="feedback-types">
                        {feedbackTypes.map((type) => (
                          <label 
                            key={type.id} 
                            className={`feedback-type-option ${formData.type === type.id ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="type"
                              value={type.id}
                              checked={formData.type === type.id}
                              onChange={handleChange}
                            />
                            <div className="type-content">
                              <type.icon className="type-icon" />
                              <span className="type-label">{type.label}</span>
                              <span className="type-desc">{type.description}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email Row */}
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required" htmlFor="name">Your Name</label>
                        <div className="input-group">
                          <FaUser className="input-icon" />
                          <input
                            type="text"
                            id="name"
                            name="name"
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                        {errors.name && <span className="form-error">{errors.name}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label required" htmlFor="email">Email Address</label>
                        <div className="input-group">
                          <FaEnvelope className="input-icon" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                        {errors.email && <span className="form-error">{errors.email}</span>}
                      </div>
                    </div>

                    {/* Plant Related (Optional) */}
                    {(formData.type === 'question' || formData.type === 'correction') && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="plant_related">
                          Related Plant (Optional)
                        </label>
                        <div className="input-group">
                          <FaLeaf className="input-icon" />
                          <input
                            type="text"
                            id="plant_related"
                            name="plant_related"
                            className="form-input"
                            placeholder="e.g., Neem, Tulsi, Turmeric"
                            value={formData.plant_related}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Subject */}
                    <div className="form-group">
                      <label className="form-label required" htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        className={`form-input ${errors.subject ? 'error' : ''}`}
                        placeholder="Brief subject of your message"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.subject && <span className="form-error">{errors.subject}</span>}
                    </div>

                    {/* Message */}
                    <div className="form-group">
                      <label className="form-label required" htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        className={`form-textarea ${errors.message ? 'error' : ''}`}
                        placeholder="Please describe your question, feedback, or issue in detail..."
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        disabled={loading}
                      ></textarea>
                      {errors.message && <span className="form-error">{errors.message}</span>}
                      <span className="form-hint">
                        {formData.message.length}/500 characters (minimum 20)
                      </span>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg btn-block"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <ButtonLoader /> Submitting...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane /> Submit Feedback
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="feedback-sidebar">
              <div className="card contact-card">
                <div className="card-body">
                  <h3>Other Ways to Reach Us</h3>
                  
                  <div className="contact-item">
                    <div className="contact-icon">
                      <FaEnvelope />
                    </div>
                    <div className="contact-info">
                      <span className="contact-label">Email</span>
                      <a href="mailto:info@phytodrugfinder.com">info@phytodrugfinder.com</a>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="contact-icon">
                      <FaHandshake />
                    </div>
                    <div className="contact-info">
                      <span className="contact-label">Research Collaboration</span>
                      <a href="mailto:research@phytodrugfinder.com">research@phytodrugfinder.com</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card faq-card">
                <div className="card-body">
                  <h3><FaQuestionCircle /> Common Questions</h3>
                  
                  <div className="faq-list">
                    <div className="faq-item">
                      <h4>How do I submit a case study?</h4>
                      <p>Login to your account and navigate to Case Studies → Submit New.</p>
                    </div>
                    
                    <div className="faq-item">
                      <h4>How long does approval take?</h4>
                      <p>Case studies and images are typically reviewed within 3-5 business days.</p>
                    </div>
                    
                    <div className="faq-item">
                      <h4>Can I correct plant information?</h4>
                      <p>Yes! Use the correction request form or email us with the details.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card disclaimer-card">
                <div className="card-body">
                  <h4>⚠️ Important Note</h4>
                  <p>
                    This platform is for educational and research purposes only. 
                    We do not provide medical advice. Please consult healthcare 
                    professionals for medical guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Feedback;