import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import PlayerControls from './PlayerControls';
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

describe('PlayerControls', () => {
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

  it('renders play button when paused', () => {
    render(
      <ChakraProvider>
        <PlayerControls />
      </ChakraProvider>
    );
    
    const playButton = screen.getByTestId('play-pause-button');
    expect(playButton).toHaveAttribute('aria-label', 'Play');
  });

  it('renders pause button when playing', () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      isPlaying: true,
    });

    render(
      <ChakraProvider>
        <PlayerControls />
      </ChakraProvider>
    );
    
    const pauseButton = screen.getByTestId('play-pause-button');
    expect(pauseButton).toHaveAttribute('aria-label', 'Pause');
  });

  it('calls togglePlay when play/pause button is clicked', () => {
    const togglePlay = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      togglePlay,
    });

    render(
      <ChakraProvider>
        <PlayerControls />
      </ChakraProvider>
    );
    
    const playButton = screen.getByTestId('play-pause-button');
    fireEvent.click(playButton);
    
    expect(togglePlay).toHaveBeenCalledTimes(1);
  });

  it('calls previous when previous button is clicked', () => {
    const previous = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      previous,
    });

    render(
      <ChakraProvider>
        <PlayerControls />
      </ChakraProvider>
    );
    
    const prevButton = screen.getByTestId('previous-button');
    fireEvent.click(prevButton);
    
    expect(previous).toHaveBeenCalledTimes(1);
  });

  it('calls next when next button is clicked', () => {
    const next = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      next,
    });

    render(
      <ChakraProvider>
        <PlayerControls />
      </ChakraProvider>
    );
    
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('disables player controls when no current song is loaded', () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      currentSong: null,
    });

    render(
      <ChakraProvider>
        <PlayerControls />
      </ChakraProvider>
    );
    
    const playButton = screen.getByTestId('play-pause-button');
    const prevButton = screen.getByTestId('previous-button');
    const nextButton = screen.getByTestId('next-button');
    
    expect(playButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('renders seek bar when showSeekBar is true', () => {
    render(
      <ChakraProvider>
        <PlayerControls showSeekBar={true} />
      </ChakraProvider>
    );
    
    const seekBar = screen.getByTestId('seek-slider');
    expect(seekBar).toBeInTheDocument();
    
    const currentTime = screen.getByText('0:30');
    expect(currentTime).toBeInTheDocument();
    
    const duration = screen.getByText('3:00');
    expect(duration).toBeInTheDocument();
  });

  it('does not render seek bar when showSeekBar is false', () => {
    render(
      <ChakraProvider>
        <PlayerControls showSeekBar={false} />
      </ChakraProvider>
    );
    
    expect(screen.queryByTestId('seek-slider')).not.toBeInTheDocument();
    expect(screen.queryByText('0:30')).not.toBeInTheDocument();
    expect(screen.queryByText('3:00')).not.toBeInTheDocument();
  });

  it('calls seekTo when seek bar is changed', async () => {
    const seekTo = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      seekTo,
    });

    render(
      <ChakraProvider>
        <PlayerControls showSeekBar={true} />
      </ChakraProvider>
    );
    
    const seekBar = screen.getByTestId('seek-slider') as HTMLInputElement;
    fireEvent.change(seekBar, { target: { value: '90' } });
    fireEvent.mouseUp(seekBar);
    
    await waitFor(() => {
      expect(seekTo).toHaveBeenCalledWith(90);
    });
  });

  it('renders volume control when showVolumeControl is true', () => {
    render(
      <ChakraProvider>
        <PlayerControls showVolumeControl={true} />
      </ChakraProvider>
    );
    
    const muteButton = screen.getByTestId('mute-button');
    expect(muteButton).toBeInTheDocument();
    
    const volumeSlider = screen.getByTestId('volume-slider');
    expect(volumeSlider).toBeInTheDocument();
  });

  it('renders compact volume control when compact is true', () => {
    render(
      <ChakraProvider>
        <PlayerControls compact={true} showVolumeControl={true} />
      </ChakraProvider>
    );
    
    // Check for compact volume controls
    const muteButton = screen.getByTestId('mute-button-compact');
    expect(muteButton).toBeInTheDocument();
    
    const volumeSlider = screen.getByTestId('volume-slider-compact');
    expect(volumeSlider).toBeInTheDocument();
  });

  it('calls setVolume when volume slider is changed', async () => {
    const setVolume = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      setVolume,
    });

    render(
      <ChakraProvider>
        <PlayerControls showVolumeControl={true} />
      </ChakraProvider>
    );
    
    const volumeSlider = screen.getByTestId('volume-slider') as HTMLInputElement;
    fireEvent.change(volumeSlider, { target: { value: '0.7' } });
    fireEvent.mouseUp(volumeSlider);
    
    await waitFor(() => {
      expect(setVolume).toHaveBeenCalledWith(0.7);
    });
  });

  it('calls toggleMute when mute button is clicked', () => {
    const mute = jest.fn();
    const unmute = jest.fn();
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      mute,
      unmute,
      isMuted: false,
    });

    render(
      <ChakraProvider>
        <PlayerControls showVolumeControl={true} />
      </ChakraProvider>
    );
    
    const muteButton = screen.getByTestId('mute-button');
    fireEvent.click(muteButton);
    
    expect(mute).toHaveBeenCalledTimes(1);
    
    // Now test unmute
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      mute,
      unmute,
      isMuted: true,
    });
    
    render(
      <ChakraProvider>
        <PlayerControls showVolumeControl={true} />
      </ChakraProvider>
    );
    
    const unmuteButton = screen.getByTestId('mute-button');
    fireEvent.click(unmuteButton);
    
    expect(unmute).toHaveBeenCalledTimes(1);
  });

  it('applies correct size class', () => {
    render(
      <ChakraProvider>
        <PlayerControls size="lg" />
      </ChakraProvider>
    );
    
    const controls = screen.getByTestId('player-controls');
    expect(controls).toBeInTheDocument();
  });
}); 