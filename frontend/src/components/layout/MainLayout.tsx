import React from 'react';
import { Outlet } from 'react-router-dom';
// Import the actual Header component
import Header from './Header';
// We'll add imports for Footer, Sidebar later

const MainLayout: React.FC = () => {
  return (
    <div className="app-layout">
      {/* Use the Header component */}
      <Header />

      <div className="main-content">
        {/* Sidebar Component might go here or be part of main */}
        <aside>Sidebar Placeholder</aside>
        
        <main>
          {/* Child route content will be rendered here */}
          <Outlet />
        </main>
      </div>

      {/* Footer Component will go here */}
      <footer>Footer Placeholder</footer>
    </div>
  );
};

export default MainLayout; 