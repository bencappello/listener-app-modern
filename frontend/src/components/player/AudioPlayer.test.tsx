import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import AudioPlayer from './AudioPlayer';
import * as PlayerContextModule from '../../contexts/PlayerContext';
import { Comment, Song, User } from '../../types/entities';

// Mock subcomponents to simplify testing
jest.mock('./MiniPlayer', () => {
  return function MockMiniPlayer({ onToggle }: { onToggle?: () => void }) {
    return (
      <div data-testid="mini-player">
        <button onClick={onToggle} data-testid="mini-player-toggle">
          Toggle
        </button>
      </div>
    );
  };
});

jest.mock('./PlayerControls', () => {
  return function MockPlayerControls() {
    return <div data-testid="player-controls">Player Controls</div>;
  };
});

jest.mock('./QueueDisplay', () => {
  return function MockQueueDisplay() {
    return <div data-testid="queue-display">Queue Display</div>;
  };
});

jest.mock('../comment/CommentList', () => {
  return function MockCommentList({ comments, isLoading }: { comments: Comment[], isLoading: boolean }) {
    return (
      <div data-testid="comment-list">
        {isLoading ? 'Loading...' : `Comments (${comments.length})`}
      </div>
    );
  };
});

jest.mock('../comment/CommentForm', () => {
  return function MockCommentForm({ onSubmit, currentUser }: { onSubmit: (text: string) => Promise<void>, currentUser: User | null }) {
    return (
      <div data-testid="comment-form">
        <button 
          onClick={() => onSubmit('Test comment')}
          data-testid="comment-submit"
          disabled={!currentUser}
        >
          Submit
        </button>
      </div>
    );
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

describe('AudioPlayer Component', () => {
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

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    createdAt: '2023-01-01',
  };

  const mockComments: Comment[] = [
    {
      id: 1,
      userId: 1,
      songId: 1,
      text: 'This is a test comment',
      createdAt: '2023-01-02',
      user: mockUser,
    },
  ];

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

  it('renders MiniPlayer when a song is playing', () => {
    render(
      <ChakraProvider>
        <AudioPlayer currentUser={mockUser} />
      </ChakraProvider>
    );
    
    expect(screen.getByTestId('mini-player')).toBeInTheDocument();
  });

  it('does not render when no song is playing', () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      currentSong: null,
    });

    render(
      <ChakraProvider>
        <AudioPlayer currentUser={mockUser} />
      </ChakraProvider>
    );
    
    expect(screen.queryByTestId('mini-player')).not.toBeInTheDocument();
  });

  it('opens the drawer when MiniPlayer toggle is clicked', () => {
    render(
      <ChakraProvider>
        <AudioPlayer currentUser={mockUser} />
      </ChakraProvider>
    );
    
    // Click the toggle button
    fireEvent.click(screen.getByTestId('mini-player-toggle'));
    
    // Drawer should open showing player controls
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('player-controls')).toBeInTheDocument();
  });

  it('shows comments in the comment tab', () => {
    render(
      <ChakraProvider>
        <AudioPlayer 
          currentUser={mockUser} 
          comments={mockComments}
          commentsLoading={false}
        />
      </ChakraProvider>
    );
    
    // Open the drawer
    fireEvent.click(screen.getByTestId('mini-player-toggle'));
    
    // Go to comments tab
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]); // Third tab is comments
    
    // Should show comment list and form
    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    expect(screen.getByText('Comments (1)')).toBeInTheDocument();
  });

  it('shows loading state for comments when commentsLoading is true', () => {
    render(
      <ChakraProvider>
        <AudioPlayer 
          currentUser={mockUser} 
          comments={[]}
          commentsLoading={true}
        />
      </ChakraProvider>
    );
    
    // Open the drawer
    fireEvent.click(screen.getByTestId('mini-player-toggle'));
    
    // Go to comments tab
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]); // Third tab is comments
    
    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('calls onAddComment when comment form is submitted', async () => {
    const mockAddComment = jest.fn().mockResolvedValue(undefined);
    
    render(
      <ChakraProvider>
        <AudioPlayer 
          currentUser={mockUser} 
          onAddComment={mockAddComment}
          comments={mockComments}
        />
      </ChakraProvider>
    );
    
    // Open the drawer
    fireEvent.click(screen.getByTestId('mini-player-toggle'));
    
    // Go to comments tab
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]); // Third tab is comments
    
    // Submit a comment
    fireEvent.click(screen.getByTestId('comment-submit'));
    
    // Should call onAddComment with the song ID and comment text
    expect(mockAddComment).toHaveBeenCalledWith('1', 'Test comment');
  });

  it('disables comment form when user is not logged in', () => {
    render(
      <ChakraProvider>
        <AudioPlayer 
          currentUser={null} 
          onAddComment={jest.fn()}
          comments={mockComments}
        />
      </ChakraProvider>
    );
    
    // Open the drawer
    fireEvent.click(screen.getByTestId('mini-player-toggle'));
    
    // Go to comments tab
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]); // Third tab is comments
    
    // Comment submit button should be disabled
    expect(screen.getByTestId('comment-submit')).toBeDisabled();
  });
}); 