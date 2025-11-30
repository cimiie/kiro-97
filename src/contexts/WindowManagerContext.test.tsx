import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WindowManagerProvider, useWindowManager } from './WindowManagerContext';

describe('WindowManagerContext', () => {
  it('opens a new window', () => {
    const { result } = renderHook(() => useWindowManager(), {
      wrapper: WindowManagerProvider,
    });

    act(() => {
      result.current.openWindow(<div>Test Content</div>, 'Test Window');
    });

    expect(result.current.windows).toHaveLength(1);
    expect(result.current.windows[0].title).toBe('Test Window');
    expect(result.current.windows[0].isMinimized).toBe(false);
  });

  it('closes a window', () => {
    const { result } = renderHook(() => useWindowManager(), {
      wrapper: WindowManagerProvider,
    });

    let windowId: string;

    act(() => {
      windowId = result.current.openWindow(<div>Test</div>, 'Test');
    });

    expect(result.current.windows).toHaveLength(1);

    act(() => {
      result.current.closeWindow(windowId);
    });

    expect(result.current.windows).toHaveLength(0);
  });

  it('minimizes a window', () => {
    const { result } = renderHook(() => useWindowManager(), {
      wrapper: WindowManagerProvider,
    });

    let windowId: string;

    act(() => {
      windowId = result.current.openWindow(<div>Test</div>, 'Test');
    });

    act(() => {
      result.current.minimizeWindow(windowId);
    });

    expect(result.current.windows[0].isMinimized).toBe(true);
  });

  it('restores a minimized window', () => {
    const { result } = renderHook(() => useWindowManager(), {
      wrapper: WindowManagerProvider,
    });

    let windowId: string;

    act(() => {
      windowId = result.current.openWindow(<div>Test</div>, 'Test');
    });

    act(() => {
      result.current.minimizeWindow(windowId);
    });

    expect(result.current.windows[0].isMinimized).toBe(true);

    act(() => {
      result.current.restoreWindow(windowId);
    });

    expect(result.current.windows[0].isMinimized).toBe(false);
  });

  it('focuses a window and increases its z-index', () => {
    const { result } = renderHook(() => useWindowManager(), {
      wrapper: WindowManagerProvider,
    });

    let windowId1: string = '';

    act(() => {
      windowId1 = result.current.openWindow(<div>Test 1</div>, 'Test 1');
    });

    const initialZIndex1 = result.current.windows[0].zIndex;

    act(() => {
      result.current.openWindow(<div>Test 2</div>, 'Test 2');
    });

    const initialZIndex2 = result.current.windows[1].zIndex;

    expect(initialZIndex2).toBeGreaterThan(initialZIndex1);

    act(() => {
      result.current.focusWindow(windowId1);
    });

    const newZIndex1 = result.current.windows[0].zIndex;
    expect(newZIndex1).toBeGreaterThan(initialZIndex2);
    expect(result.current.activeWindowId).toBe(windowId1);
  });

  it('manages multiple windows', () => {
    const { result } = renderHook(() => useWindowManager(), {
      wrapper: WindowManagerProvider,
    });

    act(() => {
      result.current.openWindow(<div>Window 1</div>, 'Window 1');
      result.current.openWindow(<div>Window 2</div>, 'Window 2');
      result.current.openWindow(<div>Window 3</div>, 'Window 3');
    });

    expect(result.current.windows).toHaveLength(3);
    expect(result.current.windows[0].title).toBe('Window 1');
    expect(result.current.windows[1].title).toBe('Window 2');
    expect(result.current.windows[2].title).toBe('Window 3');
  });
});
