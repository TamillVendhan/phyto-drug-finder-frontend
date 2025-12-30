import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaImages, 
  FaFilter, 
  FaSearch,
  FaTimes,
  FaExpand,
  FaDownload,
  FaLeaf,
  FaMicroscope,
  FaPalette,
  FaBook,
  FaUpload,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCalendar
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { imagesAPI } from '../api/api';
import { SkeletonCard, InlineLoader } from '../components/Loader';
import { toast } from 'react-toastify';

const Gallery = () => {
  const { isAuthenticated } = useAuth();
  
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);

  const imagesPerPage = 12;

  useEffect(() => {
    fetchCategories();
    fetchImages();
  }, [selectedCategory, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await imagesAPI.categories();
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { id: 'plant_photos', name: 'Plant Photos', count: 245, icon: 'leaf' },
        { id: 'microscopic', name: 'Microscopic Images', count: 89, icon: 'microscope' },
        { id: 'artwork', name: 'Traditional Artwork', count: 56, icon: 'palette' },
        { id: 'herbarium', name: 'Herbarium Sheets', count: 120, icon: 'book' }
      ]);
    }
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: imagesPerPage
      };
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await imagesAPI.list(params);
      
      if (response.data.success) {
        setImages(response.data.data || []);
        setTotalImages(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      // Fallback data
      setImages([
        {
          id: 1,
          title: 'Neem Tree Leaves',
          description: 'Fresh neem leaves showing characteristic shape',
          category: 'plant_photos',
          plant_name: 'Neem',
          image_url: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Neem+Leaves',
          thumbnail_url: 'https://via.placeholder.com/200x150/22c55e/ffffff?text=Neem',
          uploaded_by: 'Dr. Sharma',
          uploaded_at: '2024-01-15',
          downloads: 45
        },
        {
          id: 2,
          title: 'Tulsi Plant',
          description: 'Holy basil plant in full bloom',
          category: 'plant_photos',
          plant_name: 'Tulsi',
          image_url: 'https://via.placeholder.com/400x300/16a34a/ffffff?text=Tulsi+Plant',
          thumbnail_url: 'https://via.placeholder.com/200x150/16a34a/ffffff?text=Tulsi',
          uploaded_by: 'Research Team',
          uploaded_at: '2024-01-10',
          downloads: 32
        },
        {
          id: 3,
          title: 'Turmeric Rhizome Cross Section',
          description: 'Microscopic view of turmeric rhizome',
          category: 'microscopic',
          plant_name: 'Turmeric',
          image_url: 'https://via.placeholder.com/400x300/eab308/ffffff?text=Turmeric+Microscopy',
          thumbnail_url: 'https://via.placeholder.com/200x150/eab308/ffffff?text=Turmeric',
          uploaded_by: 'Lab Assistant',
          uploaded_at: '2024-01-08',
          downloads: 28
        },
        {
          id: 4,
          title: 'Ashwagandha Botanical Illustration',
          description: 'Traditional botanical artwork of Ashwagandha',
          category: 'artwork',
          plant_name: 'Ashwagandha',
          image_url: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Ashwagandha+Art',
          thumbnail_url: 'https://via.placeholder.com/200x150/8b5cf6/ffffff?text=Ashwagandha',
          uploaded_by: 'Art Department',
          uploaded_at: '2024-01-05',
          downloads: 67
        },
        {
          id: 5,
          title: 'Aloe Vera Herbarium Sheet',
          description: 'Pressed and preserved Aloe vera specimen',
          category: 'herbarium',
          plant_name: 'Aloe Vera',
          image_url: 'https://via.placeholder.com/400x300/14b8a6/ffffff?text=Aloe+Herbarium',
          thumbnail_url: 'https://via.placeholder.com/200x150/14b8a6/ffffff?text=Aloe',
          uploaded_by: 'Herbarium Curator',
          uploaded_at: '2024-01-03',
          downloads: 19
        },
        {
          id: 6,
          title: 'Ginger Root Structure',
          description: 'Detailed view of ginger rhizome structure',
          category: 'plant_photos',
          plant_name: 'Ginger',
          image_url: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Ginger+Root',
          thumbnail_url: 'https://via.placeholder.com/200x150/f59e0b/ffffff?text=Ginger',
          uploaded_by: 'Dr. Patel',
          uploaded_at: '2024-01-01',
          downloads: 54
        }
      ]);
      setTotalImages(120);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName) => {
    const icons = {
      leaf: FaLeaf,
      microscope: FaMicroscope,
      palette: FaPalette,
      book: FaBook
    };
    const Icon = icons[iconName] || FaImages;
    return <Icon />;
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
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async (image) => {
    try {
      // In production, this would trigger actual download
      toast.success(`Downloading: ${image.title}`);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchImages();
  };

  const totalPages = Math.ceil(totalImages / imagesPerPage);

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="container">
          <div className="gallery-hero-content">
            <h1><FaImages /> Plant Image Gallery</h1>
            <p>
              Explore our collection of plant photographs, microscopic images, 
              botanical illustrations, and herbarium specimens.
            </p>
            
            {/* Search */}
            <form className="gallery-search" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search images by plant name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="clear-btn"
                    onClick={() => {
                      setSearchQuery('');
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
        </div>
      </section>

      {/* Main Content */}
      <section className="gallery-content">
        <div className="container">
          {/* Category Filters */}
          <div className="gallery-categories">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
            >
              <FaImages />
              <span>All Images</span>
              <span className="count">{totalImages}</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
              >
                {getCategoryIcon(category.icon)}
                <span>{category.name}</span>
                <span className="count">{category.count}</span>
              </button>
            ))}
          </div>

          {/* Upload Button */}
          {isAuthenticated && (
            <div className="gallery-actions">
              <Link to="/gallery/upload" className="btn btn-primary">
                <FaUpload /> Upload Image
              </Link>
            </div>
          )}

          {/* Images Grid */}
          {loading ? (
            <div className="gallery-grid">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="gallery-item-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                  </div>
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
                        src={image.thumbnail_url || image.image_url} 
                        alt={image.title}
                        loading="lazy"
                      />
                      <div className="gallery-overlay">
                        <FaExpand className="expand-icon" />
                      </div>
                      <span className="gallery-category-badge">
                        {image.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="gallery-info">
                      <h3 className="gallery-title">{image.title}</h3>
                      <p className="gallery-plant">
                        <FaLeaf /> {image.plant_name}
                      </p>
                      <div className="gallery-meta">
                        <span><FaUser /> {image.uploaded_by}</span>
                        <span><FaDownload /> {image.downloads}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
              <h3>No images found</h3>
              <p>Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && images[currentImageIndex] && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <FaTimes />
            </button>
            
            <button className="lightbox-nav prev" onClick={goToPrevious}>
              <FaChevronLeft />
            </button>
            
            <div className="lightbox-image-container">
              <img 
                src={images[currentImageIndex].image_url} 
                alt={images[currentImageIndex].title}
              />
            </div>
            
            <button className="lightbox-nav next" onClick={goToNext}>
              <FaChevronRight />
            </button>

            <div className="lightbox-info">
              <h3>{images[currentImageIndex].title}</h3>
              <p>{images[currentImageIndex].description}</p>
              <div className="lightbox-meta">
                <span><FaLeaf /> {images[currentImageIndex].plant_name}</span>
                <span><FaUser /> {images[currentImageIndex].uploaded_by}</span>
                <span><FaCalendar /> {images[currentImageIndex].uploaded_at}</span>
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