'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import AppWithClippyHelper from '@/components/AppWithClippyHelper';

interface ClippyHelperContextType {
  wrapAppWithHelper: (app: JSX.Element, appName: string) => JSX.Element;
  requestHelp: (appName: string) => void;
}

const ClippyHelperContext = createContext<ClippyHelperContextType | undefined>(undefined);

interface ClippyHelperProviderProps {
  children: ReactNode;
  onHelpRequest: (appName: string) => void;
  onShutdown: () => void;
}

export function ClippyHelperProvider({ children, onHelpRequest, onShutdown }: ClippyHelperProviderProps) {
  const wrapAppWithHelper = useCallback((app: JSX.Element, appName: string) => {
    return (
      <AppWithClippyHelper appName={appName} onRequestHelp={onHelpRequest} onShutdown={onShutdown}>
        {app}
      </AppWithClippyHelper>
    );
  }, [onHelpRequest, onShutdown]);

  const requestHelp = useCallback((appName: string) => {
    onHelpRequest(appName);
  }, [onHelpRequest]);

  return (
    <ClippyHelperContext.Provider value={{ wrapAppWithHelper, requestHelp }}>
      {children}
    </ClippyHelperContext.Provider>
  );
}

export function useClippyHelper() {
  const context = useContext(ClippyHelperContext);
  if (!context) {
    throw new Error('useClippyHelper must be used within ClippyHelperProvider');
  }
  return context;
}
