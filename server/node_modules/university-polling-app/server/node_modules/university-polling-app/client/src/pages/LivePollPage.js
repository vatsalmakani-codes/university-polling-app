import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import Spinner from '../components/Spinner';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaArrowLeft, FaCircle, FaPoll, FaTrophy, FaListOl } from 'react-icons/fa';
import './LivePollPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LivePollPage = () => {
  const [poll, setPoll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    // 1. Fetch initial poll data to populate the page
    const fetchInitialData = async () => {
      try {
        const res = await axios.get(`/api/polls/${id}`);
        setPoll(res.data.poll);
      } catch (err) {
        console.error("Failed to fetch initial poll data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();

    // 2. Connect to the WebSocket server
    const socket = io('http://localhost:5000'); // Use environment variable in production

    // Event listeners for connection status
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // 3. Join the specific room for this poll to receive targeted updates
    socket.emit('joinPollRoom', id);

    // 4. Listen for real-time 'vote-update' events from the server
    socket.on('vote-update', (updatedPoll) => {
      setPoll(updatedPoll); // Update the entire poll state with the new data
    });

    // 5. Cleanup on component unmount to prevent memory leaks
    return () => {
      socket.disconnect();
    };
  }, [id]);

  const totalVotes = useMemo(() => {
    return poll ? poll.options.reduce((acc, opt) => acc + opt.votes, 0) : 0;
  }, [poll]);

  const leadingOption = useMemo(() => {
    if (!poll || !poll.options || poll.options.length === 0 || totalVotes === 0) {
      return { optionText: 'N/A', votes: 0 };
    }
    return poll.options.reduce((leader, current) =>
      current.votes > leader.votes ? current : leader,
      poll.options[0]
    );
  }, [poll, totalVotes]);

  const chartData = useMemo(() => {
    if (!poll) return { labels: [], datasets: [] };
    return {
      labels: poll.options.map(opt => opt.optionText),
      datasets: [{
        label: 'Votes',
        data: poll.options.map(opt => opt.votes),
        backgroundColor: 'rgba(78, 115, 223, 0.8)',
        borderColor: 'rgba(78, 115, 223, 1)',
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false,
      }],
    };
  }, [poll]);

  if (isLoading) return <Spinner fullscreen text="Loading Live View..." />;
  if (!poll) return <div className="error-state">Could not load poll data. Please check the poll ID and try again.</div>;

  return (
    <div className="live-poll-container">
      <div className="page-header">
        <Link to="/admin" className="back-link"><FaArrowLeft /> Back to Admin Panel</Link>
        <h1 className="page-title truncate">{poll.question}</h1>
        <div className={`connection-status ${isConnected && !poll.status == 'CLOSED' ? 'connected' : ''}`}>
          <FaCircle className="live-indicator" />
          <span>{isConnected && !poll.status == 'CLOSED' ? 'LIVE' : 'DISCONNECTED'}</span>
        </div>
      </div>

      <div className="live-stat-cards">
        <div className="stat-card">
          <FaPoll className="stat-icon polls" />
          <div className="stat-info"><span className="stat-label">Total Votes</span><span className="stat-number">{totalVotes}</span></div>
        </div>
        <div className="stat-card">
          <FaTrophy className="stat-icon winner" />
          <div className="stat-info">
            <span className="stat-label">Leading Option</span>
            <span className="stat-number truncate">{leadingOption.optionText}</span>
          </div>
        </div>
        <div className="stat-card">
          <FaListOl className="stat-icon options" />
          <div className="stat-info">
            <span className="stat-label">Total Options</span><span className="stat-number">{poll.options.length}</span>
          </div>
        </div>
      </div>

      <div className="live-content-grid">
        <div className="card">
          <div className="card-header"><h3>Vote Distribution Chart</h3></div>
          <div className="card-body">
            <div className="live-chart-wrapper">
              <Bar
                data={chartData}
                options={{
                  indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => ` ${context.raw} Votes` } } },
                  scales: { x: { ticks: { precision: 0 }, grid: { color: '#f1f3f5' } }, y: { grid: { display: false } } }
                }}
              />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Results Table</h3></div>
          <div className="card-body no-padding">
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Option</th><th>Votes</th><th>Percentage</th></tr></thead>
                <tbody>
                  {[...poll.options].sort((a, b) => b.votes - a.votes).map(opt => (
                    <tr key={opt._id}>
                      <td className="truncate">{opt.optionText}</td>
                      <td><strong>{opt.votes}</strong></td>
                      <td>{totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePollPage;