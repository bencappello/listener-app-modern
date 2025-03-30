import api from './api';
import { User } from '../types/entities';
import { Song, PaginatedResponse } from '../types/entities';

// Base API endpoints
const USERS_URL = '/users';

/**
 * Get user by ID
 */
export const getUserById = async (userId: string | number): Promise<User> => {
  const response = await api.get(`${USERS_URL}/${userId}`);
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get(`${USERS_URL}/me`);
  return response.data;
};

/**
 * Get user's favorite songs
 */
export const getUserFavorites = async (
  userId: string | number,
  params?: { page?: number; limit?: number }
): Promise<{ data: Song[]; total: number; page?: number; limit?: number }> => {
  const response = await api.get(`${USERS_URL}/${userId}/favorites`, { params });
  return response.data;
};

/**
 * Get users followed by the specified user
 */
export const getUserFollowing = async (
  userId: string | number,
  params?: { page?: number; limit?: number }
): Promise<{ data: User[]; total: number }> => {
  const response = await api.get(`${USERS_URL}/${userId}/following`, { params });
  return response.data;
};

/**
 * Get users who follow the specified user
 */
export const getUserFollowers = async (
  userId: string | number,
  params?: { page?: number; limit?: number }
): Promise<{ data: User[]; total: number }> => {
  const response = await api.get(`${USERS_URL}/${userId}/followers`, { params });
  return response.data;
};

/**
 * Toggle follow status for a user
 */
export const toggleFollow = async (userId: string | number): Promise<User> => {
  const response = await api.post(`${USERS_URL}/${userId}/follow`);
  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string | number,
  data: {
    username?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
  }
): Promise<User> => {
  const response = await api.put(`${USERS_URL}/${userId}`, data);
  return response.data;
};

/**
 * Change user password
 */
export const changePassword = async (
  data: {
    currentPassword: string;
    newPassword: string;
  }
): Promise<void> => {
  await api.post(`${USERS_URL}/change-password`, data);
}; 