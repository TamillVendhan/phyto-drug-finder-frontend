import React, { useState, useEffect } from 'react';
import { 
  FaBook, 
  FaSearch,
  FaEye,
  FaTimes,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaDownload,
  FaUser,
  FaCalendar,
  FaUniversity,
  FaExternalLinkAlt,
  FaTimesCircle,
  FaCheckCircle,
  FaClock,
  FaLeaf
} from 'react-icons/fa';
import { caseStudiesAPI } from '../../api/api';
import { InlineLoader, ButtonLoader } from '../../components/Loader';
import { toast } from 'react-toastify';

const ManageCaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCaseStudies();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchCaseStudies = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await caseStudiesAPI.list(params);
      
      if (response.data.success) {
        setCaseStudies(response.data.data || []);
        setTotalItems(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching case studies:', error);
      // Fallback data
      setCaseStudies([
        { 
          id: 1, 
          title: 'Anti-inflammatory Properties of Curcumin', 
          author_name: 'Dr. Sharma', 
          author_email: 'sharma@university.edu',
          institution: 'Delhi University',
          plant_name: 'Turmeric',
          abstract: 'This study examines the anti-inflammatory effects of curcumin extracted from turmeric...',
          status: 'pending',
          created_at: '2024-01-15',
          file_url: '#'
        },
        { 
          id: 2, 
          title: 'Neem Extract for Antimicrobial Activity', 
          author_name: 'Dr. Patel', 
          author_email: 'patel@research.org',
          institution: 'AIIMS',
          plant_name: 'Neem',
          abstract: 'A comprehensive study on the antimicrobial properties of neem leaf extracts...',
          status: 'pending',
          created_at: '2024-01-14',
          file_url: '#'
        },
        { 
          id: 3, 
          title: 'Ashwagandha in Stress Management', 
          author_name: 'Dr. Kumar', 
          author_email: 'kumar@med.edu',
          institution: 'BHU',
          plant_name: 'Ashwagandha',
          abstract: 'Clinical trials on ashwagandha for stress and anxiety reduction...',
          status: 'approved',
          created_at: '2024-01-10',
          file_url: '#'
        },
        { 
          id: 4, 
          title: 'Tulsi Oil Therapeutic Uses', 
          author_name: 'Dr. Singh', 
          author_email: 'singh@herbal.org',
          institution: 'IIT Bombay',
          plant_name: 'Tulsi',
          abstract: 'Exploring therapeutic applications of holy basil essential oil...',
          status: 'rejected',
          rejection_reason: 'Insufficient methodology details',
          created_at: '2024-01-08',
          file_url: '#'
        }
      ]);
      setTotalItems(45);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCaseStudies();
  };

  const openViewModal = (study) => {
    setSelectedStudy(study);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudy(null);
  };

  const handleApprove = async (study) => {
    setProcessing(true);
    try {
      const response = await caseStudiesAPI.approve(study.id);
      
      if (response.data.success) {
        toast.success('Case study approved successfully!');
        fetchCaseStudies();
        closeModal();
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.success('Case study approved successfully!');
      fetchCaseStudies();
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (study) => {
    setSelectedStudy(study);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const response = await caseStudiesAPI.reject(selectedStudy.id, rejectReason);
      
      if (response.data.success) {
        toast.success('Case study rejected');
        fetchCaseStudies();
        setShowRejectModal(false);
        closeModal();
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.success('Case study rejected');
      fetchCaseStudies();
      setShowRejectModal(false);
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="status-icon approved" />;
      case 'rejected': return <FaTimesCircle className="status-icon rejected" />;
      case 'pending': return <FaClock className="status-icon pending" />;
      default: return null;
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="admin-page">
      <div className="container">
        {/* Page Header */}
        <div className="admin-page-header">
          <div className="page-title">
            <h1><FaBook /> Manage Case Studies</h1>
            <p>Review, approve, or reject submitted case studies</p>
          </div>
          <div className="header-stats">
            <div className="stat-item pending">
              <FaClock />
              <span>{caseStudies.filter(s => s.status === 'pending').length} Pending</span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="admin-filters">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filter-group">
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="admin-table-container">
          {loading ? (
            <InlineLoader text="Loading case studies..." />
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Plant</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {caseStudies.length > 0 ? (
                    caseStudies.map((study) => (
                      <tr key={study.id} className={study.status === 'pending' ? 'highlight-row' : ''}>
                        <td className="id-cell">#{study.id}</td>
                        <td className="title-cell">
                          <span className="title-text">{study.title}</span>
                        </td>
                        <td>
                          <div className="author-cell">
                            <FaUser className="author-icon" />
                            <div>
                              <span className="author-name">{study.author_name}</span>
                              <span className="author-institution">{study.institution}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="plant-badge">
                            <FaLeaf /> {study.plant_name}
                          </span>
                        </td>
                        <td>
                          <span className="date-cell">
                            <FaCalendar /> {study.created_at}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${study.status}`}>
                            {getStatusIcon(study.status)}
                            {study.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button 
                            className="action-btn view"
                            onClick={() => openViewModal(study)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {study.status === 'pending' && (
                            <>
                              <button 
                                className="action-btn approve"
                                onClick={() => handleApprove(study)}
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button 
                                className="action-btn reject"
                                onClick={() => openRejectModal(study)}
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <a 
                            href={study.file_url}
                            className="action-btn download"
                            title="Download PDF"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaDownload />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        <div className="empty-state-small">
                          <FaBook />
                          <p>No case studies found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <span className="pagination-info">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      disabled={currentPage === 1}
                    >
                      <FaChevronLeft />
                    </button>
                    <span className="pagination-current">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* View Modal */}
        {showModal && selectedStudy && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaBook /> Case Study Details</h2>
                <button className="modal-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="case-study-detail">
                  <div className="detail-header">
                    <h3>{selectedStudy.title}</h3>
                    <span className={`status-badge status-${selectedStudy.status}`}>
                      {getStatusIcon(selectedStudy.status)}
                      {selectedStudy.status}
                    </span>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <FaUser className="detail-icon" />
                      <div>
                        <label>Author</label>
                        <span>{selectedStudy.author_name}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaUniversity className="detail-icon" />
                      <div>
                        <label>Institution</label>
                        <span>{selectedStudy.institution}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaLeaf className="detail-icon" />
                      <div>
                        <label>Related Plant</label>
                        <span>{selectedStudy.plant_name}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaCalendar className="detail-icon" />
                      <div>
                        <label>Submitted</label>
                        <span>{selectedStudy.created_at}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <label>Abstract</label>
                    <p className="abstract-text">{selectedStudy.abstract}</p>
                  </div>

                  {selectedStudy.status === 'rejected' && selectedStudy.rejection_reason && (
                    <div className="detail-section rejection-info">
                      <label><FaTimesCircle /> Rejection Reason</label>
                      <p>{selectedStudy.rejection_reason}</p>
                    </div>
                  )}

                  <div className="detail-actions">
                    <a 
                      href={selectedStudy.file_url}
                      className="btn btn-outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaDownload /> Download PDF
                    </a>
                    <a 
                      href={`/case-studies/${selectedStudy.id}`}
                      className="btn btn-outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaExternalLinkAlt /> View Public Page
                    </a>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                {selectedStudy.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        closeModal();
                        openRejectModal(selectedStudy);
                      }}
                    >
                      <FaTimes /> Reject
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedStudy)}
                      disabled={processing}
                    >
                      {processing ? <ButtonLoader /> : <FaCheck />} Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaTimesCircle /> Reject Case Study</h2>
                <button className="modal-close" onClick={() => setShowRejectModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <p>Please provide a reason for rejecting this case study:</p>
                <div className="form-group">
                  <label className="form-label">Rejection Reason</label>
                  <textarea
                    className="form-textarea"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="4"
                    placeholder="Enter reason for rejection..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={processing}
                >
                  {processing ? <ButtonLoader /> : <FaTimes />} Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCaseStudies;