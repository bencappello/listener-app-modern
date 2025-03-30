import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import SearchPage from './SearchPage';
import * as songService from '../../services/song.service';

// Mock song service
jest.mock('../../services/song.service');

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
    
    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
      expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    });
    
    expect(songService.searchSongs).toHaveBeenCalledWith('test', expect.any(Object));
  });

  it('displays empty state when no results found', async () => {
    (songService.searchSongs as jest.Mock).mockResolvedValue({
      data: [],
      total: 0,
    });
    
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search for songs...');
    await userEvent.type(searchInput, 'nonexistent{enter}');
    
    await waitFor(() => {
      expect(screen.getByText('No songs found')).toBeInTheDocument();
    });
    
    expect(songService.searchSongs).toHaveBeenCalledWith('nonexistent', expect.any(Object));
  });

  it('displays error message when search fails', async () => {
    (songService.searchSongs as jest.Mock).mockRejectedValue(new Error('Search failed'));
    
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search for songs...');
    await userEvent.type(searchInput, 'test{enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Error searching for songs')).toBeInTheDocument();
    });
  });

  it('updates URL with search query parameter', async () => {
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search for songs...');
    await userEvent.type(searchInput, 'test query{enter}');
    
    await waitFor(() => {
      expect(window.location.search).toContain('q=test%20query');
    });
  });
}); 