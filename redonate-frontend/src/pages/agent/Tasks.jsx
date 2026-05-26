import { useEffect, useState } from "react";
import { 
  Package, MapPin, CheckCircle2, Truck, 
  ChevronRight, Key, Loader2, AlertCircle, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import CustomSelect from "../../components/CustomSelect";
import "../../styles/agent.css";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [pickupOtp, setPickupOtp] = useState("");
  const [dropOtp, setDropOtp] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [distance, setDistance] = useState("10");
  const distanceOptions = [
    { value: "5", label: "5 km" },
    { value: "10", label: "10 km" },
    { value: "25", label: "25 km" },
    { value: "50", label: "50 km" },
  ];

  const googleMapsUrl = (location) => {
    const [lng, lat] = location?.coordinates || [];
    if (!lat || !lng) return "";
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/agent/tasks?distance=${distance}`);
      const sorted = [...res.data].sort((a, b) => (a.agent ? 0 : 1) - (b.agent ? 0 : 1));
      setTasks(sorted);
    } catch {
      setMessage({ type: "error", text: "Failed to sync tasks" });
    }
  };

  useEffect(() => { fetchTasks(); }, [distance]);

  const handleAction = async (id, actionFn, successMsg, clearFn) => {
    try {
      setLoadingId(id);
      await actionFn();
      setMessage({ type: "success", text: successMsg });
      if (clearFn) clearFn("");
      fetchTasks();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Action failed" });
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  return (
    <div className="agent-page">
      <div className="agent-header">
        <div>
          <h1><Truck size={28} /> Logistics Queue</h1>
          <p>Manage your pickups and deliveries in real-time.</p>
        </div>
        <div className="filter-row compact">
          <CustomSelect value={distance} options={distanceOptions} onChange={setDistance} />
          <button onClick={fetchTasks} className="icon-refresh-btn"><RefreshCw size={20} /></button>
        </div>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div className={`agent-alert ${message.type}`} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="tasks-grid">
        {tasks.length === 0 ? (
          <div className="empty-tasks">
            <Package size={48} />
            <p>No active tasks in your region.</p>
          </div>
        ) : (
          tasks.map((t) => (
            <motion.div className="agent-task-card" key={t._id} layout>
              <div className="task-card-header">
                <span className={`status-pill ${t.status}`}>{t.status}</span>
                <span className="task-category">{t.category} | {t.quantity} Units</span>
              </div>
              {t.title && <h3 className="task-title">{t.title}</h3>}
              {(t.description || t.pickupWindow || t.itemNotes || t.images?.length > 0) && (
                <div className="agent-instructions">
                  {t.images?.length > 0 && (
                    <div className="agent-photo-row">
                      {t.images.slice(0, 3).map((image, index) => <img src={image} alt={`Donation ${index + 1}`} key={image.slice(0, 30)} />)}
                    </div>
                  )}
                  {t.description && <p><strong>Item notes:</strong> {t.description}</p>}
                  {t.pickupWindow && <p><strong>Pickup time:</strong> {t.pickupWindow}</p>}
                  {t.itemNotes && <p><strong>Instructions:</strong> {t.itemNotes}</p>}
                </div>
              )}

              <div className="route-map">
                <div className="route-step">
                  <div className="step-icon pickup"><MapPin size={16} /></div>
                  <div className="step-details">
                    <label>Pickup From</label>
                    <p>{t.donor?.location?.address || "Location not specified"}</p>
                    {t.donor?.location?.coordinates?.length === 2 && (
                      <a className="map-link" href={googleMapsUrl(t.donor.location)} target="_blank" rel="noreferrer">Open pickup map</a>
                    )}
                  </div>
                </div>
                <div className="route-connector"></div>
                <div className="route-step">
                  <div className="step-icon dropoff"><ChevronRight size={16} /></div>
                  <div className="step-details">
                    <label>Deliver To</label>
                    <p>{t.receiver?.location?.address || "Location not specified"}</p>
                    {t.receiver?.location?.coordinates?.length === 2 && (
                      <a className="map-link" href={googleMapsUrl(t.receiver.location)} target="_blank" rel="noreferrer">Open drop map</a>
                    )}
                  </div>
                </div>
              </div>

              <div className="task-actions">
                {!t.agent && (
                  <button className="btn-primary-agent" onClick={() => handleAction(t._id, () => api.patch(`/agent/accept/${t._id}`), "Task accepted. Donor notified.")} disabled={loadingId === t._id}>
                    {loadingId === t._id ? <Loader2 className="spinner" /> : "Accept Delivery Task"}
                  </button>
                )}

                {t.status === "accepted" && t.agent && (
                  <div className="otp-verification">
                    <div className="otp-input-wrapper">
                      <Key size={16} />
                      <input placeholder="Enter Pickup OTP" value={pickupOtp} onChange={(e) => setPickupOtp(e.target.value)} />
                    </div>
                    <button className="btn-confirm" onClick={() => handleAction(t._id, () => api.patch(`/agent/pickup/${t._id}`, { otp: pickupOtp }), "Pickup Verified!", setPickupOtp)} disabled={!pickupOtp || loadingId === t._id}>
                       Confirm Pickup
                    </button>
                  </div>
                )}

                {t.status === "picked" && (
                  <div className="otp-verification">
                    <div className="otp-input-wrapper">
                      <Key size={16} />
                      <input placeholder="Enter Delivery OTP" value={dropOtp} onChange={(e) => setDropOtp(e.target.value)} />
                    </div>
                    <button className="btn-complete" onClick={() => handleAction(t._id, () => api.patch(`/agent/drop/${t._id}`, { otp: dropOtp }), "Delivery Successful!", setDropOtp)} disabled={!dropOtp || loadingId === t._id}>
                       Complete Delivery
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
