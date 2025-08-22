import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import FeedbackModal from '../components/modals/FeedbackModal';
import { FaUser, FaClock, FaChartBar, FaCheck, FaInfoCircle, FaPenFancy, FaCheckCircle, FaFileCsv, FaArrowLeft } from 'react-icons/fa';
import { format } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './PollDetail.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PollDetail = () => {
  // Component State
  const [poll, setPoll] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [userVote, setUserVote] = useState([]);
  const [resultsHidden, setResultsHidden] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Hooks
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Data Fetching
  const fetchPoll = useCallback(async () => {
    try {
      const res = await axios.get(`/api/polls/${id}`);
      setPoll(res.data.poll);
      setUserVote(res.data.userVote);
      setResultsHidden(res.data.resultsHidden || false);
      setHasSubmittedFeedback(res.data.hasSubmittedFeedback || false);
    } catch (err) {
      console.error("Failed to fetch poll:", err);
      navigate('/dashboard'); // Redirect if poll not found
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);
  
  useEffect(() => {
    setIsLoading(true);
    fetchPoll();
  }, [fetchPoll]);

  // Event Handlers
  const handleVoteSelection = (optionId) => {
    if (poll?.pollType === 'SINGLE_CHOICE') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev => 
        prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
      );
    }
  };

  const onVote = async e => {
    e.preventDefault();
    if (selectedOptions.length === 0) return;
    setIsSubmitting(true);
    setError('');
    try {
      await axios.post(`/api/polls/${id}/vote`, { optionIds: selectedOptions });
      fetchPoll(); // Refetch to update the view to results
    } catch (err) {
      setError(err.response?.data?.msg || 'Error submitting vote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!poll) return;
    const headers = "Option,Votes\n";
    // Sanitize option text for CSV (escape double quotes)
    const csvContent = poll.options.map(opt => `"${opt.optionText.replace(/"/g, '""')}",${opt.votes}`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `poll-results-${poll._id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Memoized Data for Chart
  const chartData = useMemo(() => {
    if (!poll?.options || resultsHidden) return null;
    const labels = poll.options.map(opt => opt.optionText);
    const data = poll.options.map(opt => opt.votes || 0);
    const maxVotes = Math.max(...data, 0);

    const backgroundColors = poll.options.map(opt => userVote.includes(opt._id) ? '#4e73df' : '#a3b8f2');
    const borderColors = poll.options.map(opt => opt.votes === maxVotes && maxVotes > 0 ? '#1cc88a' : '#a3b8f2');

    return {
      labels,
      datasets: [{
        label: 'Votes', data, backgroundColor: backgroundColors, borderColor: borderColors,
        borderWidth: 2, borderRadius: 5, borderSkipped: false,
      }],
    };
  }, [poll, userVote, resultsHidden]);

  if (isLoading) return <Spinner fullscreen text="Loading Poll..." />;
  if (!poll) return <div className="error-state">Poll not found.</div>;

  const totalVotes = poll.options?.reduce((acc, option) => acc + (option.votes || 0), 0) || 0;
  const hasVoted = userVote.length > 0;
  const canVote = (user.role === 'student' || user.role === 'faculty') && poll.status === 'ACTIVE' && new Date(poll.expiresAt) > new Date();

  // Sub-component Renderers
  const renderVotingOptions = () => (
    <div className="voting-section">
      <p className="voting-instructions">Select your option(s) below and cast your vote.</p>
      <form onSubmit={onVote} className="vote-form">
        {error && <p className="poll-error-message">{error}</p>}
        <div className="options-container">
          {poll.options.map(option => (
            <div key={option._id} className={`vote-option ${selectedOptions.includes(option._id) ? 'selected' : ''}`} onClick={() => handleVoteSelection(option._id)}>
              <div className={poll.pollType === 'SINGLE_CHOICE' ? 'radio-icon' : 'checkbox-icon'}>
                {selectedOptions.includes(option._id) && <FaCheck />}
              </div>
              <span>{option.optionText}</span>
            </div>
          ))}
        </div>
        <button type="submit" className='btn-submit-vote' disabled={selectedOptions.length === 0 || isSubmitting}>
          {isSubmitting ? <Spinner /> : 'Submit Vote'}
        </button>
      </form>
    </div>
  );

  const renderResults = () => {
    if (resultsHidden) {
      return (
        <div className="results-hidden-message">
          <FaInfoCircle />
          <h3>Results are Hidden</h3>
          <p>The results for this poll will be made public once it has been closed and published by an administrator.</p>
          {hasVoted && <p className="voted-confirmation">Thank you, your vote has been recorded!</p>}
        </div>
      );
    }
    return (
      <div className="results-section">
        <div className="results-header">
          <h3>Results</h3>
          {(user.role === 'faculty' || user.role.includes('admin')) && (
            <button onClick={handleExport} className="btn-export">
              <FaFileCsv /> Export Results
            </button>
          )}
        </div>
        <div className="poll-chart-container">
          {chartData && <Bar 
            data={chartData}
            options={{
              indexAxis: 'y', responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => ` ${context.raw} Votes` } } },
              scales: { x: { grid: { color: '#f1f3f5' }, ticks: { precision: 0 } }, y: { grid: { display: false } } }
            }}
          />}
        </div>
        {hasVoted && (
          <div className="feedback-prompt">
            {hasSubmittedFeedback ? (
              <button className="btn-feedback submitted" disabled><FaCheckCircle /> Feedback Submitted</button>
            ) : (
              <button className="btn-feedback" onClick={() => setShowFeedbackModal(true)}><FaPenFancy /> Share Your Feedback</button>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      {showFeedbackModal && 
        <FeedbackModal 
          pollId={id} 
          closeModal={() => {
            setShowFeedbackModal(false);
            fetchPoll(); // Refetch after submitting/closing to update button state
          }} 
        />}
      <div className="poll-detail-container">
        <Link to="/dashboard" className="back-link"><FaArrowLeft /> Back to Dashboard</Link>
        <div className='poll-detail-card'>
          <div className="poll-header-info">
            <h2>{poll.question}</h2>
            <span className="poll-type-badge">{(poll.pollType || '').replace('_', ' ')}</span>
          </div>
          <div className="poll-meta-stats">
            <div className="stat-item"><FaUser /><span><strong>Creator</strong><br />{poll.createdBy?.name || 'Unknown'}</span></div>
            <div className="stat-item"><FaClock /><span><strong>Ends</strong><br />{format(new Date(poll.expiresAt), 'MMM d, yyyy')}</span></div>
            <div className="stat-item"><FaChartBar /><span><strong>Total Votes</strong><br />{resultsHidden ? 'Hidden' : totalVotes}</span></div>
          </div>
          {canVote && !hasVoted ? renderVotingOptions() : renderResults()}
        </div>
      </div>
    </>
  );
};
export default PollDetail;