import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import QueueDisplay from './QueueDisplay';
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

describe('QueueDisplay', () => {
  const mockCurrentSong: Song = {
    id: '1',
    title: 'Current Song',
    artist: 'Current Artist',
    blogId: 1,
    blogName: 'Test Blog',
    audioUrl: 'https://example.com/current.mp3',
    imageUrl: 'https://example.com/current.jpg',
    postUrl: 'https://example.com/post1',
    postDate: '2023-01-01',
  };

  const mockQueue: Song[] = [
    {
      id: '2',
      title: 'Queued Song 1',
      artist: 'Queued Artist 1',
      blogId: 2,
      blogName: 'Test Blog 2',
      audioUrl: 'https://example.com/test2.mp3',
      imageUrl: 'https://example.com/test2.jpg',
      postUrl: 'https://example.com/post2',
      postDate: '2023-01-02',
    },
    {
      id: '3',
      title: 'Queued Song 2',
      artist: 'Queued Artist 2',
      blogId: 3,
      blogName: 'Test Blog 3',
      audioUrl: 'https://example.com/test3.mp3',
      imageUrl: 'https://example.com/test3.jpg',
      postUrl: 'https://example.com/post3',
      postDate: '2023-01-03',
    },
  ];

  beforeEach(() => {
    // Set up default mock implementation
    const play = jest.fn();
    const removeFromQueue = jest.fn();
    const clearQueue = jest.fn();

    mockUsePlayer.mockReturnValue({
      currentSong: mockCurrentSong,
      queue: mockQueue,
      isPlaying: false,
      volume: 0.5,
      isMuted: false,
      duration: 180,
      seek: 30,
      isLoading: false,
      error: null,
      play,
      pause: jest.fn(),
      togglePlay: jest.fn(),
      stop: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue,
      clearQueue,
      setVolume: jest.fn(),
      mute: jest.fn(),
      unmute: jest.fn(),
      seekTo: jest.fn(),
    });
  });

  it('renders current song and queue', () => {
    render(
      <ChakraProvider>
        <QueueDisplay />
      </ChakraProvider>
    );
    
    // Check if current song is displayed
    expect(screen.getByText('Now Playing')).toBeInTheDocument();
    expect(screen.getByText('Current Song')).toBeInTheDocument();
    expect(screen.getByText('Current Artist')).toBeInTheDocument();
    
    // Check if queued songs are displayed
    expect(screen.getByText('Next in Queue')).toBeInTheDocument();
    expect(screen.getByText('Queued Song 1')).toBeInTheDocument();
    expect(screen.getByText('Queued Artist 1')).toBeInTheDocument();
    expect(screen.getByText('Queued Song 2')).toBeInTheDocument();
    expect(screen.getByText('Queued Artist 2')).toBeInTheDocument();
  });

  it('shows empty queue message when queue is empty', () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      queue: [],
    });

    render(
      <ChakraProvider>
        <QueueDisplay />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Queue is empty')).toBeInTheDocument();
  });

  it('calls play with song when a queued song is clicked', () => {
    const play = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      play,
    });

    render(
      <ChakraProvider>
        <QueueDisplay />
      </ChakraProvider>
    );
    
    // Find and click the first queued song using getByRole and data-testid
    const songItems = screen.getAllByTestId('queue-song-item');
    fireEvent.click(songItems[0]);
    
    // Check if play was called with the correct song
    expect(play).toHaveBeenCalledWith(mockQueue[0]);
  });

  it('calls removeFromQueue when remove button for a song is clicked', () => {
    const removeFromQueue = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      removeFromQueue,
    });

    render(
      <ChakraProvider>
        <QueueDisplay />
      </ChakraProvider>
    );
    
    // Find and click the remove button for the first queued song
    const removeButtons = screen.getAllByLabelText('Remove from queue');
    fireEvent.click(removeButtons[0]);
    
    // Check if removeFromQueue was called with the correct song ID
    expect(removeFromQueue).toHaveBeenCalledWith('2');
  });

  it('calls clearQueue when clear queue button is clicked', () => {
    const clearQueue = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      clearQueue,
    });

    render(
      <ChakraProvider>
        <QueueDisplay />
      </ChakraProvider>
    );
    
    // Find and click the clear queue button
    const clearButton = screen.getByText('Clear Queue');
    fireEvent.click(clearButton);
    
    // Check if clearQueue was called
    expect(clearQueue).toHaveBeenCalledTimes(1);
  });

  it('handles onClose callback when close button is clicked', () => {
    const onClose = jest.fn();

    render(
      <ChakraProvider>
        <QueueDisplay onClose={onClose} />
      </ChakraProvider>
    );
    
    // Find and click the close button
    const closeButton = screen.getByLabelText('Close queue');
    fireEvent.click(closeButton);
    
    // Check if onClose was called
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies maxHeight when provided', () => {
    render(
      <ChakraProvider>
        <QueueDisplay maxHeight="300px" />
      </ChakraProvider>
    );
    
    // Get the main container
    const container = screen.getByTestId('queue-display');
    
    // Check if the style has been applied
    expect(container).toHaveStyle('max-height: 300px');
  });
}); 