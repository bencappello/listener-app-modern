import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RegisterData } from '../../types/auth';

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

export const RegisterForm: React.FC = () => {
  const { register, isRegistering, registerError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
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
    
    // Required fields
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      register(formData);
    }
  };
  
  return (
    <div className="register-form-container">
      <h2>Create Account</h2>
      
      {registerError && (
        <div className="error-message">
          {registerError}
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
            disabled={isRegistering}
          />
          {validationErrors.username && (
            <div className="validation-error">{validationErrors.username}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isRegistering}
          />
          {validationErrors.email && (
            <div className="validation-error">{validationErrors.email}</div>
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
            disabled={isRegistering}
          />
          {validationErrors.password && (
            <div className="validation-error">{validationErrors.password}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm_password">Confirm Password</label>
          <input
            id="confirm_password"
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            disabled={isRegistering}
          />
          {validationErrors.confirm_password && (
            <div className="validation-error">{validationErrors.confirm_password}</div>
          )}
        </div>
        
        <button type="submit" disabled={isRegistering}>
          {isRegistering ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="form-footer">
        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}; 