import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FaBook, FaPlus, FaSearch, FaDownload, FaEye, FaUser, 
  FaCalendar, FaUniversity, FaLeaf, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { caseStudiesAPI, plantsAPI } from '../api/api';
import { toast } from 'react-toastify';

const CaseStudies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [studies, setStudies] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    plant: searchParams.get('plant') || '',
    search: searchParams.get('q') || '',
    sort: 'newest'
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudies();
  }, [filters, currentPage]);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: filters.sort
      };

      if (filters.plant) params.plant_slug = filters.plant;
      if (filters.search) params.q = filters.search;

      const response = await caseStudiesAPI.list(params);
      
      // Handle different API response structures
      let dataArray = [];
      let total = 0;
      
      if (response?.data?.data) {
        // If response has nested data property
        dataArray = response.data.data;
        total = response.data.pagination?.total || dataArray.length;
      } else if (response?.data) {
        // If response has direct data property
        dataArray = response.data;
        total = response.pagination?.total || dataArray.length;
      } else if (Array.isArray(response)) {
        // If response is directly an array
        dataArray = response;
        total = dataArray.length;
      }

      setStudies(dataArray);
      setTotalCount(total);
    } catch (error) {
      console.error('Error fetching case studies:', error);
      toast.error('Failed to load case studies');
      setStudies([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await plantsAPI.list({ limit: 100 });
      
      // Handle different API response structures
      let plantArray = [];
      
      if (response?.data?.data) {
        plantArray = response.data.data;
      } else if (response?.data) {
        plantArray = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        plantArray = response;
      }

      setPlants(plantArray);
    } catch (error) {
      console.error('Error fetching plants:', error);
      toast.error('Failed to load plant filter');
      setPlants([]);
    }
  };

  const handleFilterChange = (key, value) => {
    const trimmedValue = value?.trim() || '';
    setFilters(prev => ({ ...prev, [key]: trimmedValue }));
    setCurrentPage(1);

    const newParams = new URLSearchParams(searchParams);
    if (trimmedValue) {
      newParams.set(key === 'search' ? 'q' : key, trimmedValue);
    } else {
      newParams.delete(key === 'search' ? 'q' : key);
    }
    setSearchParams(newParams);
  };

  const handleDownload = async (studyId) => {
    try {
      const response = await caseStudiesAPI.download(studyId);

      if (!response.data || response.data.size === 0) {
        throw new Error('Empty file');
      }

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `case-study-${studyId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="case-studies-page">
      <section className="case-studies-hero">
        <div className="container">
          <div className="hero-content">
            <h1><FaBook /> Case Studies</h1>
            <p>Research papers and clinical studies on medicinal plants</p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/case-studies/add" className="btn btn-white btn-lg">
                  <FaPlus /> Submit Case Study
                </Link>
              ) : (
                <Link to="/login?redirect=/case-studies/add" className="btn btn-white btn-lg">
                  <FaPlus /> Login to Submit
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="case-studies-content">
        <div className="container">
          <div className="studies-toolbar">
            <div className="search-filter">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search case studies..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="filter-group">
              <select
                className="form-select"
                value={filters.plant}
                onChange={(e) => handleFilterChange('plant', e.target.value)}
              >
                <option value="">All Plants</option>
                {Array.isArray(plants) && plants.map(plant => (
                  <option key={plant.id} value={plant.slug}>
                    {plant.common_name}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="downloads">Most Downloaded</option>
              </select>
            </div>
          </div>

          <div className="results-info">
            <span>
              Showing <strong>{studies.length}</strong> of <strong>{totalCount}</strong> case studies
            </span>
          </div>

          {loading ? (
            <div className="studies-list">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="study-card skeleton">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : studies.length > 0 ? (
            <div className="studies-list">
              {studies.map((study) => (
                <article key={study.id} className="study-card">
                  <div className="study-content">
                    <div className="study-header">
                      <Link to={`/case-studies/${study.id}`} className="study-title">
                        {study.title}
                      </Link>
                      {study.plant_name && (
                        <span className="study-plant-badge">
                          <FaLeaf /> {study.plant_name}
                        </span>
                      )}
                    </div>

                    <p className="study-abstract">
                      {study.abstract || 'No abstract available.'}
                    </p>

                    <div className="study-meta">
                      <span className="meta-item">
                        <FaUser /> {study.submitter_name || study.author_name || 'Anonymous'}
                      </span>
                      {study.institution && (
                        <span className="meta-item">
                          <FaUniversity /> {study.institution}
                        </span>
                      )}
                      <span className="meta-item">
                        <FaCalendar /> {formatDate(study.created_at)}
                      </span>
                      <span className="meta-item">
                        <FaDownload /> {study.download_count || 0} downloads
                      </span>
                    </div>
                  </div>

                  <div className="study-actions">
                    <Link to={`/case-studies/${study.id}`} className="btn btn-outline btn-sm">
                      <FaEye /> View
                    </Link>
                    <button
                      onClick={() => handleDownload(study.id)}
                      className="btn btn-primary btn-sm"
                    >
                      <FaDownload /> PDF
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaBook className="empty-icon" />
              <h3>No Case Studies Found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <FaChevronLeft /> Previous
              </button>

              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;
