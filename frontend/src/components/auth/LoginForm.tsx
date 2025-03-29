import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../types/auth';

interface ValidationErrors {
  username?: string;
  password?: string;
}

export const LoginForm: React.FC = () => {
  const { login, isLoggingIn, loginError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  
  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      login(formData);
    }
  };
  
  return (
    <div className="login-form-container">
      <h2>Sign In</h2>
      
      {loginError && (
        <div className="error-message">
          {loginError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoggingIn}
          />
          {validationErrors.username && (
            <div className="validation-error">{validationErrors.username}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoggingIn}
          />
          {validationErrors.password && (
            <div className="validation-error">{validationErrors.password}</div>
          )}
        </div>
        
        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div className="form-footer">
        <p>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}; 