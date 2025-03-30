import React from 'react';
import { render, act, renderHook, waitFor } from '@testing-library/react';
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
      
      // Simulate loading
      setTimeout(() => {
        this._onload();
      }, 50);
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
      // Clean up
    }
    
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

// Mock local storage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

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

// Wrap component with provider for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlayerProvider>{children}</PlayerProvider>
);

describe('PlayerContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });
  
  it('initializes with default values', () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    expect(result.current.currentSong).toBeNull();
    expect(result.current.queue).toEqual([]);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.volume).toBe(0.7); // Default volume
    expect(result.current.isMuted).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.seek).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  it('plays a song', async () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    act(() => {
      result.current.play(mockSongs[0]);
    });
    
    // Wait for Howl to "load"
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.currentSong).toEqual(mockSongs[0]);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.duration).toBe(180); // From mock
  });
  
  it('pauses and resumes playback', async () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    // Start playing
    act(() => {
      result.current.play(mockSongs[0]);
    });
    
    // Wait for Howl to "load"
    await waitFor(() => {
      expect(result.current.isPlaying).toBe(true);
    });
    
    // Pause
    act(() => {
      result.current.pause();
    });
    
    expect(result.current.isPlaying).toBe(false);
    
    // Resume
    act(() => {
      result.current.play();
    });
    
    expect(result.current.isPlaying).toBe(true);
  });
  
  it('toggles play/pause', async () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    // Start playing
    act(() => {
      result.current.play(mockSongs[0]);
    });
    
    // Wait for Howl to "load"
    await waitFor(() => {
      expect(result.current.isPlaying).toBe(true);
    });
    
    // Toggle to pause
    act(() => {
      result.current.togglePlay();
    });
    
    expect(result.current.isPlaying).toBe(false);
    
    // Toggle to play
    act(() => {
      result.current.togglePlay();
    });
    
    expect(result.current.isPlaying).toBe(true);
  });
  
  it('manages a queue of songs', async () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    // Add songs to queue
    act(() => {
      result.current.addToQueue(mockSongs[0]);
      result.current.addToQueue(mockSongs[1]);
    });
    
    expect(result.current.queue).toHaveLength(2);
    expect(result.current.queue[0]).toEqual(mockSongs[0]);
    expect(result.current.queue[1]).toEqual(mockSongs[1]);
    
    // Play from queue
    act(() => {
      result.current.play();
    });
    
    // Wait for Howl to "load"
    await waitFor(() => {
      expect(result.current.isPlaying).toBe(true);
    });
    
    expect(result.current.currentSong).toEqual(mockSongs[0]);
    expect(result.current.queue).toHaveLength(1);
    
    // Skip to next song
    act(() => {
      result.current.next();
    });
    
    await waitFor(() => {
      expect(result.current.currentSong).toEqual(mockSongs[1]);
    });
    
    expect(result.current.queue).toHaveLength(0);
    
    // Remove from queue
    act(() => {
      result.current.addToQueue(mockSongs[2]);
      result.current.removeFromQueue(mockSongs[2].id);
    });
    
    expect(result.current.queue).toHaveLength(0);
    
    // Clear queue
    act(() => {
      result.current.addToQueue(mockSongs[0]);
      result.current.addToQueue(mockSongs[1]);
      result.current.clearQueue();
    });
    
    expect(result.current.queue).toHaveLength(0);
  });
  
  it('controls volume and mute state', async () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    // Start playing
    act(() => {
      result.current.play(mockSongs[0]);
    });
    
    // Wait for Howl to "load"
    await waitFor(() => {
      expect(result.current.isPlaying).toBe(true);
    });
    
    // Change volume
    act(() => {
      result.current.setVolume(0.5);
    });
    
    expect(result.current.volume).toBe(0.5);
    
    // Mute
    act(() => {
      result.current.mute();
    });
    
    expect(result.current.isMuted).toBe(true);
    
    // Unmute
    act(() => {
      result.current.unmute();
    });
    
    expect(result.current.isMuted).toBe(false);
  });
  
  it('seeks to a specific position', async () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    // Start playing
    act(() => {
      result.current.play(mockSongs[0]);
    });
    
    // Wait for Howl to "load"
    await waitFor(() => {
      expect(result.current.isPlaying).toBe(true);
    });
    
    // Seek to 30 seconds
    act(() => {
      result.current.seekTo(30);
    });
    
    expect(result.current.seek).toBe(30);
  });
  
  it('persists player state to localStorage', async () => {
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    // Set volume and add to queue
    act(() => {
      result.current.setVolume(0.4);
      result.current.addToQueue(mockSongs[0]);
    });
    
    // Check localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('listener_player_volume', '0.4');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('listener_player_queue', JSON.stringify([mockSongs[0]]));
  });
  
  it('loads persisted state from localStorage', async () => {
    // Set up mock localStorage with saved state
    mockLocalStorage.setItem('listener_player_volume', '0.3');
    mockLocalStorage.setItem('listener_player_queue', JSON.stringify([mockSongs[2]]));
    mockLocalStorage.setItem('listener_player_current_song', JSON.stringify(mockSongs[1]));
    
    // Render hook which should load from localStorage
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    // Wait for volume to be loaded
    await waitFor(() => {
      expect(result.current.volume).toBe(0.3);
    });
    
    // Check queue was loaded
    await waitFor(() => {
      expect(result.current.queue).toEqual([mockSongs[2]]);
    });
    
    // Check current song was loaded
    await waitFor(() => {
      expect(result.current.currentSong).toEqual(mockSongs[1]);
    });
  });
}); 