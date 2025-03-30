import api from './api';
import { Song } from '../types/entities';

// Base API endpoints
const SONGS_URL = '/songs';

/**
 * Get a list of songs with optional filters
 */
export const getSongs = async (params?: { 
  page?: number; 
  limit?: number;
  query?: string;
  tags?: string[];
  blogId?: string | number;
}): Promise<{ data: Song[]; total: number; }> => {
  const response = await api.get(SONGS_URL, { params });
  return response.data;
};

/**
 * Get a single song by ID
 */
export const getSongById = async (id: string | number): Promise<Song> => {
  const response = await api.get(`${SONGS_URL}/${id}`);
  return response.data;
};

/**
 * Toggle favorite status for a song
 */
export const toggleFavorite = async (id: string | number): Promise<Song> => {
  const response = await api.post(`${SONGS_URL}/${id}/favorite`);
  return response.data;
};

/**
 * Get a list of favorite songs for the current user
 */
export const getFavoriteSongs = async (params?: { 
  page?: number; 
  limit?: number;
}): Promise<{ data: Song[]; total: number; }> => {
  const response = await api.get(`${SONGS_URL}/favorites`, { params });
  return response.data;
};

/**
 * Get recently played songs for the current user
 */
export const getRecentSongs = async (params?: { 
  limit?: number;
}): Promise<Song[]> => {
  const response = await api.get(`${SONGS_URL}/recent`, { params });
  return response.data;
};

/**
 * Get recommended songs based on user's listening history
 */
export const getRecommendedSongs = async (params?: {
  limit?: number;
}): Promise<Song[]> => {
  const response = await api.get(`${SONGS_URL}/recommended`, { params });
  return response.data;
};

/**
 * Log a play event for a song
 */
export const logSongPlay = async (id: string | number): Promise<void> => {
  await api.post(`${SONGS_URL}/${id}/play`);
};

/**
 * Search for songs by text query
 */
export const searchSongs = async (query: string, params?: {
  page?: number;
  limit?: number;
  tags?: string[];
}): Promise<{ data: Song[]; total: number; }> => {
  const response = await api.get(`${SONGS_URL}/search`, { 
    params: { 
      q: query,
      ...params 
    } 
  });
  return response.data;
}; 