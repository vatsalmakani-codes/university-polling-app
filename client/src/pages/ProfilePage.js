import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { FaUserEdit, FaLock, FaTrashAlt, FaTimes } from 'react-icons/fa';
import './ProfilePage.css'; // We will replace the CSS for this new structure

const ProfilePage = () => {
  const { user, loadUser, logout } = useContext(AuthContext);
  
  // State for forms
  const [name, setName] = useState('');
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // State for UI feedback
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };
  
  const handleMessageDismiss = () => {
    clearMessages();
  };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoadingName(true);
    try {
      await axios.put('/api/profile/me', { name });
      setSuccess('Name updated successfully!');
      loadUser();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update name.');
    } finally {
      setLoadingName(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    clearMessages();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('New passwords do not match.');
    }
    if (passwordData.newPassword.length < 6) {
      return setError('New password must be at least 6 characters.');
    }
    
    setLoadingPassword(true);
    try {
      await axios.put('/api/profile/change-password', { oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
      setSuccess('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to change password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    clearMessages();
    setLoadingDelete(true);
    try {
      await axios.delete('/api/profile/me');
      logout();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete account.');
      setLoadingDelete(false);
    }
  };

  if (!user) {
    return <Spinner fullscreen text="Loading Profile..." />;
  }
  
  const isDeleteDisabled = deleteConfirm !== user.name;

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage your personal information and security settings.</p>
      </div>

      { (success || error) && (
        <div className={`profile-message ${success ? 'success' : 'error'}`}>
          {success || error}
          <button onClick={handleMessageDismiss} className="dismiss-btn"><FaTimes /></button>
        </div>
      )}

      <div className="profile-grid">
        {/* Update Name Form */}
        <div className="card">
          <div className="card-header">
            <h3><FaUserEdit /> Update Information</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleNameUpdate}>
              <div className="form-group"><label htmlFor="name">Name</label><input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
              <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={user.email} disabled /><small>Email address cannot be changed.</small></div>
              <button type="submit" className="btn-profile" disabled={loadingName || user.name === name}>
                {loadingName ? <Spinner /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <div className="card-header">
            <h3><FaLock /> Change Password</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordChange}>
              <div className="form-group"><label htmlFor="oldPassword">Current Password</label><input type="password" id="oldPassword" value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} required /></div>
              <div className="form-group"><label htmlFor="newPassword">New Password</label><input type="password" id="newPassword" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required /></div>
              <div className="form-group"><label htmlFor="confirmPassword">Confirm New Password</label><input type="password" id="confirmPassword" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required /></div>
              <button type="submit" className="btn-profile" disabled={loadingPassword}>
                {loadingPassword ? <Spinner /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card danger-zone">
          <div className="card-header">
            <h3><FaTrashAlt /> Danger Zone</h3>
          </div>
          <div className="card-body">
            <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            <div className="form-group">
              <label>To confirm, please type your full name (<strong>{user.name}</strong>) in the box below.</label>
              <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type your name to confirm" />
            </div>
            <button className="btn-danger" onClick={handleDeleteAccount} disabled={isDeleteDisabled || loadingDelete}>
              {loadingDelete ? <Spinner /> : 'Permanently Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;