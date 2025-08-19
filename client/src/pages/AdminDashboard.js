import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import ResetPasswordModal from '../components/modals/ResetPasswordModal';
import ManagePollModal from '../components/modals/ManagePollModal';
import { 
  FaUsers, FaPoll, FaCheckSquare, FaTrash, FaKey, 
  FaExternalLinkAlt, FaPlus, FaSearch, FaWrench 
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './AdminDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  // Original Data State
  const [allUsers, setAllUsers] = useState([]);
  const [allPolls, setAllPolls] = useState([]);

  // Filter State
  const [userSearch, setUserSearch] = useState('');
  const [pollSearch, setPollSearch] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalUser, setModalUser] = useState(null); // For password reset modal
  const [modalPoll, setModalPoll] = useState(null); // For poll management modal

  // Memoized filtered data for performance
  const filteredUsers = useMemo(() =>
    allUsers.filter(user =>
      (user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
       user.email.toLowerCase().includes(userSearch.toLowerCase()))
    ), [allUsers, userSearch]
  );

  const filteredPolls = useMemo(() =>
    allPolls.filter(poll =>
      poll.question.toLowerCase().includes(pollSearch.toLowerCase())
    ), [allPolls, pollSearch]
  );
  
  // Encapsulated data fetching function
  const fetchData = useCallback(async () => {
    try {
      // Use Promise.all for efficient, parallel data fetching
      const [usersRes, pollsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/polls'), // Fetches all polls for admin view
      ]);
      setAllUsers(usersRes.data);
      setAllPolls(pollsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError('Could not load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized calculations for stats and chart data
  const totalVotes = useMemo(() => 
    allPolls.reduce((acc, p) => acc + p.options.reduce((sum, o) => sum + o.votes, 0), 0), 
    [allPolls]
  );
  
  const userRoleData = useMemo(() => {
    const roles = filteredUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(roles).map(r => r.charAt(0).toUpperCase() + r.slice(1)),
      datasets: [{ 
        data: Object.values(roles), 
        backgroundColor: ['#4e73df', '#1cc88a', '#e74a3b'], 
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  }, [filteredUsers]);
  
  // Action Handlers
  const deleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete "${userName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/api/users/${userId}`);
        fetchData(); // Refetch all data to update UI
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const deletePoll = async (pollId, pollQuestion) => {
    if (window.confirm(`Are you sure you want to permanently delete the poll "${pollQuestion}"?`)) {
      try {
        await axios.delete(`/api/polls/${pollId}`);
        fetchData(); // Refetch all data
      } catch (err) {
        alert('Failed to delete poll.');
      }
    }
  };

  if (loading) return <Spinner fullscreen text="Loading Admin Dashboard..."/>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="admin-dashboard">
      {modalUser && <ResetPasswordModal user={modalUser} closeModal={() => setModalUser(null)} />}
      {modalPoll && <ManagePollModal poll={modalPoll} closeModal={() => setModalPoll(null)} onUpdate={fetchData} />}

      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview and management tools.</p>
      </div>
      
      <div className="stat-cards-grid">
        <div className="stat-card"><FaUsers className="stat-icon users" /><div className="stat-info"><span className="stat-label">Total Users</span><span className="stat-number">{allUsers.length}</span></div></div>
        <div className="stat-card"><FaPoll className="stat-icon polls" /><div className="stat-info"><span className="stat-label">Total Polls</span><span className="stat-number">{allPolls.length}</span></div></div>
        <div className="stat-card"><FaCheckSquare className="stat-icon votes" /><div className="stat-info"><span className="stat-label">Total Votes Cast</span><span className="stat-number">{totalVotes}</span></div></div>
      </div>

      <div className="dashboard-main-content">
        <div className="card chart-card">
          <div className="card-header"><h3>User Role Distribution</h3></div>
          <div className="card-body">
            <div className="chart-wrapper"><Pie data={userRoleData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
          </div>
        </div>

        <div className="card users-card">
          <div className="card-header"><h3>User Management</h3></div>
          <div className="card-body">
            <div className="filter-bar">
              <div className="search-input"><FaSearch /><input type="text" placeholder="Search users by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} /></div>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td data-label="Name">{user.name}</td>
                      <td data-label="Email">{user.email}</td>
                      <td data-label="Role"><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                      <td data-label="Actions" className="actions-cell">
                        <button onClick={() => setModalUser(user)} className="btn-action reset" title="Reset Password"><FaKey /></button>
                        <button onClick={() => deleteUser(user._id, user.name)} className="btn-action delete" title="Delete User"><FaTrash /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center">No users match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card polls-card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Poll Management</h3>
            <Link to="/admin/create-poll" className="btn-create-poll-header"><FaPlus /> New Poll</Link>
          </div>
          <div className="card-body">
            <div className="filter-bar">
              <div className="search-input"><FaSearch /><input type="text" placeholder="Search polls by question..." value={pollSearch} onChange={e => setPollSearch(e.target.value)} /></div>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Question</th><th>Status</th><th>Results</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredPolls.length > 0 ? filteredPolls.map(poll => (
                    <tr key={poll._id}>
                      <td data-label="Question" className="poll-question-cell">{poll.question}</td>
                      <td data-label="Status"><span className={`status-badge ${poll.status.toLowerCase()}`}>{poll.status}</span></td>
                      <td data-label="Results">{poll.resultsPublished ? 'Published' : 'Hidden'}</td>
                      <td data-label="Actions" className="actions-cell">
                        <button onClick={() => setModalPoll(poll)} className="btn-action manage" title="Manage Poll"><FaWrench /></button>
                        <Link to={`/admin/polls/${poll._id}/live`} className="btn-action live" title="Live View"><FaExternalLinkAlt /></Link>
                        <button onClick={() => deletePoll(poll._id, poll.question)} className="btn-action delete" title="Delete Poll"><FaTrash /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center">No polls match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;