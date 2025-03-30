import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarIcon } from '@chakra-ui/icons';
import EmptyState, { EmptyStateType } from './EmptyState';

describe('EmptyState Component', () => {
  const defaultProps = {
    title: 'No Data Found',
    message: 'There is no data available at this time.',
  };
  
  const mockAction = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title and message', () => {
    render(<EmptyState {...defaultProps} />);
    
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('renders with the default InfoIcon for data type', () => {
    render(<EmptyState {...defaultProps} type="data" />);
    
    // Check that the icon container is present
    const iconElement = screen.getByTestId('empty-state-icon');
    expect(iconElement).toBeInTheDocument();
  });

  it('renders with SearchIcon for search type', () => {
    render(<EmptyState {...defaultProps} type="search" />);
    
    // Check that the icon container is present
    const iconElement = screen.getByTestId('empty-state-icon');
    expect(iconElement).toBeInTheDocument();
  });

  it('renders with AddIcon for content type', () => {
    render(<EmptyState {...defaultProps} type="content" />);
    
    // Check that the icon container is present
    const iconElement = screen.getByTestId('empty-state-icon');
    expect(iconElement).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(<EmptyState {...defaultProps} icon={StarIcon} />);
    
    // Check that the icon container is present
    const iconElement = screen.getByTestId('empty-state-icon');
    expect(iconElement).toBeInTheDocument();
  });

  it('renders action button and calls handler when clicked', () => {
    render(
      <EmptyState 
        {...defaultProps} 
        actionLabel="Try Again" 
        onAction={mockAction} 
      />
    );
    
    const actionButton = screen.getByTestId('empty-state-action');
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveTextContent('Try Again');
    
    // Click the action button
    fireEvent.click(actionButton);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when no handler is provided', () => {
    render(
      <EmptyState 
        {...defaultProps} 
        actionLabel="Try Again" 
      />
    );
    
    expect(screen.queryByTestId('empty-state-action')).not.toBeInTheDocument();
  });

  it('does not render action button when no label is provided', () => {
    render(
      <EmptyState 
        {...defaultProps} 
        onAction={mockAction} 
      />
    );
    
    expect(screen.queryByTestId('empty-state-action')).not.toBeInTheDocument();
  });

  it('applies custom minimum height when provided', () => {
    const customMinHeight = '400px';
    render(
      <EmptyState 
        {...defaultProps} 
        minHeight={customMinHeight} 
      />
    );
    
    const container = screen.getByTestId('empty-state');
    expect(container).toHaveStyle(`min-height: ${customMinHeight}`);
  });

  it('renders with all available EmptyStateType values', () => {
    const types: EmptyStateType[] = ['search', 'data', 'content', 'custom'];
    
    types.forEach(type => {
      const { unmount } = render(
        <EmptyState 
          title={`${type} empty state`} 
          message={`This is an empty state of type ${type}`}
          type={type}
        />
      );
      
      expect(screen.getByText(`${type} empty state`)).toBeInTheDocument();
      unmount();
    });
  });
}); 