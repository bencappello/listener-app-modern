import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import SongList from './SongList';
import { Song } from '../../types/entities';

// Mock song data
const mockSongs: Song[] = [
  {
    id: '1',
    title: 'First Test Song',
    artist: 'Artist One',
    blogId: '1',
    blogName: 'Test Blog 1',
    audioUrl: 'https://example.com/song1.mp3',
    imageUrl: 'https://example.com/image1.jpg',
    postUrl: 'https://example.com/post1',
    postDate: '2023-01-01',
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Second Test Song',
    artist: 'Artist Two',
    blogId: '2',
    blogName: 'Test Blog 2',
    audioUrl: 'https://example.com/song2.mp3',
    imageUrl: 'https://example.com/image2.jpg',
    postUrl: 'https://example.com/post2',
    postDate: '2023-01-02',
    isFavorite: true,
  },
  {
    id: '3',
    title: 'Third Test Song',
    artist: 'Artist Three',
    blogId: '1',
    blogName: 'Test Blog 1',
    audioUrl: 'https://example.com/song3.mp3',
    imageUrl: '', // Test missing image
    postUrl: 'https://example.com/post3',
    postDate: '2023-01-03',
    isFavorite: false,
  },
];

// Mock functions
const mockToggleFavorite = jest.fn();
const mockPlaySong = jest.fn();

describe('SongList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a list of songs', () => {
    render(
      <SongList
        songs={mockSongs}
        onToggleFavorite={mockToggleFavorite}
        onPlaySong={mockPlaySong}
        isLoading={false}
      />
    );

    // Should render all songs
    expect(screen.getByText('First Test Song')).toBeInTheDocument();
    expect(screen.getByText('Second Test Song')).toBeInTheDocument();
    expect(screen.getByText('Third Test Song')).toBeInTheDocument();
    
    // Check for artists
    expect(screen.getByText('Artist One')).toBeInTheDocument();
    expect(screen.getByText('Artist Two')).toBeInTheDocument();
    expect(screen.getByText('Artist Three')).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    render(
      <SongList
        songs={[]}
        onToggleFavorite={mockToggleFavorite}
        onPlaySong={mockPlaySong}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('song-list-loading')).toBeInTheDocument();
    expect(screen.queryByText('No songs found')).not.toBeInTheDocument();
  });

  it('displays empty state when no songs are available', () => {
    render(
      <SongList
        songs={[]}
        onToggleFavorite={mockToggleFavorite}
        onPlaySong={mockPlaySong}
        isLoading={false}
      />
    );

    expect(screen.getByText('No songs found')).toBeInTheDocument();
    expect(screen.queryByTestId('song-list-loading')).not.toBeInTheDocument();
  });

  it('calls onToggleFavorite when a song favorite button is clicked', async () => {
    render(
      <SongList
        songs={mockSongs}
        onToggleFavorite={mockToggleFavorite}
        onPlaySong={mockPlaySong}
        isLoading={false}
      />
    );

    // Find first song's favorite button and click it
    const favoriteButtons = screen.getAllByLabelText('Add to favorites');
    await userEvent.click(favoriteButtons[0]);

    // Should call the handler with the correct song ID
    expect(mockToggleFavorite).toHaveBeenCalledWith('1');
  });

  it('calls onPlaySong when a song play button is clicked', async () => {
    render(
      <SongList
        songs={mockSongs}
        onToggleFavorite={mockToggleFavorite}
        onPlaySong={mockPlaySong}
        isLoading={false}
      />
    );

    // Find first song's play button and click it
    const playButtons = screen.getAllByLabelText('Play song');
    await userEvent.click(playButtons[0]);

    // Should call the handler with the correct song
    expect(mockPlaySong).toHaveBeenCalledWith(mockSongs[0]);
  });
}); 