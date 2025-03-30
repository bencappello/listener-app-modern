import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import FavoriteButton from './FavoriteButton';
import * as songService from '../../services/song.service';

// Mock the song service
jest.mock('../../services/song.service');
const mockSongService = songService as jest.Mocked<typeof songService>;

describe('FavoriteButton Component', () => {
  const songId = '1';
  const onFavoriteChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders unfilled heart when song is not favorited', () => {
    render(<FavoriteButton songId={songId} isFavorite={false} onFavoriteChange={onFavoriteChange} />);
    
    const button = screen.getByRole('button', { name: /Add to favorites/i });
    expect(button).toBeInTheDocument();
  });
  
  it('renders filled heart when song is favorited', () => {
    render(<FavoriteButton songId={songId} isFavorite={true} onFavoriteChange={onFavoriteChange} />);
    
    const button = screen.getByRole('button', { name: /Remove from favorites/i });
    expect(button).toBeInTheDocument();
  });
  
  it('calls toggleFavorite service when button is clicked', async () => {
    mockSongService.toggleFavorite.mockResolvedValue({
      id: songId,
      title: 'Test Song',
      isFavorite: true,
    });
    
    render(<FavoriteButton songId={songId} isFavorite={false} onFavoriteChange={onFavoriteChange} />);
    
    const button = screen.getByRole('button', { name: /Add to favorites/i });
    userEvent.click(button);
    
    await waitFor(() => {
      expect(mockSongService.toggleFavorite).toHaveBeenCalledWith(songId);
    });
    
    expect(onFavoriteChange).toHaveBeenCalledWith(true);
  });
  
  it('shows loading state when toggling favorite status', async () => {
    // Delay the resolution of toggleFavorite to see loading state
    mockSongService.toggleFavorite.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          id: songId,
          title: 'Test Song',
          isFavorite: true,
        }), 100)
      )
    );
    
    render(<FavoriteButton songId={songId} isFavorite={false} onFavoriteChange={onFavoriteChange} />);
    
    const button = screen.getByRole('button', { name: /Add to favorites/i });
    userEvent.click(button);
    
    // Button should be in loading state and disabled
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
  
  it('handles errors when toggling favorite fails', async () => {
    mockSongService.toggleFavorite.mockRejectedValue(new Error('Failed to toggle favorite'));
    
    // Mock console.error to prevent error output in test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(<FavoriteButton songId={songId} isFavorite={false} onFavoriteChange={onFavoriteChange} />);
    
    const button = screen.getByRole('button', { name: /Add to favorites/i });
    userEvent.click(button);
    
    // Wait for the toggle to be called
    await waitFor(() => {
      expect(mockSongService.toggleFavorite).toHaveBeenCalledWith(songId);
    });
    
    // Callback should not be called due to error
    expect(onFavoriteChange).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('disables button when songId is not provided', () => {
    render(<FavoriteButton songId="" isFavorite={false} onFavoriteChange={onFavoriteChange} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
  
  it('applies custom styles from props', () => {
    render(
      <FavoriteButton 
        songId={songId} 
        isFavorite={false} 
        onFavoriteChange={onFavoriteChange}
        size="lg"
        color="green.500"
        activeColor="red.500"
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-testid', 'favorite-button');
  });
}); 