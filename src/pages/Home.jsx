import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLeaf, 
  FaFlask, 
  FaSearch, 
  FaArrowRight, 
  FaBook,
  FaImages,
  FaMicroscope,
  FaDna,
  FaGlobeAsia,
  FaUserGraduate,
  FaStar,
  FaQuoteLeft
} from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import PlantCard from '../components/PlantCard';
import Stats from '../components/Stats';
import { SkeletonCard } from '../components/Loader';
import { plantsAPI } from '../api/api';

const Home = () => {
  const [featuredPlants, setFeaturedPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPlants();
  }, []);

  const fetchFeaturedPlants = async () => {
    try {
      setLoading(true);
      const response = await plantsAPI.featured();
      if (response.data.success) {
        setFeaturedPlants(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured plants:', error);
      // Fallback data for development
      setFeaturedPlants([
        {
          id: 1,
          common_name: 'Neem',
          scientific_name: 'Azadirachta indica',
          slug: 'neem',
          family: 'Meliaceae',
          description: 'Known for its antibacterial and antifungal properties.',
          compound_count: 45,
          image_url: null
        },
        {
          id: 2,
          common_name: 'Tulsi',
          scientific_name: 'Ocimum sanctum',
          slug: 'tulsi',
          family: 'Lamiaceae',
          description: 'Sacred herb with numerous medicinal benefits.',
          compound_count: 32,
          image_url: null
        },
        {
          id: 3,
          common_name: 'Turmeric',
          scientific_name: 'Curcuma longa',
          slug: 'turmeric',
          family: 'Zingiberaceae',
          description: 'Powerful anti-inflammatory and antioxidant spice.',
          compound_count: 28,
          image_url: null
        },
        {
          id: 4,
          common_name: 'Ashwagandha',
          scientific_name: 'Withania somnifera',
          slug: 'ashwagandha',
          family: 'Solanaceae',
          description: 'Adaptogenic herb used in Ayurvedic medicine.',
          compound_count: 35,
          image_url: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FaMicroscope,
      title: 'Bioactive Compounds',
      description: 'Explore detailed information about phytochemicals and their molecular properties.'
    },
    {
      icon: FaDna,
      title: 'Drug-Likeness Analysis',
      description: 'Lipinski rules and ADMET properties for drug discovery research.'
    },
    {
      icon: FaGlobeAsia,
      title: 'Traditional Knowledge',
      description: 'Ayurveda, Siddha, and folk medicine documentation.'
    },
    {
      icon: FaBook,
      title: 'Research Case Studies',
      description: 'Peer-reviewed research and clinical studies on medicinal plants.'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Priya Sharma',
      role: 'Pharmacognosy Researcher',
      text: 'An invaluable resource for phytochemical research. The compound database is comprehensive and well-organized.',
      rating: 5
    },
    {
      name: 'Prof. Rajesh Kumar',
      role: 'Ayurveda Department',
      text: 'Bridges the gap between traditional knowledge and modern drug discovery beautifully.',
      rating: 5
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaLeaf /> MSc Bioinformatics Project
            </div>
            <h1 className="hero-title">
              Discover the Power of
              <span className="text-gradient"> Medicinal Plants</span>
            </h1>
            <p className="hero-description">
              A comprehensive database of phytochemicals, bioactive compounds, and 
              traditional medicinal knowledge. Bridging ancient wisdom with modern 
              drug discovery research.
            </p>
            
            {/* Search Bar */}
            <div className="hero-search">
              <SearchBar 
                size="large"
                placeholder="Search plants by name, compound, or family..."
                autoFocus={false}
              />
            </div>

            {/* Quick Links */}
            <div className="hero-quick-links">
              <span>Popular:</span>
              <Link to="/plant/neem">Neem</Link>
              <Link to="/plant/tulsi">Tulsi</Link>
              <Link to="/plant/turmeric">Turmeric</Link>
              <Link to="/plant/ashwagandha">Ashwagandha</Link>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="hero-illustration">
            <div className="hero-plant-circle">
              <FaLeaf className="hero-leaf-icon" />
            </div>
            <div className="floating-card card-1">
              <FaFlask /> 2500+ Compounds
            </div>
            <div className="floating-card card-2">
              <FaLeaf /> 150+ Plants
            </div>
            <div className="floating-card card-3">
              <FaBook /> 45+ Studies
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section-wrapper">
        <div className="container">
          <Stats variant="home" />
        </div>
      </section>

      {/* Featured Plants Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div className="section-header-content">
              <span className="section-badge">Featured</span>
              <h2>Popular Medicinal Plants</h2>
              <p>Explore our most researched medicinal plants with detailed compound information</p>
            </div>
            <Link to="/plants" className="btn btn-outline">
              View All Plants <FaArrowRight />
            </Link>
          </div>

          <div className="featured-grid">
            {loading ? (
              [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            ) : (
              featuredPlants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header centered">
            <span className="section-badge">Features</span>
            <h2>What Makes Us Unique</h2>
            <p>Comprehensive tools and data for phytochemical research</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header centered">
            <span className="section-badge">Process</span>
            <h2>How To Use</h2>
            <p>Simple steps to explore medicinal plant data</p>
          </div>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Search Plant</h3>
                <p>Enter plant name, scientific name, or compound to search</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Explore Data</h3>
                <p>View compounds, medicinal uses, safety info, and more</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Download & Cite</h3>
                <p>Export PDF reports and proper citations for research</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <FaUserGraduate className="cta-icon" />
              <h2>Are You a Researcher?</h2>
              <p>
                Register to submit case studies, upload plant images, and contribute 
                to our growing database of medicinal plant research.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Register Now <FaArrowRight />
                </Link>
                <Link to="/case-studies" className="btn btn-outline btn-lg">
                  View Case Studies
                </Link>
              </div>
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <FaBook /> Submit Research Papers
              </div>
              <div className="cta-feature">
                <FaImages /> Upload Plant Images
              </div>
              <div className="cta-feature">
                <FaStar /> Get Featured
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header centered">
            <span className="section-badge">Testimonials</span>
            <h2>What Researchers Say</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="quick-access-section">
        <div className="container">
          <div className="quick-access-grid">
            <Link to="/plants" className="quick-access-card">
              <FaLeaf className="qa-icon" />
              <h3>Browse Plants</h3>
              <p>Explore our complete plant database</p>
              <span className="qa-arrow"><FaArrowRight /></span>
            </Link>
            <Link to="/case-studies" className="quick-access-card">
              <FaBook className="qa-icon" />
              <h3>Case Studies</h3>
              <p>Read research papers and studies</p>
              <span className="qa-arrow"><FaArrowRight /></span>
            </Link>
            <Link to="/gallery" className="quick-access-card">
              <FaImages className="qa-icon" />
              <h3>Image Gallery</h3>
              <p>View plant photographs and diagrams</p>
              <span className="qa-arrow"><FaArrowRight /></span>
            </Link>
            <Link to="/feedback" className="quick-access-card">
              <FaSearch className="qa-icon" />
              <h3>Ask Question</h3>
              <p>Get help from our experts</p>
              <span className="qa-arrow"><FaArrowRight /></span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;