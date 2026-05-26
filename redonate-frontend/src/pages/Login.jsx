import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion"; // For professional animations
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/auth.css";

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data);
    } catch (err) {
      setError("The email or password you entered is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const routes = { donor: "/donor/donate", receiver: "/receiver/nearby", agent: "/agent/tasks" };
    navigate(routes[user.role] || "/dashboard");
  }, [user, navigate]);

  return (
    <div className="auth-wrapper">
      {/* Left Side: Visual/Brand Content */}
      <div className="auth-visual">
        <div className="visual-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge">Platform v2.0</span>
            <h1>Join a community of <br /><span>impactful giving.</span></h1>
            <ul className="feature-list">
              <li><CheckCircle2 size={18} /> Real-time donation tracking</li>
              <li><CheckCircle2 size={18} /> Verified agent network</li>
              <li><CheckCircle2 size={18} /> Secure transparent transactions</li>
            </ul>
          </motion.div>
        </div>
        <div className="visual-overlay"></div>
      </div>

      {/* Right Side: Login Form */}
      <div className="auth-form-container">
        <motion.div 
          className="form-box"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="field-icon" size={18} />
                <input 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="input-field">
              <div className="label-row">
                <label>Password</label>
                <Link to="/forgot-password">Forgot?</Link>
              </div>
              <div className="input-wrapper">
                <Lock className="field-icon" size={18} />
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  onChange={handleChange} 
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <Loader2 className="spinner" size={20} /> : "Sign In"}
            </button>
          </form>

          <p className="footer-text">
            Don't have an account? <Link to="/register">Create one for free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;