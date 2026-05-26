import { useEffect, useState } from "react";
import { 
  MapPin, Package, User, CheckCircle2, 
  AlertCircle, Loader2, RefreshCcw, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import CustomSelect from "../../components/CustomSelect";
import "../../styles/receiver.css";

const NearbyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filters, setFilters] = useState({ category: "", distance: "10" });
  const categoryOptions = [
    { value: "", label: "All categories" },
    { value: "food", label: "Food" },
    { value: "clothes", label: "Clothes" },
    { value: "books", label: "Books" },
    { value: "electronics", label: "Electronics" },
    { value: "essentials", label: "Essentials" },
  ];
  const distanceOptions = [
    { value: "5", label: "Within 5 km" },
    { value: "10", label: "Within 10 km" },
    { value: "25", label: "Within 25 km" },
    { value: "50", label: "Within 50 km" },
  ];

  const mapEmbedUrl = (location) => {
    const [lng, lat] = location?.coordinates || [];
    if (!lat || !lng) return "";
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.distance) params.set("distance", filters.distance);
      const res = await api.get(`/receiver/nearby?${params.toString()}`);
      setDonations(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load nearby donations" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [filters.category, filters.distance]);

  const acceptDonation = async (id) => {
    try {
      setLoadingAction(id);
      setMessage({ type: "", text: "" });
      await api.patch(`/receiver/accept/${id}`);
      setMessage({ type: "success", text: "Donation accepted! It's now in your queue." });
      
      // Remove the accepted item from the "Nearby" list locally for instant feedback
      setDonations(prev => prev.filter(d => d._id !== id));
      
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to accept donation. Try again." });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="receiver-page">
      <div className="receiver-container">
        <header className="page-header">
          <div>
            <h1><MapPin size={28} className="icon-map" /> Nearby Resources</h1>
            <p>Available donations from generous donors in your area.</p>
          </div>
          <button onClick={fetchDonations} className="refresh-btn" disabled={loading}>
            <RefreshCcw size={18} className={loading ? "spinner" : ""} />
          </button>
        </header>

        <div className="filter-row">
          <CustomSelect value={filters.category} options={categoryOptions} onChange={(category) => setFilters({ ...filters, category })} />
          <CustomSelect value={filters.distance} options={distanceOptions} onChange={(distance) => setFilters({ ...filters, distance })} />
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div 
              className={`alert-banner ${message.type}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card-receiver" />)}
          </div>
        ) : donations.length === 0 ? (
          <div className="empty-state-nearby">
            <Sparkles size={48} />
            <h3>All caught up!</h3>
            <p>No new donations available nearby right now. Check back later.</p>
          </div>
        ) : (
          <div className="donations-grid-nearby">
            {donations.map((d, index) => (
              <motion.div 
                className="nearby-card" 
                key={d._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="nearby-card-header">
                  <span className={`cat-badge ${d.category}`}>{d.category}</span>
                  <span className={`cond-badge ${d.condition}`}>{d.condition}</span>
                </div>

                <div className="nearby-card-body">
                  {d.images?.[0] && <img className="donation-thumb" src={d.images[0]} alt={d.title || d.category} />}
                  <div className="item-main">
                    <Package size={20} />
                    <h3>{d.title || `${d.quantity} units available`}</h3>
                  </div>
                  {d.description && <p className="card-description">{d.description}</p>}
                  {d.pickupWindow && <p className="card-description">Pickup: {d.pickupWindow}</p>}
                  
                  {d.donor && (
                    <div className="donor-info">
                      <User size={14} />
                      <span>Donor: <strong>{d.donor.name}</strong> ({d.donor.badge || "New Helper"})</span>
                    </div>
                  )}
                  {d.location?.coordinates?.length === 2 && (
                    <div className="pickup-map-card">
                      <iframe title={`Pickup area for ${d._id}`} src={mapEmbedUrl(d.location)} loading="lazy" />
                      <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${d.location.coordinates[1]},${d.location.coordinates[0]}`} target="_blank" rel="noreferrer">
                        Open in Google Maps
                      </a>
                    </div>
                  )}
                </div>

                <button
                  className="accept-btn-premium"
                  disabled={loadingAction === d._id}
                  onClick={() => acceptDonation(d._id)}
                >
                  {loadingAction === d._id ? (
                    <Loader2 className="spinner" size={18} />
                  ) : (
                    "Claim Donation"
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyDonations;
