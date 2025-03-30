import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  Box,
  Link,
  Stack,
  useTheme
} from '@mui/material';
import { FavoriteBorder, Favorite, PlayArrow } from '@mui/icons-material';
import { Song } from '../../types/entities';

interface SongCardProps {
  song: Song;
  onToggleFavorite: (songId: number | string) => void;
  onPlay: (song: Song) => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onToggleFavorite, onPlay }) => {
  const theme = useTheme();
  const { title, artist, blogName, imageUrl, postUrl, isFavorite } = song;
  
  const placeholderImage = '/assets/images/music-placeholder.jpg';
  const displayImage = imageUrl && imageUrl.length > 0 ? imageUrl : placeholderImage;

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'relative',
          paddingTop: '100%', // 1:1 aspect ratio
        }}
      >
        <CardMedia
          component="img"
          alt={title}
          image={displayImage}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: 1
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" noWrap>
              {artist}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => onToggleFavorite(song.id)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              sx={{ color: isFavorite ? theme.palette.error.main : 'white' }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Stack>
        </Box>
        <IconButton
          aria-label="Play song"
          onClick={() => onPlay(song)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              transform: 'translate(-50%, -50%) scale(1.1)',
            }
          }}
        >
          <PlayArrow fontSize="large" />
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" noWrap title={title}>
          {title}
        </Typography>
        <Link 
          href={postUrl}
          target="_blank" 
          rel="noopener noreferrer" 
          color="inherit"
          underline="hover"
          sx={{ display: 'block', mt: 1 }}
        >
          {blogName}
        </Link>
      </CardContent>
    </Card>
  );
};

export default SongCard; 