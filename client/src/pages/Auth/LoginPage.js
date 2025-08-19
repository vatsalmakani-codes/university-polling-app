import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './LoginPage.css'; // We will create this new CSS file
import Spinner from '../../components/Spinner';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) {
      setError('');
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/dashboard');
        window.location.reload(); // Reload to ensure the user state is updated
      } else {
        // Handle specific login failure from context (e.g., "Invalid Credentials")
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      // Handle unexpected errors (e.g., network issues)
      setError('An unexpected error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
        <div className='login-header'>
          <h2>Welcome Back!</h2>
          <p>Sign in to continue to the Polling System</p>
        </div>

        <form onSubmit={onSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="e.g., student@university.edu"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className='btn-login' disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;