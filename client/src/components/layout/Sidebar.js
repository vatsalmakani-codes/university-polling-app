import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaTachometerAlt, 
  FaHistory, 
  FaPlus, 
  FaUsersCog
} from 'react-icons/fa';
import './Sidebar.css';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 19.3137V42H9V19.3137C9 14.7228 12.5817 11 17 11V11" stroke="#fff" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M31 6V28.6863C31 33.2772 34.5817 37 39 37V37" stroke="#fff" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 11C21.4183 11 25 14.7228 25 19.3137V42H17V11Z" fill="rgba(255,255,255,0.1)" stroke="#fff" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M39 37C43.4183 37 47 33.2772 47 28.6863V6H39V37Z" fill="rgba(255,255,255,0.1)" stroke="#fff" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      <Link to="/dashboard" className="sidebar-brand">
        <Logo />
        <div className="sidebar-brand-text">PollingSys</div>
      </Link>
      
      <hr className="sidebar-divider" />

      <ul className="sidebar-nav">
        <li className="nav-item">
          <NavLink to="/dashboard" className="nav-link">
            <FaTachometerAlt /><span>Dashboard</span>
          </NavLink>
        </li>
        {(user?.role === 'student' || user?.role === 'faculty') && (
          <li className="nav-item">
            <NavLink to="/my-history" className="nav-link">
              <FaHistory /><span>My History</span>
            </NavLink>
          </li>
        )}
        {(user?.role === 'super-admin' || user?.role === 'sub-admin') && (
          <>
            <li className="nav-item">
              <NavLink to="/admin/create-poll" className="nav-link">
                <FaPlus /><span>Create Poll</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin" className="nav-link">
                <FaUsersCog /><span>Admin Panel</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};
export default Sidebar;