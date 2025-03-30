import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import BlogDetail from './BlogDetail';
import { Blog } from '../../types/entities';

describe('BlogDetail Component', () => {
  // Mock blog data
  const mockBlog: Blog = {
    id: 1,
    name: 'Test Music Blog',
    url: 'https://testmusicblog.com',
    description: 'A blog that covers the latest in indie music and emerging artists',
    imageUrl: 'https://example.com/blog-image.jpg',
    isActive: true,
    lastScraped: '2023-05-15T10:30:00.000Z'
  };

  // Mock props
  const mockOnToggleFollow = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders blog details correctly', () => {
    render(
      <BlogDetail 
        blog={mockBlog} 
        onToggleFollow={mockOnToggleFollow}
        onBack={mockOnBack}
        isFollowing={false}
      />
    );

    // Check if blog details are displayed
    expect(screen.getByText('Test Music Blog')).toBeInTheDocument();
    expect(screen.getByText('https://testmusicblog.com')).toBeInTheDocument();
    expect(screen.getByText('A blog that covers the latest in indie music and emerging artists')).toBeInTheDocument();
    
    // Check if the image is displayed
    const image = screen.getByAltText('Test Music Blog');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/blog-image.jpg');
    
    // Check last scraped date formatting
    expect(screen.getByText('Last updated: May 15, 2023')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(
      <BlogDetail 
        blog={null} 
        onToggleFollow={mockOnToggleFollow}
        onBack={mockOnBack}
        isFollowing={false}
        isLoading={true}
      />
    );

    // Check for loading skeleton
    expect(screen.getByTestId('blog-detail-loading')).toBeInTheDocument();
  });

  it('displays not found state when blog is null and not loading', () => {
    render(
      <BlogDetail 
        blog={null} 
        onToggleFollow={mockOnToggleFollow}
        onBack={mockOnBack}
        isFollowing={false}
        isLoading={false}
      />
    );

    // Check for not found message
    expect(screen.getByText('Blog not found')).toBeInTheDocument();
  });

  it('calls onToggleFollow when follow button is clicked', () => {
    render(
      <BlogDetail 
        blog={mockBlog} 
        onToggleFollow={mockOnToggleFollow}
        onBack={mockOnBack}
        isFollowing={false}
      />
    );

    // Click the follow button
    const followButton = screen.getByRole('button', { name: /follow/i });
    userEvent.click(followButton);

    // Check if onToggleFollow was called with the correct blog id
    expect(mockOnToggleFollow).toHaveBeenCalledWith(mockBlog.id);
  });

  it('displays "Unfollow" text when isFollowing is true', () => {
    render(
      <BlogDetail 
        blog={mockBlog} 
        onToggleFollow={mockOnToggleFollow}
        onBack={mockOnBack}
        isFollowing={true}
      />
    );

    // Check for unfollow button text
    expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <BlogDetail 
        blog={mockBlog} 
        onToggleFollow={mockOnToggleFollow}
        onBack={mockOnBack}
        isFollowing={false}
      />
    );

    // Click the back button
    const backButton = screen.getByRole('button', { name: /back/i });
    userEvent.click(backButton);

    // Check if onBack was called
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('displays inactive badge for inactive blogs', () => {
    const inactiveBlog = { ...mockBlog, isActive: false };
    
    render(
      <BlogDetail 
        blog={inactiveBlog} 
        onToggleFollow={mockOnToggleFollow}
        onBack={mockOnBack}
        isFollowing={false}
      />
    );

    // Check for inactive badge
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders with statistics if provided', () => {
    render(
      <BlogDetail 
        blog={mockBlog} 
        onToggleFollow={mockOnToggleFollow}
        onBack={mockOnBack}
        isFollowing={false}
        stats={{
          songCount: 120,
          followerCount: 45
        }}
      />
    );

    // Check if statistics are displayed
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Songs')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
  });

  it('renders visit website button with correct url', () => {
    render(
      <BlogDetail 
        blog={mockBlog} 
        onToggleFollow={mockOnToggleFollow}
        onBack={mockOnBack}
        isFollowing={false}
      />
    );

    // Check for visit website button
    const visitButton = screen.getByRole('link', { name: /visit website/i });
    expect(visitButton).toBeInTheDocument();
    expect(visitButton).toHaveAttribute('href', mockBlog.url);
    expect(visitButton).toHaveAttribute('target', '_blank');
  });
}); 