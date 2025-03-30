import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import { UserFeed } from './UserFeed';
import * as songService from '../../services/song.service';
import * as userService from '../../services/user.service';
import { Song } from '../../types/entities';

// Mock services
jest.mock('../../services/song.service');
jest.mock('../../services/user.service');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const mockSongService = songService as jest.Mocked<typeof songService>;
const mockUserService = userService as jest.Mocked<typeof userService>;

// Mock data
const mockSongs: Song[] = [
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
    isFavorite: false
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

describe('UserFeed Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock returns
    mockUserService.getCurrentUser.mockResolvedValue({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      profileImage: 'https://example.com/avatar.jpg',
      bio: 'Test bio',
      createdAt: '2023-01-01',
      isCurrentUser: true
    });
    mockSongService.getSongs.mockResolvedValue({
      data: mockSongs,
      total: mockSongs.length,
      page: 1,
      limit: 10
    });
  });

  it('renders the user feed page with heading', async () => {
    render(<UserFeed />);
    
    // Check for the heading
    expect(screen.getByText('Your Music Feed')).toBeInTheDocument();
  });

  it('displays loading state while fetching feed songs', async () => {
    render(<UserFeed />);
    
    // Check for loading spinner/state
    expect(screen.getByTestId('song-list-loading')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(mockSongService.getSongs).toHaveBeenCalledWith(expect.objectContaining({ feed: true }));
    });
  });

  it('displays feed songs after loading', async () => {
    render(<UserFeed />);
    
    // Wait for the feed songs to load
    await waitFor(() => {
      expect(mockSongService.getSongs).toHaveBeenCalledWith(expect.objectContaining({ feed: true }));
    });
    
    // Check if song titles are displayed
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    expect(screen.getByText('Test Artist 1')).toBeInTheDocument();
    expect(screen.getByText('Test Artist 2')).toBeInTheDocument();
  });

  it('handles empty feed state', async () => {
    // Mock empty feed
    mockSongService.getSongs.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10
    });
    
    render(<UserFeed />);
    
    // Wait for the feed songs to load
    await waitFor(() => {
      expect(mockSongService.getSongs).toHaveBeenCalledWith(expect.objectContaining({ feed: true }));
    });
    
    // Check for empty state message
    expect(screen.getByText('No songs in your feed')).toBeInTheDocument();
  });

  it('handles error state when fetching feed fails', async () => {
    // Mock error
    mockSongService.getSongs.mockRejectedValue(new Error('Failed to fetch feed'));
    
    render(<UserFeed />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Error loading your feed/i)).toBeInTheDocument();
    });
  });

  it('calls toggleFavorite when favorite button is clicked', async () => {
    mockSongService.toggleFavorite.mockResolvedValue({ ...mockSongs[0], isFavorite: true });
    
    render(<UserFeed />);
    
    // Wait for the feed songs to load
    await waitFor(() => {
      expect(mockSongService.getSongs).toHaveBeenCalledWith(expect.objectContaining({ feed: true }));
    });
    
    // Find the favorite button for the first song and click it
    const favoriteButtons = screen.getAllByLabelText(/Add to favorites|Remove from favorites/);
    userEvent.click(favoriteButtons[0]);
    
    // Verify toggleFavorite was called
    await waitFor(() => {
      expect(mockSongService.toggleFavorite).toHaveBeenCalledWith('1');
    });
  });

  it('supports pagination for feed songs', async () => {
    // Mock pagination support
    mockSongService.getSongs.mockResolvedValue({
      data: mockSongs,
      total: 20, // Total more than items per page
      page: 1,
      limit: 10
    });
    
    render(<UserFeed />);
    
    // Wait for the feed songs to load
    await waitFor(() => {
      expect(mockSongService.getSongs).toHaveBeenCalledWith(expect.objectContaining({ 
        page: 1, 
        limit: 10,
        feed: true
      }));
    });
    
    // Check if pagination is displayed
    // Note: This test assumes your Pagination component has page navigation buttons with accessible roles
    const nextPageButton = screen.getByLabelText('Go to next page');
    expect(nextPageButton).toBeInTheDocument();
    
    // Click next page
    userEvent.click(nextPageButton);
    
    // Verify getSongs was called with updated page
    await waitFor(() => {
      expect(mockSongService.getSongs).toHaveBeenCalledWith(expect.objectContaining({ 
        page: 2, 
        limit: 10,
        feed: true
      }));
    });
  });
}); 