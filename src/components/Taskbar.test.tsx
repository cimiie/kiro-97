import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Taskbar from './Taskbar';
import { WindowInstance } from '@/contexts/WindowManagerContext';

describe('Taskbar', () => {
  it('renders the Start button', () => {
    render(
      <Taskbar 
        windows={[]} 
        onWindowClick={vi.fn()} 
        menuItems={[]}
      />
    );
    
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('renders window buttons for each window', () => {
    const windows: WindowInstance[] = [
      {
        id: 'window-1',
        title: 'Test Window 1',
        component: <div>Content 1</div>,
        isMinimized: false,
        zIndex: 1000
      },
      {
        id: 'window-2',
        title: 'Test Window 2',
        component: <div>Content 2</div>,
        isMinimized: false,
        zIndex: 1001
      }
    ];

    render(
      <Taskbar 
        windows={windows} 
        onWindowClick={vi.fn()} 
        menuItems={[]}
      />
    );
    
    expect(screen.getByText('Test Window 1')).toBeInTheDocument();
    expect(screen.getByText('Test Window 2')).toBeInTheDocument();
  });

  it('renders the clock in system tray', () => {
    render(
      <Taskbar 
        windows={[]} 
        onWindowClick={vi.fn()} 
        menuItems={[]}
      />
    );
    
    // Clock should be present (it will show time in HH:MM format)
    const clock = screen.getByLabelText('System clock');
    expect(clock).toBeInTheDocument();
  });
});
