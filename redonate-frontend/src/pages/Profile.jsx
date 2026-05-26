import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck, Bell, ClipboardList, HeartHandshake, MapPin,
  Navigation, PackageCheck, ShieldCheck, Star, Truck, User
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/profile.css";

const roleContent = {
  donor: {
    title: "Donor profile",
    summary: "Manage your giving profile, pickup location, and trust details.",
    dashboard: "/donor/donate",
    icon: <HeartHandshake size={24} />,
    stats: [
      { label: "Primary action", value: "Create donations", icon: <PackageCheck size={18} /> },
      { label: "Network role", value: "Surplus provider", icon: <HeartHandshake size={18} /> },
    ],
  },
  receiver: {
    title: "Receiver profile",
    summary: "Keep your receiving location accurate so nearby donors and agents can reach you.",
    dashboard: "/receiver/nearby",
    icon: <ShieldCheck size={24} />,
    stats: [
      { label: "Primary action", value: "Claim nearby aid", icon: <MapPin size={18} /> },
      { label: "Request flow", value: "Post needs", icon: <ClipboardList size={18} /> },
    ],
  },
  agent: {
    title: "Agent profile",
    summary: "Your location helps assign pickups and deliveries around your operating area.",
    dashboard: "/agent/tasks",
    icon: <Truck size={24} />,
    stats: [
      { label: "Primary action", value: "Deliver items", icon: <Truck size={18} /> },
      { label: "Routing", value: "Nearby tasks", icon: <Navigation size={18} /> },
    ],
  },
  admin: {
    title: "Admin profile",
    summary: "Review trust, reports, and verification across the ReDonate network.",
    dashboard: "/admin",
    icon: <BadgeCheck size={24} />,
    stats: [
      { label: "Primary action", value: "Verify users", icon: <BadgeCheck size={18} /> },
      { label: "Monitoring", value: "Reports", icon: <Bell size={18} /> },
    ],
  },
};

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const currentRole = roleContent[user?.role] || roleContent.donor;
  const [address, setAddress] = useState(user?.location?.address || "");
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);

  if (!user) return null;

  const updateUser = (updatedUser) => {
    login({ token: localStorage.getItem("token"), user: updatedUser });
    setAddress(updatedUser?.location?.address || "");
  };

  const saveLocation = async (payload) => {
    try {
      const res = await api.patch("/user/location", payload);
      updateUser(res.data);
      setMessage("Location updated.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update location.");
    }
  };

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

  const useGps = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const detectedAddress = await reverseGeocode(latitude, longitude);
        setAddress(detectedAddress);
        await saveLocation({ address: detectedAddress, coordinates: [longitude, latitude] });
        setLocating(false);
      },
      () => {
        setMessage("Could not access your location. Please allow location permission.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">{currentRole.icon}</div>
        <div>
          <span className="profile-kicker">{currentRole.title}</span>
          <h1>{user.name}</h1>
          <p>{currentRole.summary}</p>
        </div>
        <button className="profile-primary" onClick={() => navigate(currentRole.dashboard)}>
          Go to Dashboard
        </button>
      </section>

      <section className="profile-layout">
        <article className="profile-panel account-panel">
          <h2>Account</h2>
          <div className="profile-identity">
            <User size={24} />
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <div className="profile-facts">
            <div>
              <span>Role</span>
              <strong>{user.role}</strong>
            </div>
            <div>
              <span>Badge</span>
              <strong>{user.badge || "New Helper"}</strong>
            </div>
            <div>
              <span>Trust score</span>
              <strong><Star size={16} /> {Number(user.trustScore || 0).toFixed(1)}</strong>
            </div>
            <div>
              <span>Verification</span>
              <strong><ShieldCheck size={16} /> {user.isVerified ? "Verified" : "Pending review"}</strong>
            </div>
          </div>
        </article>

        <article className="profile-panel">
          <h2>{user.role} tools</h2>
          <div className="role-stat-grid">
            {currentRole.stats.map((item) => (
              <div className="role-stat" key={item.label}>
                {item.icon}
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="profile-panel location-panel">
          <div className="panel-title-row">
            <h2>Location</h2>
            <button onClick={useGps} disabled={locating}>
              <Navigation size={16} /> {locating ? "Detecting..." : "Use GPS"}
            </button>
          </div>

          <label className="address-field">
            <span><MapPin size={16} /> Address used for matching</span>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, state, zip code" />
          </label>

          {user.location?.coordinates?.length === 2 && (
            <div className="location-preview">
              <span>Saved coordinates</span>
              <strong>{user.location.coordinates[1].toFixed(5)}, {user.location.coordinates[0].toFixed(5)}</strong>
              <a href={`https://www.google.com/maps/search/?api=1&query=${user.location.coordinates[1]},${user.location.coordinates[0]}`} target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
            </div>
          )}

          <button className="profile-save" onClick={() => saveLocation({ address })}>
            Save Address
          </button>
          {message && <p className="profile-message">{message}</p>}
        </article>
      </section>
    </main>
  );
};

export default Profile;
