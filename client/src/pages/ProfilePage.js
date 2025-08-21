import axios from 'axios';
import { format } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { FaCamera, FaLock, FaTimes, FaTrashAlt, FaUserEdit } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import { AuthContext } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, loadUser, logout } = useContext(AuthContext);
  
  // State for forms
  const [name, setName] = useState(user?.name || ''); // Initialize safely
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // State for UI feedback
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const clearMessages = () => { setError(''); setSuccess(''); };
  const handleMessageDismiss = () => { clearMessages(); };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    clearMessages(); setLoadingName(true);
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
    if (passwordData.newPassword !== passwordData.confirmPassword) return setError('New passwords do not match.');
    if (passwordData.newPassword.length < 6) return setError('New password must be at least 6 characters.');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!newImage) return;
    const formData = new FormData();
    formData.append('profilePicture', newImage);
    setLoadingImage(true); clearMessages();
    try {
      await axios.put('/api/profile/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Profile picture updated!');
      loadUser();
      // After successful upload, clear the preview
      setImagePreview('');
      setNewImage(null);
    } catch (err) {
      setError('Image upload failed. Must be a valid JPG or PNG file under 5MB.');
    } finally {
      setLoadingImage(false);
    }
  };

  const handleDeleteAccount = async () => {
    clearMessages(); 
    setLoadingDelete(true);
    try {
      await axios.delete('/api/profile/me');
      // The logout function will handle redirecting the user
      logout();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete account.');
      setLoadingDelete(false);
    }
  };

  if (!user) {
    return <div className="error-state">Could not load user profile.</div>;
  }
  
  const isDeleteDisabled = deleteConfirm !== user.name;
  const API_URL = 'http://localhost:5000';

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="avatar-upload-container">
          <img 
            src={imagePreview || `${API_URL}${user.profilePicture}`} 
            alt="User Avatar"
            className="profile-avatar-large"
          />
          <label htmlFor="image-upload" className="avatar-edit-icon"><FaCamera /></label>
          <input id="image-upload" type="file" accept="image/png, image/jpeg" onChange={handleImageChange} style={{display: 'none'}}/>
        </div>
        <div className="profile-header-info">
          <h1>{user.name}</h1>
          <p><span className={`role-badge profile-role ${user.role}`}>{user.role}</span> &bull; Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</p>
          {newImage && (
            <button className="btn-upload-confirm" onClick={handleImageUpload} disabled={loadingImage}>
              {loadingImage ? <Spinner/> : 'Confirm Upload'}
            </button>
          )}
        </div>
      </div>

      { (success || error) && (
        <div className={`profile-message ${success ? 'success' : 'error'}`}>
          <span>{success || error}</span>
          <button onClick={handleMessageDismiss} className="dismiss-btn"><FaTimes /></button>
        </div>
      )}

      <div className="profile-grid">
        <div className="card">
          <div className="card-header"><h3><FaUserEdit /> Update Information</h3></div>
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

        <div className="card">
          <div className="card-header"><h3><FaLock /> Change Password</h3></div>
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

        <div className="card danger-zone">
          <div className="card-header"><h3><FaTrashAlt /> Danger Zone</h3></div>
          <div className="card-body">
            <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            <div className="form-group">
              <label>To confirm, type your full name (<strong>{user.name}</strong>) below.</label>
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