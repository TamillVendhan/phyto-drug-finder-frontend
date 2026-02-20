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

const BASE_URL =
"https://hcctrichy.ac.in/phyto-drug-finder-main/backend/";

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

  /*
  ----------------------------
  FETCH IMAGES
  ----------------------------
  */

  useEffect(() => {

    fetchImages();

  }, [currentPage]);

  const fetchImages = async () => {

    try {

      setLoading(true);

      const params = {

        page: currentPage,
        limit: imagesPerPage,
        search: searchQuery || undefined

      };

      const response = await imagesAPI.list(params);

      console.log("Gallery API:", response);

      if (response?.data?.success) {

        setImages(response.data.data || []);

        setTotalImages(
          response.data.pagination?.total || 0
        );

      } else {

        setImages([]);
        setTotalImages(0);

      }

    } catch (error) {

      console.error(error);

      setImages([]);
      setTotalImages(0);

    } finally {

      setLoading(false);

    }

  };

  /*
  ----------------------------
  SEARCH
  ----------------------------
  */

  const handleSearch = (e) => {

    e.preventDefault();

    setCurrentPage(1);

    fetchImages();

  };

  /*
  ----------------------------
  LIGHTBOX
  ----------------------------
  */

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

    setCurrentImageIndex(prev =>
      prev === 0 ? images.length - 1 : prev - 1
    );

  };

  const goToNext = () => {

    setCurrentImageIndex(prev =>
      prev === images.length - 1 ? 0 : prev + 1
    );

  };

  /*
  ----------------------------
  DOWNLOAD
  ----------------------------
  */

  const handleDownload = (image) => {

    const url = BASE_URL + image.file_path;

    const a = document.createElement("a");

    a.href = url;

    a.download = image.caption || "plant-image";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

  };

  /*
  ----------------------------
  PAGINATION
  ----------------------------
  */

  const totalPages = Math.ceil(
    totalImages / imagesPerPage
  );

  /*
  ============================
  JSX
  ============================
  */

  return (

  <div className="gallery-page">

    {/* HERO */}

    <section className="gallery-hero">

      <div className="container">

        <h1>

          <FaImages /> Plant Image Gallery

        </h1>

        <p>

          Browse all approved images

        </p>

        <form
        className="gallery-search"
        onSubmit={handleSearch}
        >

          <div className="search-input-wrapper">

            <FaSearch className="search-icon"/>

            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e)=>
                setSearchQuery(e.target.value)
              }
            />

            {searchQuery &&

              <button
                type="button"
                className="clear-btn"
                onClick={()=>{

                  setSearchQuery("");

                  setCurrentPage(1);

                  fetchImages();

                }}
              >

                <FaTimes/>

              </button>

            }

          </div>

          <button
          className="btn btn-primary"
          type="submit"
          >

            Search

          </button>

        </form>

      </div>

    </section>

    {/* MAIN */}

    <section className="gallery-content">

      <div className="container">

        {/* Upload button */}

        <div className="gallery-actions">

          {isAuthenticated ?

            <Link
            to="/gallery/upload"
            className="btn btn-primary"
            >

              <FaUpload/> Upload Image

            </Link>

          :

            <Link
            to="/login?redirect=/gallery/upload"
            className="btn btn-primary"
            >

              <FaUpload/> Login to Upload

            </Link>

          }

        </div>

        {/* Loading */}

        {loading ?

          <div className="gallery-grid">

            {[...Array(8)].map((_,i)=>(

              <div
              key={i}
              className="gallery-item-skeleton"
              >

                <div className="skeleton-image"/>

              </div>

            ))}

          </div>

        :

        /* Image grid */

        images.length > 0 ?

        <>

        <div className="gallery-grid">

          {images.map((image,index)=>(

          <div
          key={image.id}
          className="gallery-item"
          >

            <div
            className="gallery-image"
            onClick={()=>
              openLightbox(index)
            }
            >

              <img
              src={
                BASE_URL +
                image.file_path
              }
              alt={
                image.caption ||
                "Plant image"
              }
              />

              <div className="gallery-overlay">

                <FaExpand/>

              </div>

              <span className="gallery-category-badge">

                {image.category}

              </span>

            </div>

            <div className="gallery-info">

              <h3>

                {image.caption ||
                 "Untitled"}

              </h3>

              <div className="gallery-meta">

                <span>

                  <FaUser/>

                  {image.uploader_name ||
                   "Unknown"}

                </span>

                <span>

                  <FaCalendar/>

                  {image.created_at}

                </span>

              </div>

              <button
              className="btn btn-sm btn-outline"
              onClick={()=>
                handleDownload(image)
              }
              >

                <FaDownload/> Download

              </button>

            </div>

          </div>

          ))}

        </div>

        {/* Pagination */}

        {totalPages > 1 &&

        <div className="pagination">

          <button
          disabled={currentPage===1}
          onClick={()=>
            setCurrentPage(p=>p-1)
          }
          >

            <FaChevronLeft/>

          </button>

          <span>

            Page {currentPage}
            of {totalPages}

          </span>

          <button
          disabled={
            currentPage===totalPages
          }
          onClick={()=>
            setCurrentPage(p=>p+1)
          }
          >

            <FaChevronRight/>

          </button>

        </div>

        }

        </>

        :

        <div className="empty-state">

          <FaImages/>

          <h3>

            No images found

          </h3>

        </div>

        }

      </div>

    </section>

    {/* LIGHTBOX */}

    {lightboxOpen && images[currentImageIndex] &&

    <div
    className="lightbox"
    onClick={closeLightbox}
    >

      <div
      className="lightbox-content"
      onClick={(e)=>
        e.stopPropagation()
      }
      >

        <button
        onClick={closeLightbox}
        className="lightbox-close"
        >

          <FaTimes/>

        </button>

        <button
        onClick={goToPrevious}
        className="lightbox-nav prev"
        >

          <FaChevronLeft/>

        </button>

        <img
        src={
          BASE_URL +
          images[currentImageIndex]
          .file_path
        }
        alt=""
        />

        <button
        onClick={goToNext}
        className="lightbox-nav next"
        >

          <FaChevronRight/>

        </button>

      </div>

    </div>

    }

  </div>

  );

};

export default Gallery;