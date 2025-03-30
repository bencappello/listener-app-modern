import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import { UserProfile } from './UserProfile';
import * as userService from '../../services/user.service';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { User, Song } from '../../types/entities';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn()
}));

// Mock user service
jest.mock('../../services/user.service');

const mockUserService = userService as jest.Mocked<typeof userService>;

// Mock data
const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  profileImage: 'https://example.com/avatar.jpg',
  avatarUrl: 'https://example.com/avatar.jpg',
  bio: 'This is a test bio',
  createdAt: '2023-01-01',
  followersCount: 10,
  followingCount: 5,
  isFollowing: false,
  isCurrentUser: false
};

const mockCurrentUser: User = {
  ...mockUser,
  id: '1',
  isCurrentUser: true
};

const mockFavoriteSongs: Song[] = [
  {
    id: '1',
    title: 'Test Song 1',
    artist: 'Test Artist 1',
    blogId: '1',
    blogName: 'Test Blog 1',
    audioUrl: 'https://example.com/song1.mp3',
    imageUrl: 'https://example.com/image1.jpg',
    postUrl: 'https://example.com/post1',
    postDate: '2023-01-01',
    isFavorite: true
  },
  {
    id: '2',
    title: 'Test Song 2',
    artist: 'Test Artist 2',
    blogId: '2',
    blogName: 'Test Blog 2',
    audioUrl: 'https://example.com/song2.mp3',
    imageUrl: 'https://example.com/image2.jpg',
    postUrl: 'https://example.com/post2',
    postDate: '2023-01-02',
    isFavorite: true
  }
];

// Import useParams and useNavigate from the mocked react-router-dom
const { useParams, useNavigate } = jest.requireActual('react-router-dom');

describe('UserProfile Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('renders user profile information correctly', async () => {
    // Setup mocks
    mockUserService.getUserById.mockResolvedValue(mockUser);
    mockUserService.getUserFavorites.mockResolvedValue({ data: mockFavoriteSongs, total: 2, page: 1, limit: 10 });

    render(<UserProfile />);

    // Wait for the user data to load
    await waitFor(() => {
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });

    // Check if user information is displayed
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('This is a test bio')).toBeInTheDocument();
    expect(screen.getByText('10 followers')).toBeInTheDocument();
    expect(screen.getByText('5 following')).toBeInTheDocument();
  });

  it('shows user avatar with correct source', async () => {
    // Setup mocks
    mockUserService.getUserById.mockResolvedValue(mockUser);
    mockUserService.getUserFavorites.mockResolvedValue({ data: mockFavoriteSongs, total: 2, page: 1, limit: 10 });

    render(<UserProfile />);

    // Wait for the user data to load
    await waitFor(() => {
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });

    // Check for avatar with aria-label
    const avatar = screen.getByLabelText('testuser avatar');
    expect(avatar).toBeInTheDocument();
    
    // Test Library prefers getByRole or other semantic queries over direct node access
  });

  it('displays favorite songs', async () => {
    // Setup mocks
    mockUserService.getUserById.mockResolvedValue(mockUser);
    mockUserService.getUserFavorites.mockResolvedValue({ data: mockFavoriteSongs, total: 2, page: 1, limit: 10 });

    render(<UserProfile />);

    // Wait for the favorite songs to load
    await waitFor(() => {
      expect(mockUserService.getUserFavorites).toHaveBeenCalledWith('1', { limit: 10 });
    });

    // Check if song titles are displayed
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    expect(screen.getByText('Test Artist 1')).toBeInTheDocument();
    expect(screen.getByText('Test Artist 2')).toBeInTheDocument();
  });

  it('shows follow button for other users', async () => {
    // Setup mocks
    mockUserService.getUserById.mockResolvedValue(mockUser);
    mockUserService.getUserFavorites.mockResolvedValue({ data: mockFavoriteSongs, total: 2, page: 1, limit: 10 });

    render(<UserProfile />);

    // Wait for the user data to load
    await waitFor(() => {
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });

    // Check for follow button
    const followButton = screen.getByRole('button', { name: 'Follow' });
    expect(followButton).toBeInTheDocument();
  });

  it('does not show follow button for current user', async () => {
    // Setup mocks
    mockUserService.getUserById.mockResolvedValue(mockCurrentUser);
    mockUserService.getUserFavorites.mockResolvedValue({ data: mockFavoriteSongs, total: 2, page: 1, limit: 10 });

    render(<UserProfile />);

    // Wait for the user data to load
    await waitFor(() => {
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });

    // Check for edit profile button instead of follow button
    const editButton = screen.getByRole('button', { name: 'Edit Profile' });
    expect(editButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
  });

  it('handles follow button click', async () => {
    // Setup mocks
    mockUserService.getUserById.mockResolvedValue(mockUser);
    mockUserService.getUserFavorites.mockResolvedValue({ data: mockFavoriteSongs, total: 2, page: 1, limit: 10 });
    mockUserService.toggleFollow.mockResolvedValue({ ...mockUser, isFollowing: true });

    render(<UserProfile />);

    // Wait for the user data to load
    await waitFor(() => {
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });

    // Click follow button
    const followButton = screen.getByRole('button', { name: 'Follow' });
    userEvent.click(followButton);

    // Check if toggleFollow was called
    await waitFor(() => {
      expect(mockUserService.toggleFollow).toHaveBeenCalledWith('1');
    });
  });

  it('shows error message when user profile fails to load', async () => {
    // Setup mocks to simulate error
    mockUserService.getUserById.mockRejectedValue(new Error('Failed to load user'));

    render(<UserProfile />);

    // Split assertions to avoid multiple assertions in one waitFor
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Unable to load user profile/i)).toBeInTheDocument();
  });

  it('navigates to edit profile page when edit button is clicked', async () => {
    // Setup mocks
    mockUserService.getUserById.mockResolvedValue(mockCurrentUser);
    mockUserService.getUserFavorites.mockResolvedValue({ data: mockFavoriteSongs, total: 2, page: 1, limit: 10 });

    render(<UserProfile />);

    // Wait for the user data to load
    await waitFor(() => {
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });

    // Click edit profile button
    const editButton = screen.getByRole('button', { name: 'Edit Profile' });
    userEvent.click(editButton);

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/profile/edit');
  });
}); 