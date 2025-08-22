import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../Spinner';
import { FaUserPlus } from 'react-icons/fa';
import './Modal.css'; // Uses the shared modal stylesheet

const CreateUserModal = ({ userRole, closeModal, onUpdate }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: userRole 
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Set the role in the form state when the modal opens
  useEffect(() => {
    setFormData(prev => ({ ...prev, role: userRole }));
  }, [userRole]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await axios.post('/api/admin/users/create', formData);
      setSuccess(res.data.msg);
      onUpdate(); // Trigger a refetch on the dashboard
      
      // Clear form and close modal after a short delay
      setTimeout(() => {
        setFormData({ name: '', email: '', password: '', role: userRole });
        closeModal();
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || `Failed to create new ${userRole}.`);
      setLoading(false);
    }
  };

  // Capitalize the role for display (e.g., 'student' -> 'Student')
  const title = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New {title}</h2>
          <button onClick={closeModal} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-message error">{error}</div>}
          {success && <div className="modal-message success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="create-name">Full Name</label>
              <input 
                type="text" 
                id="create-name"
                name="name" 
                value={formData.name} 
                onChange={onChange} 
                required 
                placeholder={`Enter ${userRole}'s full name`}
              />
            </div>
            <div className="form-group">
              <label htmlFor="create-email">University Email (.edu)</label>
              <input 
                type="email" 
                id="create-email"
                name="email" 
                value={formData.email} 
                onChange={onChange} 
                required 
                placeholder={`Enter ${userRole}'s email address`}
              />
            </div>
            <div className="form-group">
              <label htmlFor="create-password">Initial Password</label>
              <input 
                type="password"
                id="create-password" 
                name="password" 
                value={formData.password} 
                onChange={onChange} 
                required 
                minLength="6"
                placeholder="Set a temporary password"
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Spinner /> : <><FaUserPlus /> Create {title}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CreateUserModal;