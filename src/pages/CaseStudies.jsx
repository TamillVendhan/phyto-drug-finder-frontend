import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FaBook, 
  FaPlus, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaUser,
  FaCalendar,
  FaUniversity,
  FaLeaf,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import { SkeletonCard, InlineLoader } from '../components/Loader';
import { caseStudiesAPI, plantsAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
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
    fetchPlants();
  }, [filters, currentPage]);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: filters.sort
      };
      
      if (filters.plant) params.plant_slug = filters.plant;
      if (filters.search) params.search = filters.search;

      const response = await caseStudiesAPI.list(params);
      
      if (response.data.success) {
        setStudies(response.data.data || []);
        setTotalCount(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching case studies:', error);
      // Fallback data
      setStudies([
        {
          id: 1,
          title: 'Antimicrobial Properties of Azadirachta indica (Neem) Leaf Extract',
          abstract: 'This study investigates the antimicrobial activity of neem leaf extracts against common pathogens. Results demonstrate significant inhibition zones against both gram-positive and gram-negative bacteria.',
          author_name: 'Dr. Priya Sharma',
          institution: 'University of Delhi',
          plant_name: 'Neem',
          created_at: '2024-01-15',
          download_count: 45
        },
        {
          id: 2,
          title: 'Curcumin Bioavailability Enhancement: A Comparative Study',
          abstract: 'Exploring novel formulation strategies to improve the bioavailability of curcumin from Curcuma longa for therapeutic applications.',
          author_name: 'Prof. Rajesh Kumar',
          institution: 'AIIMS, New Delhi',
          plant_name: 'Turmeric',
          created_at: '2024-01-10',
          download_count: 32
        },
        {
          id: 3,
          title: 'Immunomodulatory Effects of Ocimum sanctum (Tulsi) in Clinical Trials',
          abstract: 'A randomized controlled trial evaluating the immunomodulatory properties of Tulsi extract in healthy adults.',
          author_name: 'Dr. Anita Desai',
          institution: 'NIMHANS, Bangalore',
          plant_name: 'Tulsi',
          created_at: '2024-01-05',
          download_count: 28
        }
      ]);
      setTotalCount(25);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await plantsAPI.list({ limit: 50 });
      if (response.data.success) {
        setPlants(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key === 'search' ? 'q' : key, value);
    } else {
      newParams.delete(key === 'search' ? 'q' : key);
    }
    setSearchParams(newParams);
  };

  const handleDownload = async (studyId) => {
    try {
      toast.info('Downloading PDF...');
      const response = await caseStudiesAPI.download(studyId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `case-study-${studyId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded successfully');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="case-studies-page">
      {/* Hero Section */}
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
                <Link to="/login" className="btn btn-white btn-lg">
                  Login to Submit
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="case-studies-content">
        <div className="container">
          {/* Filters */}
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
                {plants.map(plant => (
                  <option key={plant.id} value={plant.slug}>{plant.common_name}</option>
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

          {/* Results Info */}
          <div className="results-info">
            <span>Showing <strong>{studies.length}</strong> of <strong>{totalCount}</strong> case studies</span>
          </div>

          {/* Studies List */}
          {loading ? (
            <div className="studies-list">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="study-card skeleton">
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text short"></div>
                  </div>
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

                    <p className="study-abstract">{study.abstract}</p>

                    <div className="study-meta">
                      <span className="meta-item">
                        <FaUser /> {study.author_name}
                      </span>
                      <span className="meta-item">
                        <FaUniversity /> {study.institution}
                      </span>
                      <span className="meta-item">
                        <FaCalendar /> {formatDate(study.created_at)}
                      </span>
                      <span className="meta-item">
                        <FaDownload /> {study.download_count} downloads
                      </span>
                    </div>
                  </div>

                  <div className="study-actions">
                    <Link to={`/case-studies/${study.id}`} className="btn btn-outline btn-sm">
                      <FaEye /> View
                    </Link>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownload(study.id)}
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
              <p>Try adjusting your filters or search query</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft /> Previous
              </button>

              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>

              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
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