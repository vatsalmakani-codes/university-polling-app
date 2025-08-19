import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthForm from '../../components/Auth/AuthForm';
import AuthPageLayout from '../../layouts/AuthPageLayout';

const StudentRegisterPage = () => {
  // UPDATED: Add confirmPassword to the state
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // UPDATED: Add password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const success = await register({ name: formData.name, email: formData.email, password: formData.password, role: 'student' });
    
    if (success) {
      navigate('/dashboard');
      window.location.reload();
    } else {
      setError('Registration failed. This email may already be in use.');
    }
    
    setIsLoading(false);
  };

  return (
    <AuthPageLayout>
      <AuthForm
        isLogin={false}
        role="student"
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isLoading={isLoading}
        error={error}
      />
    </AuthPageLayout>
  );
};

export default StudentRegisterPage;