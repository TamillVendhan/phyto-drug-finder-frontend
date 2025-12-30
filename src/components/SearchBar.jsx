import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaLeaf, FaFlask, FaHistory, FaArrowRight } from 'react-icons/fa';
import { plantsAPI } from '../api/api';
import debounce from 'lodash.debounce';

const SearchBar = ({ 
  placeholder = "Search plants by name, family, or compound...",
  autoFocus = false,
  showSuggestions = true,
  onSearch,
  className = "",
  size = "normal" // normal, large
}) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('phyto_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Debounced search function
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await plantsAPI.search(searchQuery, { limit: 6 });
        if (response.data.success) {
          setSuggestions(response.data.data || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (showSuggestions) {
      fetchSuggestions(value);
      setShowDropdown(true);
    }
  };

  // Save to recent searches
  const saveRecentSearch = (searchTerm) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('phyto_recent_searches', JSON.stringify(updated));
  };

  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setShowDropdown(false);
      
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (plant) => {
    saveRecentSearch(plant.common_name);
    setShowDropdown(false);
    setQuery('');
    navigate(`/plant/${plant.slug}`);
  };

  // Handle recent search click
  const handleRecentClick = (term) => {
    setQuery(term);
    setShowDropdown(false);
    
    if (onSearch) {
      onSearch(term);
    } else {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('phyto_recent_searches');
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const items = [...suggestions, ...recentSearches.map(s => ({ type: 'recent', term: s }))];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (selectedIndex >= suggestions.length) {
          e.preventDefault();
          handleRecentClick(recentSearches[selectedIndex - suggestions.length]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showRecentSearches = showDropdown && query.length === 0 && recentSearches.length > 0;
  const showSuggestionsList = showDropdown && query.length >= 2;

  return (
    <div className={`search-bar-wrapper ${className} ${size === 'large' ? 'search-bar-large' : ''}`}>
      <form onSubmit={handleSubmit} className="search-bar-form">
        <div className="search-input-container">
          <FaSearch className="search-bar-icon" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-bar-input"
            autoFocus={autoFocus}
            autoComplete="off"
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

          <button type="submit" className="search-submit-btn">
            {isLoading ? (
              <span className="search-loader"></span>
            ) : (
              <>
                <span>Search</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {(showSuggestionsList || showRecentSearches) && (
        <div className="search-dropdown" ref={suggestionsRef}>
          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="search-recent">
              <div className="search-dropdown-header">
                <span><FaHistory /> Recent Searches</span>
                <button onClick={clearRecentSearches} className="clear-recent-btn">
                  Clear
                </button>
              </div>
              <ul className="search-suggestions-list">
                {recentSearches.map((term, index) => (
                  <li 
                    key={term}
                    className={`search-suggestion-item recent ${selectedIndex === suggestions.length + index ? 'selected' : ''}`}
                    onClick={() => handleRecentClick(term)}
                  >
                    <FaHistory className="suggestion-icon" />
                    <span className="suggestion-text">{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestionsList && (
            <div className="search-suggestions">
              {isLoading ? (
                <div className="search-loading">
                  <span className="spinner small"></span>
                  <span>Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="search-dropdown-header">
                    <span><FaLeaf /> Plants</span>
                  </div>
                  <ul className="search-suggestions-list">
                    {suggestions.map((plant, index) => (
                      <li 
                        key={plant.id}
                        className={`search-suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSuggestionClick(plant)}
                      >
                        <div className="suggestion-image">
                          {plant.image_url ? (
                            <img src={plant.image_url} alt={plant.common_name} />
                          ) : (
                            <FaLeaf />
                          )}
                        </div>
                        <div className="suggestion-info">
                          <span className="suggestion-name">{plant.common_name}</span>
                          <span className="suggestion-scientific">{plant.scientific_name}</span>
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
                  <span>No plants found for "{query}"</span>
                  <p>Try searching with different keywords</p>
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