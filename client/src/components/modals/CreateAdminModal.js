import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select'; // Import the new library
import Spinner from '../Spinner';
import { FaUserShield } from 'react-icons/fa';
import './Modal.css';

const CreateAdminModal = ({ closeModal, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', managedScope: 'NONE'
  });
  const [managedPolls, setManagedPolls] = useState([]); 
  const [allPolls, setAllPolls] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get('/api/polls');
        const pollOptions = res.data.map(poll => ({
          value: poll._id,
          label: poll.question
        }));
        setAllPolls(pollOptions);
      } catch (err) {
        console.error("Could not fetch polls for admin creation:", err);
      }
    };
    fetchPolls();
  }, []);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    
    const adminData = {
      ...formData,
      // Pass an array of poll IDs if the scope is 'POLLS'
      managedPolls: formData.managedScope === 'POLLS' ? managedPolls.map(p => p.value) : []
    };

    try {
      const res = await axios.post('/api/admin/admins/create', adminData);
      setSuccess(res.data.msg);
      onUpdate(); // Refetch admins on the dashboard
      setTimeout(closeModal, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || `Failed to create admin.`);
    } finally {
      setLoading(false);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({ ...provided, borderRadius: '.25rem', borderColor: 'var(--border-color)' }),
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Create New Administrator</h2><button onClick={closeModal} className="close-btn">&times;</button></div>
        <div className="modal-body">
          {error && <div className="modal-message error">{error}</div>}
          {success && <div className="modal-message success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={onChange} required /></div>
            <div className="form-group"><label>Email (.edu)</label><input type="email" name="email" value={formData.email} onChange={onChange} required /></div>
            <div className="form-group"><label>Initial Password</label><input type="password" name="password" value={formData.password} onChange={onChange} required minLength="6" /></div>
            
            <div className="form-group">
                <label>Permission Scope</label>
                <select name="managedScope" value={formData.managedScope} onChange={onChange}>
                    <option value="NONE">None (Default)</option>
                    <option value="STUDENT">Manage Students Only</option>
                    <option value="FACULTY">Manage Faculty Only</option>
                    <option value="BOTH">Manage Students & Faculty</option>
                    <option value="POLLS">Manage Specific Polls Only</option>
                </select>
            </div>

            {/* Conditionally render the poll selector */}
            {formData.managedScope === 'POLLS' && (
                <div className="form-group">
                    <label>Select Polls to Manage</label>
                    <Select
                        isMulti
                        options={allPolls}
                        value={managedPolls}
                        onChange={setManagedPolls}
                        styles={customSelectStyles}
                        placeholder="Search and select polls..."
                    />
                </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? <Spinner /> : <><FaUserShield /> Create Admin</>}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CreateAdminModal;