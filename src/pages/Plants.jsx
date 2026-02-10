import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FaLeaf, 
  FaSearch, 
  FaFilter, 
  FaTh, 
  FaList,
  FaSortAmountDown,
  FaTimes,
  FaChevronDown
} from 'react-icons/fa';
import PlantCard from '../components/PlantCard';
import { SkeletonCard, InlineLoader } from '../components/Loader';
import { plantsAPI } from '../api/api';

const Plants = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [plants, setPlants] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedFamily, setSelectedFamily] = useState(searchParams.get('family') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const ITEMS_PER_PAGE = 12;

  // Fetch families on mount
  useEffect(() => {
    fetchFamilies();
  }, []);

  // Fetch plants when filters change
  useEffect(() => {
    setPage(1);
    fetchPlants(1, true);
  }, [searchQuery, selectedFamily, sortBy]);

  // Fetch plant families
  const fetchFamilies = async () => {
    try {
      const response = await plantsAPI.families();
      if (response.data.success) {
        setFamilies(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching families:', error);
      // Fallback data
      setFamilies([
        { name: 'Fabaceae', count: 25 },
        { name: 'Lamiaceae', count: 20 },
        { name: 'Asteraceae', count: 18 },
        { name: 'Apiaceae', count: 15 },
        { name: 'Solanaceae', count: 12 },
        { name: 'Zingiberaceae', count: 10 },
        { name: 'Meliaceae', count: 8 },
        { name: 'Rutaceae', count: 7 }
      ]);
    }
  };

  // Fetch plants
  const fetchPlants = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        sort: sortBy
      };

      if (searchQuery) params.query = searchQuery;
      if (selectedFamily) params.family = selectedFamily;

      const response = searchQuery 
        ? await plantsAPI.search(searchQuery, params)
        : await plantsAPI.list(params);

      if (response.data.success) {
        const newPlants = response.data.data || [];
        
        if (reset) {
          setPlants(newPlants);
        } else {
          setPlants(prev => [...prev, ...newPlants]);
        }
        
        setTotalCount(newPlants.length);
        setHasMore(newPlants.length === ITEMS_PER_PAGE);
      } else {
        setError('Failed to load plants');
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
      setError('Failed to load plants. Please try again.');
      
      // Fallback data for development
      if (reset) {
        setPlants([
          {
            id: 1,
            common_name: 'Neem',
            scientific_name: 'Azadirachta indica',
            slug: 'neem',
            family: 'Meliaceae',
            description: 'Known for its antibacterial properties.',
            compound_count: 45
          },
          {
            id: 2,
            common_name: 'Tulsi',
            scientific_name: 'Ocimum sanctum',
            slug: 'tulsi',
            family: 'Lamiaceae',
            description: 'Sacred herb with numerous benefits.',
            compound_count: 32
          },
          {
            id: 3,
            common_name: 'Turmeric',
            scientific_name: 'Curcuma longa',
            slug: 'turmeric',
            family: 'Zingiberaceae',
            description: 'Anti-inflammatory spice.',
            compound_count: 28
          }
        ]);
        setTotalCount(3);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more plants
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPlants(nextPage, false);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchParams();
  };

  // Update URL search params
  const updateSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedFamily) params.set('family', selectedFamily);
    if (sortBy !== 'name') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchQuery, selectedFamily, sortBy, setSearchParams]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFamily('');
    setSortBy('name');
    setSearchParams({});
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedFamily || sortBy !== 'name';

  return (
    <div className="plants-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-title-section">
              <h1>
                <FaLeaf className="page-icon" />
                Medicinal Plants Database
              </h1>
              <p>
                Explore our comprehensive collection of medicinal plants with 
                detailed phytochemical and pharmacological information.
              </p>
            </div>
            <div className="page-stats">
              <div className="page-stat">
                <span className="stat-value">{totalCount}</span>
                <span className="stat-label">Total Plants</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="container">
          <div className="filters-bar">
            {/* Search Box */}
            <form onSubmit={handleSearch} className="filter-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <FaTimes />
                </button>
              )}
            </form>

            {/* Filter Toggle (Mobile) */}
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              <span>Filters</span>
              {hasActiveFilters && <span className="filter-badge"></span>}
            </button>

            {/* Desktop Filters */}
            <div className={`filters-group ${showFilters ? 'show' : ''}`}>
              {/* Family Filter */}
              <div className="filter-dropdown">
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Families</option>
                  {families.map((family) => (
                    <option key={family.name} value={family.name}>
                      {family.name} ({family.count})
                    </option>
                  ))}
                </select>
                <FaChevronDown className="select-arrow" />
              </div>

              {/* Sort By */}
              <div className="filter-dropdown">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="name_desc">Sort: Name (Z-A)</option>
                  <option value="compounds">Sort: Most Compounds</option>
                  <option value="recent">Sort: Recently Added</option>
                </select>
                <FaChevronDown className="select-arrow" />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <FaTimes /> Clear Filters
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <FaTh />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <FaList />
              </button>
            </div>
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="active-filters">
              {searchQuery && (
                <span className="filter-tag">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')}><FaTimes /></button>
                </span>
              )}
              {selectedFamily && (
                <span className="filter-tag">
                  Family: {selectedFamily}
                  <button onClick={() => setSelectedFamily('')}><FaTimes /></button>
                </span>
              )}
              {sortBy !== 'name' && (
                <span className="filter-tag">
                  Sort: {sortBy}
                  <button onClick={() => setSortBy('name')}><FaTimes /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Plants Grid */}
      <div className="plants-content">
        <div className="container">
          {loading ? (
            <div className={`plants-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={() => fetchPlants(1, true)}>
                Try Again
              </button>
            </div>
          ) : plants.length === 0 ? (
            <div className="empty-state">
              <FaLeaf className="empty-icon" />
              <h3>No Plants Found</h3>
              <p>
                {searchQuery 
                  ? `No plants match "${searchQuery}". Try different keywords.`
                  : 'No plants available in this category.'
                }
              </p>
              {hasActiveFilters && (
                <button className="btn btn-outline" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={`plants-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {plants.map((plant) => (
                  <PlantCard 
                    key={plant.id} 
                    plant={plant} 
                    variant={viewMode === 'list' ? 'horizontal' : 'default'}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="load-more-section">
                  <button 
                    className="btn btn-outline btn-lg"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <InlineLoader text="Loading..." />
                    ) : (
                      <>Load More Plants</>
                    )}
                  </button>
                  <p className="load-more-info">
                    Showing {plants.length} of {totalCount} plants
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plants;