import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Clock from './Clock';

describe('Clock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays time in HH:MM format', () => {
    const mockDate = new Date('2024-01-15T14:30:00');
    vi.setSystemTime(mockDate);

    render(<Clock />);
    
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  it('shows tooltip with full date/time on click', () => {
    const mockDate = new Date('2024-01-15T14:30:00');
    vi.setSystemTime(mockDate);

    render(<Clock />);
    
    const clockButton = screen.getByLabelText('System clock');
    fireEvent.click(clockButton);
    
    // Tooltip should appear with full date/time
    const tooltip = screen.getByText(/2024/);
    expect(tooltip).toBeInTheDocument();
  });

  it('toggles tooltip on multiple clicks', () => {
    const mockDate = new Date('2024-01-15T14:30:00');
    vi.setSystemTime(mockDate);

    render(<Clock />);
    
    const clockButton = screen.getByLabelText('System clock');
    
    // First click - show tooltip
    fireEvent.click(clockButton);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
    
    // Second click - hide tooltip
    fireEvent.click(clockButton);
    expect(screen.queryByText(/2024/)).not.toBeInTheDocument();
  });
});
