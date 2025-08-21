import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaHeadset, FaMapMarkerAlt } from 'react-icons/fa';
import './StaticPage.css'; // Uses the same shared CSS file as the About Page

const ContactPage = () => {
  return (
    <div className="static-page-wrapper">
      {/* --- A simple, clean navbar for static pages --- */}
      <nav className="static-page-nav">
        <Link to="/" className="static-logo">📊 PollingSys</Link>
        <Link to="/login" className="btn-nav-primary">Login / Register</Link>
      </nav>

      {/* --- Page Hero Section --- */}
      <div className="page-hero-static">
        <h1>Contact Us</h1>
        <p>We're here to help. Reach out to us with any questions or concerns.</p>
      </div>

      {/* --- Main Content Area --- */}
      <div className="static-page-content">
        <div className="static-card">
          <h2>Get in Touch</h2>
          <p className="contact-intro">
            Whether you have a question about features, trials, pricing, need a demo, or anything else, our team is ready to answer all your questions.
          </p>
          <div className="contact-info-grid">
            {/* General Inquiries Card */}
            <div className="contact-info-item">
              <FaEnvelope className="contact-icon" />
              <h3>General Inquiries</h3>
              <p>For general questions about the polling system and its features.</p>
              <a href="mailto:info@university.edu" className="contact-link">info@university.edu</a>
            </div>

            {/* Technical Support Card */}
            <div className="contact-info-item">
              <FaHeadset className="contact-icon" />
              <h3>Technical Support</h3>
              <p>Having trouble logging in or casting a vote? Our tech team is ready to assist.</p>
              <a href="mailto:support@university.edu" className="contact-link">support@university.edu</a>
            </div>

            {/* Office Location Card */}
            <div className="contact-info-item">
              <FaMapMarkerAlt className="contact-icon" />
              <h3>Our Office</h3>
              <p>Administration Building, Room 101<br />123 University Drive<br />Your City, State 12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;