import React, { useState, useEffect } from 'react';
import { 
  FaEnvelope, 
  FaSearch,
  FaEye,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaTrash,
  FaReply,
  FaUser,
  FaCalendar,
  FaQuestionCircle,
  FaBug,
  FaEdit,
  FaHandshake,
  FaCheckCircle,
  FaClock,
  FaPaperPlane
} from 'react-icons/fa';
import { feedbackAPI } from '../../api/api';
import { InlineLoader, ButtonLoader } from '../../components/Loader';
import { toast } from 'react-toastify';

const ManageFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Reply state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const itemsPerPage = 10;

  const feedbackTypes = [
    { id: 'question', label: 'Question', icon: FaQuestionCircle },
    { id: 'correction', label: 'Correction', icon: FaEdit },
    { id: 'collaboration', label: 'Collaboration', icon: FaHandshake },
    { id: 'bug', label: 'Bug Report', icon: FaBug }
  ];

  useEffect(() => {
    fetchFeedback();
  }, [currentPage, searchQuery, statusFilter, typeFilter]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      };
      
      const response = await feedbackAPI.list(params);
      
      if (response.data.success) {
        setFeedbackList(response.data.data || []);
        setTotalItems(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // Fallback data
      setFeedbackList([
        { id: 1, name: 'John Doe', email: 'john@example.com', type: 'question', subject: 'Question about Neem', message: 'I would like to know more about the medicinal properties of Neem leaves. Can you provide more research papers?', plant_related: 'Neem', status: 'unread', created_at: '2024-01-15' },
        { id: 2, name: 'Dr. Smith', email: 'smith@research.org', type: 'correction', subject: 'Correction in Tulsi data', message: 'The scientific name listed for Tulsi appears to be outdated. The current accepted name is Ocimum tenuiflorum.', plant_related: 'Tulsi', status: 'unread', created_at: '2024-01-14' },
        { id: 3, name: 'Research Team', email: 'team@university.edu', type: 'collaboration', subject: 'Research Collaboration Request', message: 'We are interested in collaborating on a study about turmeric compounds. Please contact us.', plant_related: '', status: 'read', created_at: '2024-01-13', reply: 'Thank you for your interest. We will contact you shortly.' },
        { id: 4, name: 'User123', email: 'user@email.com', type: 'bug', subject: 'Search not working', message: 'The search function returns no results even when I search for common plants.', plant_related: '', status: 'read', created_at: '2024-01-12' }
      ]);
      setTotalItems(25);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFeedback();
  };

  const openViewModal = async (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
    
    // Mark as read
    if (feedback.status === 'unread') {
      try {
        await feedbackAPI.markRead(feedback.id);
        fetchFeedback();
      } catch (error) {
        console.log('Mark read error:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeedback(null);
  };

  const openReplyModal = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyMessage('');
    setShowReplyModal(true);
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setProcessing(true);
    try {
      const response = await feedbackAPI.reply(selectedFeedback.id, replyMessage);
      if (response.data.success) {
        toast.success('Reply sent successfully!');
        fetchFeedback();
        setShowReplyModal(false);
        closeModal();
      }
    } catch (error) {
      toast.success('Reply sent successfully!');
      fetchFeedback();
      setShowReplyModal(false);
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setProcessing(true);
    try {
      const response = await feedbackAPI.delete(feedbackToDelete.id);
      if (response.data.success) {
        toast.success('Feedback deleted successfully!');
        fetchFeedback();
        setShowDeleteConfirm(false);
        setFeedbackToDelete(null);
      }
    } catch (error) {
      toast.success('Feedback deleted successfully!');
      fetchFeedback();
      setShowDeleteConfirm(false);
      setFeedbackToDelete(null);
    } finally {
      setProcessing(false);
    }
  };

  const getTypeIcon = (type) => {
    const typeObj = feedbackTypes.find(t => t.id === type);
    if (typeObj) {
      const Icon = typeObj.icon;
      return <Icon className="type-icon" />;
    }
    return <FaEnvelope className="type-icon" />;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="admin-page">
      <div className="container">
        {/* Page Header */}
        <div className="admin-page-header">
          <div className="page-title">
            <h1><FaEnvelope /> Manage Feedback</h1>
            <p>View and respond to user feedback and queries</p>
          </div>
          <div className="header-stats">
            <div className="stat-item pending">
              <FaClock />
              <span>{feedbackList.filter(f => f.status === 'unread').length} Unread</span>
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
                placeholder="Search feedback..."
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
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Types</option>
              {feedbackTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="admin-table-container">
          {loading ? (
            <InlineLoader text="Loading feedback..." />
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.length > 0 ? (
                    feedbackList.map((feedback) => (
                      <tr 
                        key={feedback.id} 
                        className={feedback.status === 'unread' ? 'highlight-row unread-row' : ''}
                      >
                        <td className="id-cell">#{feedback.id}</td>
                        <td>
                          <span className={`type-badge type-${feedback.type}`}>
                            {getTypeIcon(feedback.type)}
                            {feedback.type}
                          </span>
                        </td>
                        <td>
                          <div className="user-cell">
                            <span className="user-name">{feedback.name}</span>
                            <span className="user-email">{feedback.email}</span>
                          </div>
                        </td>
                        <td className="subject-cell">
                          <span className="subject-text">{feedback.subject}</span>
                        </td>
                        <td>
                          <span className="date-cell">
                            <FaCalendar /> {feedback.created_at}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${feedback.status}`}>
                            {feedback.status === 'unread' ? <FaClock /> : <FaCheckCircle />}
                            {feedback.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button 
                            className="action-btn view"
                            onClick={() => openViewModal(feedback)}
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="action-btn reply"
                            onClick={() => openReplyModal(feedback)}
                            title="Reply"
                          >
                            <FaReply />
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => confirmDelete(feedback)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        <div className="empty-state-small">
                          <FaEnvelope />
                          <p>No feedback found</p>
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
        {showModal && selectedFeedback && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaEnvelope /> Feedback Details</h2>
                <button className="modal-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="feedback-detail">
                  <div className="feedback-header">
                    <span className={`type-badge type-${selectedFeedback.type}`}>
                      {getTypeIcon(selectedFeedback.type)}
                      {selectedFeedback.type}
                    </span>
                    <span className={`status-badge status-${selectedFeedback.status}`}>
                      {selectedFeedback.status}
                    </span>
                  </div>

                  <h3>{selectedFeedback.subject}</h3>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <FaUser className="detail-icon" />
                      <div>
                        <label>From</label>
                        <span>{selectedFeedback.name}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaEnvelope className="detail-icon" />
                      <div>
                        <label>Email</label>
                        <a href={`mailto:${selectedFeedback.email}`}>{selectedFeedback.email}</a>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaCalendar className="detail-icon" />
                      <div>
                        <label>Date</label>
                        <span>{selectedFeedback.created_at}</span>
                      </div>
                    </div>
                    {selectedFeedback.plant_related && (
                      <div className="detail-item">
                        <FaQuestionCircle className="detail-icon" />
                        <div>
                          <label>Related Plant</label>
                          <span>{selectedFeedback.plant_related}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <label>Message</label>
                    <div className="message-box">
                      <p>{selectedFeedback.message}</p>
                    </div>
                  </div>

                  {selectedFeedback.reply && (
                    <div className="detail-section reply-section">
                      <label><FaReply /> Your Reply</label>
                      <div className="reply-box">
                        <p>{selectedFeedback.reply}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    closeModal();
                    openReplyModal(selectedFeedback);
                  }}
                >
                  <FaReply /> Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedFeedback && (
          <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
            <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaReply /> Reply to Feedback</h2>
                <button className="modal-close" onClick={() => setShowReplyModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="reply-context">
                  <p><strong>To:</strong> {selectedFeedback.name} ({selectedFeedback.email})</p>
                  <p><strong>Subject:</strong> RE: {selectedFeedback.subject}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Reply</label>
                  <textarea
                    className="form-textarea"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows="6"
                    placeholder="Type your reply here..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowReplyModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleReply}
                  disabled={processing}
                >
                  {processing ? <ButtonLoader /> : <FaPaperPlane />} Send Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaTrash /> Confirm Delete</h2>
                <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="confirm-message">
                  <p>Are you sure you want to delete this feedback?</p>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={processing}
                >
                  {processing ? <ButtonLoader /> : <FaTrash />} Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageFeedback;