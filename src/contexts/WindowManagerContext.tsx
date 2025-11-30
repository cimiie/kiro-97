'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface WindowInstance {
  id: string;
  component: ReactNode;
  title: string;
  isMinimized: boolean;
  zIndex: number;
}

interface WindowManagerState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  nextZIndex: number;
}

interface WindowManagerActions {
  openWindow: (component: ReactNode, title: string) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}

type WindowManagerContextType = WindowManagerState & WindowManagerActions;

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

const INITIAL_Z_INDEX = 1000;
const MAX_Z_INDEX = 9999;

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(INITIAL_Z_INDEX);

  // Normalize z-indices when approaching max to prevent overflow
  const normalizeZIndices = useCallback(() => {
    setWindows((prev) => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      return sorted.map((window, index) => ({
        ...window,
        zIndex: INITIAL_Z_INDEX + index,
      }));
    });
    setNextZIndex(INITIAL_Z_INDEX + windows.length);
  }, [windows.length]);

  const openWindow = useCallback((component: ReactNode, title: string): string => {
    const id = `window-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Check if we need to normalize z-indices
    if (nextZIndex >= MAX_Z_INDEX) {
      normalizeZIndices();
    }

    const newWindow: WindowInstance = {
      id,
      component,
      title,
      isMinimized: false,
      zIndex: nextZIndex,
    };

    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(id);
    setNextZIndex((prev) => prev + 1);

    return id;
  }, [nextZIndex, normalizeZIndices]);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    // Check if we need to normalize z-indices
    if (nextZIndex >= MAX_Z_INDEX) {
      normalizeZIndices();
    }

    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w))
    );
    setActiveWindowId(id);
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex, normalizeZIndices]);

  const focusWindow = useCallback((id: string) => {
    // Check if we need to normalize z-indices
    if (nextZIndex >= MAX_Z_INDEX) {
      normalizeZIndices();
    }

    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w))
    );
    setActiveWindowId(id);
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex, normalizeZIndices]);

  const value: WindowManagerContextType = {
    windows,
    activeWindowId,
    nextZIndex,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager(): WindowManagerContextType {
  const context = useContext(WindowManagerContext);
  if (context === undefined) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
}
