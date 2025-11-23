import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home Page', () => {
  it('renders the desktop environment', () => {
    const { container } = render(<Home />);
    const desktop = container.querySelector('[class*="desktop"]');
    expect(desktop).toBeInTheDocument();
  });

  it('renders desktop icons', () => {
    render(<Home />);
    expect(screen.getByText('My Computer')).toBeInTheDocument();
    expect(screen.getByText('Recycle Bin')).toBeInTheDocument();
    expect(screen.getByText('Internet Explorer')).toBeInTheDocument();
  });
});
