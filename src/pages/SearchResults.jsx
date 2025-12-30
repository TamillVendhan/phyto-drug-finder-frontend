import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaLeaf, 
  FaFlask, 
  FaBook,
  FaArrowLeft,
  FaTimes,
  FaFilter
} from 'react-icons/fa';
import PlantCard from '../components/PlantCard';
import SearchBar from '../components/SearchBar';
import { SkeletonCard, InlineLoader } from '../components/Loader';
import { plantsAPI, compoundsAPI, caseStudiesAPI } from '../api/api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // State
  const [activeTab, setActiveTab] = useState('plants');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    plants: [],
    compounds: [],
    caseStudies: []
  });
  const [counts, setCounts] = useState({
    plants: 0,
    compounds: 0,
    caseStudies: 0
  });

  // Fetch results when query changes
  useEffect(() => {
    if (query) {
      fetchAllResults();
    }
  }, [query]);

  const fetchAllResults = async () => {
    setLoading(true);
    try {
      // Fetch all types in parallel
      const [plantsRes, compoundsRes, caseStudiesRes] = await Promise.allSettled([
        plantsAPI.search(query, { limit: 20 }),
        compoundsAPI.search(query),
        caseStudiesAPI.search(query)
      ]);

      // Process results
      const plantsData = plantsRes.status === 'fulfilled' && plantsRes.value.data.success 
        ? plantsRes.value.data.data : [];
      const compoundsData = compoundsRes.status === 'fulfilled' && compoundsRes.value.data.success 
        ? compoundsRes.value.data.data : [];
      const caseStudiesData = caseStudiesRes.status === 'fulfilled' && caseStudiesRes.value.data.success 
        ? caseStudiesRes.value.data.data : [];

      setResults({
        plants: plantsData,
        compounds: compoundsData,
        caseStudies: caseStudiesData
      });

      setCounts({
        plants: plantsData.length,
        compounds: compoundsData.length,
        caseStudies: caseStudiesData.length
      });

      // Set active tab to first non-empty result
      if (plantsData.length > 0) {
        setActiveTab('plants');
      } else if (compoundsData.length > 0) {
        setActiveTab('compounds');
      } else if (caseStudiesData.length > 0) {
        setActiveTab('caseStudies');
      }

    } catch (error) {
      console.error('Search error:', error);
      // Fallback data
      setResults({
        plants: [
          {
            id: 1,
            common_name: 'Neem',
            scientific_name: 'Azadirachta indica',
            slug: 'neem',
            family: 'Meliaceae',
            compound_count: 45
          }
        ],
        compounds: [],
        caseStudies: []
      });
      setCounts({ plants: 1, compounds: 0, caseStudies: 0 });
    } finally {
      setLoading(false);
    }
  };

  const totalResults = counts.plants + counts.compounds + counts.caseStudies;

  const tabs = [
    { id: 'plants', label: 'Plants', icon: FaLeaf, count: counts.plants },
    { id: 'compounds', label: 'Compounds', icon: FaFlask, count: counts.compounds },
    { id: 'caseStudies', label: 'Case Studies', icon: FaBook, count: counts.caseStudies }
  ];

  return (
    <div className="search-results-page">
      {/* Header */}
      <div className="search-results-header">
        <div className="container">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Back to Home
          </Link>
          
          <div className="search-results-title">
            <h1>
              <FaSearch /> Search Results
            </h1>
            {query && (
              <p className="search-query-info">
                {loading ? (
                  'Searching...'
                ) : (
                  <>
                    Found <strong>{totalResults}</strong> results for "<strong>{query}</strong>"
                  </>
                )}
              </p>
            )}
          </div>

          {/* Search Bar */}
          <div className="search-results-search">
            <SearchBar 
              placeholder="Search again..."
              autoFocus={false}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="search-tabs-wrapper">
        <div className="container">
          <div className="search-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.count === 0}
              >
                <tab.icon />
                <span>{tab.label}</span>
                <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="search-results-content">
        <div className="container">
          {loading ? (
            <div className="results-grid">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : totalResults === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">
                <FaSearch />
              </div>
              <h2>No Results Found</h2>
              <p>
                We couldn't find any results for "<strong>{query}</strong>". 
                Try searching with different keywords.
              </p>
              <div className="no-results-suggestions">
                <h4>Suggestions:</h4>
                <ul>
                  <li>Check your spelling</li>
                  <li>Try more general keywords</li>
                  <li>Try searching by scientific name</li>
                  <li>Browse our <Link to="/plants">plant database</Link></li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Plants Results */}
              {activeTab === 'plants' && (
                <div className="results-section">
                  <div className="results-section-header">
                    <h2><FaLeaf /> Plants ({counts.plants})</h2>
                  </div>
                  {results.plants.length > 0 ? (
                    <div className="results-grid">
                      {results.plants.map((plant) => (
                        <PlantCard key={plant.id} plant={plant} />
                      ))}
                    </div>
                  ) : (
                    <div className="no-results-tab">
                      <p>No plants found matching your search.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Compounds Results */}
              {activeTab === 'compounds' && (
                <div className="results-section">
                  <div className="results-section-header">
                    <h2><FaFlask /> Compounds ({counts.compounds})</h2>
                  </div>
                  {results.compounds.length > 0 ? (
                    <div className="compounds-list">
                      {results.compounds.map((compound) => (
                        <div key={compound.id} className="compound-result-card">
                          <div className="compound-info">
                            <h3>{compound.name}</h3>
                            <p className="compound-class">{compound.chemical_class}</p>
                            {compound.molecular_formula && (
                              <p className="compound-formula">{compound.molecular_formula}</p>
                            )}
                          </div>
                          <div className="compound-meta">
                            {compound.plants && compound.plants.length > 0 && (
                              <div className="compound-plants">
                                <span>Found in:</span>
                                {compound.plants.slice(0, 3).map((plant, i) => (
                                  <Link key={i} to={`/plant/${plant.slug}`}>
                                    {plant.common_name}
                                  </Link>
                                ))}
                                {compound.plants.length > 3 && (
                                  <span className="more">+{compound.plants.length - 3} more</span>
                                )}
                              </div>
                            )}
                            <span className={`badge badge-${compound.activity_type || 'primary'}`}>
                              {compound.activity || 'Bioactive'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-results-tab">
                      <p>No compounds found matching your search.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Case Studies Results */}
              {activeTab === 'caseStudies' && (
                <div className="results-section">
                  <div className="results-section-header">
                    <h2><FaBook /> Case Studies ({counts.caseStudies})</h2>
                  </div>
                  {results.caseStudies.length > 0 ? (
                    <div className="case-studies-list">
                      {results.caseStudies.map((study) => (
                        <div key={study.id} className="case-study-result-card">
                          <div className="case-study-info">
                            <h3>{study.title}</h3>
                            <p className="case-study-author">
                              By {study.author_name} • {study.institution}
                            </p>
                            <p className="case-study-abstract">
                              {study.abstract?.substring(0, 200)}...
                            </p>
                          </div>
                          <div className="case-study-actions">
                            <Link 
                              to={`/case-studies/${study.id}`} 
                              className="btn btn-outline btn-sm"
                            >
                              View Study
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-results-tab">
                      <p>No case studies found matching your search.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;