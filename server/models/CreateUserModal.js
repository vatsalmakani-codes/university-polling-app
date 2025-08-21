import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../Spinner';
import './Modal.css';

const CreateUserModal = ({ userRole, closeModal, onUpdate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: userRole });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Set the role when the modal opens
  useEffect(() => {
    setFormData(prev => ({ ...prev, role: userRole }));
  }, [userRole]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await axios.post('/api/admin/users/create', formData);
      setSuccess(res.data.msg);
      onUpdate(); // Refetch users on the dashboard
      setTimeout(closeModal, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || `Failed to create ${userRole}.`);
    } finally {
      setLoading(false);
    }
  };

  const title = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Create New {title}</h2><button onClick={closeModal} className="close-btn">&times;</button></div>
        <div className="modal-body">
          {error && <div className="modal-message error">{error}</div>}
          {success && <div className="modal-message success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={onChange} required /></div>
            <div className="form-group"><label>University Email (.edu)</label><input type="email" name="email" value={formData.email} onChange={onChange} required /></div>
            <div className="form-group"><label>Initial Password</label><input type="password" name="password" value={formData.password} onChange={onChange} required minLength="6" /></div>
            <div className="modal-actions">
              <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? <Spinner /> : `Create ${title}`}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CreateUserModal;