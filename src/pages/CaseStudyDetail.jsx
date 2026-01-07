import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaUser, FaUniversity, FaCalendar, FaLeaf, FaEye, FaFilePdf } from 'react-icons/fa';
import { caseStudiesAPI } from '../api/api';
import { InlineLoader } from '../components/Loader';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL || 'https://hcctrichy.ac.in/phyto-drug-finder-main/backend/api/';

const CaseStudyDetail = () => {
  const { id } = useParams();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudy();
  }, [id]);

const fetchStudy = async () => {
  try {
    setLoading(true);
    const response = await caseStudiesAPI.get(id);

    console.log('Raw API Response:', response); // Keep this for debug

    let studyData = null;

    if (response && response.success && response.data) {
      studyData = response.data;
    } else if (response && response.id) {
      // If API returns study object directly
      studyData = response;
    } else {
      throw new Error('Invalid response format');
    }

    setStudy(studyData);
  } catch (error) {
    console.error('Error loading case study:', error);
    toast.error('Case study not found or failed to load');
    setStudy(null);
  } finally {
    setLoading(false);
  }
};

const handleDownload = async () => {
  if (!study?.id) return;

  try {
    
    const response = await caseStudiesAPI.download(study.id);

    if (!response.data || response.data.size === 0) {
      throw new Error('Empty file');
    }

    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = study.original_filename || `case-study-${study.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success('Download successful!');
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Download failed');
  }
};

  if (loading) {
    return (
      <div className="container">
        <InlineLoader text="Loading case study..." />
      </div>
    );
  }

  if (!study) {
    return (
      <div className="container">
        <div className="not-found text-center py-5">
          <FaFilePdf className="empty-icon large" />
          <h2>Case Study Not Found</h2>
          <p>The requested case study could not be loaded.</p>
          <Link to="/case-studies" className="btn btn-primary">
            <FaArrowLeft /> Back to Case Studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="case-study-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/case-studies">Case Studies</Link>
          <span>/</span>
          <span>{study.title}</span>
        </div>

        {/* Header */}
        <div className="study-header">
          <h1>{study.title}</h1>
          
          <div className="study-actions">
            <button onClick={handleDownload} className="btn btn-primary">
              <FaDownload /> Download PDF
            </button>
          </div>
        </div>

        {/* Meta Information */}
        <div className="study-meta-grid">
          <div className="meta-item">
            <FaUser />
            <div>
              <strong>Author</strong>
              <span>{study.author_name || 'Anonymous'}</span>
            </div>
          </div>

          {study.institution && (
            <div className="meta-item">
              <FaUniversity />
              <div>
                <strong>Institution</strong>
                <span>{study.institution}</span>
              </div>
            </div>
          )}

          {study.plant_name && (
            <div className="meta-item">
              <FaLeaf />
              <div>
                <strong>Plant</strong>
                <Link to={`/plant/${study.plant_slug || ''}`}>
                  {study.plant_name} ({study.plant_scientific_name})
                </Link>
              </div>
            </div>
          )}

          <div className="meta-item">
            <FaCalendar />
            <div>
              <strong>Published</strong>
              <span>{new Date(study.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          <div className="meta-item">
            <FaEye />
            <div>
              <strong>Views</strong>
              <span>{study.views || 0}</span>
            </div>
          </div>

          <div className="meta-item">
            <FaDownload />
            <div>
              <strong>Downloads</strong>
              <span>{study.download_count || study.downloads || 0}</span>
            </div>
          </div>
        </div>

        {/* Abstract */}
        <div className="study-section">
          <h2>Abstract</h2>
          <div className="abstract-content">
            <p>{study.abstract || 'No abstract available.'}</p>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="study-section pdf-section">
          <h2>Full Document</h2>
          <div className="pdf-container">
            <iframe
              src={`${API_BASE}case-studies/download.php?id=${study.id}`}
              title={`Case Study - ${study.title}`}
              width="100%"
              height="800px"
              style={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <p>Your browser does not support PDFs. 
                <button onClick={handleDownload} style={{color: 'blue', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer'}}>
                  Download the PDF instead
                </button>.
              </p>
            </iframe>
          </div>
          
          <div className="pdf-note">
            <small>Tip: Use the download button above for offline reading or printing.</small>
          </div>
        </div>

        {/* Back Button */}
        <div className="study-footer">
          <Link to="/case-studies" className="btn btn-outline">
            <FaArrowLeft /> Back to All Case Studies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyDetail;