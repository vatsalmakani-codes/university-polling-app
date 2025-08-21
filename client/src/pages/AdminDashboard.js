import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ResetPasswordModal from '../components/modals/ResetPasswordModal';
import ManagePollModal from '../components/modals/ManagePollModal';
import CreateUserModal from '../components/modals/CreateUserModal';
import CreateAdminModal from '../components/modals/CreateAdminModal';
import { 
  FaUsers, FaPoll, FaCheckSquare, FaTrash, FaKey, 
  FaExternalLinkAlt, FaPlus, FaSearch, FaWrench, FaComments, FaUserPlus, FaStar, FaUserCog
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './AdminDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  // Data State
  const [allUsers, setAllUsers] = useState([]);
  const [allPolls, setAllPolls] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);

  // Filter & UI State
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [modalUser, setModalUser] = useState(null);
  const [modalPoll, setModalPoll] = useState(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [userTypeToCreate, setUserTypeToCreate] = useState('');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);

  // Search State
  const [userSearch, setUserSearch] = useState('');
  const [pollSearch, setPollSearch] = useState('');

  // Memoized filtered data for performance
  const { students, faculty, admins } = useMemo(() => {
    const searchLower = userSearch.toLowerCase();
    return {
      students: allUsers.filter(u => u.role === 'student' && (u.name.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower))),
      faculty: allUsers.filter(u => u.role === 'faculty' && (u.name.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower))),
      admins: allUsers.filter(u => u.role.includes('admin') && (u.name.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower))),
    };
  }, [allUsers, userSearch]);

  const filteredPolls = useMemo(() =>
    allPolls.filter(p => p.question.toLowerCase().includes(pollSearch.toLowerCase())),
    [allPolls, pollSearch]
  );
  
  const fetchData = useCallback(async () => {
    try {
      const [usersRes, pollsRes, feedbackRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/polls'), // Admin gets all polls
        axios.get('/api/admin/feedback'),
      ]);
      setAllUsers(usersRes.data);
      setAllPolls(pollsRes.data);
      setAllFeedback(feedbackRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError('Could not load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Memoized calculations for stats and chart data
  const totalVotes = useMemo(() => 
    allPolls.reduce((acc, p) => acc + p.options.reduce((sum, o) => sum + o.votes, 0), 0), 
    [allPolls]
  );
  
  const userRoleData = useMemo(() => {
    const roles = allUsers.reduce((acc, u) => {
      const role = u.role.includes('admin') ? 'Admin' : u.role;
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      acc[capitalizedRole] = (acc[capitalizedRole] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(roles),
      datasets: [{ 
        data: Object.values(roles), 
        backgroundColor: ['#4e73df', '#1cc88a', '#e74a3b', '#f6c23e'], 
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  }, [allUsers]);
  
  // Action Handlers
  const deleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete "${userName}"? This will also remove all their votes and feedback.`)) {
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

  const toggleFeaturedFeedback = async (feedbackId) => {
    try {
      await axios.put(`/api/admin/feedback/${feedbackId}/feature`);
      fetchData();
    } catch(err) {
      alert('Failed to update feedback status.');
    }
  };
  
  const deleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback item?')) {
        try {
            await axios.delete(`/api/admin/feedback/${feedbackId}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete feedback.');
        }
    }
  };

  const openCreateUserModal = (role) => {
    setUserTypeToCreate(role);
    setShowCreateUserModal(true);
  };
  
  if (loading) return <Spinner fullscreen text="Loading Admin Dashboard..."/>;
  if (error) return <div className="error-state">{error}</div>;

  const userTable = (usersToDisplay) => (
    <div className="table-responsive">
      <table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
        <tbody>
          {usersToDisplay.length > 0 ? usersToDisplay.map(u => (
            <tr key={u._id}>
              <td data-label="Name">{u.name}</td>
              <td data-label="Email">{u.email}</td>
              <td data-label="Role"><span className={`role-badge ${u.role}`}>{u.role}</span></td>
              <td data-label="Actions" className="actions-cell">
                <button onClick={() => setModalUser(u)} className="btn-action reset" title="Reset Password"><FaKey /></button>
                {u.role !== 'super-admin' && <button onClick={() => deleteUser(u._id, u.name)} className="btn-action delete" title="Delete User"><FaTrash /></button>}
              </td>
            </tr>
          )) : (
            <tr><td colSpan="4" className="text-center">No users match your search criteria.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {modalUser && <ResetPasswordModal user={modalUser} closeModal={() => setModalUser(null)} />}
      {modalPoll && <ManagePollModal poll={modalPoll} closeModal={() => setModalPoll(null)} onUpdate={fetchData} />}
      {showCreateUserModal && <CreateUserModal userRole={userTypeToCreate} closeModal={() => setShowCreateUserModal(false)} onUpdate={fetchData} />}
      {showCreateAdminModal && <CreateAdminModal closeModal={() => setShowCreateAdminModal(false)} onUpdate={fetchData} />}

      <div className="page-header"><h1 className="page-title">Admin Dashboard</h1><p className="page-subtitle">System overview and management tools.</p></div>
      
      <div className="stat-cards-grid">
        <div className="stat-card"><FaUsers className="stat-icon users" /><div className="stat-info"><span className="stat-label">Total Users</span><span className="stat-number">{allUsers.length}</span></div></div>
        <div className="stat-card"><FaPoll className="stat-icon polls" /><div className="stat-info"><span className="stat-label">Total Polls</span><span className="stat-number">{allPolls.length}</span></div></div>
        <div className="stat-card"><FaCheckSquare className="stat-icon votes" /><div className="stat-info"><span className="stat-label">Total Votes</span><span className="stat-number">{totalVotes}</span></div></div>
        <div className="stat-card"><FaComments className="stat-icon feedback" /><div className="stat-info"><span className="stat-label">Feedback Items</span><span className="stat-number">{allFeedback.length}</span></div></div>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`tab-btn ${activeTab === 'polls' ? 'active' : ''}`} onClick={() => setActiveTab('polls')}>Polls</button>
        {user.role === 'super-admin' && <button className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>Administrators</button>}
        <button className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>Feedback</button>
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>User Management (Students & Faculty)</h3>
            <div className="header-actions">
              <button className="btn-create-user" onClick={() => openCreateUserModal('student')}><FaUserPlus/> New Student</button>
              <button className="btn-create-user" onClick={() => openCreateUserModal('faculty')}><FaUserPlus/> New Faculty</button>
            </div>
          </div>
          <div className="card-body">
            <div className="filter-bar"><div className="search-input"><FaSearch /><input type="text" placeholder="Search students & faculty..." value={userSearch} onChange={e => setUserSearch(e.target.value)} /></div></div>
            {userTable([...students, ...faculty])}
          </div>
        </div>
      )}

      {activeTab === 'polls' && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Poll Management</h3><Link to="/admin/create-poll" className="btn-create-poll-header"><FaPlus /> New Poll</Link>
          </div>
          <div className="card-body">
            <div className="filter-bar"><div className="search-input"><FaSearch /><input type="text" placeholder="Search polls by question..." value={pollSearch} onChange={e => setPollSearch(e.target.value)} /></div></div>
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Question</th><th>Status</th><th>Results</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredPolls.map(p => (
                    <tr key={p._id}>
                      <td data-label="Question" className="poll-question-cell">{p.question}</td>
                      <td data-label="Status"><span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span></td>
                      <td data-label="Results">{p.resultsPublished ? 'Published' : 'Hidden'}</td>
                      <td data-label="Actions" className="actions-cell">
                        <button onClick={() => setModalPoll(p)} className="btn-action manage" title="Manage Poll"><FaWrench /></button>
                        {user.role === 'super-admin' && <Link to={`/admin/polls/${p._id}/live`} className="btn-action live" title="Live View"><FaExternalLinkAlt /></Link>}
                        <button onClick={() => deletePoll(p._id, p.question)} className="btn-action delete" title="Delete Poll"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admins' && user.role === 'super-admin' && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Administrator Management</h3>
            <button className="btn-create-user" onClick={() => setShowCreateAdminModal(true)}><FaUserCog/> New Admin</button>
          </div>
          <div className="card-body">
            <div className="filter-bar"><div className="search-input"><FaSearch /><input type="text" placeholder="Search admins by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} /></div></div>
            {userTable(admins)}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
         <div className="card">
           <div className="card-header"><h3>User Feedback Management</h3></div>
           <div className="card-body">
             <div className="table-responsive">
              <table className="table">
                <thead><tr><th>User</th><th>Comment</th><th>Rating</th><th>Actions</th></tr></thead>
                <tbody>
                  {allFeedback.map(fb => (
                    <tr key={fb._id}>
                      <td data-label="User">{fb.user?.name || 'N/A'}</td>
                      <td data-label="Comment" className="feedback-comment-cell">{fb.comment}</td>
                      <td data-label="Rating">{fb.rating} ★</td>
                      <td data-label="Actions" className="actions-cell">
                        <button onClick={() => toggleFeaturedFeedback(fb._id)} className={`btn-action feature ${fb.isFeatured ? 'featured' : ''}`} title={fb.isFeatured ? 'Unfeature' : 'Feature'}><FaStar /></button>
                        <button onClick={() => deleteFeedback(fb._id)} className="btn-action delete" title="Delete Feedback"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
           </div>
         </div>
      )}
    </div>
  );
};
export default AdminDashboard;