import { useState } from "react";
import {
  Send, Package, FileText, Hash,
  CheckCircle2, AlertCircle, Loader2, Info, CalendarClock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../api/axios";
import "../../styles/receiver.css";

const PostNeeds = () => {
  const [formData, setFormData] = useState({
    category: "food",
    description: "",
    quantityNeeded: "",
    urgency: "medium",
    neededBy: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quantityNeeded = Number(formData.quantityNeeded);

    if (!quantityNeeded || quantityNeeded < 1 || quantityNeeded > 10000) {
      setStatus({ type: "error", message: "Quantity must be between 1 and 10000." });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/receiver/request", { ...formData, quantityNeeded });
      setStatus({ type: "success", message: "Your requirement has been posted to nearby donors." });
      setFormData({ category: "food", description: "", quantityNeeded: "", urgency: "medium", neededBy: "" });
      setTimeout(() => setStatus({ type: "", message: "" }), 5000);
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.message || "Failed to post need." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-needs-page">
      <motion.div className="post-card-container wide-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="post-header">
          <div className="icon-circle"><Send size={24} color="#2563eb" /></div>
          <h2>Create New Request</h2>
          <p>Urgency, deadline, and clear notes help donors respond faster.</p>
        </div>

        <AnimatePresence>
          {status.message && (
            <motion.div className={`status-toast ${status.type}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="modern-receiver-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label><Package size={16} /> Item Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="food">Food and Perishables</option>
              <option value="clothes">Clothing and Apparel</option>
              <option value="books">Educational Materials</option>
              <option value="electronics">Electronics and Hardware</option>
              <option value="essentials">Medical and Essentials</option>
            </select>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><Hash size={16} /> Total Quantity Needed</label>
              <input type="number" name="quantityNeeded" placeholder="e.g. 50" min="1" max="10000" value={formData.quantityNeeded} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label><CalendarClock size={16} /> Needed By</label>
              <input type="date" name="neededBy" value={formData.neededBy} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Urgency</label>
            <div className="segmented-control">
              {["low", "medium", "high"].map((level) => (
                <button key={level} type="button" className={formData.urgency === level ? "active" : ""} onClick={() => setFormData({ ...formData, urgency: level })}>
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label><FileText size={16} /> Description and Priority</label>
            <textarea name="description" placeholder="Tell donors how this will help or if there are specific requirements..." value={formData.description} onChange={handleChange} required />
          </div>

          <div className="info-banner">
            <Info size={16} />
            <p>This request will notify nearby donors and appear in the urgent requests dashboard.</p>
          </div>

          <button type="submit" className="post-submit-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : "Publish Requirement"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PostNeeds;
