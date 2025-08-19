import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthForm from '../../components/Auth/AuthForm';
import AuthPageLayout from '../../layouts/AuthPageLayout';

const FacultyLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Attempt to log in with the 'faculty' role
    const success = await login(formData.email, formData.password, 'faculty');
    
    if (success) {
      navigate('/dashboard'); // Redirect to the main dashboard on success
      window.location.reload();
    } else {
      setError('Invalid credentials or role mismatch. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <AuthPageLayout>
      <AuthForm
        isLogin={true}
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

export default FacultyLoginPage;