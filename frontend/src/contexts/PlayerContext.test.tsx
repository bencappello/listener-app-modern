import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { PlayerProvider, usePlayer } from './PlayerContext';
import { Song } from '../types/entities';

// Mock Howler
jest.mock('howler', () => {
  const originalModule = jest.requireActual('howler');
  
  // Mock Howl class
  class MockHowl {
    _src: string[];
    _volume: number;
    _onload: () => void;
    _onplay: () => void;
    _onpause: () => void;
    _onstop: () => void;
    _onend: () => void;
    _onloaderror: () => void;
    _onplayerror: () => void;
    _duration: number = 180; // 3 minutes
    _position: number = 0;
    _playing: boolean = false;
    
    constructor(options: any) {
      this._src = options.src;
      this._volume = options.volume || 1;
      this._onload = options.onload || (() => {});
      this._onplay = options.onplay || (() => {});
      this._onpause = options.onpause || (() => {});
      this._onstop = options.onstop || (() => {});
      this._onend = options.onend || (() => {});
      this._onloaderror = options.onloaderror || (() => {});
      this._onplayerror = options.onplayerror || (() => {});
      
      // Simulate async loading
      setTimeout(() => this._onload(), 100);
    }
    
    play() {
      this._playing = true;
      this._onplay();
    }
    
    pause() {
      this._playing = false;
      this._onpause();
    }
    
    stop() {
      this._playing = false;
      this._position = 0;
      this._onstop();
    }
    
    seek(position?: number) {
      if (position !== undefined) {
        this._position = position;
      }
      return this._position;
    }
    
    volume(vol?: number) {
      if (vol !== undefined) {
        this._volume = vol;
      }
      return this._volume;
    }
    
    duration() {
      return this._duration;
    }
    
    unload() {
      // Cleanup
    }
    
    // Helper methods for tests
    simulateEnd() {
      this._playing = false;
      this._position = 0;
      this._onend();
    }
    
    simulateError() {
      this._onloaderror();
    }
  }
  
  return {
    ...originalModule,
    Howl: MockHowl,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock song data
const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Test Song 1',
    artist: 'Test Artist 1',
    blogId: '1',
    blogName: 'Test Blog 1',
    audioUrl: 'https://example.com/song1.mp3',
    postUrl: 'https://example.com/post1',
    postDate: '2023-01-01',
  },
  {
    id: '2',
    title: 'Test Song 2',
    artist: 'Test Artist 2',
    blogId: '1',
    blogName: 'Test Blog 1',
    audioUrl: 'https://example.com/song2.mp3',
    postUrl: 'https://example.com/post2',
    postDate: '2023-01-02',
  },
  {
    id: '3',
    title: 'Test Song 3',
    artist: 'Test Artist 3',
    blogId: '2',
    blogName: 'Test Blog 2',
    audioUrl: 'https://example.com/song3.mp3',
    postUrl: 'https://example.com/post3',
    postDate: '2023-01-03',
  },
];

// Test component that consumes the context
const TestPlayer = () => {
  const { 
    currentSong, 
    isPlaying, 
    play, 
    pause, 
    togglePlay, 
    next, 
    previous,
    volume,
    setVolume,
    isMuted,
    mute,
    unmute,
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    seekTo,
    seek,
    duration
  } = usePlayer();

  return (
    <div>
      <div data-testid="current-song">{currentSong ? currentSong.title : 'No song'}</div>
      <div data-testid="player-state">{isPlaying ? 'Playing' : 'Paused'}</div>
      <div data-testid="volume">Volume: {volume}</div>
      <div data-testid="is-muted">{isMuted ? 'Muted' : 'Not Muted'}</div>
      <div data-testid="seek-position">Position: {seek}</div>
      <div data-testid="queue-length">Queue: {queue.length}</div>
      
      <button data-testid="play-button" onClick={() => play()}>Play</button>
      <button data-testid="pause-button" onClick={pause}>Pause</button>
      <button data-testid="toggle-button" onClick={togglePlay}>Toggle</button>
      <button data-testid="next-button" onClick={next}>Next</button>
      <button data-testid="previous-button" onClick={previous}>Previous</button>
      <button data-testid="mute-button" onClick={mute}>Mute</button>
      <button data-testid="unmute-button" onClick={unmute}>Unmute</button>
      <button data-testid="volume-up-button" onClick={() => setVolume(0.8)}>Volume Up</button>
      <button data-testid="volume-down-button" onClick={() => setVolume(0.2)}>Volume Down</button>
      <button data-testid="seek-button" onClick={() => seekTo(60)}>Seek to 60s</button>
      <button data-testid="clear-queue-button" onClick={clearQueue}>Clear Queue</button>
    </div>
  );
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlayerProvider>{children}</PlayerProvider>
);

describe('PlayerContext', () => {
  const mockSong = {
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

  const mockSong2 = {
    id: '2',
    title: 'Test Song 2',
    artist: 'Test Artist 2',
    blogId: 2,
    blogName: 'Test Blog 2',
    audioUrl: 'https://example.com/test2.mp3',
    imageUrl: 'https://example.com/test2.jpg',
    postUrl: 'https://example.com/post2',
    postDate: '2023-01-02',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initially has no current song and is not playing', () => {
    render(<TestPlayer />, { wrapper });
    
    expect(screen.getByTestId('current-song')).toHaveTextContent('No song');
    expect(screen.getByTestId('player-state')).toHaveTextContent('Paused');
  });

  it('can play a song', async () => {
    const { rerender } = render(<TestPlayer />, { wrapper });
    
    // Set up a test component that can trigger play with a song
    const TestPlayerWithPlaySong = () => {
      const { play, currentSong } = usePlayer();
      
      return (
        <div>
          <div data-testid="current-song">{currentSong ? currentSong.title : 'No song'}</div>
          <button data-testid="play-song-button" onClick={() => play(mockSong)}>
            Play Song
          </button>
        </div>
      );
    };
    
    rerender(<TestPlayerWithPlaySong />);
    
    // Play the song
    act(() => {
      screen.getByTestId('play-song-button').click();
    });
    
    // FastForward through the loading process
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Current song should be updated
    await waitFor(() => {
      expect(screen.getByTestId('current-song')).toHaveTextContent('Test Song');
    });
  });

  it('can toggle play/pause', async () => {
    const { rerender } = render(<TestPlayer />, { wrapper });
    
    // Set up a test component that initializes with a song
    const TestPlayerWithSong = () => {
      const { play, isPlaying, togglePlay } = usePlayer();
      
      // Initialize with a song
      React.useEffect(() => {
        play(mockSong);
      }, [play]);
      
      return (
        <div>
          <div data-testid="player-state">{isPlaying ? 'Playing' : 'Paused'}</div>
          <button data-testid="toggle-button" onClick={togglePlay}>
            Toggle
          </button>
        </div>
      );
    };
    
    rerender(<TestPlayerWithSong />);
    
    // FastForward through the loading process
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Initially playing after loading
    await waitFor(() => {
      expect(screen.getByTestId('player-state')).toHaveTextContent('Playing');
    });
    
    // Toggle to pause
    act(() => {
      screen.getByTestId('toggle-button').click();
    });
    
    // Should be paused
    expect(screen.getByTestId('player-state')).toHaveTextContent('Paused');
    
    // Toggle to play again
    act(() => {
      screen.getByTestId('toggle-button').click();
    });
    
    // Should be playing again
    expect(screen.getByTestId('player-state')).toHaveTextContent('Playing');
  });

  it('can control volume', async () => {
    render(<TestPlayer />, { wrapper });
    
    // Default volume should be 0.7 (70%)
    expect(screen.getByTestId('volume')).toHaveTextContent('Volume: 0.7');
    
    // Increase volume
    act(() => {
      screen.getByTestId('volume-up-button').click();
    });
    
    // Volume should be 0.8
    expect(screen.getByTestId('volume')).toHaveTextContent('Volume: 0.8');
    
    // Decrease volume
    act(() => {
      screen.getByTestId('volume-down-button').click();
    });
    
    // Volume should be 0.2
    expect(screen.getByTestId('volume')).toHaveTextContent('Volume: 0.2');
  });

  it('can mute and unmute', () => {
    render(<TestPlayer />, { wrapper });
    
    // Initially not muted
    expect(screen.getByTestId('is-muted')).toHaveTextContent('Not Muted');
    
    // Mute
    act(() => {
      screen.getByTestId('mute-button').click();
    });
    
    // Should be muted
    expect(screen.getByTestId('is-muted')).toHaveTextContent('Muted');
    
    // Unmute
    act(() => {
      screen.getByTestId('unmute-button').click();
    });
    
    // Should be unmuted
    expect(screen.getByTestId('is-muted')).toHaveTextContent('Not Muted');
  });

  it('can add songs to queue and play next', async () => {
    const { rerender } = render(<TestPlayer />, { wrapper });
    
    // Set up a component to add songs to queue
    const TestPlayerWithQueue = () => {
      const { play, currentSong, queue, addToQueue, next } = usePlayer();
      
      React.useEffect(() => {
        play(mockSong);
      }, [play]);
      
      return (
        <div>
          <div data-testid="current-song">{currentSong ? currentSong.title : 'No song'}</div>
          <div data-testid="queue-length">Queue: {queue.length}</div>
          <button data-testid="add-to-queue" onClick={() => addToQueue(mockSong2)}>
            Add to Queue
          </button>
          <button data-testid="next-button" onClick={next}>Next</button>
        </div>
      );
    };
    
    rerender(<TestPlayerWithQueue />);
    
    // FastForward through the loading process
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Should be playing the first song
    await waitFor(() => {
      expect(screen.getByTestId('current-song')).toHaveTextContent('Test Song');
    });
    
    // Queue should be empty
    expect(screen.getByTestId('queue-length')).toHaveTextContent('Queue: 0');
    
    // Add a song to the queue
    act(() => {
      screen.getByTestId('add-to-queue').click();
    });
    
    // Queue should have 1 song
    expect(screen.getByTestId('queue-length')).toHaveTextContent('Queue: 1');
    
    // Skip to next song
    act(() => {
      screen.getByTestId('next-button').click();
    });
    
    // Advance timer to allow for song loading
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Current song should be the one from the queue
    await waitFor(() => {
      expect(screen.getByTestId('current-song')).toHaveTextContent('Test Song 2');
    });
    
    // Queue should be empty again
    expect(screen.getByTestId('queue-length')).toHaveTextContent('Queue: 0');
  });

  it('can seek to a specific position', async () => {
    const { rerender } = render(<TestPlayer />, { wrapper });
    
    // Set up a component to test seeking
    const TestPlayerWithSeek = () => {
      const { play, seek, seekTo } = usePlayer();
      
      React.useEffect(() => {
        play(mockSong);
      }, [play]);
      
      return (
        <div>
          <div data-testid="seek-position">Position: {seek}</div>
          <button data-testid="seek-button" onClick={() => seekTo(60)}>
            Seek to 60s
          </button>
        </div>
      );
    };
    
    rerender(<TestPlayerWithSeek />);
    
    // FastForward through the loading process
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Initial position might vary depending on implementation
    // Seek to 60 seconds
    act(() => {
      screen.getByTestId('seek-button').click();
    });
    
    // Position should be updated to 60
    expect(screen.getByTestId('seek-position')).toHaveTextContent('Position: 60');
  });

  it('persists state to localStorage', async () => {
    const { rerender } = render(<TestPlayer />, { wrapper });
    
    // Create a component that modifies state
    const SetupComponent = () => {
      const { play, setVolume, addToQueue } = usePlayer();
      
      React.useEffect(() => {
        // Set up state to persist
        play(mockSong);
        setVolume(0.5);
        addToQueue(mockSong2);
      }, [play, setVolume, addToQueue]);
      
      return <div>Setting up state</div>;
    };
    
    rerender(<SetupComponent />);
    
    // Fast-forward time to allow for state to update and persist
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Check localStorage for persisted state
    expect(localStorage.getItem('listener_player_volume')).toBe('0.5');
    expect(localStorage.getItem('listener_player_current_song')).not.toBeNull();
    expect(localStorage.getItem('listener_player_queue')).not.toBeNull();
    
    // Parse the persisted queue
    const persistedQueue = JSON.parse(localStorage.getItem('listener_player_queue') || '[]');
    expect(persistedQueue.length).toBe(1);
    expect(persistedQueue[0].id).toBe('2');
  });

  it('handles errors when audio fails to load', async () => {
    // We need to create a special test component that can trigger errors
    const TestPlayerWithError = () => {
      const { play, error, isLoading } = usePlayer();
      
      return (
        <div>
          <div data-testid="error-message">{error || 'No error'}</div>
          <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not loading'}</div>
          <button 
            data-testid="play-bad-song"
            onClick={() => {
              const badSong = {...mockSong, audioUrl: 'bad-url'};
              play(badSong);
              
              // Force a loading error (since we can't actually load a bad URL in tests)
              setTimeout(() => {
                // Access the mock Howl instance and trigger error
                const howlInstance = require('howler').Howl.mock.instances[0];
                howlInstance.simulateError();
              }, 100);
            }}
          >
            Play Bad Song
          </button>
        </div>
      );
    };
    
    render(<TestPlayerWithError />, { wrapper });
    
    // Try to play a bad song
    act(() => {
      screen.getByTestId('play-bad-song').click();
    });
    
    // Should show loading state
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // Fast-forward to trigger the error
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load audio file');
    });
    
    // Should no longer be loading
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading');
  });
}); 