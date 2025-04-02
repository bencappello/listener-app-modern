import React from 'react';
import { Outlet } from 'react-router-dom';
// We'll add imports for Header, Footer, Sidebar later

const MainLayout: React.FC = () => {
  return (
    <div className="app-layout">
      {/* Header Component will go here */}
      <header>Header Placeholder</header>

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