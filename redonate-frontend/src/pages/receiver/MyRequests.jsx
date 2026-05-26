import { useEffect, useState } from "react";
import { 
  ClipboardList, CheckCircle, Clock, 
  Layers, Loader2, BarChart3, PackageOpen 
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "../../api/axios";
import "../../styles/receiver.css";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/receiver/requests");
        setRequests(res.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "open": return "status-open";
      case "fulfilled": return "status-full";
      case "pending": return "status-pending";
      default: return "status-pending";
    }
  };

  return (
    <div className="receiver-page">
      <div className="receiver-header-row">
        <div>
          <h1><ClipboardList size={28} /> My Requests</h1>
          <p>Tracking your active requirements and incoming aid.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="spinner" size={32} />
          <p>Updating your records...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-dashboard">
          <Layers size={48} />
          <h3>No active requests</h3>
          <p>You haven't posted any resource requests yet.</p>
        </div>
      ) : (
        <div className="requests-grid-receiver">
          {requests.map((req, index) => {
            const progress = req?.quantityNeeded > 0
              ? Math.min((req.quantityReceived / req.quantityNeeded) * 100, 100)
              : 0;

            return (
              <motion.div 
                key={req?._id || index}
                className="receiver-card-premium"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="card-top-receiver">
                  <span className={`status-dot-label ${getStatusStyle(req?.status)}`}>
                    
                    {req?.status === "open" && <Clock size={12} />}
                    {req?.status === "fulfilled" && <CheckCircle size={12} />}
                    {req?.status === "pending" && <Loader2 size={12} />}

                    {req?.status}
                  </span>

                  <div className="category-pill">
                    <PackageOpen size={14} />
                    {req?.category}
                  </div>
                </div>

                <div className="card-body-receiver">
                  <h3>{req?.description}</h3>
                  
                  <div className="stat-row">
                    <div className="stat-item">
                      <label>Target</label>
                      <span>{req?.quantityNeeded}</span>
                    </div>
                    <div className="stat-item">
                      <label>Received</label>
                      <span className="received-count">
                        {req?.quantityReceived}
                      </span>
                    </div>
                  </div>

                  <div className="receiver-progress-area">
                    <div className="progress-text-row">
                      <span>Fulfillment</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <motion.div 
                        className="progress-bar-fill-receiver"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-footer-receiver">
                  <BarChart3 size={14} />
                  <span>
                    Request ID: {req?._id?.slice(-6)?.toUpperCase() || "N/A"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequests;