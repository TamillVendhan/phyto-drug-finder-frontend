import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaBook,
  FaArrowLeft,
  FaUpload,
  FaFile,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { caseStudiesAPI, plantsAPI } from '../api/api';
import { ButtonLoader } from '../components/Loader';
import { toast } from 'react-toastify';

const AddCaseStudy = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // user is now the parsed phyto_user object

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    plant_id: '',
    keywords: '',
    methodology: '',
    results: '',
    conclusion: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [declaration, setDeclaration] = useState(false);

  useEffect(() => {
    fetchPlants();
  }, []);

const fetchPlants = async () => {
  try {
    const response = await plantsAPI.list({ limit: 100 });


    // The plants array is at response.data.data (due to your wrapper)
    const plantArray = Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

    setPlants(plantArray);
  } catch (error) {
    console.error('Error fetching plants:', error);
    toast.error('Failed to load plant filter');
    setPlants([]);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, pdf: 'Only PDF files are allowed' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, pdf: 'File size must be less than 10MB' }));
        return;
      }
      setPdfFile(file);
      setErrors(prev => ({ ...prev, pdf: '' }));
    }
  };

  const removeFile = () => {
    setPdfFile(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    if (!formData.abstract.trim()) {
      newErrors.abstract = 'Abstract is required';
    } else if (formData.abstract.length < 100) {
      newErrors.abstract = 'Abstract must be at least 100 characters';
    }
    if (!formData.plant_id) {
      newErrors.plant_id = 'Please select a related plant';
    }
    if (!pdfFile) {
      newErrors.pdf = 'PDF file is required';
    }
    if (!declaration) {
      newErrors.declaration = 'You must agree to the declaration';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Check authentication FIRST
  if (!user || !user.id) {
    toast.error('You must be logged in to submit');
    navigate('/py/login'); // Use correct route
    return;
  }

  if (!validate()) {
    toast.error('Please fix the errors before submitting');
    return;
  }

  setLoading(true);

  try {
    const submitData = new FormData();

    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] && formData[key].toString().trim()) {
        submitData.append(key, formData[key].toString().trim());
      }
    });

    // Append PDF file
    if (pdfFile) {
      submitData.append('pdf_file', pdfFile);
    }

    // ✅ Use user.id directly from context (already available)
    submitData.append('author_name', user.name || 'Unknown');
    submitData.append('institution', user.institution || '');
    submitData.append('user_id', user.id);

    console.log('📤 Submitting case study...');
    console.log('👤 User:', user.name, 'ID:', user.id);
    console.log('📄 PDF file:', pdfFile?.name);

    const response = await caseStudiesAPI.submit(submitData);

    if (response.success) {
      toast.success('Case study submitted successfully! Awaiting admin review.');
      navigate('/py/case-studies'); // Use correct route
    } else {
      toast.error(response.message || 'Submission failed');
    }
  } catch (error) {
    console.error('❌ Submission error:', error);

    if (error.status === 401) {
      toast.error('Session expired. Please login again.');
      setTimeout(() => navigate('/py/login'), 1500);
    } else if (error.status === 413) {
      toast.error('File too large. Maximum size is 10MB.');
    } else if (error.status === 400) {
      toast.error(error.message || 'Invalid form data.');
    } else {
      toast.error(error.message || 'Submission failed. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  // Rest of the JSX remains exactly the same
  return (
    <div className="add-case-study-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <Link to="/case-studies" className="back-link">
            <FaArrowLeft /> Back to Case Studies
          </Link>
          <div className="header-content">
            <h1><FaBook /> Submit Case Study</h1>
            <p>Share your research with the community</p>
          </div>
        </div>
        {/* Info Box */}
        <div className="info-box">
          <FaExclamationTriangle />
          <div>
            <strong>Submission Guidelines:</strong>
            <ul>
              <li>All submissions are reviewed by admin before publishing</li>
              <li>Only original work is accepted</li>
              <li>PDF should be well-formatted and readable</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="case-study-form card">
          <div className="card-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label required">Title</label>
              <input
                type="text"
                name="title"
                className={`form-input ${errors.title ? 'error' : ''}`}
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter the title of your case study"
                disabled={loading}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>
            {/* Plant Selection */}
            <div className="form-group">
              <label className="form-label required">Related Plant</label>
              <select
                name="plant_id"
                className={`form-select ${errors.plant_id ? 'error' : ''}`}
                value={formData.plant_id}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select a plant</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>{plant.common_name}</option>
                ))}
              </select>
              {errors.plant_id && <span className="form-error">{errors.plant_id}</span>}
            </div>
            {/* Abstract */}
            <div className="form-group">
              <label className="form-label required">Abstract</label>
              <textarea
                name="abstract"
                className={`form-textarea ${errors.abstract ? 'error' : ''}`}
                value={formData.abstract}
                onChange={handleChange}
                placeholder="Provide a brief summary of your research (minimum 100 characters)"
                rows={5}
                disabled={loading}
              />
              <div className="form-hint">
                {formData.abstract.length}/100 characters minimum
              </div>
              {errors.abstract && <span className="form-error">{errors.abstract}</span>}
            </div>
            {/* Keywords */}
            <div className="form-group">
              <label className="form-label">Keywords</label>
              <input
                type="text"
                name="keywords"
                className="form-input"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g., antimicrobial, neem, phytochemistry (comma-separated)"
                disabled={loading}
              />
            </div>
            {/* Methodology */}
            <div className="form-group">
              <label className="form-label">Methodology (Optional)</label>
              <textarea
                name="methodology"
                className="form-textarea"
                value={formData.methodology}
                onChange={handleChange}
                placeholder="Briefly describe your research methodology"
                rows={3}
                disabled={loading}
              />
            </div>
            {/* Results */}
            <div className="form-group">
              <label className="form-label">Key Results (Optional)</label>
              <textarea
                name="results"
                className="form-textarea"
                value={formData.results}
                onChange={handleChange}
                placeholder="Summarize your key findings"
                rows={3}
                disabled={loading}
              />
            </div>
            {/* Conclusion */}
            <div className="form-group">
              <label className="form-label">Conclusion (Optional)</label>
              <textarea
                name="conclusion"
                className="form-textarea"
                value={formData.conclusion}
                onChange={handleChange}
                placeholder="State your conclusions"
                rows={3}
                disabled={loading}
              />
            </div>
            {/* PDF Upload */}
            <div className="form-group">
              <label className="form-label required">Upload PDF</label>
              {!pdfFile ? (
                <div className={`file-upload-area ${errors.pdf ? 'error' : ''}`}>
                  <input
                    type="file"
                    id="pdf-upload"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={loading}
                  />
                  <label htmlFor="pdf-upload" className="file-upload-label">
                    <FaUpload className="upload-icon" />
                    <span className="upload-text">Click to upload PDF</span>
                    <span className="upload-hint">Max file size: 10MB</span>
                  </label>
                </div>
              ) : (
                <div className="file-preview">
                  <FaFile className="file-icon" />
                  <div className="file-info">
                    <span className="file-name">{pdfFile.name}</span>
                    <span className="file-size">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    className="file-remove"
                    onClick={removeFile}
                    disabled={loading}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              {errors.pdf && <span className="form-error">{errors.pdf}</span>}
            </div>
            {/* Declaration */}
            <div className="form-group">
              <label className={`declaration-checkbox ${errors.declaration ? 'error' : ''}`}>
                <input
                  type="checkbox"
                  checked={declaration}
                  onChange={(e) => {
                    setDeclaration(e.target.checked);
                    if (errors.declaration) {
                      setErrors(prev => ({ ...prev, declaration: '' }));
                    }
                  }}
                  disabled={loading}
                />
                <span>
                  I declare that this is my original work and I have the right to submit it.
                  I understand that the submission will be reviewed before publishing.
                </span>
              </label>
              {errors.declaration && <span className="form-error">{errors.declaration}</span>}
            </div>
            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <><ButtonLoader /> Submitting...</>
                ) : (
                  <><FaCheck /> Submit Case Study</>
                )}
              </button>
              <Link to="/case-studies" className="btn btn-secondary btn-lg">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCaseStudy;