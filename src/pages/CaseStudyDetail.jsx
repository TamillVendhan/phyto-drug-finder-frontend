import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { caseStudiesAPI } from '../api/api';
import { InlineLoader } from '../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaDownload, FaUser, FaCalendar, FaBook } from 'react-icons/fa';

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
      
      if (response.success) {
        setStudy(response.data);
      } else {
        toast.error(response.message || 'Case study not found');
      }
    } catch (err) {
      toast.error('Failed to load case study');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <InlineLoader text="Loading case study..." />;
  }

  if (!study) {
    return (
      <div className="container">
        <div className="not-found">
          <h2>Case Study Not Found</h2>
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
        <Link to="/case-studies" className="back-link">
          <FaArrowLeft /> Back to Case Studies
        </Link>

        <div className="case-study-header">
          <h1>{study.title}</h1>
          <div className="case-study-meta">
            <span><FaUser /> {study.author_name}</span>
            <span><FaCalendar /> {new Date(study.created_at).toLocaleDateString()}</span>
            {study.plant_name && <span><FaBook /> {study.plant_name}</span>}
          </div>
        </div>

        <div className="case-study-content">
          <div className="abstract-section">
            <h2>Abstract</h2>
            <p>{study.abstract}</p>
          </div>

          <div className="pdf-section">
            <h2>Full Document</h2>
            <div className="pdf-viewer">
              {study.pdf_url ? (
                <iframe
                  src={study.pdf_url}
                  title="Case Study PDF"
                  width="100%"
                  height="800px"
                  style={{ border: 'none' }}
                />
              ) : (
                <p>No PDF available</p>
              )}
            </div>
            {study.original_filename && (
              <a href={study.pdf_url} className="btn btn-primary" download>
                <FaDownload /> Download PDF
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyDetail;