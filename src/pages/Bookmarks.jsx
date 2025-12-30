import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBookmark, 
  FaTrash, 
  FaLeaf,
  FaSearch,
  FaArrowLeft
} from 'react-icons/fa';
import PlantCard from '../components/PlantCard';
import { SkeletonCard, InlineLoader } from '../components/Loader';
import { bookmarksAPI } from '../api/api';
import { toast } from 'react-toastify';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await bookmarksAPI.list();
      
      if (response.data.success) {
        setBookmarks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      // Fallback data
      setBookmarks([
        { id: 1, slug: 'neem', common_name: 'Neem', scientific_name: 'Azadirachta indica', family: 'Meliaceae', compound_count: 35 },
        { id: 2, slug: 'tulsi', common_name: 'Tulsi', scientific_name: 'Ocimum tenuiflorum', family: 'Lamiaceae', compound_count: 28 },
        { id: 3, slug: 'turmeric', common_name: 'Turmeric', scientific_name: 'Curcuma longa', family: 'Zingiberaceae', compound_count: 42 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (plantId) => {
    try {
      await bookmarksAPI.remove(plantId);
      setBookmarks(prev => prev.filter(b => b.id !== plantId));
      toast.success('Bookmark removed');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  const handleBookmarkChange = (plantId, isBookmarked) => {
    if (!isBookmarked) {
      setBookmarks(prev => prev.filter(b => b.id !== plantId));
    }
  };

  const filteredBookmarks = bookmarks.filter(plant => 
    plant.common_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.scientific_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bookmarks-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <Link to="/profile" className="back-link">
            <FaArrowLeft /> Back to Profile
          </Link>
          <div className="header-content">
            <h1><FaBookmark /> My Bookmarks</h1>
            <p>Plants you've saved for quick access</p>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="bookmarks-toolbar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search your bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="bookmark-count">
            <strong>{bookmarks.length}</strong> bookmarked plants
          </div>
        </div>

        {/* Bookmarks Grid */}
        {loading ? (
          <div className="plants-grid">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredBookmarks.length > 0 ? (
          <div className="plants-grid">
            {filteredBookmarks.map((plant) => (
              <PlantCard 
                key={plant.id} 
                plant={{...plant, is_bookmarked: true}} 
                onBookmarkChange={handleBookmarkChange}
              />
            ))}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="empty-state">
            <FaSearch className="empty-icon" />
            <h3>No matches found</h3>
            <p>No bookmarks match your search "{searchQuery}"</p>
            <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <FaBookmark className="empty-icon" />
            <h3>No Bookmarks Yet</h3>
            <p>Start exploring plants and bookmark your favorites!</p>
            <Link to="/plants" className="btn btn-primary">
              <FaLeaf /> Browse Plants
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;