import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAppSelector } from '../../store';

/**
 * Login page component
 * Displays the login form and handles redirection after successful login
 */
const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  
  // Get the return URL from location state or default to homepage
  const from = location.state?.from?.pathname || '/';
  
  // If already authenticated, redirect to the return URL or homepage
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage; 