import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../Spinner';
import { FaStar } from 'react-icons/fa';
import './Modal.css';

const FeedbackModal = ({ pollId, closeModal }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await axios.post(`/api/feedback/polls/${pollId}`, { rating, comment });
      setSuccess('Thank you for your feedback!');
      setTimeout(closeModal, 2000); // Close modal after 2 seconds
    } catch (err) {
      setError('Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Submit Feedback</h2><button onClick={closeModal} className="close-btn">&times;</button></div>
        <div className="modal-body">
          {error && <div className="modal-message error">{error}</div>}
          {success && <div className="modal-message success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Rating</label>
              <div className="star-rating">
                {[...Array(5)].map((star, index) => {
                  const ratingValue = index + 1;
                  return (
                    <label key={index}>
                      <input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} />
                      <FaStar className="star" color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"} onMouseEnter={() => setHover(ratingValue)} onMouseLeave={() => setHover(0)} />
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="form-group">
              <label>Your Comments</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} required />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={closeModal} className="btn-secondary">Close</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? <Spinner /> : 'Submit'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default FeedbackModal;