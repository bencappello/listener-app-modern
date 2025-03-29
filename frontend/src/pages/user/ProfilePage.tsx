import React from 'react';
import { useAppSelector } from '../../store';

/**
 * User profile page
 * Displays user profile information and options to edit
 */
const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  if (!user) {
    return <div>Loading user data...</div>;
  }
  
  return (
    <div className="profile-page">
      <h1>Profile</h1>
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt={`${user.username}'s avatar`} />
            ) : (
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h2>{user.username}</h2>
            <p className="profile-email">{user.email}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="edit-profile-button">Edit Profile</button>
        </div>
        
        <div className="profile-stats">
          <div className="stats-item">
            <h3>Favorites</h3>
            <span className="stats-count">0</span>
          </div>
          <div className="stats-item">
            <h3>Following</h3>
            <span className="stats-count">0</span>
          </div>
          <div className="stats-item">
            <h3>Followers</h3>
            <span className="stats-count">0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 