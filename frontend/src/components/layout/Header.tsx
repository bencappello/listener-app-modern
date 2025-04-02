import React from 'react';
import { Link } from 'react-router-dom';
// import useAuth from '../../hooks/useAuth'; // We'll add this later for real auth state

const Header: React.FC = () => {
  // Placeholder for authentication state
  const isAuthenticated = false; // Assume not logged in initially
  // const { user, logout } = useAuth(); // Example usage for later

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '1rem', 
      borderBottom: '1px solid #ccc' 
    }}>
      <div className="logo">
        <Link to="/">Listener App</Link>
      </div>
      <nav>
        {isAuthenticated ? (
          <>
            {/* Placeholder for authenticated user links */}
            <Link to="/profile" style={{ marginRight: '1rem' }}>Profile</Link>
            <button onClick={() => console.log('Logout clicked - TBD')}>Logout</button>
            {/* Replace console.log with actual logout function later */}
          </>
        ) : (
          <>
            {/* Placeholder for guest links */}
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header; 