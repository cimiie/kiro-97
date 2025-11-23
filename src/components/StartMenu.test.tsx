import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StartMenu, { MenuItem } from './StartMenu';

describe('StartMenu', () => {
  const mockMenuItems: MenuItem[] = [
    {
      id: 'programs',
      label: 'Programs',
      icon: '📁',
      subItems: [
        {
          id: 'notepad',
          label: 'Notepad',
          icon: '📝',
          action: vi.fn()
        }
      ]
    },
    {
      id: 'shutdown',
      label: 'Shut Down...',
      icon: '🔌',
      action: vi.fn()
    }
  ];

  it('does not render when closed', () => {
    render(
      <StartMenu 
        isOpen={false} 
        onClose={vi.fn()} 
        menuItems={mockMenuItems} 
      />
    );
    
    expect(screen.queryByText('Programs')).not.toBeInTheDocument();
  });

  it('renders menu items when open', () => {
    render(
      <StartMenu 
        isOpen={true} 
        onClose={vi.fn()} 
        menuItems={mockMenuItems} 
      />
    );
    
    expect(screen.getByText('Programs')).toBeInTheDocument();
    expect(screen.getByText('Shut Down...')).toBeInTheDocument();
  });

  it('shows submenu on hover', () => {
    render(
      <StartMenu 
        isOpen={true} 
        onClose={vi.fn()} 
        menuItems={mockMenuItems} 
      />
    );
    
    const programsItem = screen.getByText('Programs');
    const menuItemContainer = programsItem.parentElement?.parentElement;
    
    if (menuItemContainer) {
      fireEvent.mouseEnter(menuItemContainer);
    }
    
    expect(screen.getByText('Notepad')).toBeInTheDocument();
  });

  it('calls action and closes menu when item is clicked', () => {
    const onClose = vi.fn();
    const action = vi.fn();
    
    const items: MenuItem[] = [
      {
        id: 'test',
        label: 'Test Item',
        action
      }
    ];

    render(
      <StartMenu 
        isOpen={true} 
        onClose={onClose} 
        menuItems={items} 
      />
    );
    
    fireEvent.click(screen.getByText('Test Item'));
    
    expect(action).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
