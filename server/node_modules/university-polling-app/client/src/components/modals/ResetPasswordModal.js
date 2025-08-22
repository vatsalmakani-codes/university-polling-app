import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../Spinner';
import { FaKey } from 'react-icons/fa';
import './Modal.css'; // Uses the shared modal stylesheet

const ResetPasswordModal = ({ user, closeModal }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');

    // Client-side validation
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    
    setLoading(true);
    
    try {
      // The admin endpoint to reset a user's password
      const res = await axios.post(`/api/admin/users/${user._id}/reset-password`, { newPassword });
      setSuccess(res.data.msg); // Show success message from the API
      setNewPassword(''); // Clear the input field on success
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reset Password</h2>
          <button onClick={closeModal} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-message error">{error}</div>}
          {success && <div className="modal-message success">{success}</div>}

          <h4 className="poll-question-preview">For User: {user.name} ({user.email})</h4>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input 
                type="password" 
                id="new-password"
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
                minLength="6"
                placeholder="Enter a new secure password"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Spinner /> : <><FaKey /> Reset Password</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;