import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaTachometerAlt, FaHistory, FaPlus, FaUsers } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">📊</div>
        <div className="sidebar-brand-text">PollingSys</div>
      </div>
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" className="nav-link">
            <FaTachometerAlt /><span>Dashboard</span>
            
          </NavLink>
        </li>
        {user?.role == 'student' && (
          <li><NavLink to="/my-history" className="nav-link"><FaHistory /><span>My History</span></NavLink></li>
        )}
        {user?.role === 'admin' && (
          <>
            <li><NavLink to="/admin/create-poll" className="nav-link"><FaPlus /><span>Create Poll</span></NavLink></li>
            <li><NavLink to="/admin" className="nav-link"><FaUsers /><span>User Management</span></NavLink></li>
          </>
        )}
      </ul>
    </aside>
  );
};
export default Sidebar;