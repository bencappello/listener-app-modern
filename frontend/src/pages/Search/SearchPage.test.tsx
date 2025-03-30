import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import SearchPage from './SearchPage';
import * as songService from '../../services/song.service';
import { MemoryRouter } from 'react-router-dom';

// Mock song service
jest.mock('../../services/song.service');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: '' }),
}));

describe('SearchPage Component', () => {
  const mockSongs = [
    {
      id: '1',
      title: 'Test Song 1',
      artist: 'Test Artist 1',
      blogId: '1',
      blogName: 'Test Blog',
      audioUrl: 'https://example.com/song1.mp3',
      imageUrl: 'https://example.com/image1.jpg',
      postUrl: 'https://example.com/post1',
      postDate: '2023-01-01',
      isFavorite: false,
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
      isFavorite: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    (songService.searchSongs as jest.Mock).mockResolvedValue({
      data: [],
      total: 0,
    });
  });

  it('renders search bar correctly', () => {
    render(<SearchPage />);
    
    expect(screen.getByPlaceholderText('Search for songs...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('shows initial empty state', () => {
    render(<SearchPage />);
    
    expect(screen.getByText('Search for songs to listen to')).toBeInTheDocument();
  });

  it('displays loading state while searching', async () => {
    // Delay the resolution of the search promise
    (songService.searchSongs as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: [], total: 0 }), 100))
    );
    
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search for songs...');
    await userEvent.type(searchInput, 'test{enter}');
    
    expect(screen.getByTestId('song-list-loading')).toBeInTheDocument();
  });

  it('displays search results when found', async () => {
    (songService.searchSongs as jest.Mock).mockResolvedValue({
      data: mockSongs,
      total: mockSongs.length,
    });
    
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search for songs...');
    await userEvent.type(searchInput, 'test{enter}');
    
    // Find both song titles
    await screen.findByText('Test Song 1');
    await screen.findByText('Test Song 2');
    
    expect(songService.searchSongs).toHaveBeenCalledTimes(1);
  });

  it('displays empty state when no results found', async () => {
    (songService.searchSongs as jest.Mock).mockResolvedValue({
      data: [],
      total: 0,
    });
    
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search for songs...');
    await userEvent.type(searchInput, 'nonexistent{enter}');
    
    await screen.findByText('No songs found');
    
    expect(songService.searchSongs).toHaveBeenCalledTimes(1);
  });

  it('displays error message when search fails', async () => {
    (songService.searchSongs as jest.Mock).mockRejectedValue(new Error('Search failed'));
    
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search for songs...');
    await userEvent.type(searchInput, 'test{enter}');
    
    await screen.findByText('Error searching for songs. Please try again.');
  });

  it('navigates to search results page with query parameter', async () => {
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search for songs...');
    await userEvent.type(searchInput, 'test query{enter}');
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20query', { replace: true });
    });
  });
}); 