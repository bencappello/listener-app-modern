import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './Layout.css';

interface MainLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideSidebar = false }) => {
  return (
    <div className="main-layout" data-testid="main-layout">
      <Navbar />
      
      <div className="layout-container">
        {!hideSidebar && <Sidebar />}
        
        <div 
          className={`content-container ${hideSidebar ? 'content-container-full' : ''}`}
          data-testid="content-container"
        >
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout; 