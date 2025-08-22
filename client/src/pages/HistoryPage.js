import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { AuthContext } from '../context/AuthContext';
import './HistoryPage.css';

const HistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Determine the user's role once for clean conditional logic
  const isStudent = user.role === 'student'   || user.role === 'faculty';

  useEffect(() => {
    // Determine the correct API endpoint based on the user's role
    const endpoint = isStudent
      ? '/api/polls/history/my-votes'
      : '/api/polls/history/my-polls'; // Endpoint for faculty

    const fetchHistory = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await axios.get(endpoint);
        setData(res.data);
      } catch (err) {
        setError(`Could not load your history. Please try again.`);
        console.error("History fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isStudent]); // The dependency array ensures this runs once on load

  if (isLoading) return <Spinner />;
  if (error) return <div className="error-state">{error}</div>;

  // Helper function to render a table row for a student
  const renderStudentRow = (item) => (
    <tr key={item.pollId}>
      <td data-label="Poll Question" className="poll-question-cell">{item.pollQuestion}</td>
      <td data-label="Your Vote(s)"><strong>{item.votedFor}</strong></td>
      <td data-label="Action" className="text-center">
        <Link to={`/poll/${item.pollId}`} className="btn-table-action view">View Results</Link>
      </td>
    </tr>
  );

  // Helper function to render a table row for a faculty member
  const renderFacultyRow = (item) => (
    <tr key={item.pollId}>
      <td data-label="Poll Question" className="poll-question-cell">{item.pollQuestion}</td>
      <td data-label="Status">
        <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
      </td>
      <td data-label="Results">
        {item.resultsPublished ? 'Published' : 'Hidden'}
      </td>
      <td data-label="Action" className="text-center">
        <Link to={`/poll/${item.pollId}`} className="btn-table-action view">View Poll</Link>
      </td>
    </tr>
  );

  return (
    <div className="history-container">
      <div className="page-header">
        <h1 className="page-title">{isStudent ? 'My Voting History' : 'My Created Polls'}</h1>
        <p className="page-subtitle">A record of your polling activity.</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h3><FaHistory /> {isStudent ? 'Vote Record' : 'Poll Record'}</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              {/* Render the correct table headers based on role */}
              <thead>
                {isStudent ? (
                  <tr>
                    <th>Poll Question</th>
                    <th>Your Vote(s)</th>
                    <th className="text-center">Action</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Poll Question</th>
                    <th>Status</th>
                    <th>Results</th>
                    <th className="text-center">Action</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {data.length > 0 ? (
                  // Render the correct type of row based on role
                  data.map(item => isStudent ? renderStudentRow(item) : renderFacultyRow(item))
                ) : (
                  <tr>
                    {/* Render the correct empty state message and span all columns */}
                    <td colSpan={isStudent ? 3 : 4}>
                      <div className="empty-state-inner">
                        <h3>No Activity Yet</h3>
                        <p>{isStudent ? "You haven't voted on any polls." : "You haven't created any polls."}</p>
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
export default HistoryPage;