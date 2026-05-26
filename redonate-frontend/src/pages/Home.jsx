import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Heart, ShieldCheck, MapPin, Target,
  ArrowRight, Users, Building2, Truck, Star,
  Sparkles, Clock, Zap, PackageCheck, Navigation, BellRing, ChevronRight
} from "lucide-react";
import "../styles/home.css";

const Home = () => {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const titleY = useTransform(smoothProgress, [0, 0.2], [0, -50]);
  const opacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);

  // Framer Motion Variants for Staggered Animations
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  return (
    <div className="home-stream">
      {/* ================= HERO SECTION ================= */}
      <section className="hero-kinetic">
        <div className="hero-background-mesh"></div>
        
        <motion.div style={{ y: titleY, opacity }} className="hero-title-group">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
            className="logo-badge"
          >
            <Sparkles size={16} className="text-blue" />
            <span className="logo-main">Re</span>
            <span className="logo-sub">Donate</span>
          </motion.div>

          <motion.h1 variants={containerVars} initial="hidden" animate="show">
            <motion.span variants={itemVars} className="block-line">surplus.</motion.span>
            <motion.span variants={itemVars} className="block-line highlight-italic">meet.</motion.span>
            <motion.span variants={itemVars} className="block-line">need.</motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Turn your extra into someone else's essential. <br />
            We handle the delivery; you make the impact.
          </motion.p>

          <motion.div 
            className="hero-cta" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Link to="/register" className="btn-join-stream primary-glow">
              Join the Movement <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Visuals */}
        <motion.div 
  className="hero-visual-kinetic" 
  initial={{ opacity: 0, filter: "blur(10px)" }} 
  animate={{ opacity: 1, filter: "blur(0px)" }} 
  transition={{ duration: 1.2, delay: 0.3 }}
>
  <div className="logistics-orbit">
    
    {/* NEW: Background clipping layer so lines stay inside, but cards can float outside */}
    <div className="orbit-bg-clip">
      <div className="orbit-grid" />
      <div className="orbit-ring ring-1" />
      <div className="orbit-ring ring-2" />
      <div className="route-beam route-one" />
      <div className="route-beam route-two" />
    </div>

    {/* Nodes */}
    <div className="pulse-node donor-pulse"><Heart size={18} /></div>
    <div className="pulse-node receiver-pulse"><Building2 size={18} /></div>
    <div className="pulse-node agent-pulse"><Truck size={18} /></div>

    {/* Floating Glass Cards */}
    <motion.div className="hero-card donate-card-float glass-panel" animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
      <div className="hero-card-icon blue"><PackageCheck size={20} /></div>
      <div className="card-text">
        <span>Donation matched</span>
        <strong>12 food kits</strong>
      </div>
    </motion.div>

    <motion.div className="hero-card route-card-float glass-panel" animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
      <div className="hero-card-icon green"><Navigation size={20} /></div>
      <div className="card-text">
        <span>Agent route</span>
        <strong>2.8 km pickup</strong>
      </div>
    </motion.div>

    <motion.div className="hero-card otp-card-float glass-panel" animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}>
      <div className="hero-card-icon amber"><ShieldCheck size={20} /></div>
      <div className="card-text">
        <span>OTP secured</span>
        <strong>Handoff verified</strong>
      </div>
    </motion.div>

    {/* Center Core */}
    <div className="match-core glow-core">
      <Sparkles size={24} className="core-icon" />
      <strong>5,214+</strong>
      <span>verified matches</span>
    </div>

    <div className="alert-chip glass-panel">
      <BellRing size={14} className="alert-icon" />
      <span>Live nearby need found</span>
    </div>
  </div>
</motion.div>
</section>

      {/* ================= STATS BANNER ================= */}
      <section className="stats-banner">
        <div className="stat-item">
          <h3>10k+</h3>
          <p>Active Donors</p>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <h3>500+</h3>
          <p>Verified NGOs</p>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <h3>1.2M</h3>
          <p>Items Delivered</p>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <h3>99.9%</h3>
          <p>Success Rate</p>
        </div>
      </section>

      {/* ================= TIMELINE FLOW ================= */}
      <section className="journey-flow-section">
        <motion.div 
          className="flow-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2>The ReDonate Ecosystem</h2>
          <p>A seamless, transparent pipeline engineered for hyper-local aid.</p>
        </motion.div>

        <div className="flow-timeline">
          <motion.div className="flow-line-main" style={{ scaleY: smoothProgress }} />

          {/* Node 1: Donor */}
          <motion.div className="flow-node donor-node" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}>
            <div className="flow-meta">
              <span className="node-icon"><Users size={24} /></span>
              <span className="node-category">The Spark</span>
            </div>
            <div className="flow-content-block">
              <div className="block-glow"></div>
              <h3>Start as a Donor</h3>
              <p>Your journey begins here. Declutter your home with purpose by listing usability-verified items instantly.</p>
              <ul className="flow-list">
                <li><ChevronRight size={16} className="list-icon" /> <Clock size={16} /> Real-time journey tracking</li>
                <li><ChevronRight size={16} className="list-icon" /> <Target size={16} /> Smart item prioritization</li>
                <li><ChevronRight size={16} className="list-icon" /> <MapPin size={16} /> Hyper-local mapping</li>
              </ul>
            </div>
          </motion.div>

          {/* Node 2: NGO */}
          <motion.div className="flow-node receiver-node" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}>
            <div className="flow-meta">
              <span className="node-category">The Gap</span>
              <span className="node-icon"><Building2 size={24} /></span>
            </div>
            <div className="flow-content-block">
              <div className="block-glow"></div>
              <h3>Verified Receivers</h3>
              <p>NGOs post critical needs. We run complex matching algorithms against local surplus in milliseconds.</p>
              <ul className="flow-list">
                <li><ChevronRight size={16} className="list-icon" /> <ShieldCheck size={16} /> Strict KYC verification</li>
                <li><ChevronRight size={16} className="list-icon" /> <Heart size={16} /> Need-based auto-matching</li>
              </ul>
            </div>
          </motion.div>

          {/* Node 3: Agent */}
          <motion.div className="flow-node agent-node" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}>
            <div className="flow-meta">
              <span className="node-icon"><Truck size={24} /></span>
              <span className="node-category">The Engine</span>
            </div>
            <div className="flow-content-block">
              <div className="block-glow"></div>
              <h3>The Agent Network</h3>
              <p>Connect the dots. Pick up items and deliver aid safely. Our system uses end-to-end cryptographic OTPs.</p>
              <ul className="flow-list">
                <li><ChevronRight size={16} className="list-icon" /> <Zap size={16} /> AI route optimization</li>
                <li><ChevronRight size={16} className="list-icon" /> <ShieldCheck size={16} /> Dual OTP handshake</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= IMPACT CTA ================= */}
      <section className="impact-showcase">
        <div className="impact-background"></div>
        <motion.div 
          className="impact-text-wrapper"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="star-wrapper"><Star size={32} color="#facc15" fill="#facc15" /></div>
          <h2>You are the difference.</h2>
          <p>Join over 10,000 donors, NGOs, and logistics agents transforming communities locally.</p>
          <Link to="/register" className="btn-impact-cta">
            Build Your Impact <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;