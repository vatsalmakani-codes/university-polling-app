import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthForm from '../../components/Auth/AuthForm';
import AuthPageLayout from '../../layouts/AuthPageLayout';

const FacultyRegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    const success = await register({ name: formData.name, email: formData.email, password: formData.password, role: 'faculty' });
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Registration failed. Email may be invalid or already in use.');
    }
    setIsLoading(false);
  };

  return (
    <AuthPageLayout>
      <AuthForm
        isLogin={false}
        role="faculty"
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isLoading={isLoading}
        error={error}
      />
    </AuthPageLayout>
  );
};
export default FacultyRegisterPage;