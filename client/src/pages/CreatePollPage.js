import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import DatePicker from 'react-datepicker';
import { 
  FaPlus, FaTrashAlt, FaListUl, FaCheckDouble, 
  FaUsers, FaUserGraduate, FaChalkboardTeacher 
} from 'react-icons/fa';
import './CreatePollPage.css';

const CreatePollPage = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [pollType, setPollType] = useState('SINGLE_CHOICE');
  const [targetAudience, setTargetAudience] = useState('STUDENT');
  const [expiresAt, setExpiresAt] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to 1 week from now
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const addOption = () => { if (options.length < 10) setOptions([...options, '']); };
  const removeOption = (index) => { setOptions(options.filter((_, i) => i !== index)); };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      return setError('Please provide at least two valid options.');
    }
    const pollData = { question, options: validOptions, pollType, targetAudience, expiresAt };
    setIsLoading(true);
    try {
      await axios.post('/api/admin/polls', pollData);
      navigate('/admin'); // Redirect to admin dashboard on success
    } catch(err) {
      setError('Failed to create poll. Please check all fields and try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="create-poll-container">
      <div className="page-header">
        <h1 className="page-title">Create New Poll</h1>
        <p className="page-subtitle">Fill out the details below to launch a new poll for the university community.</p>
      </div>
      
      <form onSubmit={onSubmit}>
        {error && <div className="error-message-fixed">{error}</div>}

        <div className="card">
          <div className="card-header"><h3>Poll Details</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="question">Poll Question</label>
              <textarea 
                id="question" 
                value={question} 
                onChange={e => setQuestion(e.target.value)} 
                required 
                placeholder="e.g., What should be the new theme for the annual fest?" 
              />
            </div>
            <div className="form-group">
              <label>Answer Options</label>
              {options.map((opt, i) => (
                <div className="option-input-group" key={i}>
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={e => handleOptionChange(i, e.target.value)} 
                    required 
                    placeholder={`Option ${i + 1}`} 
                  />
                  {options.length > 2 && (
                    <button type="button" className="btn-remove-option" onClick={() => removeOption(i)} title="Remove Option">
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add-option" onClick={addOption} disabled={options.length >= 10}>
                <FaPlus /> Add Another Option
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Settings</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label>Poll Type</label>
              <div className="custom-radio-group">
                <button type="button" className={`radio-btn ${pollType === 'SINGLE_CHOICE' ? 'active' : ''}`} onClick={() => setPollType('SINGLE_CHOICE')}><FaListUl/> Single Choice</button>
                <button type="button" className={`radio-btn ${pollType === 'MULTIPLE_CHOICE' ? 'active' : ''}`} onClick={() => setPollType('MULTIPLE_CHOICE')}><FaCheckDouble/> Multiple Choice</button>
              </div>
            </div>
            <div className="form-group">
              <label>Target Audience</label>
              <div className="custom-radio-group">
                <button type="button" className={`radio-btn ${targetAudience === 'STUDENT' ? 'active' : ''}`} onClick={() => setTargetAudience('STUDENT')}><FaUserGraduate/> Students</button>
                <button type="button" className={`radio-btn ${targetAudience === 'FACULTY' ? 'active' : ''}`} onClick={() => setTargetAudience('FACULTY')}><FaChalkboardTeacher/> Faculty</button>
                <button type="button" className={`radio-btn ${targetAudience === 'ALL' ? 'active' : ''}`} onClick={() => setTargetAudience('ALL')}><FaUsers/> All Users</button>
              </div>
            </div>
            <div className="form-group">
              <label>Set Voting Deadline</label>
              <DatePicker 
                selected={expiresAt} 
                onChange={date => setExpiresAt(date)} 
                showTimeSelect 
                dateFormat="MMMM d, yyyy h:mm aa" 
                className="date-picker-input"
                minDate={new Date()}
              />
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-submit-poll" disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Publish Poll'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreatePollPage;