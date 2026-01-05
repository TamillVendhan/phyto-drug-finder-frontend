import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';import {
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
  variant = 'default', // 'default' | 'compact' | 'horizontal'
  showBookmark = true,
  onBookmarkChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Safely get initial bookmark state
  const initialBookmarked = Boolean(plant?.is_bookmarked);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Ensure plant and id exist
  if (!plant || !plant.id || !plant.slug) {
    console.warn('PlantCard: Invalid plant data', plant);
    return null;
  }

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please login to bookmark plants');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isBookmarking) return; // Prevent double-click

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

      // Notify parent (e.g., bookmark page to re-render count)
      onBookmarkChange?.(plant.id, !isBookmarked);
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Failed to update bookmark');
      // Optionally revert UI on error
      // setIsBookmarked(prev => !prev);
    } finally {
      setIsBookmarking(false);
    }
  };

  const getEvidenceBadgeClass = (level) => {
    if (!level) return 'badge-primary';
    switch (level.toLowerCase()) {
      case 'clinical':   return 'badge-success';
      case 'experimental': return 'badge-info';
      case 'traditional': return 'badge-warning';
      default:           return 'badge-primary';
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Shared image component to avoid duplication
  const PlantImage = ({ size = 'default' }) => (
    <>
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.common_name || 'Medicinal plant'}
          loading="lazy"
          className={`plant-image-${size}`}
        />
      ) : (
        <div className={`plant-card-placeholder ${size === 'small' ? 'small' : ''}`}>
          <FaLeaf />
        </div>
      )}
    </>
  );

  // Default Variant
  if (variant === 'default') {
    return (
      <div className="plant-card" role="article">
        <Link to={`/plant/${plant.slug}`} className="plant-card-link" aria-label={`View details for ${plant.common_name}`}>
          <div className="plant-card-image">
            <PlantImage />

            <div className="plant-card-overlay">
              <span className="view-details">
                <FaEye /> View Details
              </span>
            </div>

            {plant.family && (
              <span className="plant-family-badge">{plant.family}</span>
            )}
          </div>

          <div className="plant-card-content">
            <h3 className="plant-card-title">{plant.common_name || 'Unknown Plant'}</h3>
            <p className="plant-card-scientific">{plant.scientific_name || 'N/A'}</p>

            {plant.description && (
              <p className="plant-card-description">
                {truncateText(plant.description, 100)}
              </p>
            )}

            <div className="plant-card-stats">
              {plant.compound_count > 0 && (
                <span className="plant-stat">
                  <FaFlask /> {plant.compound_count} Compounds
                </span>
              )}
              {plant.medicinal_uses_count > 0 && (
                <span className="plant-stat">
                  <FaSeedling /> {plant.medicinal_uses_count} Uses
                </span>
              )}
            </div>

            {plant.evidence_level && (
              <span className={`badge ${getEvidenceBadgeClass(plant.evidence_level)}`}>
                {plant.evidence_level}
              </span>
            )}
          </div>

          <div className="plant-card-footer">
            {plant.regions && (
              <span className="plant-region">
                <FaMapMarkerAlt /> {plant.regions}
              </span>
            )}
            <FaArrowRight className="plant-arrow" />
          </div>
        </Link>

        {showBookmark && (
          <button
            className={`plant-bookmark-btn ${isBookmarked ? 'bookmarked' : ''} ${isBookmarking ? 'loading' : ''}`}
            onClick={handleBookmark}
            disabled={isBookmarking}
            aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarking ? (
              <span className="btn-loader small" />
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

  // Compact Variant
  if (variant === 'compact') {
    return (
      <div className="plant-card-compact">
        <Link to={`/plant/${plant.slug}`} className="plant-card-compact-link">
          <div className="plant-card-compact-image">
            <PlantImage size="small" />
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

  // Horizontal Variant
  if (variant === 'horizontal') {
    return (
      <div className="plant-card-horizontal">
        <Link to={`/plant/${plant.slug}`} className="plant-card-horizontal-link">
          <div className="plant-card-horizontal-image">
            <PlantImage />
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
                {truncateText(plant.description, 150)}
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
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarking ? <span className="btn-loader small" /> : isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default PlantCard;