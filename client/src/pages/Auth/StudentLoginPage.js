import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthForm from '../../components/Auth/AuthForm';
import AuthPageLayout from '../../layouts/AuthPageLayout'; // <-- Import the new layout

const StudentLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    const success = await login(formData.email, formData.password, 'student');
    if (success) {
      navigate('/dashboard');
      window.location.reload();
    } else {
      setError('Invalid credentials or role mismatch.');
    }
    setIsLoading(false);
  };

  return (
    <AuthPageLayout>
      <AuthForm
        isLogin
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
export default StudentLoginPage;