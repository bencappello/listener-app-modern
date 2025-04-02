import React from 'react';
import LoginForm from '../components/authentication/LoginForm';

const LoginPage: React.FC = () => {

  const handleLogin = async (values: { email: string; password: string }) => {
    // Placeholder for actual login logic
    console.log('Login submitted', values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    // Redirect or update state upon successful login - TBD
  };

  return (
    <div>
      {/* We can reuse the LoginForm component */}
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
};

export default LoginPage; 