import React, { useContext, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import {
  FaShieldAlt, FaMobileAlt, FaLock, FaEnvelope, FaUniversalAccess,
  FaChartPie, FaStar, FaQuoteLeft
} from 'react-icons/fa';
import './LandingPage.css';

// Reusable animation variants for Framer Motion
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

const FeatureCard = ({ icon, title, children }) => (
  <motion.div className="feature-card-detailed" variants={fadeInUp}>
    <div className="feature-icon-detailed">{icon}</div>
    <div className="feature-content-detailed">
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  </motion.div>
);

const TestimonialCard = ({ stars, text, author }) => (
  <motion.div className="testimonial-card" variants={fadeInUp}>
    <FaQuoteLeft className="quote-icon" />
    <div className="stars">{Array(stars).fill(0).map((_, i) => <FaStar key={i} />)}</div>
    <p className="quote">{text}</p>
    <span className="author">- {author}</span>
  </motion.div>
);

const LandingPage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('.landing-nav');
      if (nav) {
        if (window.scrollY > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="landing-page-wrapper">
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-logo">📊 PollingSys</div>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn-nav-secondary">Login</Link>
            <Link to="/login" className="btn-nav-primary">Sign Up</Link>
          </div>
        </div>
      </nav>


      <motion.section className="landing-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <div className="hero-content">
          <motion.h1 variants={fadeInUp}>Your Voice, Your Choice: Empower Change Today!</motion.h1>
          <motion.p className="subtitle" variants={fadeInUp} transition={{ delay: 0.2 }}>
            Are you ready to make your mark on the future? We believe your vote has the power to shape the world around you.
          </motion.p>
          <motion.div variants={fadeInUp} transition={{ delay: 0.4 }}>
            <Link to="/login" className="btn-cta-primary">Register now →</Link>
          </motion.div>
          <motion.div className="social-proof" variants={fadeInUp} transition={{ delay: 0.6 }}>
            <div className="avatars">
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=Jane" alt="avatar" />
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=John" alt="avatar" />
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=Alex" alt="avatar" />
            </div>
            <span>Trusted by students and faculty across the university.</span>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="landing-features-detailed"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <div className="section-header">
          <h2 className="section-title">A Secure, Modern, and Accessible Platform</h2>
          <p className="section-subtitle">Everything you need for fair and efficient university elections.</p>
        </div>
        <div className="features-grid-detailed">
          <FeatureCard icon={<FaShieldAlt />} title="Secure Voting">Each voter has a unique ID and can only vote once, ensuring fair and accurate results.</FeatureCard>
          <FeatureCard icon={<FaMobileAlt />} title="Mobile Ready">Our platform is optimized for all devices. Vote from a web browser anywhere, anytime.</FeatureCard>
          <FeatureCard icon={<FaLock />} title="256-Bit Encryption">All activity has SSL (https://) grade security that keeps your data and ballots secure.</FeatureCard>
          <FeatureCard icon={<FaEnvelope />} title="Email Notifications">We'll notify voters when an election launches so they never miss a chance to participate.</FeatureCard>
          <FeatureCard icon={<FaUniversalAccess />} title="Accessibility">The voting application targets Section 508 and WCAG 2.0 AA compliance for inclusivity.</FeatureCard>
          <FeatureCard icon={<FaChartPie />} title="Instant Results">Results are automatically calculated and presented with beautiful, easy-to-read charts.</FeatureCard>
        </div>
      </motion.section>

      <motion.section
        className="landing-testimonials"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <div className="section-header">
          <h2 className="section-title">What Our Users Think</h2>
        </div>
        <div className="testimonials-grid">
          <TestimonialCard stars={5} author="Anonymous Student">I appreciate the security I find in this platform. I know my vote is anonymous and counts.</TestimonialCard>
          <TestimonialCard stars={4} author="Anonymous Faculty">Now that I don't have to manage paper ballots, gathering feedback is a breeze. This is the best thing I've seen for a long time.</TestimonialCard>
          <TestimonialCard stars={5} author="Anonymous Student">What a relief! The system alerts me when a new vote session opens. I no longer worry about missing my opportunity.</TestimonialCard>
        </div>
      </motion.section>

      <motion.section
        className="cta-section"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.div variants={fadeInUp} className="cta-content">
          <h2>Ready to Make an Impact?</h2>
          <p>Join the community and let your voice be heard. It takes less than a minute to get started.</p>
          <Link to="/login" className="btn-cta-secondary">Create Your Account</Link>
        </motion.div>
      </motion.section>


      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Column 1: Brand Info */}
            <div className="footer-column">
              <h4>📊 PollingSys</h4>
              <p>
                Your elections. Any device. Any location. On time. Empowering student
                and faculty voices through secure and accessible digital polling.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-column">
              <h5>Quick Links</h5>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Login Portal</Link></li>
                <li><Link to="/login">Register</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="footer-column">
              <h5>Resources</h5>
              <ul>
                <li><Link to="/contact">Support</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><a href="#features">Features</a></li> {/* You can add an ID to your features section to link to it */}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} PollingSys. All Rights Reserved.</p>
            <div className="footer-legal-links">
              <Link to="#">Terms of Service</Link>
              <span>|</span>
              <Link to="#">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;