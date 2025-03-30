import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Alert,
  Divider
} from '@mui/material';
import { SearchBar } from '../../components/search';
import SongList from '../../components/song/SongList';
import * as songService from '../../services/song.service';
import { Song } from '../../types/entities';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Get initial query from URL if present
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  useEffect(() => {
    // If there's an initial query in the URL, perform search
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    
    // Update URL with search query
    navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    
    try {
      const result = await songService.searchSongs(query);
      setSongs(result.data);
    } catch (err) {
      console.error('Error searching songs:', err);
      setError('Error searching for songs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (songId: number | string) => {
    try {
      await songService.toggleFavorite(songId);
      // Update the song in the list with the new favorite status
      setSongs(prevSongs => 
        prevSongs.map(song => 
          song.id === songId 
            ? { ...song, isFavorite: !song.isFavorite } 
            : song
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Error updating favorite status. Please try again.');
    }
  };

  const handlePlaySong = async (song: Song) => {
    try {
      await songService.logSongPlay(song.id);
      // Here you would typically integrate with audio player
      console.log('Playing song:', song.title);
    } catch (err) {
      console.error('Error logging song play:', err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Songs
      </Typography>
      
      <Box sx={{ mb: 4, maxWidth: 600 }}>
        <SearchBar 
          onSearch={handleSearch} 
          initialValue={initialQuery}
        />
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!searchPerformed ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="300px"
        >
          <Typography variant="h6" color="text.secondary">
            Search for songs to listen to
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Enter keywords in the search box above
          </Typography>
        </Box>
      ) : (
        <Box>
          {initialQuery && (
            <Typography variant="h6" gutterBottom>
              Search results for: <strong>{initialQuery}</strong>
            </Typography>
          )}
          
          <SongList
            songs={songs}
            onToggleFavorite={handleToggleFavorite}
            onPlaySong={handlePlaySong}
            isLoading={loading}
          />
        </Box>
      )}
    </Container>
  );
};

export default SearchPage; 