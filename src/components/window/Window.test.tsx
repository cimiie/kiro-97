import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Window from './Window';

describe('Window', () => {
  const defaultProps = {
    id: 'test-window',
    title: 'Test Window',
    initialPosition: { x: 100, y: 100 },
    initialSize: { width: 400, height: 300 },
    onClose: vi.fn(),
    onMinimize: vi.fn(),
    onFocus: vi.fn(),
    zIndex: 1000,
    isMinimized: false,
  };

  it('renders window with title', () => {
    render(
      <Window {...defaultProps}>
        <div>Window Content</div>
      </Window>
    );

    expect(screen.getByText('Test Window')).toBeInTheDocument();
    expect(screen.getByText('Window Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Window {...defaultProps} onClose={onClose}>
        <div>Content</div>
      </Window>
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onMinimize when minimize button is clicked', () => {
    const onMinimize = vi.fn();
    render(
      <Window {...defaultProps} onMinimize={onMinimize}>
        <div>Content</div>
      </Window>
    );

    const minimizeButton = screen.getByLabelText('Minimize');
    fireEvent.click(minimizeButton);

    expect(onMinimize).toHaveBeenCalledTimes(1);
  });

  it('calls onFocus when window is clicked', () => {
    const onFocus = vi.fn();
    render(
      <Window {...defaultProps} onFocus={onFocus}>
        <div>Content</div>
      </Window>
    );

    const windowElement = screen.getByText('Content').closest('[data-window-id]');
    if (windowElement) {
      fireEvent.mouseDown(windowElement);
    }

    expect(onFocus).toHaveBeenCalled();
  });

  it('does not render when minimized', () => {
    render(
      <Window {...defaultProps} isMinimized={true}>
        <div>Content</div>
      </Window>
    );

    expect(screen.queryByText('Test Window')).not.toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('applies correct z-index', () => {
    const { container } = render(
      <Window {...defaultProps} zIndex={1500}>
        <div>Content</div>
      </Window>
    );

    const windowElement = container.querySelector('[data-window-id]') as HTMLElement;
    expect(windowElement?.style.zIndex).toBe('1500');
  });

  it('positions window at initial coordinates', () => {
    const { container } = render(
      <Window {...defaultProps} initialPosition={{ x: 200, y: 150 }}>
        <div>Content</div>
      </Window>
    );

    const windowElement = container.querySelector('[data-window-id]') as HTMLElement;
    expect(windowElement?.style.left).toBe('200px');
    expect(windowElement?.style.top).toBe('150px');
  });

  it('sets initial size', () => {
    const { container } = render(
      <Window {...defaultProps} initialSize={{ width: 500, height: 400 }}>
        <div>Content</div>
      </Window>
    );

    const windowElement = container.querySelector('[data-window-id]') as HTMLElement;
    expect(windowElement?.style.width).toBe('500px');
    expect(windowElement?.style.height).toBe('400px');
  });
});
