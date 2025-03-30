import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import MiniPlayer from './MiniPlayer';
import * as PlayerContextModule from '../../contexts/PlayerContext';
import { Song } from '../../types/entities';

// Mock the PlayerControls component
jest.mock('./PlayerControls', () => {
  return function MockPlayerControls() {
    return <div data-testid="player-controls">Player Controls</div>;
  };
});

// Mock the usePlayer hook
jest.mock('../../contexts/PlayerContext', () => {
  const originalModule = jest.requireActual('../../contexts/PlayerContext');
  return {
    ...originalModule,
    usePlayer: jest.fn(),
  };
});

const mockUsePlayer = PlayerContextModule.usePlayer as jest.MockedFunction<typeof PlayerContextModule.usePlayer>;

describe('MiniPlayer', () => {
  const mockSong: Song = {
    id: '1',
    title: 'Test Song',
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
      currentSong: mockSong,
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

  it('renders the MiniPlayer with song information', () => {
    render(
      <ChakraProvider>
        <MiniPlayer />
      </ChakraProvider>
    );
    
    // Check for song information
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Test Blog')).toBeInTheDocument();
    
    // Check for the album image
    const image = screen.getByAltText('Test Song cover');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/test.jpg');
    
    // Check for player controls
    expect(screen.getByTestId('player-controls')).toBeInTheDocument();
  });

  it('does not render when there is no current song', () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      currentSong: null,
    });

    render(
      <ChakraProvider>
        <MiniPlayer />
      </ChakraProvider>
    );
    
    // The mini player should not be visible
    expect(screen.queryByTestId('mini-player')).not.toBeInTheDocument();
  });

  it('displays queue information when there are songs in the queue', () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      queue: [
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
      ],
    });

    render(
      <ChakraProvider>
        <MiniPlayer />
      </ChakraProvider>
    );
    
    // Check for queue information
    expect(screen.getByText('2 in queue')).toBeInTheDocument();
  });

  it('toggles the expanded state when toggle button is clicked', () => {
    render(
      <ChakraProvider>
        <MiniPlayer />
      </ChakraProvider>
    );
    
    // Find the toggle button
    const toggleButton = screen.getByLabelText('Expand player');
    expect(toggleButton).toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(toggleButton);
    
    // The button should now be for collapsing
    expect(screen.getByLabelText('Collapse player')).toBeInTheDocument();
    
    // The expanded content should be visible
    expect(screen.getByTestId('expanded-player-content')).toBeInTheDocument();
  });

  it('accepts and uses the isVisible prop', () => {
    // Render with isVisible=false
    render(
      <ChakraProvider>
        <MiniPlayer isVisible={false} />
      </ChakraProvider>
    );
    
    // The mini player should not be visible even though there's a current song
    expect(screen.queryByTestId('mini-player')).not.toBeInTheDocument();
    
    // Render with isVisible=true
    render(
      <ChakraProvider>
        <MiniPlayer isVisible={true} />
      </ChakraProvider>
    );
    
    // The mini player should be visible
    expect(screen.getByTestId('mini-player')).toBeInTheDocument();
  });

  it('handles the onToggleVisibility callback', () => {
    const mockToggleVisibility = jest.fn();
    
    render(
      <ChakraProvider>
        <MiniPlayer onToggleVisibility={mockToggleVisibility} />
      </ChakraProvider>
    );
    
    // Find the close button
    const closeButton = screen.getByLabelText('Close player');
    expect(closeButton).toBeInTheDocument();
    
    // Click to close
    fireEvent.click(closeButton);
    
    // The callback should be called
    expect(mockToggleVisibility).toHaveBeenCalledTimes(1);
  });
}); 