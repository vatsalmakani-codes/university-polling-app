import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-copyright">
          Copyright &copy; {new Date().getFullYear()} PollingSys
        </div>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <span>&bull;</span>
          <Link to="/contact">Contact</Link>
          <span>&bull;</span>
          <a href="#">Privacy Policy</a>
          <span>&bull;</span>
          <a href="#">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;