import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './StaticPage.css'; // Also uses the shared CSS

const ContactPage = () => {
  return (
    <div className="static-page-wrapper">
      <div className="page-hero-static">
        <h1>Contact Us</h1>
        <p>We're here to help. Reach out to us with any questions or concerns.</p>
      </div>

      <div className="static-page-content">
        <div className="static-card">
          <h2>Get in Touch</h2>
          <div className="contact-info-grid">
            <div className="contact-info-item">
              <FaEnvelope className="contact-icon" />
              <h3>General Inquiries</h3>
              <p>For general questions about the polling system and its features.</p>
              <a href="mailto:info@university.edu" className="contact-link">info@university.edu</a>
            </div>
            <div className="contact-info-item">
              <FaPhone className="contact-icon" />
              <h3>Technical Support</h3>
              <p>Having trouble logging in or casting a vote? Our tech team is ready to assist.</p>
              <a href="mailto:support@university.edu" className="contact-link">support@university.edu</a>
            </div>
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