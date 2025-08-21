import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AuthPageLayout.css';

const Logo = () => (<div className="auth-logo">📊 PollingSys</div>);

const AuthPageLayout = ({ children }) => {
  return (
    <div className="auth-page-container">
      <div className="auth-panel-left">
        <div className="auth-panel-content">
          <Logo />
          <h1>Your Voice, Your University</h1>
          <p>Engage, vote, and make an impact.</p>
        </div>
      </div>
      <div className="auth-panel-right">
        {children}
        <div className="auth-back-link">
          <Link to="/login"><FaArrowLeft /> Back to Role Selection</Link>
        </div>
      </div>
    </div>
  );
};
export default AuthPageLayout;