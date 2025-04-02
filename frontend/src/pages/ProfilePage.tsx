import React from 'react';

const ProfilePage: React.FC = () => {
  // Placeholder for fetching user data
  const user = {
    name: 'User Name',
    email: 'user@example.com',
    // Add more profile details later
  };

  return (
    <div>
      <h1>Profile Page</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      {/* Add more profile information display here */}
    </div>
  );
};

export default ProfilePage; 