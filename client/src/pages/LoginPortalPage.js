import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield } from 'react-icons/fa';
import './LoginPortalPage.css';

const LoginPortalPage = () => {
  return (
    <div className="portal-container">
      <div className="portal-card">
        <div className="portal-header">
          <h1>Select Your Role</h1>
          <p>Please choose your role to proceed with login or registration.</p>
        </div>
        <div className="role-selection-grid">
          <Link to="/login/student" className="role-card student">
            <FaUserGraduate className="role-icon" />
            <h3>Student</h3>
          </Link>
          <Link to="/login/faculty" className="role-card faculty">
            <FaChalkboardTeacher className="role-icon" />
            <h3>Faculty</h3>
          </Link>
          <Link to="/login/admin" className="role-card admin">
            <FaUserShield className="role-icon" />
            <h3>Admin</h3>
          </Link>
        </div>
        <div className="portal-footer">
          <Link to="/">← Back to Landing Page</Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPortalPage;