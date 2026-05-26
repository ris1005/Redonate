import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { 
  User, LogOut, ChevronDown, Heart, 
  History, LayoutDashboard, Truck, PlusCircle, MapPin 
  , Bell, BarChart3, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const res = await api.get("/user/notifications");
        setUnreadCount((res.data || []).filter((item) => !item.read).length);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnread();
    const interval = window.setInterval(fetchUnread, 30000);
    return () => window.clearInterval(interval);
  }, [user, location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <h2 className="logo" onClick={() => navigate("/")}>
          Re<span>Donate</span>
        </h2>

        {/* ✅ ROLE BASED LINKS */}
        <div className="nav-center">
          <div className="nav-links public-links">
            <button className={isActive("/impact") ? "active" : ""} onClick={() => navigate("/impact")}>
              <BarChart3 size={18} /> <span>Impact</span>
            </button>
          </div>
          {user && (
            <div className="nav-links">
              {user.role === "donor" && (
                <>
                  <button className={isActive("/donor/donate") ? "active" : ""} onClick={() => navigate("/donor/donate")}>
                    <Heart size={18} /> <span>Donate</span>
                  </button>
                  <button className={isActive("/donor/my-donations") ? "active" : ""} onClick={() => navigate("/donor/my-donations")}>
                    <History size={18} /> <span>Activity</span>
                  </button>
                  <button className={isActive("/donor/requests") ? "active" : ""} onClick={() => navigate("/donor/requests")}>
                    <LayoutDashboard size={18} /> <span>Requests</span>
                  </button>
                </>
              )}

              {user.role === "receiver" && (
                <>
                  <button className={isActive("/receiver/nearby") ? "active" : ""} onClick={() => navigate("/receiver/nearby")}>
                    <MapPin size={18} /> <span>Nearby</span>
                  </button>
                  <button className={isActive("/receiver/request") ? "active" : ""} onClick={() => navigate("/receiver/request")}>
                    <PlusCircle size={18} /> <span>Post Need</span>
                  </button>
                  <button className={isActive("/receiver/requests") ? "active" : ""} onClick={() => navigate("/receiver/requests")}>
                    <History size={18} /> <span>My Requests</span>
                  </button>
                </>
              )}

              {user.role === "agent" && (
                <button className={isActive("/agent/tasks") ? "active" : ""} onClick={() => navigate("/agent/tasks")}>
                  <Truck size={18} /> <span>Deliveries</span>
                </button>
              )}

              {user.role === "admin" && (
                <button className={isActive("/admin") ? "active" : ""} onClick={() => navigate("/admin")}>
                  <ShieldCheck size={18} /> <span>Admin</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="nav-right">
          {!user ? (
            <div className="auth-menu">
              <button className="login-trigger" onClick={() => setOpen(!open)}>
                Join Us <ChevronDown size={16} className={open ? "rotate" : ""} />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    className="dropdown-premium"
                  >
                    <div className="dropdown-section">
                      <label>Login As</label>
                      <p onClick={() => {navigate("/login/donor"); setOpen(false)}}>Donor</p>
                      <p onClick={() => {navigate("/login/receiver"); setOpen(false)}}>Receiver</p>
                      <p onClick={() => {navigate("/login/agent"); setOpen(false)}}>Agent</p>
                    </div>
                    <div className="dropdown-divider" />
                    <p className="register-link" onClick={() => {navigate("/register"); setOpen(false)}}>Create Account</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="user-profile-actions">
              <button className="logout-btn notification-nav-btn" onClick={() => navigate("/notifications")} title="Notifications">
                <Bell size={18} />
                {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              <div className="avatar-circle" onClick={() => navigate("/profile")}>
                <User size={20} />
              </div>
              <button className="logout-btn" onClick={logout}>
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
