import api from './api';
import { Song, PaginatedResponse } from '../types/entities';

// Base API endpoints
const SONGS_URL = '/songs';

interface GetSongsParams {
  page?: number;
  limit?: number;
  sort?: string;
  feed?: boolean;
  query?: string;
  tags?: string[];
}

/**
 * Get a list of songs with optional filters
 */
export const getSongs = async (params: GetSongsParams = {}): Promise<PaginatedResponse<Song>> => {
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
export const toggleFavorite = async (songId: string | number): Promise<Song> => {
  const response = await api.post(`${SONGS_URL}/${songId}/favorite`);
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
export const searchSongs = async (query: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Song>> => {
  const response = await api.get(`${SONGS_URL}/search`, { 
    params: { 
      q: query,
      ...params
    } 
  });
  return response.data;
};

export const getFeedSongs = async (params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Song>> => {
  const response = await api.get(`${SONGS_URL}/feed`, { params });
  return response.data;
};

export const getSongsByTag = async (tag: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Song>> => {
  const response = await api.get(`/tags/${tag}/songs`, { params });
  return response.data;
};

export const getSongsByBlog = async (blogId: string | number, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Song>> => {
  const response = await api.get(`/blogs/${blogId}/songs`, { params });
  return response.data;
};

export const getPopularSongs = async (params: { page?: number; limit?: number; period?: string } = {}): Promise<PaginatedResponse<Song>> => {
  const response = await api.get(`${SONGS_URL}/popular`, { params });
  return response.data;
}; 