import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Song } from '../../types/entities';
import { render } from '../../test-utils/testing-library-utils';
import SongCard from './SongCard';

// Mock song data
const mockSong: Song = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  blogId: '1',
  blogName: 'Test Blog',
  audioUrl: 'https://example.com/test.mp3',
  imageUrl: 'https://example.com/test.jpg',
  postUrl: 'https://example.com/post',
  postDate: '2023-01-01',
  isFavorite: false,
};

// Mock song data with favorite
const mockFavoriteSong: Song = {
  ...mockSong,
  isFavorite: true,
};

// Mock functions
const mockToggleFavorite = jest.fn();
const mockPlaySong = jest.fn();

describe('SongCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders song information correctly', () => {
    render(
      <SongCard
        song={mockSong}
        onToggleFavorite={mockToggleFavorite}
        onPlay={mockPlaySong}
      />
    );

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Test Blog')).toBeInTheDocument();
    expect(screen.getByAltText('Test Song')).toHaveAttribute('src', 'https://example.com/test.jpg');
  });

  it('displays favorite icon appropriately', () => {
    const { rerender } = render(
      <SongCard
        song={mockSong}
        onToggleFavorite={mockToggleFavorite}
        onPlay={mockPlaySong}
      />
    );

    // Initially not favorited
    const favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toBeInTheDocument();

    // Rerender with favorited song
    rerender(
      <SongCard
        song={mockFavoriteSong}
        onToggleFavorite={mockToggleFavorite}
        onPlay={mockPlaySong}
      />
    );

    // Now should show as favorited
    const unfavoriteButton = screen.getByLabelText('Remove from favorites');
    expect(unfavoriteButton).toBeInTheDocument();
  });

  it('calls onToggleFavorite when favorite button is clicked', async () => {
    render(
      <SongCard
        song={mockSong}
        onToggleFavorite={mockToggleFavorite}
        onPlay={mockPlaySong}
      />
    );

    const favoriteButton = screen.getByLabelText('Add to favorites');
    await userEvent.click(favoriteButton);

    expect(mockToggleFavorite).toHaveBeenCalledWith(mockSong.id);
  });

  it('calls onPlay when play button is clicked', async () => {
    render(
      <SongCard
        song={mockSong}
        onToggleFavorite={mockToggleFavorite}
        onPlay={mockPlaySong}
      />
    );

    const playButton = screen.getByLabelText('Play song');
    await userEvent.click(playButton);

    expect(mockPlaySong).toHaveBeenCalledWith(mockSong);
  });

  it('displays a placeholder image when imageUrl is not available', () => {
    const songWithoutImage = { ...mockSong, imageUrl: '' };
    
    render(
      <SongCard
        song={songWithoutImage}
        onToggleFavorite={mockToggleFavorite}
        onPlay={mockPlaySong}
      />
    );

    const placeholderImage = screen.getByAltText('Test Song');
    expect(placeholderImage).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });

  it('renders a link to the blog post', () => {
    render(
      <SongCard
        song={mockSong}
        onToggleFavorite={mockToggleFavorite}
        onPlay={mockPlaySong}
      />
    );

    const blogLink = screen.getByText('Test Blog');
    expect(blogLink).toHaveAttribute('href', 'https://example.com/post');
  });
}); 