import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaStar,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaShoppingBag,
  FaUsers,
  FaBox,
  FaChartLine,
  FaRobot,
  FaMobileAlt,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

/* ───────────── Scroll-to-top button ───────────── */
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-xl hover:scale-110 transition-transform"
      aria-label="Scroll to top"
    >
      <FaChevronUp size={18} />
    </motion.button>
  );
};

/* ───────────── Animated Counter ───────────── */
const AnimatedCounter = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

/* ───────────── HOME ───────────── */
const Home = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ── Navbar ── */
  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#features" },
    { label: "Why Us", href: "#why-us" },
    { label: "FAQ", href: "#faq" },
  ];

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ── Stats ── */
  const stats = [
    { value: 10000, suffix: "+", label: "Products" },
    { value: 5000, suffix: "+", label: "Happy Customers" },
    { value: 99, suffix: "%", label: "Uptime" },
    { value: 24, suffix: "/7", label: "Support" },
  ];

  /* ── Features ── */
  const features = [
    { icon: <FaShoppingBag />, title: "Smart Shopping", desc: "Curated product catalog with powerful search, filters, and personalized recommendations." },
    { icon: <FaShieldAlt />, title: "Secure Auth", desc: "Multi-role authentication with OTP verification, password reset, and session management." },
    { icon: <FaChartLine />, title: "Admin Analytics", desc: "Owner dashboard with revenue tracking, order insights, and employee management." },
    { icon: <FaRobot />, title: "AI Chatbot", desc: "Intelligent shopping assistant powered by Groq RAG technology for instant support." },
    { icon: <FaTruck />, title: "Order Tracking", desc: "Real-time order status updates from placement to doorstep delivery." },
    { icon: <FaMobileAlt />, title: "Mobile Ready", desc: "Expo-powered mobile app for Android & iOS alongside the responsive web platform." },
  ];

  /* ── Value propositions ── */
  const values = [
    { icon: <FaShieldAlt size={28} />, title: "100% Secure", desc: "Enterprise-grade security with encrypted data & OTP verification" },
    { icon: <FaTruck size={28} />, title: "Fast Delivery", desc: "Track your orders in real-time from warehouse to doorstep" },
    { icon: <FaHeadset size={28} />, title: "24/7 Support", desc: "AI chatbot + dedicated support for instant help anytime" },
    { icon: <FaStar size={28} />, title: "Premium Quality", desc: "Curated products with ratings & reviews from real customers" },
  ];

  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#0a0a0f] text-[#f0f0f5]">
      {/* ─── SCROLL TO TOP ─── */}
      <ScrollToTop />

      {/* ─── NAVBAR ─── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo("#hero")}>
            <img src="/logooo.png" alt="Shop4Ever" className="w-10 h-10 rounded-full border border-[#FF8C00]/50 shadow-lg" />
            <span className="text-xl font-extrabold text-gradient">Shop4Ever</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <button key={l.label} onClick={() => scrollTo(l.href)} className="text-sm font-medium text-gray-300 hover:text-orange-500 transition-colors">
                {l.label}
              </button>
            ))}
            <button onClick={() => navigate("/login")} className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 transition-opacity shadow-lg">
              Get Started
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-gray-300 hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden glass border-t border-white/5 overflow-hidden">
              <div className="flex flex-col gap-2 px-6 py-4">
                {navLinks.map((l) => (
                  <button key={l.label} onClick={() => scrollTo(l.href)} className="text-left py-3 text-gray-300 hover:text-orange-500 transition-colors font-medium">
                    {l.label}
                  </button>
                ))}
                <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold">
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─── HERO SECTION ─── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-500 opacity-[0.07] rounded-full blur-[120px] animate-float" />
          <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-[#FF4B91] opacity-[0.06] rounded-full blur-[120px] animate-float-delayed" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[#8A2BE2] opacity-[0.06] rounded-full blur-[120px] animate-float" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full glass text-sm font-medium text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Full-Stack E-Commerce Platform
            </motion.div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-6">
              <span className="text-gradient animate-gradient-x">Shop Smarter.</span>
              <br />
              <span className="text-gray-100">Live Better.</span>
            </h1>

            {/* Subheading */}
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 leading-relaxed mb-10">
              Discover your next favorite product — smartly, stylishly, and securely. A premium shopping experience built with modern technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/login")} className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl shadow-xl hover:shadow-[0_0_40px_rgba(255,140,0,0.3)] transition-all flex items-center gap-3">
                Start Shopping <FaArrowRight />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => scrollTo("#features")} className="px-8 py-4 text-lg font-bold text-gray-200 glass rounded-2xl border border-white/10 hover:border-[#FF8C00]/40 transition-all">
                Explore Features
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="relative z-10 -mt-8 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl glass"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center py-4">
                <p className="text-3xl md:text-4xl font-extrabold text-gradient">
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-gray-400 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gradient mb-4">Powerful Features</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Everything you need for a world-class e-commerce experience, built with modern technologies.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(255, 140, 0, 0.1)" }}
                className="group p-8 rounded-2xl glass hover:border-[#FF8C00]/30 transition-all duration-300 cursor-default"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-[#FF8C00]/20 flex items-center justify-center text-orange-500 text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed text-[15px]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY US SECTION ─── */}
      <section id="why-us" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gradient mb-4">Why Shop4Ever?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">We're not just another shopping platform. Here's what sets us apart.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center p-8 rounded-2xl glass group hover:border-[#FF8C00]/30 transition-all"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-[#8A2BE2]/20 border border-[#FF8C00]/20 flex items-center justify-center text-orange-500 mb-6 group-hover:animate-pulse-glow transition-all">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-100 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gradient mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Find answers to common questions about Shop4Ever.</p>
          </motion.div>
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass border border-[#FF8C00]/20 rounded-2xl overflow-hidden transition-all duration-300">
              <button onClick={() => setFaqOpen(!faqOpen)} className="w-full px-8 py-6 text-left flex justify-between items-center bg-transparent focus:outline-none hover:bg-white/5 transition-colors">
                <span className="text-lg font-bold text-gray-100 pr-4">If I log in via Google and want to log in with email later, how do I get a password?</span>
                <FaChevronDown className={`text-orange-500 transition-transform duration-300 flex-shrink-0 ${faqOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {faqOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-8 pb-6 text-gray-400 leading-relaxed text-[15px] border-t border-white/5 pt-4">
                      You can get a password by using the <strong>"Forgot Password"</strong> method on the Login page. Simply click "Forgot Password", enter your Google email address, verify the OTP sent to your inbox, and set a new password. You can then use that password to log in via email!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 md:p-16 rounded-3xl overflow-hidden text-center"
          >
            {/* BG gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-[#FF4B91]/10 to-[#8A2BE2]/15 rounded-3xl" />
            <div className="absolute inset-0 glass rounded-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-100 mb-4">Ready to Start Shopping?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">Join thousands of happy customers and discover a smarter way to shop.</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/login")} className="px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl shadow-xl hover:shadow-[0_0_40px_rgba(255,140,0,0.3)] transition-all inline-flex items-center gap-3">
                Create Free Account <FaArrowRight />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logooo.png" alt="Shop4Ever" className="w-10 h-10 rounded-full border border-[#FF8C00]/50" />
                <span className="text-xl font-extrabold text-gradient">Shop4Ever</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                A full-stack e-commerce ecosystem designed with modern technologies, focusing on speed, security, and seamless user experience.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <button onClick={() => scrollTo("#hero")} className="text-left text-sm text-gray-500 hover:text-orange-500 transition-colors">Home</button>
                <button onClick={() => scrollTo("#features")} className="text-left text-sm text-gray-500 hover:text-orange-500 transition-colors">Features</button>
                <button onClick={() => scrollTo("#why-us")} className="text-left text-sm text-gray-500 hover:text-orange-500 transition-colors">Why Us</button>
                <button onClick={() => scrollTo("#faq")} className="text-left text-sm text-gray-500 hover:text-orange-500 transition-colors">FAQ</button>
                <button onClick={() => navigate("/login")} className="text-left text-sm text-gray-500 hover:text-orange-500 transition-colors">Login</button>
              </div>
            </div>

            {/* Socials */}
            <div>
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Connect</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-[#FF8C00]/30 transition-all">
                  <FaGithub size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-[#FF8C00]/30 transition-all">
                  <FaLinkedin size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-[#FF8C00]/30 transition-all">
                  <FaTwitter size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Shop4Ever. All rights reserved.</p>
            <p className="text-xs text-gray-600">Built with React, Node.js, MySQL & ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
