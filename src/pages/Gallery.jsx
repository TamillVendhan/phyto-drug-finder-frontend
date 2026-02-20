import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaImages,
  FaSearch,
  FaTimes,
  FaExpand,
  FaDownload,
  FaUpload,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCalendar
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { imagesAPI } from '../api/api';
import { toast } from 'react-toastify';

const Gallery = () => {
  const { isAuthenticated } = useAuth();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);

  const imagesPerPage = 12;

  useEffect(() => {
    fetchImages();
  }, [currentPage]);

  const fetchImages = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: imagesPerPage
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await imagesAPI.list(params);

      if (response?.data?.success) {
        setImages(response.data.data || []);
        setTotalImages(response.data.total || 0);
      } else {
        setImages([]);
        setTotalImages(0);
      }

    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]);
      setTotalImages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchImages();
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleDownload = async (image) => {
    try {
      toast.success(`Downloading: ${image.caption || "Image"}`);
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const totalPages = Math.ceil(totalImages / imagesPerPage);

  return (
    <div className="gallery-page">

      {/* HERO */}
      <section className="gallery-hero">
        <div className="container">
          <h1><FaImages /> Plant Image Gallery</h1>
          <p>Browse all approved images uploaded to the system</p>

          <form className="gallery-search" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                    fetchImages();
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="gallery-content">
        <div className="container">

          {/* UPLOAD ACTION */}
          <div className="gallery-actions">
            {isAuthenticated ? (
              <Link to="/gallery/upload" className="btn btn-primary">
                <FaUpload /> Upload Image
              </Link>
            ) : (
              <Link to="/login?redirect=/gallery/upload" className="btn btn-primary">
                <FaUpload /> Login to Upload
              </Link>
            )}
          </div>

          {/* IMAGE GRID */}
          {loading ? (
            <div className="gallery-grid">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="gallery-item-skeleton">
                  <div className="skeleton-image"></div>
                </div>
              ))}
            </div>

          ) : images.length > 0 ? (
            <>
              <div className="gallery-grid">
                {images.map((image, index) => (
                  <div key={image.id} className="gallery-item">

                    <div
                      className="gallery-image"
                      onClick={() => openLightbox(index)}
                    >
                      <img
                        src={image.file_path}
                        alt={image.alt_text || image.caption || "Plant Image"}
                        loading="lazy"
                      />

                      <div className="gallery-overlay">
                        <FaExpand className="expand-icon" />
                      </div>

                      <span className="gallery-category-badge">
                        {image.category}
                      </span>
                    </div>

                    <div className="gallery-info">
                      <h3 className="gallery-title">
                        {image.caption || "Untitled Image"}
                      </h3>

                      <div className="gallery-meta">
                        <span>
                          <FaUser /> {image.uploaded_by || "Unknown"}
                        </span>
                        <span>
                          <FaCalendar /> {image.created_at}
                        </span>
                      </div>

                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleDownload(image)}
                      >
                        <FaDownload /> Download
                      </button>

                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                  >
                    <FaChevronLeft /> Previous
                  </button>

                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              )}

            </>
          ) : (

            <div className="empty-state">
              <FaImages className="empty-icon" />
              <h3>No images available</h3>
              <p>No approved images found in the system.</p>
            </div>

          )}
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightboxOpen && images[currentImageIndex] && (
        <div className="lightbox" onClick={closeLightbox}>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="lightbox-close" onClick={closeLightbox}>
              <FaTimes />
            </button>

            <button className="lightbox-nav prev" onClick={goToPrevious}>
              <FaChevronLeft />
            </button>

            <div className="lightbox-image-container">
              <img
                src={images[currentImageIndex].file_path}
                alt={images[currentImageIndex].caption}
              />
            </div>

            <button className="lightbox-nav next" onClick={goToNext}>
              <FaChevronRight />
            </button>

            <div className="lightbox-info">
              <h3>
                {images[currentImageIndex].caption}
              </h3>

              <div className="lightbox-meta">
                <span>
                  <FaUser /> {images[currentImageIndex].uploaded_by}
                </span>
                <span>
                  <FaCalendar /> {images[currentImageIndex].created_at}
                </span>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleDownload(images[currentImageIndex])}
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>

          <div className="lightbox-counter">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;
