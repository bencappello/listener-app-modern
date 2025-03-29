import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils/testing-library-utils';
import { MainLayout } from './MainLayout';

// Mock children component
const MockChildComponent = () => <div data-testid="mock-child">Child Component</div>;

// Mock the Navbar, Sidebar, and Footer components
jest.mock('./Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar Component</div>
}));

jest.mock('./Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar Component</div>
}));

jest.mock('./Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>
}));

describe('MainLayout', () => {
  it('renders the layout with all components', () => {
    render(
      <MainLayout>
        <MockChildComponent />
      </MainLayout>
    );
    
    // Check if navbar is rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    
    // Check if sidebar is rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Check if footer is rendered
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    
    // Check if the child component is rendered
    expect(screen.getByTestId('mock-child')).toBeInTheDocument();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('applies correct structure and CSS classes', () => {
    render(
      <MainLayout>
        <MockChildComponent />
      </MainLayout>
    );
    
    // Check for main layout container
    const layoutContainer = screen.getByTestId('main-layout');
    expect(layoutContainer).toBeInTheDocument();
    expect(layoutContainer).toHaveClass('main-layout');
    
    // Check for content container
    const contentContainer = screen.getByTestId('content-container');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('content-container');
  });

  it('renders without sidebar when hideSidebar prop is true', () => {
    render(
      <MainLayout hideSidebar>
        <MockChildComponent />
      </MainLayout>
    );
    
    // Sidebar should not be rendered
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    
    // Navbar and footer should still be rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    
    // Content should have different class when sidebar is hidden
    const contentContainer = screen.getByTestId('content-container');
    expect(contentContainer).toHaveClass('content-container-full');
  });
}); 