import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Howl } from 'howler';
import { Song } from '../types/entities';

// Define the type for our player state
interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  duration: number;
  seek: number;
  isLoading: boolean;
  error: string | null;
}

// Define the type for our context
interface PlayerContextType extends PlayerState {
  // Playback controls
  play: (song?: Song) => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  
  // Queue management
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string | number) => void;
  clearQueue: () => void;
  
  // Audio settings
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  seekTo: (seconds: number) => void;
  
  // Player state
  isMuted: boolean;
}

// Create the context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Storage keys for persisting state
const PLAYER_VOLUME_KEY = 'listener_player_volume';
const PLAYER_QUEUE_KEY = 'listener_player_queue';
const PLAYER_CURRENT_SONG_KEY = 'listener_player_current_song';

// Provider component
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Player state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7); // 70% volume by default
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const howlRef = useRef<Howl | null>(null);
  const seekTimerRef = useRef<number | null>(null);
  
  // Helper function to persist player state
  const persistState = useCallback(() => {
    localStorage.setItem(PLAYER_VOLUME_KEY, volume.toString());
    localStorage.setItem(PLAYER_QUEUE_KEY, JSON.stringify(queue));
    localStorage.setItem(PLAYER_CURRENT_SONG_KEY, JSON.stringify(currentSong));
  }, [volume, queue, currentSong]);
  
  // Load saved state on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem(PLAYER_VOLUME_KEY);
    if (savedVolume) {
      setVolumeState(parseFloat(savedVolume));
    }
    
    const savedQueue = localStorage.getItem(PLAYER_QUEUE_KEY);
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (e) {
        console.error('Failed to parse saved queue', e);
      }
    }
    
    const savedCurrentSong = localStorage.getItem(PLAYER_CURRENT_SONG_KEY);
    if (savedCurrentSong) {
      try {
        setCurrentSong(JSON.parse(savedCurrentSong));
      } catch (e) {
        console.error('Failed to parse saved current song', e);
      }
    }
  }, []);
  
  // Persist state when it changes
  useEffect(() => {
    persistState();
  }, [volume, queue, currentSong, persistState]);
  
  // Update seek position on interval
  useEffect(() => {
    if (isPlaying && howlRef.current) {
      seekTimerRef.current = window.setInterval(() => {
        setSeek(howlRef.current?.seek() || 0);
      }, 1000) as unknown as number;
    }
    
    return () => {
      if (seekTimerRef.current) {
        clearInterval(seekTimerRef.current);
      }
    };
  }, [isPlaying]);
  
  // Set up Howler instance when current song changes
  useEffect(() => {
    if (!currentSong || !currentSong.audioUrl) {
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    if (howlRef.current) {
      howlRef.current.unload();
    }
    
    const howl = new Howl({
      src: [currentSong.audioUrl],
      html5: true, // Use HTML5 Audio for better streaming support
      volume: isMuted ? 0 : volume,
      onload: () => {
        setDuration(howl.duration());
        setIsLoading(false);
        
        if (isPlaying) {
          howl.play();
        }
      },
      onend: () => {
        next();
      },
      onplay: () => {
        setIsPlaying(true);
      },
      onpause: () => {
        setIsPlaying(false);
      },
      onstop: () => {
        setIsPlaying(false);
        setSeek(0);
      },
      onloaderror: () => {
        setError('Failed to load audio file');
        setIsLoading(false);
        
        // Try to play the next song if the current one fails
        if (queue.length > 0) {
          next();
        }
      },
      onplayerror: () => {
        setError('Failed to play audio file');
        setIsLoading(false);
        
        // Try to play the next song if the current one fails
        if (queue.length > 0) {
          next();
        }
      }
    });
    
    howlRef.current = howl;
  }, [currentSong]);
  
  // Update volume when it changes
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);
  
  // Playback controls
  const play = useCallback((song?: Song) => {
    if (song) {
      // If a specific song is provided, play it
      setCurrentSong(song);
      setIsPlaying(true);
    } else if (currentSong) {
      // Play the current song
      if (howlRef.current) {
        howlRef.current.play();
        setIsPlaying(true);
      }
    } else if (queue.length > 0) {
      // Play the first song in the queue
      setCurrentSong(queue[0]);
      setQueue(queue.slice(1));
      setIsPlaying(true);
    }
  }, [currentSong, queue]);
  
  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause();
      setIsPlaying(false);
    }
  }, []);
  
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);
  
  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
      setIsPlaying(false);
      setSeek(0);
    }
  }, []);
  
  const next = useCallback(() => {
    if (queue.length > 0) {
      // Play the next song in the queue
      const nextSong = queue[0];
      const newQueue = queue.slice(1);
      
      setCurrentSong(nextSong);
      setQueue(newQueue);
      setIsPlaying(true);
    } else {
      // No more songs in the queue, just stop
      stop();
      setCurrentSong(null);
    }
  }, [queue, stop]);
  
  const previous = useCallback(() => {
    if (howlRef.current && howlRef.current.seek() > 3) {
      // If we're more than 3 seconds into the song, just restart it
      howlRef.current.seek(0);
    } else if (currentSong) {
      // Add current song back to the end of the queue if we're skipping it
      setQueue(prevQueue => [...prevQueue, currentSong]);
      
      // Play the next song (or stop if queue is empty)
      if (queue.length > 0) {
        const nextSong = queue[0];
        const newQueue = queue.slice(1);
        
        setCurrentSong(nextSong);
        setQueue(newQueue);
        setIsPlaying(true);
      } else {
        stop();
        setCurrentSong(null);
      }
    }
  }, [currentSong, queue, stop]);
  
  // Queue management
  const addToQueue = useCallback((song: Song) => {
    setQueue(prevQueue => [...prevQueue, song]);
  }, []);
  
  const removeFromQueue = useCallback((songId: string | number) => {
    setQueue(prevQueue => prevQueue.filter(song => song.id !== songId));
  }, []);
  
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);
  
  // Audio settings
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  }, [isMuted]);
  
  const mute = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.volume(0);
    }
    setIsMuted(true);
  }, []);
  
  const unmute = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume);
    }
    setIsMuted(false);
  }, [volume]);
  
  const seekTo = useCallback((seconds: number) => {
    if (howlRef.current) {
      howlRef.current.seek(seconds);
      setSeek(seconds);
    }
  }, []);
  
  // Construct the context value
  const contextValue: PlayerContextType = {
    currentSong,
    queue,
    isPlaying,
    volume,
    isMuted,
    duration,
    seek,
    isLoading,
    error,
    play,
    pause,
    togglePlay,
    stop,
    next,
    previous,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setVolume,
    mute,
    unmute,
    seekTo
  };
  
  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook to use the player context
export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  
  return context;
};

export default PlayerContext; 