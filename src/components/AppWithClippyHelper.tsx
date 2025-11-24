'use client';

import { ReactNode, createContext, useContext } from 'react';
import AppClippyHelper from './AppClippyHelper';

interface AppWithClippyHelperProps {
  children: ReactNode;
  appName: string;
  onRequestHelp: (appName: string) => void;
  onShutdown: () => void;
}

const ClippyHelpContext = createContext<((appName: string) => void) | null>(null);

export function useClippyHelp() {
  return useContext(ClippyHelpContext);
}

export default function AppWithClippyHelper({
  children,
  appName,
  onRequestHelp,
  onShutdown,
}: AppWithClippyHelperProps) {
  const handleHelp = () => {
    onRequestHelp(appName);
  };

  return (
    <ClippyHelpContext.Provider value={onRequestHelp}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
        <AppClippyHelper appName={appName} onHelp={handleHelp} onShutdown={onShutdown} />
      </div>
    </ClippyHelpContext.Provider>
  );
}
