import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SongDetail from './SongDetail';
import * as songService from '../../services/song.service';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
  useNavigate: () => jest.fn(),
}));

// Mock the song service
jest.mock('../../services/song.service');

describe('SongDetail', () => {
  const mockSong = {
    id: '123',
    title: 'Test Song',
    artist: 'Test Artist',
    blogId: '456',
    blogName: 'Test Blog',
    audioUrl: 'https://example.com/song.mp3',
    imageUrl: 'https://example.com/image.jpg',
    postUrl: 'https://example.com/post',
    postDate: '2023-01-01',
    isFavorite: false,
    tags: ['indie', 'rock'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays song details when loaded', async () => {
    // Mock song service response
    (songService.getSongById as jest.Mock).mockResolvedValue(mockSong);

    render(
      <MemoryRouter initialEntries={['/songs/123']}>
        <Routes>
          <Route path="/songs/:id" element={<SongDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // First the loading state should be shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Then the song details should load
    await waitFor(() => {
      expect(screen.getByTestId('song-title')).toHaveTextContent('Test Song');
      expect(screen.getByTestId('song-artist')).toHaveTextContent('Test Artist');
    });

    // Service should have been called
    expect(songService.getSongById).toHaveBeenCalledWith('123');
  });

  it('toggles favorite status when favorite button is clicked', async () => {
    // Mock song service responses
    (songService.getSongById as jest.Mock).mockResolvedValue(mockSong);
    (songService.toggleFavorite as jest.Mock).mockResolvedValue({
      ...mockSong,
      isFavorite: true,
    });

    render(
      <MemoryRouter initialEntries={['/songs/123']}>
        <Routes>
          <Route path="/songs/:id" element={<SongDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for song to load
    await waitFor(() => {
      expect(screen.getByTestId('song-title')).toBeInTheDocument();
    });

    // Click favorite button
    userEvent.click(screen.getByTestId('favorite-button'));

    // Check if toggleFavorite was called
    await waitFor(() => {
      expect(songService.toggleFavorite).toHaveBeenCalledWith('123');
    });
  });

  it('shows error message when song cannot be loaded', async () => {
    // Mock failed song service response
    (songService.getSongById as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/songs/123']}>
        <Routes>
          <Route path="/songs/:id" element={<SongDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // First loading state should be shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Then error message should be shown
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to load song details');
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
  });

  it('logs play event when play button is clicked', async () => {
    // Mock song service responses
    (songService.getSongById as jest.Mock).mockResolvedValue(mockSong);
    (songService.logSongPlay as jest.Mock).mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={['/songs/123']}>
        <Routes>
          <Route path="/songs/:id" element={<SongDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for song to load
    await waitFor(() => {
      expect(screen.getByTestId('song-title')).toBeInTheDocument();
    });

    // Click play button
    userEvent.click(screen.getByTestId('play-button'));

    // Check if logSongPlay was called
    await waitFor(() => {
      expect(songService.logSongPlay).toHaveBeenCalledWith('123');
    });
  });
}); 