import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../Spinner';
import DatePicker from 'react-datepicker';
import { FaWrench, FaBullhorn } from 'react-icons/fa';
import './Modal.css'; // Uses the shared modal stylesheet

const ManagePollModal = ({ poll, closeModal, onUpdate }) => {
  // State for the form fields, initialized with the current poll's data
  const [status, setStatus] = useState(poll.status);
  const [expiresAt, setExpiresAt] = useState(new Date(poll.expiresAt));
  const [targetAudience, setTargetAudience] = useState(poll.targetAudience);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Clears messages before performing a new action
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Handler for updating status, deadline, and audience
  const handleSettingsUpdate = async () => {
    clearMessages();
    setLoading(true);
    try {
      await axios.put(`/api/admin/polls/${poll._id}/settings`, { status, expiresAt, targetAudience });
      setSuccess('Poll settings updated successfully!');
      onUpdate(); // Trigger a refetch on the dashboard
      setTimeout(closeModal, 1500); // Close modal after a short delay
    } catch (err) {
      setError('Failed to update poll settings.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for toggling the results publication status
  const handlePublishToggle = async () => {
    clearMessages();
    setLoading(true);
    try {
      await axios.put(`/api/admin/polls/${poll._id}/publish`);
      setSuccess(`Results are now ${poll.resultsPublished ? 'hidden' : 'published'}.`);
      onUpdate(); // Trigger a refetch
      setTimeout(closeModal, 1500);
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
          {success && <div className="modal-message success">{success}</div>}
          <h4 className="poll-question-preview">{poll.question}</h4>
          
          <div className="form-group">
            <label>Poll Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="ACTIVE">Active (Open for voting)</option>
              <option value="CLOSED">Closed (Voting disabled)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Target Audience</label>
            <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)}>
              <option value="STUDENT">Students Only</option>
              <option value="FACULTY">Faculty Only</option>
              <option value="ALL">All Users</option>
            </select>
          </div>
          <div className="form-group">
            <label>Extend Deadline</label>
            <DatePicker 
              selected={expiresAt} 
              onChange={date => setExpiresAt(date)} 
              showTimeSelect 
              dateFormat="MMMM d, yyyy h:mm aa" 
              className="date-picker-input"
            />
          </div>
          <button className="btn-primary full-width" onClick={handleSettingsUpdate} disabled={loading}>
            {loading ? <Spinner /> : <><FaWrench /> Update Settings</>}
          </button>
          
          <hr className="modal-divider" />

          <button className={`btn-secondary full-width ${poll.resultsPublished ? 'published' : ''}`} onClick={handlePublishToggle} disabled={loading}>
            {loading ? <Spinner/> : (
              <><FaBullhorn /> {poll.resultsPublished ? 'Unpublish Results' : 'Publish Results'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ManagePollModal;