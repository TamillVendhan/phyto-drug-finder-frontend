import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaTimes,
  FaLeaf,
  FaFlask,
  FaHistory,
  FaArrowRight,
} from 'react-icons/fa';
import { plantsAPI } from '../api/api';
import debounce from 'lodash.debounce';

const SearchBar = ({
  placeholder = "Search plants by name, family, or compound...",
  autoFocus = false,
  showSuggestions = true,
  onSearch,
  className = "",
  size = "normal", // "normal" | "large"
}) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('phyto_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        localStorage.removeItem('phyto_recent_searches');
      }
    }
  }, []);

  // Debounced API search
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await plantsAPI.search(searchQuery.trim(), { limit: 6 });
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Search suggestions error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (showSuggestions) {
      fetchSuggestions(value);
      setShowDropdown(true);
    }
  };

  // Save recent search
  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    const cleaned = term.trim();
    const updated = [
      cleaned,
      ...recentSearches.filter((s) => s !== cleaned),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('phyto_recent_searches', JSON.stringify(updated));
  };

  // Submit search
  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    saveRecentSearch(trimmed);
    setShowDropdown(false);
    setQuery('');

    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  // Click suggestion → go to plant detail
  const handleSuggestionClick = (plant) => {
    saveRecentSearch(plant.common_name);
    setQuery('');
    setShowDropdown(false);
    navigate(`/plant/${plant.slug}`);
  };

  // Click recent → search again
  const handleRecentClick = (term) => {
    setQuery(term);
    inputRef.current?.focus();
    handleSubmit();
  };

  // Clear input
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Clear all recent
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('phyto_recent_searches');
  };

  // Click outside → close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show states
  const showRecent = showDropdown && query.length === 0 && recentSearches.length > 0;
  const showResults = showDropdown && query.length >= 2;

  return (
    <div className={`search-bar-wrapper ${className} ${size === 'large' ? 'search-bar-large' : ''}`}>
      <form onSubmit={handleSubmit} className="search-bar-form" autoComplete="off">
        <div className="search-input-container">
          <FaSearch className="search-bar-icon" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            className="search-bar-input"
            autoFocus={autoFocus}
          />

          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}

          <button type="submit" className="search-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="search-loader" />
            ) : (
              <>
                <span className="submit-text">Search</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {(showRecent || showResults) && (
        <div className="search-dropdown" ref={dropdownRef}>
          {/* Recent Searches */}
          {showRecent && (
            <div className="search-recent">
              <div className="search-dropdown-header">
                <span>
                  <FaHistory /> Recent Searches
                </span>
                <button type="button" onClick={clearRecentSearches} className="clear-recent-btn">
                  Clear
                </button>
              </div>
              <ul className="search-suggestions-list">
                {recentSearches.map((term) => (
                  <li
                    key={term}
                    className="search-suggestion-item recent"
                    onClick={() => handleRecentClick(term)}
                  >
                    <FaHistory className="suggestion-icon" />
                    <span className="suggestion-text">{term}</span>
                    <FaArrowRight className="suggestion-arrow" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Live Suggestions */}
          {showResults && (
            <div className="search-suggestions">
              {isLoading ? (
                <div className="search-loading">
                  <span className="spinner small" />
                  <span>Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="search-dropdown-header">
                    <span>
                      <FaLeaf /> Matching Plants
                    </span>
                  </div>
                  <ul className="search-suggestions-list">
                    {suggestions.map((plant) => (
                      <li
                        key={plant.id}
                        className="search-suggestion-item"
                        onClick={() => handleSuggestionClick(plant)}
                      >
                        <div className="suggestion-image">
                          {plant.image_url ? (
                            <img src={plant.image_url} alt={plant.common_name} loading="lazy" />
                          ) : (
                            <FaLeaf />
                          )}
                        </div>
                        <div className="suggestion-info">
                          <div className="suggestion-name">{plant.common_name}</div>
                          <div className="suggestion-scientific">{plant.scientific_name}</div>
                        </div>
                        {plant.compound_count > 0 && (
                          <span className="suggestion-badge">
                            <FaFlask /> {plant.compound_count}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="search-dropdown-footer">
                    <button
                      type="button"
                      className="view-all-btn"
                      onClick={handleSubmit}
                    >
                      View all results for "{query}" <FaArrowRight />
                    </button>
                  </div>
                </>
              ) : (
                <div className="search-no-results">
                  <FaSearch />
                  <p>No plants found for "{query}"</p>
                  <small>Try different keywords or spelling</small>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;