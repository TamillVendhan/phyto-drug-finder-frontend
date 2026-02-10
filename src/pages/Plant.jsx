import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaLeaf,
  FaFlask,
  FaPills,
  FaShieldAlt,
  FaDna,
  FaSeedling,
  FaLandmark,
  FaVolumeUp,
  FaBookmark,
  FaRegBookmark,
  FaDownload,
  FaShare,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaChevronRight,
  FaBook,
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaCloudRain,
  FaTint
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import {
  plantsAPI,
  compoundsAPI,
  medicinalAPI,
  safetyAPI,
  drugLikenessAPI,
  ecologyAPI,
  culturalAPI,
  bookmarksAPI,
  exportAPI
} from '../api/api';
import { PageLoader, InlineLoader } from '../components/Loader';
import AudioButton from '../components/AudioButton';
import { toast } from 'react-toastify';

const Plant = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compounds');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [compounds, setCompounds] = useState([]);
  const [medicinalUses, setMedicinalUses] = useState([]);
  const [safety, setSafety] = useState(null);
  const [drugLikeness, setDrugLikeness] = useState([]);
  const [ecology, setEcology] = useState(null);
  const [culturalUses, setCulturalUses] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    fetchPlant();
  }, [slug]);

  useEffect(() => {
    if (plant) fetchTabData();
  }, [activeTab, plant]);

