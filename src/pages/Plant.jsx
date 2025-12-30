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

  // Tab data states
  const [compounds, setCompounds] = useState([]);
  const [medicinalUses, setMedicinalUses] = useState([]);
  const [safety, setSafety] = useState(null);
  const [drugLikeness, setDrugLikeness] = useState([]);
  const [ecology, setEcology] = useState(null);
  const [culturalUses, setCulturalUses] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Fetch plant data
  useEffect(() => {
    fetchPlant();
  }, [slug]);

  // Fetch tab data when tab changes
  useEffect(() => {
    if (plant) {
      fetchTabData();
    }
  }, [activeTab, plant]);

  const fetchPlant = async () => {
    try {
      setLoading(true);
      const response = await plantsAPI.getBySlug(slug);
      
      if (response.data.success) {
        setPlant(response.data.data);
        setIsBookmarked(response.data.data.is_bookmarked || false);
      } else {
        toast.error('Plant not found');
        navigate('/plants');
      }
    } catch (error) {
      console.error('Error fetching plant:', error);
      // Fallback data for development
      setPlant({
        id: 1,
        slug: 'neem',
        common_name: 'Neem',
        scientific_name: 'Azadirachta indica',
        family: 'Meliaceae',
        genus: 'Azadirachta',
        species: 'indica',
        kingdom: 'Plantae',
        description: 'Neem is a fast-growing tree that can reach a height of 15–20 metres. It is known for its drought resistance and medicinal properties. All parts of the tree have been used traditionally for their medicinal value.',
        image_url: null,
        compound_count: 35,
        regions: 'India, Southeast Asia, Africa'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    if (!plant) return;
    
    setTabLoading(true);
    try {
      switch (activeTab) {
        case 'compounds':
          const compoundsRes = await compoundsAPI.byPlant(plant.id);
          setCompounds(compoundsRes.data.success ? compoundsRes.data.data : getFallbackCompounds());
          break;
        case 'medicinal':
          const medicinalRes = await medicinalAPI.byPlant(plant.id);
          setMedicinalUses(medicinalRes.data.success ? medicinalRes.data.data : getFallbackMedicinal());
          break;
        case 'safety':
          const safetyRes = await safetyAPI.byPlant(plant.id);
          setSafety(safetyRes.data.success ? safetyRes.data.data : getFallbackSafety());
          break;
        case 'druglikeness':
          const drugRes = await drugLikenessAPI.byPlant(plant.id);
          setDrugLikeness(drugRes.data.success ? drugRes.data.data : getFallbackDrugLikeness());
          break;
        case 'ecology':
          const ecoRes = await ecologyAPI.byPlant(plant.id);
          setEcology(ecoRes.data.success ? ecoRes.data.data : getFallbackEcology());
          break;
        case 'cultural':
          const culturalRes = await culturalAPI.byPlant(plant.id);
          setCulturalUses(culturalRes.data.success ? culturalRes.data.data : getFallbackCultural());
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching tab data:', error);
      // Set fallback data
      switch (activeTab) {
        case 'compounds': setCompounds(getFallbackCompounds()); break;
        case 'medicinal': setMedicinalUses(getFallbackMedicinal()); break;
        case 'safety': setSafety(getFallbackSafety()); break;
        case 'druglikeness': setDrugLikeness(getFallbackDrugLikeness()); break;
        case 'ecology': setEcology(getFallbackEcology()); break;
        case 'cultural': setCulturalUses(getFallbackCultural()); break;
      }
    } finally {
      setTabLoading(false);
    }
  };

  // Fallback data functions
  const getFallbackCompounds = () => [
    { id: 1, name: 'Azadirachtin', chemical_class: 'Tetranortriterpenoid', molecular_formula: 'C35H44O16', activity: ['Insecticidal', 'Antimalarial'] },
    { id: 2, name: 'Nimbin', chemical_class: 'Limonoid', molecular_formula: 'C30H36O9', activity: ['Anti-inflammatory', 'Antiviral'] },
    { id: 3, name: 'Nimbidin', chemical_class: 'Limonoid', molecular_formula: 'C28H34O7', activity: ['Antibacterial', 'Antifungal'] },
    { id: 4, name: 'Gedunin', chemical_class: 'Limonoid', molecular_formula: 'C28H34O7', activity: ['Antimalarial', 'Anticancer'] },
    { id: 5, name: 'Quercetin', chemical_class: 'Flavonoid', molecular_formula: 'C15H10O7', activity: ['Antioxidant', 'Anti-inflammatory'] }
  ];

  const getFallbackMedicinal = () => [
    { id: 1, use_type: 'Traditional', condition: 'Skin disorders', description: 'Used for treating eczema, psoriasis, and other skin conditions', evidence_level: 'Traditional' },
    { id: 2, use_type: 'Traditional', condition: 'Dental care', description: 'Neem twigs used as natural toothbrush for oral hygiene', evidence_level: 'Traditional' },
    { id: 3, use_type: 'Modern', condition: 'Diabetes management', description: 'Studies show potential blood sugar lowering effects', evidence_level: 'Experimental' },
    { id: 4, use_type: 'Modern', condition: 'Antimicrobial', description: 'Effective against various bacteria and fungi', evidence_level: 'Clinical' }
  ];

  const getFallbackSafety = () => ({
    human_safety: 'Generally Safe',
    human_notes: 'Safe when used appropriately. Avoid during pregnancy.',
    animal_safety: 'Caution Required',
    animal_notes: 'Toxic to cats and some aquatic organisms.',
    toxic_dosage: 'Oral LD50 in rats: >5000 mg/kg',
    pregnancy_warning: true,
    pregnancy_notes: 'Not recommended during pregnancy due to potential abortifacient effects.',
    interactions: 'May interact with diabetes and blood pressure medications.'
  });

  const getFallbackDrugLikeness = () => [
    { compound_name: 'Azadirachtin', molecular_weight: 720.7, h_bond_donors: 3, h_bond_acceptors: 16, logp: 1.09, lipinski_violations: 2, absorption: 'Low', toxicity_risk: 'Low' },
    { compound_name: 'Nimbin', molecular_weight: 540.6, h_bond_donors: 1, h_bond_acceptors: 9, logp: 2.5, lipinski_violations: 1, absorption: 'Medium', toxicity_risk: 'Low' },
    { compound_name: 'Quercetin', molecular_weight: 302.2, h_bond_donors: 5, h_bond_acceptors: 7, logp: 1.5, lipinski_violations: 0, absorption: 'High', toxicity_risk: 'Low' }
  ];

  const getFallbackEcology = () => ({
    growth_habit: 'Tree',
    height: '15-20 meters',
    growth_rate: 'Fast',
    lifespan: '150-200 years',
    native_regions: ['India', 'Myanmar', 'Bangladesh', 'Sri Lanka', 'Pakistan'],
    introduced_regions: ['Africa', 'Middle East', 'South America', 'Australia'],
    climate: 'Tropical and Sub-tropical',
    temperature_range: '21-32°C',
    rainfall: '400-1200 mm annually',
    soil_types: ['Sandy', 'Clay', 'Loamy'],
    soil_ph: '6.2-7.0',
    altitude: '0-1500 meters',
    flowering_season: 'March-May',
    fruiting_season: 'June-August'
  });

  const getFallbackCultural = () => [
    { id: 1, system: 'Ayurveda', description: 'Used for blood purification and skin diseases. Known as "Sarva Roga Nivarini" (curer of all ailments).', historical_period: 'Ancient (>2000 years)' },
    { id: 2, system: 'Siddha', description: 'Used in various formulations for fever and skin conditions.', historical_period: 'Ancient' },
    { id: 3, system: 'Folk Medicine', description: 'Leaves used for bathing during chickenpox, bark for dental care.', historical_period: 'Traditional' },
    { id: 4, system: 'Religious', description: 'Considered sacred in Hinduism, associated with goddess Durga.', historical_period: 'Ancient' }
  ];

  // Handle bookmark
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

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      toast.info('Generating PDF...');
      const response = await exportAPI.plantPDF(plant.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plant.common_name}-details.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: plant.common_name,
        text: `Learn about ${plant.common_name} (${plant.scientific_name}) on Phyto Drug Finder`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
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

  if (loading) {
    return <PageLoader />;
  }

  if (!plant) {
    return (
      <div className="plant-not-found">
        <h2>Plant Not Found</h2>
        <Link to="/plants" className="btn btn-primary">Browse Plants</Link>
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

      {/* Plant Header */}
      <section className="plant-header">
        <div className="container">
          <div className="plant-header-content">
            {/* Plant Image */}
            <div className="plant-image-container">
              {plant.image_url ? (
                <img src={plant.image_url} alt={plant.common_name} className="plant-main-image" />
              ) : (
                <div className="plant-image-placeholder">
                  <FaLeaf />
                </div>
              )}
            </div>

            {/* Plant Info */}
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

              {/* Taxonomy */}
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

              {/* Description */}
              {plant.description && (
                <p className="plant-description">{plant.description}</p>
              )}

              {/* Action Buttons */}
              <div className="plant-actions">
                <button 
                  className={`btn ${isBookmarked ? 'btn-primary' : 'btn-outline'}`}
                  onClick={handleBookmark}
                  disabled={bookmarkLoading}
                >
                  {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button className="btn btn-outline" onClick={handleDownloadPDF}>
                  <FaDownload /> Download PDF
                </button>
                <button className="btn btn-outline" onClick={handleShare}>
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
          {/* Tab Navigation */}
          <div className="plant-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`plant-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="plant-tab-content">
            {tabLoading ? (
              <InlineLoader text="Loading data..." />
            ) : (
              <>
                {/* Compounds Tab */}
                {activeTab === 'compounds' && (
                  <div className="tab-panel compounds-panel">
                    <h3>Bioactive Compounds</h3>
                    <p className="tab-description">
                      Phytochemicals and bioactive compounds found in {plant.common_name}
                    </p>
                    
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
                            {compounds.map((compound) => (
                              <tr key={compound.id}>
                                <td className="compound-name">{compound.name}</td>
                                <td>{compound.chemical_class}</td>
                                <td className="formula">{compound.molecular_formula || '-'}</td>
                                <td>
                                  <div className="activity-badges">
                                    {(compound.activity || []).map((act, idx) => (
                                      <span key={idx} className="badge badge-success">{act}</span>
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
                        <p>No compound data available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Medicinal Uses Tab */}
                {activeTab === 'medicinal' && (
                  <div className="tab-panel medicinal-panel">
                    <h3>Medicinal Uses</h3>
                    <p className="tab-description">
                      Traditional and modern medicinal applications
                    </p>

                    {/* Disclaimer */}
                    <div className="disclaimer-box">
                      <FaExclamationTriangle />
                      <p>
                        <strong>Disclaimer:</strong> This information is for educational purposes only 
                        and is not intended as medical advice. Always consult a healthcare professional 
                        before using any medicinal plants.
                      </p>
                    </div>

                    {medicinalUses.length > 0 ? (
                      <div className="medicinal-cards">
                        {medicinalUses.map((use) => (
                          <div key={use.id} className="medicinal-card">
                            <div className="medicinal-card-header">
                              <h4>{use.condition}</h4>
                              <span className={`evidence-badge ${use.evidence_level?.toLowerCase()}`}>
                                {use.evidence_level}
                              </span>
                            </div>
                            <p className="medicinal-type">{use.use_type}</p>
                            <p className="medicinal-description">{use.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <FaPills />
                        <p>No medicinal use data available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Safety Tab */}
                {activeTab === 'safety' && (
                  <div className="tab-panel safety-panel">
                    <h3>Safety Summary</h3>
                    <p className="tab-description">
                      Safety information for human and animal use
                    </p>

                    {safety ? (
                      <div className="safety-grid">
                        {/* Human Safety */}
                        <div className="safety-card">
                          <div className="safety-card-header">
                            <h4>Human Safety</h4>
                            <SafetyBadge status={safety.human_safety} />
                          </div>
                          <p>{safety.human_notes}</p>
                        </div>

                        {/* Animal Safety */}
                        <div className="safety-card">
                          <div className="safety-card-header">
                            <h4>Animal Safety</h4>
                            <SafetyBadge status={safety.animal_safety} />
                          </div>
                          <p>{safety.animal_notes}</p>
                        </div>

                        {/* Pregnancy Warning */}
                        {safety.pregnancy_warning && (
                          <div className="safety-card warning">
                            <div className="safety-card-header">
                              <h4>⚠️ Pregnancy Warning</h4>
                            </div>
                            <p>{safety.pregnancy_notes}</p>
                          </div>
                        )}

                        {/* Toxic Dosage */}
                        {safety.toxic_dosage && (
                          <div className="safety-card">
                            <h4>Toxic Dosage</h4>
                            <p>{safety.toxic_dosage}</p>
                          </div>
                        )}

                        {/* Drug Interactions */}
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
                        <p>No safety data available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Drug-Likeness Tab */}
                {activeTab === 'druglikeness' && (
                  <div className="tab-panel druglikeness-panel">
                    <h3>Drug-Likeness Properties</h3>
                    <p className="tab-description">
                      Lipinski's Rule of Five and ADMET predictions for bioactive compounds
                    </p>

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
                            {drugLikeness.map((drug, idx) => (
                              <tr key={idx}>
                                <td className="compound-name">{drug.compound_name}</td>
                                <td>{drug.molecular_weight}</td>
                                <td>{drug.h_bond_donors}</td>
                                <td>{drug.h_bond_acceptors}</td>
                                <td>{drug.logp}</td>
                                <td>
                                  <span className={`violations-badge ${drug.lipinski_violations === 0 ? 'pass' : drug.lipinski_violations <= 1 ? 'warning' : 'fail'}`}>
                                    {drug.lipinski_violations}
                                  </span>
                                </td>
                                <td>
                                  <span className={`absorption-badge ${drug.absorption?.toLowerCase()}`}>
                                    {drug.absorption}
                                  </span>
                                </td>
                                <td>
                                  <span className={`toxicity-badge ${drug.toxicity_risk?.toLowerCase()}`}>
                                    {drug.toxicity_risk}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Lipinski Rule Legend */}
                        <div className="lipinski-legend">
                          <h5>Lipinski's Rule of Five Criteria:</h5>
                          <ul>
                            <li><strong>MW:</strong> Molecular Weight ≤ 500 Da</li>
                            <li><strong>HBD:</strong> H-Bond Donors ≤ 5</li>
                            <li><strong>HBA:</strong> H-Bond Acceptors ≤ 10</li>
                            <li><strong>LogP:</strong> Lipophilicity ≤ 5</li>
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
                    <p className="tab-description">
                      Growing conditions and geographical distribution
                    </p>

                    {ecology ? (
                      <div className="ecology-content">
                        {/* Growth Info */}
                        <div className="ecology-section">
                          <h4><FaSeedling /> Growth Characteristics</h4>
                          <div className="ecology-grid">
                            <div className="ecology-item">
                              <span className="ecology-label">Growth Habit</span>
                              <span className="ecology-value">{ecology.growth_habit}</span>
                            </div>
                            <div className="ecology-item">
                              <span className="ecology-label">Height</span>
                              <span className="ecology-value">{ecology.height}</span>
                            </div>
                            <div className="ecology-item">
                              <span className="ecology-label">Growth Rate</span>
                              <span className="ecology-value">{ecology.growth_rate}</span>
                            </div>
                            <div className="ecology-item">
                              <span className="ecology-label">Lifespan</span>
                              <span className="ecology-value">{ecology.lifespan}</span>
                            </div>
                          </div>
                        </div>

                        {/* Climate Requirements */}
                        <div className="ecology-section">
                          <h4><FaThermometerHalf /> Climate Requirements</h4>
                          <div className="ecology-grid">
                            <div className="ecology-item">
                              <span className="ecology-label">Climate Type</span>
                              <span className="ecology-value">{ecology.climate}</span>
                            </div>
                            <div className="ecology-item">
                              <span className="ecology-label">Temperature</span>
                              <span className="ecology-value">{ecology.temperature_range}</span>
                            </div>
                            <div className="ecology-item">
                              <span className="ecology-label">Rainfall</span>
                              <span className="ecology-value">{ecology.rainfall}</span>
                            </div>
                            <div className="ecology-item">
                              <span className="ecology-label">Altitude</span>
                              <span className="ecology-value">{ecology.altitude}</span>
                            </div>
                          </div>
                        </div>

                        {/* Soil Requirements */}
                        <div className="ecology-section">
                          <h4><FaTint /> Soil Requirements</h4>
                          <div className="ecology-grid">
                            <div className="ecology-item">
                              <span className="ecology-label">Soil Types</span>
                              <span className="ecology-value">{ecology.soil_types?.join(', ')}</span>
                            </div>
                            <div className="ecology-item">
                              <span className="ecology-label">Soil pH</span>
                              <span className="ecology-value">{ecology.soil_ph}</span>
                            </div>
                          </div>
                        </div>

                        {/* Regions */}
                        <div className="ecology-section">
                          <h4><FaMapMarkerAlt /> Distribution</h4>
                          <div className="regions-container">
                            <div className="region-group">
                              <h5>Native Regions</h5>
                              <div className="region-tags">
                                {ecology.native_regions?.map((region, idx) => (
                                  <span key={idx} className="region-tag native">{region}</span>
                                ))}
                              </div>
                            </div>
                            <div className="region-group">
                              <h5>Introduced Regions</h5>
                              <div className="region-tags">
                                {ecology.introduced_regions?.map((region, idx) => (
                                  <span key={idx} className="region-tag introduced">{region}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Seasons */}
                        <div className="ecology-section">
                          <h4><FaCloudRain /> Seasons</h4>
                          <div className="ecology-grid">
                            <div className="ecology-item">
                              <span className="ecology-label">Flowering</span>
                              <span className="ecology-value">{ecology.flowering_season}</span>
                            </div>
                            <div className="ecology-item">
                              <span className="ecology-label">Fruiting</span>
                              <span className="ecology-value">{ecology.fruiting_season}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <FaSeedling />
                        <p>No ecology data available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Cultural Uses Tab */}
                {activeTab === 'cultural' && (
                  <div className="tab-panel cultural-panel">
                    <h3>Cultural & Historical Uses</h3>
                    <p className="tab-description">
                      Traditional medicine systems and historical significance
                    </p>

                    {culturalUses.length > 0 ? (
                      <div className="cultural-timeline">
                        {culturalUses.map((use) => (
                          <div key={use.id} className="cultural-item">
                            <div className="cultural-marker">
                              <FaLandmark />
                            </div>
                            <div className="cultural-content">
                              <div className="cultural-header">
                                <h4>{use.system}</h4>
                                <span className="cultural-period">{use.historical_period}</span>
                              </div>
                              <p>{use.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <FaLandmark />
                        <p>No cultural use data available</p>
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
          <h3>Related Case Studies</h3>
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
  const getIcon = () => {
    switch (status?.toLowerCase()) {
      case 'safe':
      case 'generally safe':
        return <FaCheckCircle className="text-success" />;
      case 'caution required':
      case 'limited':
        return <FaExclamationTriangle className="text-warning" />;
      case 'unsafe':
      case 'not safe':
        return <FaTimesCircle className="text-error" />;
      default:
        return <FaQuestionCircle className="text-info" />;
    }
  };

  const getClass = () => {
    switch (status?.toLowerCase()) {
      case 'safe':
      case 'generally safe':
        return 'safety-status safe';
      case 'caution required':
      case 'limited':
        return 'safety-status caution';
      case 'unsafe':
      case 'not safe':
        return 'safety-status unsafe';
      default:
        return 'safety-status unknown';
    }
  };

  return (
    <span className={getClass()}>
      {getIcon()} {status}
    </span>
  );
};

export default Plant;