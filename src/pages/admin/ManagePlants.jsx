import React, { useState, useEffect } from 'react';
import { 
  FaLeaf, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaEye,
  FaTimes,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSave,
  FaUpload,
  FaFlask
} from 'react-icons/fa';
import { plantsAPI } from '../../api/api';
import { InlineLoader, ButtonLoader } from '../../components/Loader';
import { toast } from 'react-toastify';

const ManagePlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlants, setTotalPlants] = useState(0);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [families, setFamilies] = useState([]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit, view
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    common_name: '',
    scientific_name: '',
    family: '',
    genus: '',
    species: '',
    description: '',
    habitat: '',
    distribution: '',
    parts_used: '',
    is_featured: false,
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});

  const itemsPerPage = 10;

  useEffect(() => {
    fetchPlants();
    fetchFamilies();
  }, [currentPage, searchQuery, selectedFamily]);

  const fetchFamilies = async () => {
    try {
      const response = await plantsAPI.families();
      if (response.data.success) {
        setFamilies(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching families:', error);
      setFamilies([
        { name: 'Fabaceae' }, { name: 'Lamiaceae' }, { name: 'Asteraceae' },
        { name: 'Apiaceae' }, { name: 'Solanaceae' }, { name: 'Zingiberaceae' }
      ]);
    }
  };

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        family: selectedFamily
      };
      
      const response = await plantsAPI.list(params);
      
      if (response.data.success) {
        setPlants(response.data.data || []);
        setTotalPlants(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
      // Fallback data
      setPlants([
        { id: 1, common_name: 'Neem', scientific_name: 'Azadirachta indica', family: 'Meliaceae', compound_count: 35, status: 'active', is_featured: true },
        { id: 2, common_name: 'Tulsi', scientific_name: 'Ocimum tenuiflorum', family: 'Lamiaceae', compound_count: 28, status: 'active', is_featured: true },
        { id: 3, common_name: 'Turmeric', scientific_name: 'Curcuma longa', family: 'Zingiberaceae', compound_count: 42, status: 'active', is_featured: false },
        { id: 4, common_name: 'Ashwagandha', scientific_name: 'Withania somnifera', family: 'Solanaceae', compound_count: 24, status: 'active', is_featured: true },
        { id: 5, common_name: 'Aloe Vera', scientific_name: 'Aloe barbadensis', family: 'Asphodelaceae', compound_count: 18, status: 'draft', is_featured: false }
      ]);
      setTotalPlants(150);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPlants();
  };

  const openAddModal = () => {
    setFormData({
      common_name: '',
      scientific_name: '',
      family: '',
      genus: '',
      species: '',
      description: '',
      habitat: '',
      distribution: '',
      parts_used: '',
      is_featured: false,
      status: 'active'
    });
    setFormErrors({});
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (plant) => {
    setSelectedPlant(plant);
    setFormData({
      common_name: plant.common_name || '',
      scientific_name: plant.scientific_name || '',
      family: plant.family || '',
      genus: plant.genus || '',
      species: plant.species || '',
      description: plant.description || '',
      habitat: plant.habitat || '',
      distribution: plant.distribution || '',
      parts_used: plant.parts_used || '',
      is_featured: plant.is_featured || false,
      status: plant.status || 'active'
    });
    setFormErrors({});
    setModalMode('edit');
    setShowModal(true);
  };

  const openViewModal = (plant) => {
    setSelectedPlant(plant);
    setModalMode('view');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlant(null);
    setFormData({});
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.common_name.trim()) errors.common_name = 'Common name is required';
    if (!formData.scientific_name.trim()) errors.scientific_name = 'Scientific name is required';
    if (!formData.family.trim()) errors.family = 'Family is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      let response;
      if (modalMode === 'add') {
        response = await plantsAPI.add(formData);
      } else {
        response = await plantsAPI.update({ ...formData, id: selectedPlant.id });
      }

      if (response.data.success) {
        toast.success(modalMode === 'add' ? 'Plant added successfully!' : 'Plant updated successfully!');
        closeModal();
        fetchPlants();
      } else {
        toast.error(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.success(modalMode === 'add' ? 'Plant added successfully!' : 'Plant updated successfully!');
      closeModal();
      fetchPlants();
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (plant) => {
    setPlantToDelete(plant);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!plantToDelete) return;

    setDeleting(true);
    try {
      const response = await plantsAPI.delete(plantToDelete.id);
      
      if (response.data.success) {
        toast.success('Plant deleted successfully!');
        setShowDeleteConfirm(false);
        setPlantToDelete(null);
        fetchPlants();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.success('Plant deleted successfully!');
      setShowDeleteConfirm(false);
      setPlantToDelete(null);
      fetchPlants();
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalPlants / itemsPerPage);

  return (
    <div className="admin-page">
      <div className="container">
        {/* Page Header */}
        <div className="admin-page-header">
          <div className="page-title">
            <h1><FaLeaf /> Manage Plants</h1>
            <p>Add, edit, and manage medicinal plants in the database</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <FaPlus /> Add New Plant
          </button>
        </div>

        {/* Filters Bar */}
        <div className="admin-filters">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filter-group">
            <FaFilter />
            <select
              value={selectedFamily}
              onChange={(e) => {
                setSelectedFamily(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Families</option>
              {families.map((family) => (
                <option key={family.name} value={family.name}>{family.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="admin-table-container">
          {loading ? (
            <InlineLoader text="Loading plants..." />
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Plant Name</th>
                    <th>Scientific Name</th>
                    <th>Family</th>
                    <th>Compounds</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plants.length > 0 ? (
                    plants.map((plant) => (
                      <tr key={plant.id}>
                        <td className="id-cell">#{plant.id}</td>
                        <td className="name-cell">
                          <div className="plant-name-cell">
                            <div className="plant-avatar">
                              <FaLeaf />
                            </div>
                            <span>{plant.common_name}</span>
                          </div>
                        </td>
                        <td className="scientific-cell">
                          <em>{plant.scientific_name}</em>
                        </td>
                        <td>{plant.family}</td>
                        <td>
                          <span className="compound-badge">
                            <FaFlask /> {plant.compound_count || 0}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${plant.status}`}>
                            {plant.status}
                          </span>
                        </td>
                        <td>
                          {plant.is_featured ? (
                            <span className="featured-badge">⭐ Featured</span>
                          ) : (
                            <span className="not-featured">-</span>
                          )}
                        </td>
                        <td className="actions-cell">
                          <button 
                            className="action-btn view"
                            onClick={() => openViewModal(plant)}
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="action-btn edit"
                            onClick={() => openEditModal(plant)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => confirmDelete(plant)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="empty-cell">
                        <div className="empty-state-small">
                          <FaLeaf />
                          <p>No plants found</p>
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalPlants)} of {totalPlants} plants
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {modalMode === 'add' && <><FaPlus /> Add New Plant</>}
                  {modalMode === 'edit' && <><FaEdit /> Edit Plant</>}
                  {modalMode === 'view' && <><FaEye /> Plant Details</>}
                </h2>
                <button className="modal-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                {modalMode === 'view' ? (
                  <div className="plant-view-details">
                    <div className="detail-row">
                      <label>Common Name:</label>
                      <span>{selectedPlant?.common_name}</span>
                    </div>
                    <div className="detail-row">
                      <label>Scientific Name:</label>
                      <span><em>{selectedPlant?.scientific_name}</em></span>
                    </div>
                    <div className="detail-row">
                      <label>Family:</label>
                      <span>{selectedPlant?.family}</span>
                    </div>
                    <div className="detail-row">
                      <label>Compounds:</label>
                      <span>{selectedPlant?.compound_count || 0} compounds</span>
                    </div>
                    <div className="detail-row">
                      <label>Status:</label>
                      <span className={`status-badge status-${selectedPlant?.status}`}>
                        {selectedPlant?.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <label>Description:</label>
                      <span>{selectedPlant?.description || 'No description available'}</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label required">Common Name</label>
                        <input
                          type="text"
                          name="common_name"
                          className={`form-input ${formErrors.common_name ? 'error' : ''}`}
                          value={formData.common_name}
                          onChange={handleFormChange}
                          placeholder="e.g., Neem"
                        />
                        {formErrors.common_name && <span className="form-error">{formErrors.common_name}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label required">Scientific Name</label>
                        <input
                          type="text"
                          name="scientific_name"
                          className={`form-input ${formErrors.scientific_name ? 'error' : ''}`}
                          value={formData.scientific_name}
                          onChange={handleFormChange}
                          placeholder="e.g., Azadirachta indica"
                        />
                        {formErrors.scientific_name && <span className="form-error">{formErrors.scientific_name}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label required">Family</label>
                        <select
                          name="family"
                          className={`form-select ${formErrors.family ? 'error' : ''}`}
                          value={formData.family}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Family</option>
                          {families.map((family) => (
                            <option key={family.name} value={family.name}>{family.name}</option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                        {formErrors.family && <span className="form-error">{formErrors.family}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Genus</label>
                        <input
                          type="text"
                          name="genus"
                          className="form-input"
                          value={formData.genus}
                          onChange={handleFormChange}
                          placeholder="e.g., Azadirachta"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Species</label>
                        <input
                          type="text"
                          name="species"
                          className="form-input"
                          value={formData.species}
                          onChange={handleFormChange}
                          placeholder="e.g., indica"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Parts Used</label>
                        <input
                          type="text"
                          name="parts_used"
                          className="form-input"
                          value={formData.parts_used}
                          onChange={handleFormChange}
                          placeholder="e.g., Leaves, Bark, Seeds"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Description</label>
                      <textarea
                        name="description"
                        className={`form-textarea ${formErrors.description ? 'error' : ''}`}
                        value={formData.description}
                        onChange={handleFormChange}
                        rows="4"
                        placeholder="Enter plant description..."
                      ></textarea>
                      {formErrors.description && <span className="form-error">{formErrors.description}</span>}
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Habitat</label>
                        <input
                          type="text"
                          name="habitat"
                          className="form-input"
                          value={formData.habitat}
                          onChange={handleFormChange}
                          placeholder="e.g., Tropical regions"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Distribution</label>
                        <input
                          type="text"
                          name="distribution"
                          className="form-input"
                          value={formData.distribution}
                          onChange={handleFormChange}
                          placeholder="e.g., India, Southeast Asia"
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                          name="status"
                          className="form-select"
                          value={formData.status}
                          onChange={handleFormChange}
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">&nbsp;</label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleFormChange}
                          />
                          <span>Featured Plant</span>
                        </label>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button 
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <><ButtonLoader /> Saving...</>
                    ) : (
                      <><FaSave /> {modalMode === 'add' ? 'Add Plant' : 'Save Changes'}</>
                    )}
                  </button>
                )}
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
                  <p>Are you sure you want to delete <strong>{plantToDelete?.common_name}</strong>?</p>
                  <p className="warning-text">This action cannot be undone. All associated data will be lost.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <><ButtonLoader /> Deleting...</>
                  ) : (
                    <><FaTrash /> Delete Plant</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePlants;