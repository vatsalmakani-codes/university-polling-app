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
    // 1. Fetch initial poll data
    axios.get(`/api/polls/${id}`)
      .then(res => {
        setPoll(res.data.poll);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch poll:", err);
        setIsLoading(false);
      });

    // 2. Connect to WebSocket server
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // 3. Join the specific room for this poll
    socket.emit('joinPollRoom', id);

    // 4. Listen for real-time vote updates
    socket.on('vote-update', (updatedPoll) => {
      setPoll(updatedPoll); // Update state with new data from server
    });

    // 5. Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [id]);
  
  const totalVotes = useMemo(() => {
    return poll ? poll.options.reduce((acc, opt) => acc + opt.votes, 0) : 0;
  }, [poll]);

  const leadingOption = useMemo(() => {
    if (!poll || totalVotes === 0) return { text: 'N/A', votes: 0 };
    return poll.options.reduce((leader, current) => current.votes > leader.votes ? current : leader, poll.options[0]);
  }, [poll, totalVotes]);

  const chartData = useMemo(() => {
    if (!poll) return null;
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
        <Link to="/admin" className="back-link"><FaArrowLeft /> Back to Dashboard</Link>
        <h1 className="page-title">{poll.question}</h1>
        <div className={`connection-status ${isConnected ? 'connected' : ''}`}>
          <FaCircle className="live-indicator" />
          <span>{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
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
            <span className="stat-number truncate">{leadingOption.text}</span>
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
              {chartData && <Bar 
                data={chartData}
                options={{
                  indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { ticks: { precision: 0 }, grid: { color: '#f1f3f5' } }, y: { grid: { display: false } } }
                }}
              />}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Results Table</h3></div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Option</th><th>Votes</th><th>Percentage</th></tr></thead>
                <tbody>
                  {[...poll.options].sort((a,b) => b.votes - a.votes).map(opt => (
                    <tr key={opt._id}>
                      <td>{opt.optionText}</td>
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