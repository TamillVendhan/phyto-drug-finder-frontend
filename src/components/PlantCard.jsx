import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaLeaf, 
  FaFlask, 
  FaBookmark, 
  FaRegBookmark,
  FaEye,
  FaMapMarkerAlt,
  FaSeedling,
  FaArrowRight
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { bookmarksAPI } from '../api/api';
import { toast } from 'react-toastify';

const PlantCard = ({ 
  plant, 
  variant = "default", // default, compact, horizontal
  showBookmark = true,
  onBookmarkChange 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(plant.is_bookmarked || false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Handle bookmark toggle
  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please login to bookmark plants');
      navigate('/login');
      return;
    }

    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        await bookmarksAPI.remove(plant.id);
        setIsBookmarked(false);
        toast.success('Removed from bookmarks');
      } else {
        await bookmarksAPI.add(plant.id);
        setIsBookmarked(true);
        toast.success('Added to bookmarks');
      }
      
      if (onBookmarkChange) {
        onBookmarkChange(plant.id, !isBookmarked);
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    } finally {
      setIsBookmarking(false);
    }
  };

  // Get evidence level badge color
  const getEvidenceBadgeClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'clinical':
        return 'badge-success';
      case 'experimental':
        return 'badge-info';
      case 'traditional':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  // Default Card Layout
  if (variant === "default") {
    return (
      <div className="plant-card">
        <Link to={`/plant/${plant.slug}`} className="plant-card-link">
          {/* Image Section */}
          <div className="plant-card-image">
            {plant.image_url ? (
              <img src={plant.image_url} alt={plant.common_name} loading="lazy" />
            ) : (
              <div className="plant-card-placeholder">
                <FaLeaf />
              </div>
            )}
            
            {/* Overlay with quick info */}
            <div className="plant-card-overlay">
              <span className="view-details">
                <FaEye /> View Details
              </span>
            </div>

            {/* Family Badge */}
            {plant.family && (
              <span className="plant-family-badge">{plant.family}</span>
            )}
          </div>

          {/* Content Section */}
          <div className="plant-card-content">
            <h3 className="plant-card-title">{plant.common_name}</h3>
            <p className="plant-card-scientific">{plant.scientific_name}</p>
            
            {/* Description */}
            {plant.description && (
              <p className="plant-card-description">
                {plant.description.length > 100 
                  ? `${plant.description.substring(0, 100)}...` 
                  : plant.description
                }
              </p>
            )}

            {/* Stats Row */}
            <div className="plant-card-stats">
              {plant.compound_count > 0 && (
                <span className="plant-stat">
                  <FaFlask />
                  <span>{plant.compound_count} Compounds</span>
                </span>
              )}
              {plant.medicinal_uses_count > 0 && (
                <span className="plant-stat">
                  <FaSeedling />
                  <span>{plant.medicinal_uses_count} Uses</span>
                </span>
              )}
            </div>

            {/* Evidence Level */}
            {plant.evidence_level && (
              <span className={`badge ${getEvidenceBadgeClass(plant.evidence_level)}`}>
                {plant.evidence_level}
              </span>
            )}
          </div>

          {/* Card Footer */}
          <div className="plant-card-footer">
            {plant.regions && (
              <span className="plant-region">
                <FaMapMarkerAlt />
                <span>{plant.regions}</span>
              </span>
            )}
            <span className="plant-arrow">
              <FaArrowRight />
            </span>
          </div>
        </Link>

        {/* Bookmark Button */}
        {showBookmark && (
          <button 
            className={`plant-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmark}
            disabled={isBookmarking}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarking ? (
              <span className="btn-loader small"></span>
            ) : isBookmarked ? (
              <FaBookmark />
            ) : (
              <FaRegBookmark />
            )}
          </button>
        )}
      </div>
    );
  }

  // Compact Card Layout
  if (variant === "compact") {
    return (
      <div className="plant-card-compact">
        <Link to={`/plant/${plant.slug}`} className="plant-card-compact-link">
          <div className="plant-card-compact-image">
            {plant.image_url ? (
              <img src={plant.image_url} alt={plant.common_name} loading="lazy" />
            ) : (
              <div className="plant-card-placeholder small">
                <FaLeaf />
              </div>
            )}
          </div>
          <div className="plant-card-compact-content">
            <h4 className="plant-card-compact-title">{plant.common_name}</h4>
            <p className="plant-card-compact-scientific">{plant.scientific_name}</p>
          </div>
          <FaArrowRight className="plant-card-compact-arrow" />
        </Link>
      </div>
    );
  }

  // Horizontal Card Layout
  if (variant === "horizontal") {
    return (
      <div className="plant-card-horizontal">
        <Link to={`/plant/${plant.slug}`} className="plant-card-horizontal-link">
          <div className="plant-card-horizontal-image">
            {plant.image_url ? (
              <img src={plant.image_url} alt={plant.common_name} loading="lazy" />
            ) : (
              <div className="plant-card-placeholder">
                <FaLeaf />
              </div>
            )}
          </div>
          
          <div className="plant-card-horizontal-content">
            <div className="plant-card-horizontal-header">
              <h3 className="plant-card-horizontal-title">{plant.common_name}</h3>
              {plant.family && (
                <span className="badge badge-primary">{plant.family}</span>
              )}
            </div>
            <p className="plant-card-horizontal-scientific">{plant.scientific_name}</p>
            
            {plant.description && (
              <p className="plant-card-horizontal-description">
                {plant.description.length > 150 
                  ? `${plant.description.substring(0, 150)}...` 
                  : plant.description
                }
              </p>
            )}
            
            <div className="plant-card-horizontal-footer">
              <div className="plant-card-stats">
                {plant.compound_count > 0 && (
                  <span className="plant-stat">
                    <FaFlask /> {plant.compound_count} Compounds
                  </span>
                )}
                {plant.regions && (
                  <span className="plant-stat">
                    <FaMapMarkerAlt /> {plant.regions}
                  </span>
                )}
              </div>
              <span className="btn btn-sm btn-outline">
                View Details <FaArrowRight />
              </span>
            </div>
          </div>
        </Link>

        {showBookmark && (
          <button 
            className={`plant-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmark}
            disabled={isBookmarking}
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default PlantCard;