import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../Spinner';
import './Modal.css';

const ResetPasswordModal = ({ user, closeModal }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`/api/admin/users/${user._id}/reset-password`, { newPassword });
      setSuccess(res.data.msg);
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reset Password for {user.name}</h2>
          <button onClick={closeModal} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-message error">{error}</div>}
          {success && <div className="modal-message success">{success}</div>}
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
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? <Spinner /> : 'Reset Password'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ResetPasswordModal;