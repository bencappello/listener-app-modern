import React from 'react';
import { Navigate } from 'react-router-dom';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { useAppSelector } from '../../store';

/**
 * Register page component
 * Displays the registration form and handles redirection after successful registration
 */
const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // If already authenticated, redirect to homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage; 