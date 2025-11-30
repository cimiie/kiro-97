import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home Page', () => {
  it('renders the power button initially', () => {
    render(<Home />);
    expect(screen.getByText('Press power button to start')).toBeInTheDocument();
    expect(screen.getByLabelText('Power On')).toBeInTheDocument();
  });

  it('shows boot screen after clicking power button', () => {
    render(<Home />);
    
    const powerButton = screen.getByLabelText('Power On');
    fireEvent.click(powerButton);
    
    expect(screen.getByText('Kiro 97')).toBeInTheDocument();
    // Check that we're no longer on the power screen
    expect(screen.queryByText('Press power button to start')).not.toBeInTheDocument();
  });
});
