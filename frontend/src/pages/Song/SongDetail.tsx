import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  CircularProgress, 
  IconButton, 
  Paper, 
  Alert 
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  PlayArrow, 
  ArrowBack, 
  Share, 
  Comment as CommentIcon
} from '@mui/icons-material';
import * as songService from '../../services/song.service';
import { Song } from '../../types/entities';

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        if (!id) {
          setError('No song ID provided');
          setLoading(false);
          return;
        }
        
        const data = await songService.getSongById(id);
        setSong(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching song:', err);
        setError('Unable to load song details. Please try again later.');
        setLoading(false);
      }
    };

    fetchSong();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!song) return;
    
    try {
      const updatedSong = await songService.toggleFavorite(song.id);
      setSong(updatedSong);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite status. Please try again.');
    }
  };

  const handlePlaySong = async () => {
    if (!song) return;
    
    try {
      await songService.logSongPlay(song.id);
      // Here you would typically trigger the audio player
      console.log('Playing song:', song.title);
    } catch (err) {
      console.error('Error logging song play:', err);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!song) {
    return (
      <Box p={3}>
        <Alert severity="warning" sx={{ mb: 2 }}>Song not found</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button 
        variant="outlined" 
        startIcon={<ArrowBack />} 
        onClick={handleGoBack}
        sx={{ mb: 3 }}
      >
        Back
      </Button>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          {/* Song Image */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '300px' }, 
              height: { xs: '250px', md: '300px' },
              backgroundColor: 'grey.200',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            {song.imageUrl ? (
              <img 
                src={song.imageUrl} 
                alt={song.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                height="100%"
                bgcolor="grey.200"
              >
                <Typography variant="body2" color="text.secondary">
                  No image available
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Song Details */}
          <Box flex="1">
            <Typography variant="h4" gutterBottom data-testid="song-title">
              {song.title}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom data-testid="song-artist">
              {song.artist}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              From blog:{' '}
              <Box 
                component="span" 
                sx={{ 
                  color: 'primary.main', 
                  textDecoration: 'underline', 
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/blogs/${song.blogId}`)}
              >
                {song.blogName}
              </Box>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Posted: {new Date(song.postDate).toLocaleDateString()}
            </Typography>
            
            {/* Tags */}
            {song.tags && song.tags.length > 0 && (
              <Box my={2}>
                {song.tags.map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }} 
                    onClick={() => navigate(`/tags/${tag}`)}
                  />
                ))}
              </Box>
            )}
            
            {/* Action Buttons */}
            <Box mt={3} display="flex" gap={1}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<PlayArrow />}
                onClick={handlePlaySong}
                data-testid="play-button"
              >
                Play
              </Button>
              
              <IconButton 
                color="primary" 
                onClick={handleToggleFavorite}
                data-testid="favorite-button"
              >
                {song.isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              
              <IconButton color="primary">
                <Share />
              </IconButton>
              
              <IconButton color="primary">
                <CommentIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Original Post Link */}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Original post:{' '}
        <Box 
          component="a" 
          href={song.postUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ color: 'primary.main' }}
        >
          View on {song.blogName}
        </Box>
      </Typography>
    </Box>
  );
} 