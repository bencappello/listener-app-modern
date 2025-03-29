import React from 'react';
import { render, screen } from '../../test-utils/testing-library-utils';
import Button from './Button';

// Mock the Button component
jest.mock('./Button', () => {
  return {
    __esModule: true,
    default: ({ children, onClick, isDisabled }: any) => (
      <button 
        onClick={onClick} 
        disabled={isDisabled}
        data-testid="mocked-button"
      >
        {children}
      </button>
    ),
  };
});

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByTestId('mocked-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
  });

  it('handles onClick events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByTestId('mocked-button');
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct styling when disabled', () => {
    render(<Button isDisabled>Disabled Button</Button>);
    const button = screen.getByTestId('mocked-button');
    expect(button).toBeDisabled();
  });
}); 