import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaImages,
  FaSearch,
  FaTimes,
  FaExpand,
  FaUpload,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCalendar,
  FaLeaf
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

  /* FIX IMAGE URL */
  const fixImageUrl = (image) => {

    if (image.image_url) {
      return image.image_url.replace(
        "/backend/uploads/",
        "/backend/api/uploads/"
      );
    }

    return (
      "https://hcctrichy.ac.in/phyto-drug-finder-main/backend/api/" +
      image.file_path
    );

  };

  /* FETCH IMAGES */
  const fetchImages = useCallback(async () => {

    try {

      setLoading(true);

      const params = {
        page: currentPage,
        limit: imagesPerPage,
        search: searchQuery || undefined
      };

      const data = await imagesAPI.list(params);

      if (Array.isArray(data)) {

        setImages(data);
        setTotalImages(data.length);

      } else {

        setImages([]);
        setTotalImages(0);

      }

    } catch (error) {

      console.error(error);
      toast.error("Failed loading gallery");

    } finally {

      setLoading(false);

    }

  }, [currentPage, searchQuery]);

  useEffect(() => {

    fetchImages();

  }, [fetchImages]);

  /* SEARCH */
  const handleSearch = (e) => {

    e.preventDefault();
    setCurrentPage(1);
    fetchImages();

  };

  /* LIGHTBOX */
  const openLightbox = (index) => {

    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";

  };

  const closeLightbox = () => {

    setLightboxOpen(false);
    document.body.style.overflow = "auto";

  };

  const goToPrevious = () => {

    setCurrentImageIndex(prev =>
      prev === 0 ? images.length - 1 : prev - 1
    );

  };

  const goToNext = () => {

    setCurrentImageIndex(prev =>
      prev === images.length - 1 ? 0 : prev + 1
    );

  };

  const totalPages = Math.ceil(totalImages / imagesPerPage);

  return (

  <div className="gallery-page">

    {/* HERO */}
    <section className="gallery-hero">

      <div className="container">

        <h1>
          <FaImages /> Plant Image Gallery
        </h1>

        <p>Browse approved uploaded plant images</p>

        <form className="gallery-search" onSubmit={handleSearch}>

          <div className="search-input-wrapper">

            <FaSearch />

            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e)=>setSearchQuery(e.target.value)}
            />

            {searchQuery &&
              <button
                type="button"
                onClick={()=>{
                  setSearchQuery("");
                  fetchImages();
                }}
              >
                <FaTimes/>
              </button>
            }

          </div>

          <button type="submit">
            Search
          </button>

        </form>

      </div>

    </section>

    {/* CONTENT */}
    <section className="gallery-content">

      <div className="container">

        {/* Upload button */}
        <div className="gallery-actions">

          {isAuthenticated ?

            <Link to="/gallery/upload" className="btn btn-primary">
              <FaUpload/> Upload Image
            </Link>

          :

            <Link to="/login?redirect=/gallery/upload" className="btn btn-primary">
              <FaUpload/> Login to Upload
            </Link>

          }

        </div>

        {/* LOADING */}
        {loading ?

          <div className="gallery-grid">
            {[...Array(8)].map((_,i)=>(
              <div key={i} className="gallery-item-skeleton"/>
            ))}
          </div>

        :

        images.length > 0 ?

        <>

        <div className="gallery-grid">

          {images.map((image,index)=>(

          <div key={image.id} className="gallery-item">

            {/* IMAGE */}
            <div
              className="gallery-image"
              onClick={()=>openLightbox(index)}
            >

              <img
                src={fixImageUrl(image)}
                alt={image.caption || "Plant Image"}
                style={{
                  width:"100%",
                  height:"220px",
                  objectFit:"cover"
                }}
              />

              <div className="gallery-overlay">
                <FaExpand/>
              </div>

              <span className="gallery-category-badge">
                {image.category}
              </span>

            </div>

            {/* INFO */}
            <div className="gallery-info">

              <h3>{image.caption}</h3>

              <p className="plant-name">
                <FaLeaf/> {image.plant_name || "Unknown Plant"}
              </p>

              <div className="gallery-meta">

                <span>
                  <FaUser/> {image.uploader_name}
                </span>

                <span>
                  <FaCalendar/> {image.created_at}
                </span>

              </div>

            </div>

          </div>

          ))}

        </div>

        {/* PAGINATION */}
        {totalPages > 1 &&

        <div className="pagination">

          <button
            disabled={currentPage===1}
            onClick={()=>setCurrentPage(p=>p-1)}
          >
            <FaChevronLeft/>
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage===totalPages}
            onClick={()=>setCurrentPage(p=>p+1)}
          >
            <FaChevronRight/>
          </button>

        </div>

        }

        </>

        :

        <div className="empty-state">

          <FaImages/>
          <h3>No images found</h3>
          <p>No approved uploads yet</p>

        </div>

        }

      </div>

    </section>

    {/* LIGHTBOX */}
    {lightboxOpen && images[currentImageIndex] &&

    <div className="lightbox" onClick={closeLightbox}>

      <div
        className="lightbox-content"
        onClick={(e)=>e.stopPropagation()}
      >

        <button onClick={closeLightbox}>
          <FaTimes/>
        </button>

        <button onClick={goToPrevious}>
          <FaChevronLeft/>
        </button>

        <img
          src={fixImageUrl(images[currentImageIndex])}
          alt={images[currentImageIndex].caption || "Plant Image"}
          style={{maxHeight:"80vh"}}
        />

        <div style={{marginTop:"10px"}}>
          <FaLeaf/> {images[currentImageIndex].plant_name}
        </div>

        <button onClick={goToNext}>
          <FaChevronRight/>
        </button>

      </div>

    </div>

    }

  </div>

  );

};

export default Gallery;