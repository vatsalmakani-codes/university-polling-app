import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-links">
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} University Polling System
      </div>
    </div>
  </footer>
);
export default Footer;