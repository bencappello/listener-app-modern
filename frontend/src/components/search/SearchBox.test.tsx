import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import SearchBox from './SearchBox';

describe('SearchBox Component', () => {
  const mockOnSearch = jest.fn();
  const mockOnClear = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders with placeholder text', () => {
    render(
      <SearchBox 
        placeholder="Search for music" 
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );
    
    expect(screen.getByPlaceholderText('Search for music')).toBeInTheDocument();
  });
  
  it('calls onSearch when submit button is clicked', () => {
    render(
      <SearchBox 
        placeholder="Search for music" 
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );
    
    const input = screen.getByPlaceholderText('Search for music');
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    userEvent.type(input, 'test query');
    userEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });
  
  it('calls onSearch when Enter key is pressed', () => {
    render(
      <SearchBox 
        placeholder="Search for music" 
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );
    
    const input = screen.getByPlaceholderText('Search for music');
    
    userEvent.type(input, 'test query');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });
  
  it('calls onClear when clear button is clicked', () => {
    render(
      <SearchBox 
        placeholder="Search for music" 
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        defaultValue="initial query"
      />
    );
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    
    userEvent.click(clearButton);
    
    expect(mockOnClear).toHaveBeenCalled();
    
    // The input should be cleared
    const input = screen.getByPlaceholderText('Search for music');
    expect(input).toHaveValue('');
  });
  
  it('does not show clear button when input is empty', () => {
    render(
      <SearchBox 
        placeholder="Search for music" 
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );
    
    // Clear button should not be present initially
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    
    // Type something to make the clear button appear
    const input = screen.getByPlaceholderText('Search for music');
    userEvent.type(input, 'a');
    
    // Now the clear button should be present
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    
    // Clear the input
    userEvent.clear(input);
    
    // The clear button should disappear again
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });
  
  it('displays the search button as disabled when input is empty and disableEmptySearch is true', () => {
    render(
      <SearchBox 
        placeholder="Search for music" 
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        disableEmptySearch={true}
      />
    );
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
    
    // Type something to enable the button
    const input = screen.getByPlaceholderText('Search for music');
    userEvent.type(input, 'test');
    
    // Button should be enabled now
    expect(searchButton).not.toBeDisabled();
  });
  
  it('applies custom styles when provided', () => {
    render(
      <SearchBox 
        placeholder="Search for music" 
        onSearch={mockOnSearch}
        onClear={mockOnClear}
        size="lg"
        width="500px"
        colorScheme="blue"
      />
    );
    
    const inputGroup = screen.getByRole('group');
    expect(inputGroup).toHaveStyle({ width: '500px' });
  });
}); 