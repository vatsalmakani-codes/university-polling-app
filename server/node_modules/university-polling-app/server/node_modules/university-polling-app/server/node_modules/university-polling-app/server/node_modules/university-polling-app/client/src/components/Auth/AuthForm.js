import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../Spinner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AuthForm.css';

const AuthForm = ({ isLogin, role, formData, setFormData, onSubmit, isLoading, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="auth-form-card">
      <div className="auth-header">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <p>as a <span className="role-highlight">{roleTitle}</span></p>
      </div>
      <form onSubmit={onSubmit}>
        {error && <div className="error-message">{error}</div>}
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={onChange} required placeholder="e.g., Jane Doe" />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">University Email (.edu)</label>
          <input type="email" id="email" name="email" value={formData.email || ''} onChange={onChange} required placeholder="e.g., student@university.edu" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-group">
            <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password || ''} onChange={onChange} required placeholder="Minimum 6 characters" minLength="6" />
            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-group">
              <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword || ''} onChange={onChange} required placeholder="Re-type your password" />
              <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
        )}
        <button type="submit" className='btn-auth' disabled={isLoading}>
          {isLoading ? <Spinner /> : (isLogin ? 'Login' : 'Create Account')}
        </button>
      </form>
      <div className="auth-footer">
        {isLogin ? (
          role !== 'admin' && <p>New here? <Link to={`/register/${role}`}>Create an account</Link></p>
        ) : (
          <p>Already have an account? <Link to={`/login/${role}`}>Sign in</Link></p>
        )}
      </div>
    </div>
  );
};
export default AuthForm;