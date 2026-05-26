import { useEffect, useState } from "react";
import {
  History, Package, Clock, CheckCircle2,
  Truck, RefreshCw, Inbox, Star, Flag
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import "../../styles/donor.css";

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [ratingScore, setRatingScore] = useState({});

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/donor/my-donations");
      setDonations(res.data);
    } catch (err) {
      console.error("Failed to fetch donations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const rateUser = async (donation, toUserId, score) => {
    try {
      if (!toUserId) return;
      await api.patch(`/donor/donations/${donation._id}/rate`, { toUserId, score });
      setMessage("Rating saved.");
      fetchDonations();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save rating.");
    }
  };

  const reportDonation = async (donation) => {
    const reason = window.prompt("Why are you reporting this donation?");
    if (!reason) return;
    try {
      await api.patch(`/donor/donations/${donation._id}/report`, { reason });
      setMessage("Report submitted for admin review.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not submit report.");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered": return <CheckCircle2 size={16} />;
      case "picked": return <Truck size={16} />;
      case "accepted": return <Clock size={16} />;
      default: return <Package size={16} />;
    }
  };

  return (
    <div className="history-page">
      <div className="history-container">
        <header className="history-header">
          <div>
            <h1><History size={24} /> Donation History</h1>
            <p>Track your contributions and their impact</p>
          </div>
          <button onClick={fetchDonations} className="refresh-btn" title="Refresh">
            <RefreshCw size={20} className={loading ? "spinner" : ""} />
          </button>
        </header>
        {message && <div className="alert-banner success">{message}</div>}

        {loading ? (
          <div className="skeleton-loader">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        ) : donations.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} />
            <h3>No donations yet</h3>
            <p>Your history will appear here once you make your first donation.</p>
          </div>
        ) : (
          <div className="donations-list">
            {donations.map((d, index) => (
              <motion.div 
                className="donation-card-modern" 
                key={d._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="card-main">
                  <div className="item-info">
                    <div className={`icon-box ${d.category}`}>
                      <Package size={24} />
                    </div>
                    <div>
                      <h3>{d.category.charAt(0).toUpperCase() + d.category.slice(1)}</h3>
                      <p>{d.title || `${d.quantity} items`} | {d.condition} condition</p>
                      {d.description && <p className="card-description">{d.description}</p>}
                    </div>
                  </div>

                  <div className="delivery-tag">
                    <span>Sent to:</span>
                    <strong>{d.deliveryType === "ngo" ? "Registered NGO" : "Local Agent"}</strong>
                    {d.receiver?.name && <span>{d.receiver.name}</span>}
                    {d.agent?.name && <span>Agent: {d.agent.name}</span>}
                  </div>

                  <div className={`status-pill ${d.status}`}>
                    {getStatusIcon(d.status)}
                    <span>{d.status}</span>
                  </div>
                </div>
                
                {/* Progress Bar UX */}
                <div className="progress-track">
                  <div className={`step active`}>Request</div>
                  <div className={`step-line ${['accepted', 'picked', 'delivered'].includes(d.status) ? 'active' : ''}`}></div>
                  <div className={`step ${['accepted', 'picked', 'delivered'].includes(d.status) ? 'active' : ''}`}>Accepted</div>
                  <div className={`step-line ${['picked', 'delivered'].includes(d.status) ? 'active' : ''}`}></div>
                  <div className={`step ${['picked', 'delivered'].includes(d.status) ? 'active' : ''}`}>In Transit</div>
                  <div className={`step-line ${d.status === 'delivered' ? 'active' : ''}`}></div>
                  <div className={`step ${d.status === 'delivered' ? 'active' : ''}`}>Delivered</div>
                </div>
                {d.statusHistory?.length > 0 && (
                  <div className="timeline-list">
                    {d.statusHistory.map((event, eventIndex) => (
                      <span key={`${d._id}-${eventIndex}`}>{event.status} - {new Date(event.at).toLocaleString()}</span>
                    ))}
                  </div>
                )}
                <div className="card-actions-row">
                  {d.status === "delivered" && d.agent?._id && (
                    <div className="rating-control">
                      <select value={ratingScore[d._id] || "5"} onChange={(e) => setRatingScore({ ...ratingScore, [d._id]: e.target.value })}>
                        <option value="5">5 stars</option>
                        <option value="4">4 stars</option>
                        <option value="3">3 stars</option>
                        <option value="2">2 stars</option>
                        <option value="1">1 star</option>
                      </select>
                      <button onClick={() => rateUser(d, d.agent._id, Number(ratingScore[d._id] || 5))}><Star size={16} /> Rate agent</button>
                    </div>
                  )}
                  <button onClick={() => reportDonation(d)}><Flag size={16} /> Report</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDonations;
