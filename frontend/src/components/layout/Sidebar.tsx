import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Simple icon components for sidebar
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const LibraryIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm12 6V9c0-.55-.45-1-1-1h-2v5h2c.55 0 1-.45 1-1zm-2-3h1v3h-1V9z" />
  </svg>
);

const DiscoverIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z" />
  </svg>
);

const PlaylistIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M14 6H4c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1zm0 4H4c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1zM4 16h6c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM19 6c-1.1 0-2 .9-2 2v6.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h2V6h-2z" />
  </svg>
);

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}
      data-testid="sidebar"
    >
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          data-testid="sidebar-toggle"
        >
          {collapsed ? '>' : '<'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <DashboardIcon />
            <span className="nav-text">Dashboard</span>
          </Link>
          
          <Link to="/library" className={`nav-item ${isActive('/library') ? 'active' : ''}`}>
            <LibraryIcon />
            <span className="nav-text">My Library</span>
          </Link>
          
          <Link to="/discover" className={`nav-item ${isActive('/discover') ? 'active' : ''}`}>
            <DiscoverIcon />
            <span className="nav-text">Discover</span>
          </Link>
          
          <Link to="/playlists" className={`nav-item ${isActive('/playlists') ? 'active' : ''}`}>
            <PlaylistIcon />
            <span className="nav-text">Playlists</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}; 