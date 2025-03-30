import api from './api';
import { Blog, PaginatedResponse } from '../types/entities';

// Base URL for blog endpoints
const BLOGS_URL = '/blogs';

/**
 * Get a list of all blogs with optional pagination
 * @param page The page number to fetch
 * @param limit The number of items per page
 * @returns Promise with blogs data, total count, and pagination info
 */
export const getBlogs = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Blog>> => {
  const response = await api.get(BLOGS_URL, {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Get blogs followed by the current user
 * @param page The page number to fetch
 * @param limit The number of items per page
 * @returns Promise with followed blogs data, total count, and pagination info
 */
export const getFollowedBlogs = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Blog>> => {
  const response = await api.get(`${BLOGS_URL}/followed`, {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Get a single blog by ID
 * @param id The blog ID
 * @returns Promise with the blog data
 */
export const getBlogById = async (id: number): Promise<Blog> => {
  const response = await api.get(`${BLOGS_URL}/${id}`);
  return response.data;
};

/**
 * Toggle following a blog
 * @param blogId The blog ID to toggle follow status
 * @returns Promise with the updated blog data
 */
export const toggleFollowBlog = async (blogId: number): Promise<Blog> => {
  const response = await api.post(`${BLOGS_URL}/${blogId}/follow`);
  return response.data;
};

/**
 * Search for blogs by name or description
 * @param query The search query
 * @param page The page number to fetch
 * @param limit The number of items per page
 * @returns Promise with matching blogs data, total count, and pagination info
 */
export const searchBlogs = async (
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Blog>> => {
  const response = await api.get(`${BLOGS_URL}/search`, {
    params: { query, page, limit }
  });
  return response.data;
};

/**
 * Get statistics for a blog
 * @param blogId The blog ID to get statistics for
 * @returns Promise with the blog statistics
 */
export const getBlogStats = async (blogId: number): Promise<{
  songCount: number;
  followerCount: number;
}> => {
  const response = await api.get(`${BLOGS_URL}/${blogId}/stats`);
  return response.data;
};

/**
 * Get the most recent songs from a blog
 * @param blogId The blog ID
 * @param limit The maximum number of songs to retrieve
 * @returns Promise with the recent songs
 */
export const getBlogRecentSongs = async (
  blogId: number,
  limit: number = 5
): Promise<any[]> => {
  const response = await api.get(`${BLOGS_URL}/${blogId}/songs/recent`, {
    params: { limit }
  });
  return response.data;
}; 