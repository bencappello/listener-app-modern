import React from 'react';
import { render, screen } from '@testing-library/react';
import { Comment } from '../../types/entities';
import CommentList from './CommentList';

// Mock data
const mockComments: Comment[] = [
  {
    id: 1,
    userId: 1,
    songId: 1,
    text: 'This is the first comment',
    createdAt: '2023-03-15T14:30:00.000Z',
    user: {
      id: 1,
      username: 'testuser1',
      email: 'test1@example.com',
      createdAt: '2023-01-01',
      profileImage: 'https://example.com/avatar1.jpg'
    }
  },
  {
    id: 2,
    userId: 2,
    songId: 1,
    text: 'This is the second comment with a current user',
    createdAt: '2023-03-16T10:20:00.000Z',
    user: {
      id: 2,
      username: 'testuser2',
      email: 'test2@example.com',
      createdAt: '2023-01-02',
      isCurrentUser: true
    }
  },
  {
    id: 3,
    userId: 3,
    songId: 1,
    text: 'This is the third comment',
    createdAt: '2023-03-17T09:10:00.000Z',
    user: {
      id: 3,
      username: 'testuser3',
      email: 'test3@example.com',
      createdAt: '2023-01-03'
    }
  }
];

describe('CommentList Component', () => {
  it('renders a list of comments correctly', () => {
    render(<CommentList comments={mockComments} />);
    
    // Check if all comments are displayed
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    expect(screen.getByText('This is the second comment with a current user')).toBeInTheDocument();
    expect(screen.getByText('This is the third comment')).toBeInTheDocument();
    
    // Check for usernames
    expect(screen.getByText('testuser1')).toBeInTheDocument();
    expect(screen.getByText('testuser2')).toBeInTheDocument();
    expect(screen.getByText('testuser3')).toBeInTheDocument();
    
    // Check if "You" badge is displayed for current user
    expect(screen.getByText('You')).toBeInTheDocument();
  });
  
  it('displays a loading state when isLoading is true', () => {
    render(<CommentList comments={[]} isLoading={true} />);
    
    // Check for loading message
    expect(screen.getByTestId('comment-list-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading comments...')).toBeInTheDocument();
  });
  
  it('displays an empty state when no comments are available', () => {
    render(<CommentList comments={[]} />);
    
    // Check for empty state message
    expect(screen.getByTestId('comment-list-empty')).toBeInTheDocument();
    expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
  });
  
  it('renders the correct number of comments', () => {
    render(<CommentList comments={mockComments} />);
    
    // The component should render all comments in the list
    const commentItems = screen.getAllByText(/This is the .* comment/);
    expect(commentItems).toHaveLength(3);
  });
  
  it('renders relative time for comments', () => {
    render(<CommentList comments={mockComments} />);
    
    // There should be relative time displays 
    // We can't test the exact formatted time as it depends on the current date,
    // but we can check that the formatRelativeTime function is applied
    const timeElements = screen.getAllByText(/ago/i);
    expect(timeElements.length).toBeGreaterThan(0);
  });
  
  it('renders user avatars for each comment', () => {
    render(<CommentList comments={mockComments} />);
    
    // Use Testing Library methods instead of direct DOM queries
    // Check that avatars are present by looking for elements with the role "img"
    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(mockComments.length);
  });
}); 