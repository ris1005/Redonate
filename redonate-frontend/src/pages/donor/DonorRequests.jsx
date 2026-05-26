import { useEffect, useState } from "react";
import { 
  Heart, Users, Info, PackagePlus, 
  ArrowRight, ShieldCheck, Search, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import CustomSelect from "../../components/CustomSelect";
import "../../styles/donor.css";

const DonorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [donationQty, setDonationQty] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ category: "", urgency: "", distance: "10" });
  const categoryOptions = [
    { value: "", label: "All categories" },
    { value: "food", label: "Food" },
    { value: "clothes", label: "Clothes" },
    { value: "books", label: "Books" },
    { value: "electronics", label: "Electronics" },
    { value: "essentials", label: "Essentials" },
  ];
  const urgencyOptions = [
    { value: "", label: "All urgency" },
    { value: "high", label: "High urgency" },
    { value: "medium", label: "Medium urgency" },
    { value: "low", label: "Low urgency" },
  ];
  const distanceOptions = [
    { value: "5", label: "Within 5 km" },
    { value: "10", label: "Within 10 km" },
    { value: "25", label: "Within 25 km" },
    { value: "50", label: "Within 50 km" },
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.category) params.set("category", filters.category);
        if (filters.urgency) params.set("urgency", filters.urgency);
        if (filters.distance) params.set("distance", filters.distance);
        const res = await api.get(`/donor/requests?${params.toString()}`);
        setRequests(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, [filters.category, filters.urgency, filters.distance]);

  const handleDonate = async (req) => {
    const remaining = req.quantityNeeded - req.quantityReceived;
    const qty = Math.min(Number(donationQty[req._id]), remaining);

    if (!qty || qty <= 0) return;

    try {
      setLoadingId(req._id);
      await api.post("/donor/donate", {
        category: req.category,
        condition: "good",
        quantity: qty,
        deliveryType: "ngo",
        requestId: req._id,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r._id === req._id
            ? { ...r, quantityReceived: r.quantityReceived + qty }
            : r
        )
      );
      setDonationQty({ ...donationQty, [req._id]: "" });
    } catch (err) {
      console.error("Donation failed");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.receiver?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="requests-page">
      <div className="requests-container">
        <header className="page-header">
          <div className="header-text">
            <h1>Urgent Requests</h1>
            <p>Directly support needs from NGOs and local communities.</p>
          </div>
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search category or NGO..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="filter-row">
          <CustomSelect value={filters.category} options={categoryOptions} onChange={(category) => setFilters({ ...filters, category })} />
          <CustomSelect value={filters.urgency} options={urgencyOptions} onChange={(urgency) => setFilters({ ...filters, urgency })} />
          <CustomSelect value={filters.distance} options={distanceOptions} onChange={(distance) => setFilters({ ...filters, distance })} />
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-requests">
            <Heart size={48} className="heart-icon" />
            <p>No active requests found matching your search.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((req) => {
              const progress = (req.quantityReceived / req.quantityNeeded) * 100;
              const isFull = req.quantityReceived >= req.quantityNeeded;

              return (
                <motion.div 
                  key={req._id} 
                  className={`request-card-premium ${isFull ? 'completed' : ''}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="card-top">
                    <span className={`category-tag ${req.category}`}>
                      {req.category}
                    </span>
                    <span className={`category-tag urgency-${req.urgency || "medium"}`}>
                      {req.urgency || "medium"}
                    </span>
                    <div className="receiver-meta">
                      <Users size={14} />
                      <span>{req.receiver?.name || "Verified NGO"} | {req.receiver?.badge || "Partner"}</span>
                    </div>
                  </div>

                  <h3 className="req-desc">{req.description}</h3>

                  <div className="progress-container">
                    <div className="progress-labels">
                      <span>Progress</span>
                      <span>{req.quantityReceived} / {req.quantityNeeded}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <motion.div 
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  {req.neededBy && <p className="card-description">Needed by {new Date(req.neededBy).toLocaleDateString()}</p>}
                  {req.receiver?.location?.coordinates?.length === 2 && (
                    <a className="map-link" href={`https://www.openstreetmap.org/?mlat=${req.receiver.location.coordinates[1]}&mlon=${req.receiver.location.coordinates[0]}#map=15/${req.receiver.location.coordinates[1]}/${req.receiver.location.coordinates[0]}`} target="_blank" rel="noreferrer">
                      View receiver area
                    </a>
                  )}

                  {!isFull ? (
                    <div className="donation-action-area">
                      <div className="qty-input-wrapper">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={donationQty[req._id] || ""}
                          onChange={(e) => setDonationQty({ ...donationQty, [req._id]: e.target.value })}
                        />
                      </div>
                      <button
                        className="quick-donate-btn"
                        onClick={() => handleDonate(req)}
                        disabled={loadingId === req._id || !donationQty[req._id]}
                      >
                        {loadingId === req._id ? <Loader2 className="spinner" size={18} /> : "Donate"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="fully-funded">
                      <ShieldCheck size={18} /> Goal Met
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorRequests;
