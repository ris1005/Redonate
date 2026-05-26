import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, Mail, Lock, MapPin, 
  Navigation, UserCircle, ShieldCheck, Truck, Loader2, ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/auth.css";

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    address: "",
    coordinates: null
  });
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();
      return data.display_name || `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    } catch {
      return `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const detectedAddress = await reverseGeocode(latitude, longitude);
        setForm(prev => ({
          ...prev,
          address: detectedAddress,
          coordinates: [longitude, latitude]
        }));
        setLocLoading(false);
      },
      () => {
        alert("Please allow location access");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      const res = await api.post("/auth/login", { email: form.email, password: form.password });
      login(res.data);
      navigate("/");
    } catch (err) {
      alert("Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Visual Section (Hidden on Mobile) */}
      <div className="auth-visual">
        <div className="visual-overlay"></div>
        <div className="visual-content">
          <span className="badge">Join the community</span>
          <h1>Small acts, <span>Big impact.</span></h1>
          <ul className="feature-list">
            <li><ShieldCheck size={20} color="#60a5fa" /> Verified NGO Network</li>
            <li><MapPin size={20} color="#60a5fa" /> Real-time proximity matching</li>
            <li><Truck size={20} color="#60a5fa" /> Seamless delivery tracking</li>
          </ul>
        </div>
      </div>

      {/* Form Section */}
      <div className="auth-form-container">
        <motion.div 
          className="form-box"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="form-header">
            <h2>Create Account</h2>
            <p>Join us in making a difference today.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User className="field-icon" size={18} />
                <input name="name" placeholder="John Doe" onChange={handleChange} required />
              </div>
            </div>

            <div className="input-field">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="field-icon" size={18} />
                <input type="email" name="email" placeholder="john@example.com" onChange={handleChange} required />
              </div>
            </div>

            <div className="input-field">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="field-icon" size={18} />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
              </div>
            </div>

            <div className="input-field">
              <label>Select Your Role</label>
              <div className="role-selector-grid">
                {['donor', 'receiver', 'agent', 'admin'].map((r) => (
                  <button 
                    key={r}
                    type="button"
                    className={`role-option ${form.role === r ? 'active' : ''}`}
                    onClick={() => setForm({...form, role: r})}
                  >
                    {r === 'donor' && <UserCircle size={18} />}
                    {r === 'receiver' && <ShieldCheck size={18} />}
                    {r === 'agent' && <Truck size={18} />}
                    {r === 'admin' && <ShieldCheck size={18} />}
                    <span>{r}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="input-field">
              <label>Location Details</label>
              <div className="input-wrapper">
                <MapPin className="field-icon" size={18} />
                <input 
                  name="address" 
      placeholder="Street, City, Zip Code" 
      value={form.address}
      onChange={handleChange} 
      // This ensures the browser validation is happy
      required={!form.coordinates}
                />
              </div>
              <button 
                type="button" 
                className={`location-fetch-btn ${form.coordinates ? 'success' : ''}`} 
                onClick={getCurrentLocation}
              >
                {locLoading ? <Loader2 size={16} className="spinner" /> : <Navigation size={16} />}
                {form.coordinates ? "Location Captured" : "Auto-detect Location"}
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <Loader2 className="spinner" size={20} /> : <>Get Started <ArrowRight size={18} /></>}
            </button>

            <p className="footer-text">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
