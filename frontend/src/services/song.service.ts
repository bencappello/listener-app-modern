import api from './api';
import { Song, PaginatedResponse } from '../types/entities';

// API endpoints
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
 * Fetch songs with pagination
 * @param page Page number (default 1)
 * @param limit Items per page (default 10)
 * @returns Promise with songs data and pagination info
 */
export const getSongs = async (
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedResponse<Song>> => {
  const response = await api.get(SONGS_URL, {
    params: { page, limit }
  });
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
 * @param songId Song ID
 * @returns Promise with updated song data
 */
export const toggleFavorite = async (
  songId: number | string
): Promise<Song> => {
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
export const getRecentSongs = async (
  limit: number = 10
): Promise<Song[]> => {
  const response = await api.get(`${SONGS_URL}/recent`, {
    params: { limit }
  });
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
 * Log that a song was played
 * @param songId Song ID
 * @returns Promise that resolves when the play is logged
 */
export const logSongPlay = async (
  songId: number | string
): Promise<void> => {
  await api.post(`${SONGS_URL}/${songId}/play`);
};

/**
 * Search for songs by title or artist
 * @param query Search query string
 * @param page Page number (default 1)
 * @param limit Items per page (default 10)
 * @returns Promise with matching songs and pagination info
 */
export const searchSongs = async (
  query: string, 
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedResponse<Song>> => {
  const response = await api.get(`${SONGS_URL}/search`, {
    params: { q: query, page, limit }
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

/**
 * Get trending songs
 * @param limit Number of songs to retrieve (default 10)
 * @returns Promise with trending songs
 */
export const getTrendingSongs = async (
  limit: number = 10
): Promise<Song[]> => {
  const response = await api.get(`${SONGS_URL}/trending`, {
    params: { limit }
  });
  return response.data;
};

/**
 * Get recently added songs
 * @param limit Number of songs to retrieve (default 10)
 * @returns Promise with recently added songs
 */
export const getRecentAddedSongs = async (
  limit: number = 10
): Promise<Song[]> => {
  const response = await api.get('/songs/recent', {
    params: { limit }
  });
  return response.data;
}; 