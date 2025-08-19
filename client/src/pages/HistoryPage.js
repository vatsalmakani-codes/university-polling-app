import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { FaHistory, FaCheckSquare } from 'react-icons/fa';
import './HistoryPage.css'; // We will create this new CSS file

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/polls/history/my-votes');
        setHistory(res.data);
      } catch (err) {
        setError('Could not load your voting history. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <Spinner fullscreen text="Fetching your history..." />;
  }
  
  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <FaHistory />
        <h2>My Voting History</h2>
      </div>

      {history.length > 0 ? (
        <div className="history-list">
          {history.map((item, index) => (
            <div className="history-card" key={index}>
              <div className="history-card-icon">
                <FaCheckSquare />
              </div>
              <div className="history-card-content">
                <p className="poll-question">{item.pollQuestion}</p>
                <p className="your-vote">
                  Your Vote: <strong>{item.votedFor}</strong>
                </p>
              </div>
              <Link to={`/poll/${item.pollId}`} className="btn-view-results">
                View Results
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-history">
          <h3>No Votes Yet!</h3>
          <p>You haven't participated in any polls.</p>
          <Link to="/" className="btn-find-polls">Find Polls to Vote On</Link>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;