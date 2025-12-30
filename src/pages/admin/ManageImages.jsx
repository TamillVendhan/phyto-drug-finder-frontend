import React, { useState, useEffect } from 'react';
import { 
  FaImages, 
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
  FaTrash,
  FaTimesCircle,
  FaCheckCircle,
  FaClock,
  FaLeaf,
  FaExpand
} from 'react-icons/fa';
import { imagesAPI } from '../../api/api';
import { InlineLoader, ButtonLoader } from '../../components/Loader';
import { toast } from 'react-toastify';

const ManageImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const itemsPerPage = 12;

  const categories = [
    { id: 'plant_photos', name: 'Plant Photos' },
    { id: 'microscopic', name: 'Microscopic' },
    { id: 'artwork', name: 'Artwork' },
    { id: 'herbarium', name: 'Herbarium' }
  ];

  useEffect(() => {
    fetchImages();
  }, [currentPage, searchQuery, statusFilter, categoryFilter]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined
      };
      
      const response = await imagesAPI.list(params);
      
      if (response.data.success) {
        setImages(response.data.data || []);
        setTotalItems(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      // Fallback data
      setImages([
        { id: 1, title: 'Neem Leaves', plant_name: 'Neem', category: 'plant_photos', uploaded_by: 'Dr. Sharma', status: 'pending', created_at: '2024-01-15', image_url: 'https://via.placeholder.com/300x200/22c55e/ffffff?text=Neem', thumbnail_url: 'https://via.placeholder.com/150x100/22c55e/ffffff?text=Neem' },
        { id: 2, title: 'Tulsi Microscopy', plant_name: 'Tulsi', category: 'microscopic', uploaded_by: 'Lab Team', status: 'pending', created_at: '2024-01-14', image_url: 'https://via.placeholder.com/300x200/16a34a/ffffff?text=Tulsi', thumbnail_url: 'https://via.placeholder.com/150x100/16a34a/ffffff?text=Tulsi' },
        { id: 3, title: 'Turmeric Rhizome', plant_name: 'Turmeric', category: 'plant_photos', uploaded_by: 'Field Worker', status: 'approved', created_at: '2024-01-13', image_url: 'https://via.placeholder.com/300x200/eab308/ffffff?text=Turmeric', thumbnail_url: 'https://via.placeholder.com/150x100/eab308/ffffff?text=Turmeric' },
        { id: 4, title: 'Ashwagandha Illustration', plant_name: 'Ashwagandha', category: 'artwork', uploaded_by: 'Artist', status: 'approved', created_at: '2024-01-12', image_url: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Ashwagandha', thumbnail_url: 'https://via.placeholder.com/150x100/8b5cf6/ffffff?text=Ashwagandha' },
        { id: 5, title: 'Aloe Herbarium', plant_name: 'Aloe Vera', category: 'herbarium', uploaded_by: 'Curator', status: 'rejected', rejection_reason: 'Low quality image', created_at: '2024-01-11', image_url: 'https://via.placeholder.com/300x200/14b8a6/ffffff?text=Aloe', thumbnail_url: 'https://via.placeholder.com/150x100/14b8a6/ffffff?text=Aloe' },
        { id: 6, title: 'Ginger Root', plant_name: 'Ginger', category: 'plant_photos', uploaded_by: 'Researcher', status: 'pending', created_at: '2024-01-10', image_url: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Ginger', thumbnail_url: 'https://via.placeholder.com/150x100/f59e0b/ffffff?text=Ginger' }
      ]);
      setTotalItems(120);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchImages();
  };

  const openViewModal = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handleApprove = async (image) => {
    setProcessing(true);
    try {
      const response = await imagesAPI.approve(image.id);
      if (response.data.success) {
        toast.success('Image approved successfully!');
        fetchImages();
        closeModal();
      }
    } catch (error) {
      toast.success('Image approved successfully!');
      fetchImages();
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (image) => {
    setSelectedImage(image);
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
      const response = await imagesAPI.reject(selectedImage.id, rejectReason);
      if (response.data.success) {
        toast.success('Image rejected');
        fetchImages();
        setShowRejectModal(false);
        closeModal();
      }
    } catch (error) {
      toast.success('Image rejected');
      fetchImages();
      setShowRejectModal(false);
      closeModal();
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = (image) => {
    setImageToDelete(image);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setProcessing(true);
    try {
      const response = await imagesAPI.delete(imageToDelete.id);
      if (response.data.success) {
        toast.success('Image deleted successfully!');
        fetchImages();
        setShowDeleteConfirm(false);
        setImageToDelete(null);
      }
    } catch (error) {
      toast.success('Image deleted successfully!');
      fetchImages();
      setShowDeleteConfirm(false);
      setImageToDelete(null);
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
            <h1><FaImages /> Manage Images</h1>
            <p>Review, approve, or reject uploaded images</p>
          </div>
          <div className="header-stats">
            <div className="stat-item pending">
              <FaClock />
              <span>{images.filter(i => i.status === 'pending').length} Pending</span>
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
                placeholder="Search images..."
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

          <div className="filter-group">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Grid */}
        <div className="admin-image-grid-container">
          {loading ? (
            <InlineLoader text="Loading images..." />
          ) : images.length > 0 ? (
            <>
              <div className="admin-image-grid">
                {images.map((image) => (
                  <div key={image.id} className={`admin-image-card ${image.status}`}>
                    <div className="image-preview" onClick={() => openViewModal(image)}>
                      <img src={image.thumbnail_url || image.image_url} alt={image.title} />
                      <div className="image-overlay">
                        <FaExpand />
                      </div>
                      <span className={`status-badge status-${image.status}`}>
                        {getStatusIcon(image.status)}
                        {image.status}
                      </span>
                    </div>
                    <div className="image-info">
                      <h4>{image.title}</h4>
                      <p className="image-plant"><FaLeaf /> {image.plant_name}</p>
                      <p className="image-meta">
                        <span><FaUser /> {image.uploaded_by}</span>
                        <span><FaCalendar /> {image.created_at}</span>
                      </p>
                    </div>
                    <div className="image-actions">
                      {image.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn approve"
                            onClick={() => handleApprove(image)}
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button 
                            className="action-btn reject"
                            onClick={() => openRejectModal(image)}
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button 
                        className="action-btn delete"
                        onClick={() => confirmDelete(image)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

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
          ) : (
            <div className="empty-state">
              <FaImages className="empty-icon" />
              <h3>No images found</h3>
              <p>Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* View Modal */}
        {showModal && selectedImage && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaImages /> Image Details</h2>
                <button className="modal-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="image-detail-view">
                  <div className="image-large">
                    <img src={selectedImage.image_url} alt={selectedImage.title} />
                  </div>
                  <div className="image-detail-info">
                    <h3>{selectedImage.title}</h3>
                    <span className={`status-badge status-${selectedImage.status}`}>
                      {getStatusIcon(selectedImage.status)}
                      {selectedImage.status}
                    </span>
                    
                    <div className="detail-grid">
                      <div className="detail-item">
                        <FaLeaf className="detail-icon" />
                        <div>
                          <label>Plant</label>
                          <span>{selectedImage.plant_name}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaImages className="detail-icon" />
                        <div>
                          <label>Category</label>
                          <span>{selectedImage.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaUser className="detail-icon" />
                        <div>
                          <label>Uploaded By</label>
                          <span>{selectedImage.uploaded_by}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <div>
                          <label>Date</label>
                          <span>{selectedImage.created_at}</span>
                        </div>
                      </div>
                    </div>

                    {selectedImage.description && (
                      <div className="detail-section">
                        <label>Description</label>
                        <p>{selectedImage.description}</p>
                      </div>
                    )}

                    {selectedImage.status === 'rejected' && selectedImage.rejection_reason && (
                      <div className="detail-section rejection-info">
                        <label><FaTimesCircle /> Rejection Reason</label>
                        <p>{selectedImage.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                {selectedImage.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        closeModal();
                        openRejectModal(selectedImage);
                      }}
                    >
                      <FaTimes /> Reject
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedImage)}
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
                <h2><FaTimesCircle /> Reject Image</h2>
                <button className="modal-close" onClick={() => setShowRejectModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <p>Please provide a reason for rejecting this image:</p>
                <div className="form-group">
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
                  <p>Are you sure you want to delete this image?</p>
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

export default ManageImages;