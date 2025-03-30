import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  HStack,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeMute,
  FaVolumeUp,
} from 'react-icons/fa';
import { usePlayer } from '../../contexts/PlayerContext';
import { formatDuration } from '../../utils/formatters';

interface PlayerControlsProps {
  showSeekBar?: boolean;
  showVolumeControl?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  compact?: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  showSeekBar = true,
  showVolumeControl = true,
  size = 'md',
  colorScheme = 'purple',
  compact = false,
}) => {
  // Get player state and controls from context
  const {
    isPlaying,
    togglePlay,
    next,
    previous,
    volume,
    setVolume,
    isMuted,
    mute,
    unmute,
    duration,
    seek,
    seekTo,
    currentSong,
    isLoading,
  } = usePlayer();

  // Button sizes based on the size prop
  const buttonSizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  };

  // Icon sizes based on the size prop
  const iconSizes = {
    sm: 4,
    md: 5,
    lg: 6,
  };

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Calculate formatted times
  const currentTime = formatDuration(seek);
  const totalTime = formatDuration(duration);
  
  // Handle seek change
  const handleSeekChange = (value: number) => {
    seekTo(value);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  };

  return (
    <Box 
      p={2} 
      borderWidth="1px" 
      borderRadius="md" 
      bg={bgColor} 
      borderColor={borderColor}
      data-testid="player-controls"
    >
      {/* Main controls */}
      <Flex 
        justify="center" 
        align="center" 
        mb={showSeekBar ? 2 : 0}
      >
        {/* Skip back button */}
        <IconButton
          aria-label="Previous song"
          icon={<FaStepBackward />}
          size={buttonSizes[size]}
          variant="ghost"
          onClick={previous}
          isDisabled={!currentSong}
          data-testid="previous-button"
        />
        
        {/* Play/Pause button */}
        <IconButton
          aria-label={isPlaying ? 'Pause' : 'Play'}
          icon={isPlaying ? <FaPause /> : <FaPlay />}
          size={buttonSizes[size]}
          colorScheme={colorScheme}
          onClick={togglePlay}
          isDisabled={!currentSong}
          isLoading={isLoading}
          mx={2}
          borderRadius="full"
          data-testid="play-pause-button"
        />
        
        {/* Skip forward button */}
        <IconButton
          aria-label="Next song"
          icon={<FaStepForward />}
          size={buttonSizes[size]}
          variant="ghost"
          onClick={next}
          isDisabled={!currentSong}
          data-testid="next-button"
        />
        
        {/* Volume controls (if not compact) */}
        {showVolumeControl && !compact && (
          <HStack ml={4} width="150px">
            <IconButton
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              size={buttonSizes[size]}
              variant="ghost"
              onClick={toggleMute}
              data-testid="mute-button"
            />
            <Slider
              aria-label="Volume"
              value={isMuted ? 0 : volume}
              min={0}
              max={1}
              step={0.01}
              onChange={handleVolumeChange}
              colorScheme={colorScheme}
              width="100px"
              data-testid="volume-slider"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </HStack>
        )}
      </Flex>
      
      {/* Seek bar */}
      {showSeekBar && currentSong && (
        <Box px={compact ? 0 : 4}>
          <Slider
            aria-label="Seek"
            value={seek}
            min={0}
            max={duration || 100}
            onChange={handleSeekChange}
            colorScheme={colorScheme}
            data-testid="seek-slider"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <Tooltip
              label={currentTime}
              placement="top"
              hasArrow
            >
              <SliderThumb />
            </Tooltip>
          </Slider>
          
          {!compact && (
            <Flex justify="space-between">
              <Text fontSize="xs" color={textColor}>
                {currentTime}
              </Text>
              <Text fontSize="xs" color={textColor}>
                {totalTime}
              </Text>
            </Flex>
          )}
        </Box>
      )}
      
      {/* Volume controls (if compact) */}
      {showVolumeControl && compact && (
        <Flex justify="center" align="center" mt={2}>
          <IconButton
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            size="sm"
            variant="ghost"
            onClick={toggleMute}
            data-testid="mute-button-compact"
          />
          <Slider
            aria-label="Volume"
            value={isMuted ? 0 : volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            colorScheme={colorScheme}
            width="100px"
            ml={2}
            data-testid="volume-slider-compact"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Flex>
      )}
    </Box>
  );
};

export default PlayerControls; 