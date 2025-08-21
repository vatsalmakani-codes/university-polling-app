import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { FaVoteYea, FaChartBar, FaEye } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPolls = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/polls');
        setPolls(res.data);
      } catch (err) {
        setError('Could not fetch polls. Please try again later.');
        console.error("HomePage fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolls();
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <div className="error-state">{error}</div>;

  // Helper function to determine the status badge for a poll
  const getStatusBadge = (poll) => {
    if (user.role === 'student' && poll.hasVoted) {
      return <span className="status-badge voted">Voted</span>;
    }
    const isPollActive = poll.status === 'ACTIVE' && !poll.isExpired;
    if (isPollActive) {
      return <span className="status-badge active">Active</span>;
    }
    return <span className="status-badge closed">Closed</span>;
  };

  // Helper function to determine the action button for a poll
  const getActionButton = (poll) => {
    const isPollActive = poll.status === 'ACTIVE' && !poll.isExpired;

    if (user.role === 'student') {
      if (isPollActive && !poll.hasVoted) {
        return <Link to={`/poll/${poll._id}`} className="btn-table-action vote"><FaVoteYea /> Vote Now</Link>;
      }
      return <Link to={`/poll/${poll._id}`} className="btn-table-action view"><FaChartBar /> View Results</Link>;
    }

    // For Faculty and Admin, the action is always to view the poll/results
    return <Link to={`/poll/${poll._id}`} className="btn-table-action view"><FaEye /> View Poll</Link>;
  };

  return (
    <div className="home-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">An overview of all polls available to you.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Available Polls</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Poll Question</th>
                  <th>Created By</th>
                  <th>Voting Ends</th>
                  <th>Your Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {polls.length > 0 ? polls.map(poll => (
                  <tr key={poll._id}>
                    <td data-label="Poll Question" className="poll-question-cell">{poll.question}</td>
                    <td data-label="Created By">{poll.createdBy?.name || 'N/A'}</td>
                    <td data-label="Voting Ends">{format(new Date(poll.expiresAt), 'MMM d, yyyy')}</td>
                    <td data-label="Your Status">{getStatusBadge(poll)}</td>
                    <td data-label="Action" className="text-center">{getActionButton(poll)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state-inner">
                        <h3>No Polls Available</h3>
                        <p>There are no polls relevant to you at the moment. Please check back later.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;