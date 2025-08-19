import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../Spinner';
import DatePicker from 'react-datepicker';
import './Modal.css';

const ManagePollModal = ({ poll, closeModal, onUpdate }) => {
  const [status, setStatus] = useState(poll.status);
  const [expiresAt, setExpiresAt] = useState(new Date(poll.expiresAt));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStatusUpdate = async () => {
    setLoading(true); setError('');
    try {
      await axios.put(`/api/admin/polls/${poll._id}/status`, { status, expiresAt });
      onUpdate(); // Trigger a refetch on the dashboard
      closeModal();
    } catch (err) {
      setError('Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    setLoading(true); setError('');
    try {
      await axios.put(`/api/admin/polls/${poll._id}/publish`);
      onUpdate();
      closeModal();
    } catch (err) {
      setError('Failed to toggle publish status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Poll</h2>
          <button onClick={closeModal} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-message error">{error}</div>}
          <h4>{poll.question}</h4>
          
          <div className="form-group">
            <label>Poll Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Extend Deadline</label>
            <DatePicker selected={expiresAt} onChange={date => setExpiresAt(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className="date-picker-input"/>
          </div>
          <button className="btn-primary full-width" onClick={handleStatusUpdate} disabled={loading}>
            {loading ? <Spinner/> : 'Update Status & Deadline'}
          </button>
          
          <hr className="modal-divider" />

          <button className="btn-secondary full-width" onClick={handlePublishToggle} disabled={loading}>
            {loading ? <Spinner/> : (poll.resultsPublished ? 'Unpublish Results' : 'Publish Results')}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ManagePollModal;