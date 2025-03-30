import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import BlogList from './BlogList';
import { Blog } from '../../types/entities';

describe('BlogList Component', () => {
  // Mock blog data
  const mockBlogs: Blog[] = [
    {
      id: 1,
      name: 'Test Blog 1',
      url: 'https://testblog1.com',
      description: 'This is the first test blog',
      imageUrl: 'https://example.com/image1.jpg',
      isActive: true,
      lastScraped: '2023-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      name: 'Test Blog 2',
      url: 'https://testblog2.com',
      description: 'This is the second test blog',
      imageUrl: 'https://example.com/image2.jpg',
      isActive: true
    },
    {
      id: 3,
      name: 'Test Blog 3',
      url: 'https://testblog3.com',
      isActive: false
    }
  ];

  // Mock props
  const mockOnToggleFollow = jest.fn();
  const mockOnBlogClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a list of blogs', () => {
    render(
      <BlogList 
        blogs={mockBlogs} 
        onToggleFollow={mockOnToggleFollow}
        onBlogClick={mockOnBlogClick}
        isLoading={false}
      />
    );

    // Check if blog names are displayed
    expect(screen.getByText('Test Blog 1')).toBeInTheDocument();
    expect(screen.getByText('Test Blog 2')).toBeInTheDocument();
    expect(screen.getByText('Test Blog 3')).toBeInTheDocument();
    
    // Check if descriptions are displayed
    expect(screen.getByText('This is the first test blog')).toBeInTheDocument();
    expect(screen.getByText('This is the second test blog')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(
      <BlogList 
        blogs={[]} 
        onToggleFollow={mockOnToggleFollow}
        onBlogClick={mockOnBlogClick}
        isLoading={true}
      />
    );

    // Check for loading indicator
    expect(screen.getByTestId('blog-list-loading')).toBeInTheDocument();
    expect(screen.queryByText('No blogs found')).not.toBeInTheDocument();
  });

  it('displays empty state when no blogs are available', () => {
    render(
      <BlogList 
        blogs={[]} 
        onToggleFollow={mockOnToggleFollow}
        onBlogClick={mockOnBlogClick}
        isLoading={false}
      />
    );

    // Check for empty state message
    expect(screen.getByText('No blogs found')).toBeInTheDocument();
  });

  it('calls onBlogClick when a blog is clicked', () => {
    render(
      <BlogList 
        blogs={mockBlogs} 
        onToggleFollow={mockOnToggleFollow}
        onBlogClick={mockOnBlogClick}
        isLoading={false}
      />
    );

    // Click on the first blog
    const blogCards = screen.getAllByTestId('blog-card');
    userEvent.click(blogCards[0]);

    // Check if onBlogClick was called with the correct blog
    expect(mockOnBlogClick).toHaveBeenCalledWith(mockBlogs[0]);
  });

  it('calls onToggleFollow when follow button is clicked', () => {
    render(
      <BlogList 
        blogs={mockBlogs} 
        onToggleFollow={mockOnToggleFollow}
        onBlogClick={mockOnBlogClick}
        isLoading={false}
      />
    );

    // Click on the first follow button
    const followButtons = screen.getAllByRole('button', { name: /follow|unfollow/i });
    userEvent.click(followButtons[0]);

    // Check if onToggleFollow was called with the correct blog id
    expect(mockOnToggleFollow).toHaveBeenCalledWith(mockBlogs[0].id);
  });

  it('displays badges for inactive blogs', () => {
    render(
      <BlogList 
        blogs={mockBlogs} 
        onToggleFollow={mockOnToggleFollow}
        onBlogClick={mockOnBlogClick}
        isLoading={false}
      />
    );

    // Look for inactive badge on the third blog
    const inactiveBadges = screen.getAllByText('Inactive');
    expect(inactiveBadges.length).toBe(1);
  });

  it('renders with grid layout when specified', () => {
    render(
      <BlogList 
        blogs={mockBlogs} 
        onToggleFollow={mockOnToggleFollow}
        onBlogClick={mockOnBlogClick}
        isLoading={false}
        layout="grid"
      />
    );

    // Check if grid layout is used
    const gridContainer = screen.getByTestId('blog-grid-layout');
    expect(gridContainer).toBeInTheDocument();
  });

  it('renders with list layout by default', () => {
    render(
      <BlogList 
        blogs={mockBlogs} 
        onToggleFollow={mockOnToggleFollow}
        onBlogClick={mockOnBlogClick}
        isLoading={false}
      />
    );

    // Check if list layout is used
    const listContainer = screen.getByTestId('blog-list-layout');
    expect(listContainer).toBeInTheDocument();
  });

  it('applies custom title when provided', () => {
    const customTitle = 'Custom Blog List Title';
    render(
      <BlogList 
        blogs={mockBlogs} 
        onToggleFollow={mockOnToggleFollow}
        onBlogClick={mockOnBlogClick}
        isLoading={false}
        title={customTitle}
      />
    );

    // Check if custom title is displayed
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });
}); 