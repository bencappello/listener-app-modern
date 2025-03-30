import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import SongItem from './SongItem';
import * as PlayerContextModule from '../../contexts/PlayerContext';
import { Song } from '../../types/entities';

// Mock the usePlayer hook
jest.mock('../../contexts/PlayerContext', () => {
  const originalModule = jest.requireActual('../../contexts/PlayerContext');
  return {
    ...originalModule,
    usePlayer: jest.fn(),
  };
});

const mockUsePlayer = PlayerContextModule.usePlayer as jest.MockedFunction<typeof PlayerContextModule.usePlayer>;

describe('SongItem Component', () => {
  const mockSong: Song = {
    id: '1',
    title: 'Test Song Title',
    artist: 'Test Artist',
    blogId: 1,
    blogName: 'Test Blog',
    audioUrl: 'https://example.com/test.mp3',
    imageUrl: 'https://example.com/test.jpg',
    postUrl: 'https://example.com/post',
    postDate: '2023-01-01',
  };

  beforeEach(() => {
    // Set up default mock implementation
    mockUsePlayer.mockReturnValue({
      currentSong: null,
      queue: [],
      isPlaying: false,
      volume: 0.5,
      isMuted: false,
      duration: 180,
      seek: 30,
      isLoading: false,
      error: null,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlay: jest.fn(),
      stop: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      clearQueue: jest.fn(),
      setVolume: jest.fn(),
      mute: jest.fn(),
      unmute: jest.fn(),
      seekTo: jest.fn(),
    });
  });

  it('renders song information correctly', () => {
    render(
      <ChakraProvider>
        <SongItem song={mockSong} />
      </ChakraProvider>
    );
    
    // Check for song information
    expect(screen.getByText('Test Song Title')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('From: Test Blog')).toBeInTheDocument();
    
    // Check for album cover
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/test.jpg');
  });

  it('does not render blog name when showBlog is false', () => {
    render(
      <ChakraProvider>
        <SongItem song={mockSong} showBlog={false} />
      </ChakraProvider>
    );
    
    expect(screen.queryByText('From: Test Blog')).not.toBeInTheDocument();
  });

  it('does not render image when showImage is false', () => {
    render(
      <ChakraProvider>
        <SongItem song={mockSong} showImage={false} />
      </ChakraProvider>
    );
    
    const image = screen.queryByRole('img');
    expect(image).not.toBeInTheDocument();
  });

  it('calls play when play button is clicked', () => {
    const play = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      play,
    });

    render(
      <ChakraProvider>
        <SongItem song={mockSong} />
      </ChakraProvider>
    );
    
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);
    
    expect(play).toHaveBeenCalledWith(mockSong);
  });

  it('displays a Playing badge when song is current and playing', () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      currentSong: mockSong,
      isPlaying: true,
    });

    render(
      <ChakraProvider>
        <SongItem song={mockSong} />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Playing')).toBeInTheDocument();
  });

  it('displays a Paused badge when song is current but not playing', () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      currentSong: mockSong,
      isPlaying: false,
    });

    render(
      <ChakraProvider>
        <SongItem song={mockSong} />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('calls addToQueue when queue button is clicked', () => {
    const addToQueue = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      addToQueue,
    });

    render(
      <ChakraProvider>
        <SongItem song={mockSong} />
      </ChakraProvider>
    );
    
    const queueButton = screen.getByTestId('queue-button');
    fireEvent.click(queueButton);
    
    expect(addToQueue).toHaveBeenCalledWith(mockSong);
  });

  it('renders favorite button when onAddToFavorites is provided', () => {
    const onAddToFavorites = jest.fn();
    
    render(
      <ChakraProvider>
        <SongItem 
          song={mockSong} 
          onAddToFavorites={onAddToFavorites}
        />
      </ChakraProvider>
    );
    
    const favoriteButton = screen.getByTestId('favorite-button');
    expect(favoriteButton).toBeInTheDocument();
  });

  it('calls onAddToFavorites when favorite button is clicked and song is not favorited', () => {
    const onAddToFavorites = jest.fn();
    const nonFavoriteSong = { ...mockSong, isFavorite: false };
    
    render(
      <ChakraProvider>
        <SongItem 
          song={nonFavoriteSong} 
          onAddToFavorites={onAddToFavorites}
        />
      </ChakraProvider>
    );
    
    const favoriteButton = screen.getByTestId('favorite-button');
    fireEvent.click(favoriteButton);
    
    expect(onAddToFavorites).toHaveBeenCalledWith(mockSong.id);
  });

  it('calls onRemoveFromFavorites when favorite button is clicked and song is favorited', () => {
    const onRemoveFromFavorites = jest.fn();
    const favoriteSong = { ...mockSong, isFavorite: true };
    
    render(
      <ChakraProvider>
        <SongItem 
          song={favoriteSong} 
          onRemoveFromFavorites={onRemoveFromFavorites}
        />
      </ChakraProvider>
    );
    
    const favoriteButton = screen.getByTestId('favorite-button');
    fireEvent.click(favoriteButton);
    
    expect(onRemoveFromFavorites).toHaveBeenCalledWith(mockSong.id);
  });
}); 