const fetchPlant = async () => {
  try {
    setLoading(true);
    const response = await plantsAPI.getBySlug(slug);

    setPlant(response);
    setIsBookmarked(response?.is_bookmarked || false);
  } catch (error) {
    toast.error('Plant not found');
    navigate('/plants');
  } finally {
    setLoading(false);
  }
};

  // Fetch data for active tab
  const fetchTabData = async () => {
    if (!plant) return;

    setTabLoading(true);
    try {
      let data;

      switch (activeTab) {
case 'compounds':
  const res = await compoundsAPI.byPlant(plant.id);

  console.log("Compounds API raw:", res);

  setCompounds(Array.isArray(res) ? res : []);
  break;

case 'medicinal':
  data = await medicinalAPI.byPlant(plant.id);
  setMedicinalUses(Array.isArray(data) ? data : []);
  break;

case 'safety':
  data = await safetyAPI.byPlant(plant.id);
  setSafety(data || null);
  break;

case 'druglikeness':
  data = await drugLikenessAPI.byPlant(plant.id);
  setDrugLikeness(Array.isArray(data) ? data : []);
  break;

case 'ecology':
  data = await ecologyAPI.byPlant(plant.id);
  setEcology(data || null);
  break;

case 'cultural':
  data = await culturalAPI.byPlant(plant.id);
  setCulturalUses(Array.isArray(data) ? data : []);
  break;

        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to load section data');

      // Clear on error
      switch (activeTab) {
        case 'compounds': setCompounds([]); break;
        case 'medicinal': setMedicinalUses([]); break;
        case 'safety': setSafety(null); break;
        case 'druglikeness': setDrugLikeness([]); break;
        case 'ecology': setEcology(null); break;
        case 'cultural': setCulturalUses([]); break;
      }
    } finally {
      setTabLoading(false);
    }
  };

  // Bookmark handling
  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to bookmark plants');
      navigate('/login');
      return;
    }

    setBookmarkLoading(true);
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
    } catch (error) {
      toast.error('Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  // PDF download
  const handleDownloadPDF = async () => {
    try {
      toast.info('Generating PDF report...');
      const response = await exportAPI.plantPDF(plant.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plant.common_name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  // Share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${plant.common_name} - Phyto Drug Finder`,
        text: `Learn about ${plant.common_name} on Phyto Drug Finder`,
        url: window.location.href
      }).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const tabs = [
    { id: 'compounds', label: 'Bioactive Compounds', icon: FaFlask },
    { id: 'medicinal', label: 'Medicinal Uses', icon: FaPills },
    { id: 'safety', label: 'Safety Summary', icon: FaShieldAlt },
    { id: 'druglikeness', label: 'Drug-Likeness', icon: FaDna },
    { id: 'ecology', label: 'Growth & Ecology', icon: FaSeedling },
    { id: 'cultural', label: 'Cultural Uses', icon: FaLandmark }
  ];

  if (loading) return <PageLoader />;

  if (!plant) {
    return (
      <div className="container text-center py-5">
        <h2>Plant Not Found</h2>
        <Link to="/plants" className="btn btn-primary mt-3">Browse Plants</Link>
      </div>
    );
  }

  return (
    <div className="plant-page">
      {/* Breadcrumb */}
      <div className="plant-breadcrumb">
        <div className="container">
          <Link to="/plants" className="breadcrumb-back">
            <FaArrowLeft /> Back to Plants
          </Link>
          <div className="breadcrumb-trail">
            <Link to="/">Home</Link>
            <FaChevronRight />
            <Link to="/plants">Plants</Link>
            <FaChevronRight />
            <span>{plant.common_name}</span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <section className="plant-header">
        <div className="container">
          <div className="plant-header-content">
            <div className="plant-image-container">
              {plant.image_url ? (
                <img src={plant.image_url} alt={plant.common_name} className="plant-main-image" />
              ) : (
                <div className="plant-image-placeholder">
                  <FaLeaf />
                </div>
              )}
            </div>

            <div className="plant-info">
              <div className="plant-badges">
                <span className="badge badge-primary">{plant.family}</span>
                {plant.compound_count > 0 && (
                  <span className="badge badge-info">
                    <FaFlask /> {plant.compound_count} Compounds
                  </span>
                )}
              </div>

              <h1 className="plant-title">
                {plant.common_name}
                <AudioButton text={plant.common_name} />
              </h1>

              <p className="plant-scientific">
                <em>{plant.scientific_name}</em>
                <AudioButton text={plant.scientific_name} size="small" />
              </p>

              <div className="plant-taxonomy">
                <h4>Botanical Classification</h4>
                <div className="taxonomy-grid">
                  <div className="taxonomy-item">
                    <span className="taxonomy-label">Kingdom</span>
                    <span className="taxonomy-value">{plant.kingdom || 'Plantae'}</span>
                  </div>
                  <div className="taxonomy-item">
                    <span className="taxonomy-label">Family</span>
                    <span className="taxonomy-value">{plant.family}</span>
                  </div>
                  <div className="taxonomy-item">
                    <span className="taxonomy-label">Genus</span>
                    <span className="taxonomy-value">{plant.genus || '-'}</span>
                  </div>
                  <div className="taxonomy-item">
                    <span className="taxonomy-label">Species</span>
                    <span className="taxonomy-value">{plant.species || '-'}</span>
                  </div>
                </div>
              </div>

              {plant.description && (
                <p className="plant-description">{plant.description}</p>
              )}

              <div className="plant-actions">
                <button
                  onClick={handleBookmark}
                  disabled={bookmarkLoading}
                  className={`btn ${isBookmarked ? 'btn-primary' : 'btn-outline'}`}
                >
                  {bookmarkLoading ? '...' : isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                  {isBookmarked ? ' Bookmarked' : ' Bookmark'}
                </button>

                <button onClick={handleDownloadPDF} className="btn btn-outline">
                  <FaDownload /> Download PDF
                </button>

                <button onClick={handleShare} className="btn btn-outline">
                  <FaShare /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="plant-tabs-section">
        <div className="container">
          <div className="plant-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`plant-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="plant-tab-content">
            {tabLoading ? (
              <InlineLoader text="Loading data..." />
            ) : (
              <>
                {/* Compounds Tab */}
                {activeTab === 'compounds' && (
                  <div className="tab-panel compounds-panel">
                    <h3>Bioactive Compounds</h3>
                    {compounds.length > 0 ? (
                      <div className="compounds-table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Compound Name</th>
                              <th>Chemical Class</th>
                              <th>Molecular Formula</th>
                              <th>Biological Activity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {compounds.map((c) => (
                              <tr key={c.id}>
                                <td className="compound-name">{c.name}</td>
                                <td>{c.chemical_class || '-'}</td>
                                <td className="formula">{c.molecular_formula || '-'}</td>
                                <td>
                                  <div className="activity-badges">
                                    {(c.activity || []).map((act, i) => (
                                      <span key={i} className="badge badge-success">{act}</span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <FaFlask />
                        <p>No compounds recorded for this plant</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Medicinal Uses Tab */}
                {activeTab === 'medicinal' && (
                  <div className="tab-panel medicinal-panel">
                    <h3>Medicinal Uses</h3>
                    <div className="disclaimer-box">
                      <FaExclamationTriangle />
                      <p><strong>Disclaimer:</strong> This information is for educational purposes only and not medical advice.</p>
                    </div>

                    {medicinalUses.length > 0 ? (
                      <div className="medicinal-cards">
                        {medicinalUses.map((use) => (
                          <div key={use.id} className="medicinal-card">
                            <div className="medicinal-card-header">
                              <h4>{use.medical_condition  }</h4>
                              <span className={`evidence-badge ${use.evidence_level?.toLowerCase() || ''}`}>
                                {use.evidence_level || 'Unknown'}
                              </span>
                            </div>
                            <p className="medicinal-type">{use.use_type || 'General'}</p>
                            <p className="medicinal-description">{use.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <FaPills />
                        <p>No medicinal uses recorded</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Safety Tab */}
                {activeTab === 'safety' && (
                  <div className="tab-panel safety-panel">
                    <h3>Safety Summary</h3>
                    {safety ? (
                      <div className="safety-grid">
                        <div className="safety-card">
                          <div className="safety-card-header">
                            <h4>Human Safety</h4>
                            <SafetyBadge status={safety.human_safety} />
                          </div>
                          <p>{safety.human_notes || 'No notes available'}</p>
                        </div>

                        <div className="safety-card">
                          <div className="safety-card-header">
                            <h4>Animal Safety</h4>
                            <SafetyBadge status={safety.animal_safety} />
                          </div>
                          <p>{safety.animal_notes || 'No notes available'}</p>
                        </div>

                        {safety.pregnancy_warning && (
                          <div className="safety-card warning">
                            <div className="safety-card-header">
                              <h4>⚠️ Pregnancy Warning</h4>
                            </div>
                            <p>{safety.pregnancy_notes || 'Avoid during pregnancy'}</p>
                          </div>
                        )}

                        {safety.toxic_dosage && (
                          <div className="safety-card">
                            <h4>Toxic Dosage</h4>
                            <p>{safety.toxic_dosage}</p>
                          </div>
                        )}

                        {safety.interactions && (
                          <div className="safety-card">
                            <h4>Drug Interactions</h4>
                            <p>{safety.interactions}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <FaShieldAlt />
                        <p>No safety information available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Drug-Likeness Tab */}
                {activeTab === 'druglikeness' && (
                  <div className="tab-panel druglikeness-panel">
                    <h3>Drug-Likeness Properties</h3>
                    {drugLikeness.length > 0 ? (
                      <div className="druglikeness-table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Compound</th>
                              <th>MW</th>
                              <th>HBD</th>
                              <th>HBA</th>
                              <th>LogP</th>
                              <th>Violations</th>
                              <th>Absorption</th>
                              <th>Toxicity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drugLikeness.map((d, i) => (
                              <tr key={i}>
                                <td className="compound-name">{d.compound_name}</td>
                                <td>{d.molecular_weight || '-'}</td>
                                <td>{d.h_bond_donors || '-'}</td>
                                <td>{d.h_bond_acceptors || '-'}</td>
                                <td>{d.logp || '-'}</td>
                                <td>
                                  <span className={`violations-badge ${d.lipinski_violations === 0 ? 'pass' : d.lipinski_violations <= 1 ? 'warning' : 'fail'}`}>
                                    {d.lipinski_violations ?? '-'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`absorption-badge ${d.absorption?.toLowerCase() || ''}`}>
                                    {d.absorption || '-'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`toxicity-badge ${d.toxicity_risk?.toLowerCase() || ''}`}>
                                    {d.toxicity_risk || '-'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div className="lipinski-legend">
                          <h5>Lipinski's Rule of Five</h5>
                          <ul>
                            <li>MW ≤ 500 Da</li>
                            <li>H-Bond Donors ≤ 5</li>
                            <li>H-Bond Acceptors ≤ 10</li>
                            <li>LogP ≤ 5</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <FaDna />
                        <p>No drug-likeness data available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Ecology Tab */}
                {activeTab === 'ecology' && (
                  <div className="tab-panel ecology-panel">
                    <h3>Growth & Ecology</h3>
                    {ecology ? (
                      <div className="ecology-content">
                        <div className="ecology-section">
                          <h4><FaSeedling /> Growth Characteristics</h4>
                          <div className="ecology-grid">
                            <div className="ecology-item"><span>Growth Habit</span><span>{ecology.growth_habit || '-'}</span></div>
                            <div className="ecology-item"><span>Height</span><span>{ecology.height || '-'}</span></div>
                            <div className="ecology-item"><span>Growth Rate</span><span>{ecology.growth_rate || '-'}</span></div>
                            <div className="ecology-item"><span>Lifespan</span><span>{ecology.lifespan || '-'}</span></div>
                          </div>
                        </div>

                        <div className="ecology-section">
                          <h4><FaThermometerHalf /> Climate</h4>
                          <div className="ecology-grid">
                            <div className="ecology-item"><span>Type</span><span>{ecology.climate || '-'}</span></div>
                            <div className="ecology-item"><span>Temperature</span><span>{ecology.temperature_range || '-'}</span></div>
                            <div className="ecology-item"><span>Rainfall</span><span>{ecology.rainfall || '-'}</span></div>
                            <div className="ecology-item"><span>Altitude</span><span>{ecology.altitude || '-'}</span></div>
                          </div>
                        </div>

                        <div className="ecology-section">
                          <h4><FaTint /> Soil</h4>
                          <div className="ecology-grid">
                            <div className="ecology-item"><span>Types</span><span>{ecology.soil_types?.join(', ') || '-'}</span></div>
                            <div className="ecology-item"><span>pH</span><span>{ecology.soil_ph || '-'}</span></div>
                          </div>
                        </div>

                        <div className="ecology-section">
                          <h4><FaMapMarkerAlt /> Distribution</h4>
                          <div className="regions-container">
                            <div className="region-group">
                              <h5>Native</h5>
                              <div className="region-tags">
                                {ecology.native_regions?.length > 0 ? ecology.native_regions.map((r, i) => (
                                  <span key={i} className="region-tag native">{r}</span>
                                )) : <span>-</span>}
                              </div>
                            </div>
                            <div className="region-group">
                              <h5>Introduced</h5>
                              <div className="region-tags">
                                {ecology.introduced_regions?.length > 0 ? ecology.introduced_regions.map((r, i) => (
                                  <span key={i} className="region-tag introduced">{r}</span>
                                )) : <span>-</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ecology-section">
                          <h4><FaCloudRain /> Seasons</h4>
                          <div className="ecology-grid">
                            <div className="ecology-item"><span>Flowering</span><span>{ecology.flowering_season || '-'}</span></div>
                            <div className="ecology-item"><span>Fruiting</span><span>{ecology.fruiting_season || '-'}</span></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <FaSeedling />
                        <p>No ecological data available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Cultural Uses Tab */}
                {activeTab === 'cultural' && (
                  <div className="tab-panel cultural-panel">
                    <h3>Cultural & Historical Uses</h3>
                    {culturalUses.length > 0 ? (
                      <div className="cultural-timeline">
                        {culturalUses.map((c) => (
                          <div key={c.id} className="cultural-item">
                            <div className="cultural-marker"><FaLandmark /></div>
                            <div className="cultural-content">
                              <div className="cultural-header">
                                <h4>{c.system}</h4>
                                <span className="cultural-period">{c.historical_period || 'Traditional'}</span>
                              </div>
                              <p>{c.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <FaLandmark />
                        <p>No cultural uses recorded</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Related Case Studies */}
      <section className="related-section">
        <div className="container">
          <h3>Related Research</h3>
          <Link to={`/case-studies?plant=${plant.slug}`} className="btn btn-outline">
            <FaBook /> View Case Studies for {plant.common_name}
          </Link>
        </div>
      </section>
    </div>
  );
};

// Safety Badge Component
const SafetyBadge = ({ status }) => {
  const getIconAndClass = () => {
    const lower = status?.toLowerCase() || '';
    if (lower.includes('safe')) return { icon: <FaCheckCircle />, className: 'safe' };
    if (lower.includes('caution') || lower.includes('limited')) return { icon: <FaExclamationTriangle />, className: 'caution' };
    if (lower.includes('unsafe') || lower.includes('toxic')) return { icon: <FaTimesCircle />, className: 'unsafe' };
    return { icon: <FaQuestionCircle />, className: 'unknown' };
  };

  const { icon, className } = getIconAndClass();

  return (
    <span className={`safety-status ${className}`}>
      {icon} {status || 'Unknown'}
    </span>
  );
};

export default Plant;