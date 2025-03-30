import React, { useState } from 'react';
import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import * as songService from '../../services/song.service';

interface FavoriteButtonProps extends Omit<IconButtonProps, 'aria-label' | 'icon' | 'onClick'> {
  songId: string | number;
  isFavorite: boolean;
  onFavoriteChange: (isFavorite: boolean) => void;
  color?: string;
  activeColor?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  songId,
  isFavorite,
  onFavoriteChange,
  color = 'gray.400',
  activeColor = 'red.400',
  size = 'md',
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  
  const handleToggleFavorite = async () => {
    if (!songId) return;
    
    try {
      setLoading(true);
      const updatedSong = await songService.toggleFavorite(songId);
      onFavoriteChange(updatedSong.isFavorite || false);
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      icon={isFavorite ? <FaHeart /> : <FaRegHeart />}
      onClick={handleToggleFavorite}
      isLoading={loading}
      isDisabled={!songId || loading}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      color={isFavorite ? activeColor : color}
      variant="ghost"
      size={size}
      data-testid="favorite-button"
      {...props}
    />
  );
};

export default FavoriteButton; 