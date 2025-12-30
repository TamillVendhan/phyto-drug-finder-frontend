import React from 'react';
import { FaLeaf } from 'react-icons/fa';

// Full page loader
export const PageLoader = () => {
  return (
    <div className="page-loader">
      <div className="loader-content">
        <div className="leaf-spinner">
          <FaLeaf className="leaf-icon" />
        </div>
        <h3>Loading...</h3>
        <p>Discovering phytochemicals</p>
      </div>
    </div>
  );
};

// Inline loader (for sections)
export const InlineLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="inline-loader">
      <div className="spinner"></div>
      <span>{text}</span>
    </div>
  );
};

// Button loader
export const ButtonLoader = () => {
  return <span className="btn-loader"></span>;
};

// Skeleton loader for cards
export const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
      </div>
    </div>
  );
};

// Skeleton loader for list items
export const SkeletonList = ({ count = 5 }) => {
  return (
    <div className="skeleton-list">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="skeleton-list-item">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-info">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton loader for table
export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {[...Array(cols)].map((_, index) => (
          <div key={index} className="skeleton-th"></div>
        ))}
      </div>
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {[...Array(cols)].map((_, colIndex) => (
            <div key={colIndex} className="skeleton-td"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Default export
const Loader = PageLoader;
export default Loader;