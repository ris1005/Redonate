import { useState } from "react";
import {
  Shirt, Utensils, Book, Cpu, Heart,
  Package, Building2, User2, CheckCircle, Loader2, ImagePlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import "../../styles/donor.css";

const Donate = () => {
  const [form, setForm] = useState({
    category: "clothes",
    condition: "good",
    quantity: "",
    deliveryType: "ngo",
    title: "",
    description: "",
    expiryDate: "",
    pickupWindow: "",
    itemNotes: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const categories = [
    { id: "clothes", label: "Clothes", icon: <Shirt size={20} /> },
    { id: "food", label: "Food", icon: <Utensils size={20} /> },
    { id: "books", label: "Books", icon: <Book size={20} /> },
    { id: "electronics", label: "Electronics", icon: <Cpu size={20} /> },
    { id: "essentials", label: "Essentials", icon: <Heart size={20} /> },
  ];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const selectOption = (name, value) => setForm({ ...form, [name]: value });

  const handleImages = async (event) => {
    const remainingSlots = 3 - form.images.length;
    const files = Array.from(event.target.files || []).slice(0, remainingSlots);
    const encoded = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    );
    setForm((prev) => ({ ...prev, images: [...prev.images, ...encoded].slice(0, 3) }));
    event.target.value = "";
  };

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, imageIndex) => imageIndex !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quantity = Number(form.quantity);

    if (!quantity || quantity < 1 || quantity > 10000) {
      setMessage({ type: "error", text: "Quantity must be between 1 and 10000." });
      return;
    }

    setLoading(true);
    try {
      await api.post("/donor/donate", { ...form, quantity });
      setMessage({ type: "success", text: "Donation posted. Nearby receivers will be notified." });
      setForm({
        category: "clothes",
        condition: "good",
        quantity: "",
        deliveryType: "ngo",
        title: "",
        description: "",
        expiryDate: "",
        pickupWindow: "",
        itemNotes: "",
        images: [],
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-page">
      <motion.div className="donate-card-premium wide-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="donate-header">
          <h1>Create a Donation</h1>
          <p>Add enough detail for receivers and agents to trust the handoff.</p>
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={`alert-banner ${message.type}`}>
              {message.type === "success" ? <CheckCircle size={18} /> : null}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-section">
            <label>What are you donating?</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button key={cat.id} type="button" className={`cat-item ${form.category === cat.id ? "active" : ""}`} onClick={() => selectOption("category", cat.id)}>
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Item title</label>
              <input name="title" placeholder="e.g. Winter clothes bundle" value={form.title} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Quantity / Items</label>
              <input name="quantity" type="number" min="1" max="10000" placeholder="e.g. 5" value={form.quantity} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea name="description" placeholder="Sizes, contents, quality, pickup instructions..." value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange}>
                <option value="new">Brand New</option>
                <option value="good">Gently Used</option>
                <option value="usable">Old but Usable</option>
              </select>
            </div>
            <div className="input-group">
              <label>Pickup window</label>
              <input name="pickupWindow" placeholder="Today 5-8 PM" value={form.pickupWindow} onChange={handleChange} />
            </div>
          </div>

          {form.category === "food" && (
            <div className="input-group">
              <label>Food expiry / best before</label>
              <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
            </div>
          )}

          <div className="input-group">
            <label>Photos</label>
            <label className="image-upload-box">
              <ImagePlus size={20} />
              <span>{form.images.length}/3 photos selected. Add photos</span>
              <input type="file" accept="image/*" multiple onChange={handleImages} disabled={form.images.length >= 3} />
            </label>
            {form.images.length > 0 && (
              <div className="image-preview-row">
                {form.images.map((image, index) => (
                  <button type="button" className="image-preview-tile" onClick={() => removeImage(index)} key={image.slice(0, 30)}>
                    <img src={image} alt={`Donation preview ${index + 1}`} />
                    <span>Remove</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Extra notes</label>
            <textarea name="itemNotes" placeholder="Anything agents or receivers should know..." value={form.itemNotes} onChange={handleChange} />
          </div>

          <div className="form-section">
            <label>Deliver to</label>
            <div className="delivery-options">
              <div className={`delivery-box ${form.deliveryType === "ngo" ? "active" : ""}`} onClick={() => selectOption("deliveryType", "ngo")}>
                <Building2 size={24} />
                <div>
                  <strong>NGO / Shelter</strong>
                  <p>Directly to registered organizations</p>
                </div>
              </div>

              <div className={`delivery-box ${form.deliveryType === "beggar" ? "active" : ""}`} onClick={() => selectOption("deliveryType", "beggar")}>
                <User2 size={24} />
                <div>
                  <strong>Agent Delivered</strong>
                  <p>Agent delivers to needy individuals</p>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-donate-btn" disabled={loading || !form.quantity}>
            {loading ? <Loader2 className="spinner" /> : <><Package size={20} /> Complete Donation</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Donate;
