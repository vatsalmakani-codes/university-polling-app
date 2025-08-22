import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Topbar.css';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <nav className="topbar">
      <ul className="topbar-nav">
        <li className="nav-item user-profile" ref={dropdownRef}>
          <button className="profile-trigger" onClick={() => setDropdownOpen(!isDropdownOpen)}>
            <span className="user-name">{user?.name}</span>
            <img src={`http://localhost:5000${user?.profilePicture}`} alt="avatar" className="profile-avatar" />
          </button>
          {isDropdownOpen && (
            <div className="profile-dropdown">
              <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FaUser /> Profile</Link>
              <button className="dropdown-item" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};
export default Topbar;