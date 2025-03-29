import React from 'react';
import { render, screen } from '../../test-utils/testing-library-utils';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies primary variant styles by default', () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByRole('button');
    
    // Check for Chakra blue colorScheme class
    expect(button).toHaveClass('chakra-button');
    expect(button).not.toHaveClass('chakra-button--outline');
  });

  test('applies outline variant styles when specified', () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('chakra-button');
    expect(button).toHaveClass('chakra-button--outline');
  });

  test('applies different sizes when specified', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('chakra-button--lg');
  });

  test('is disabled when disabled prop is provided', () => {
    render(<Button isDisabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
  });
}); 