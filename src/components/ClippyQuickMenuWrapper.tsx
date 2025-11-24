'use client';

import { ReactNode, createContext, useContext } from 'react';
import ClippyQuickMenu from './ClippyQuickMenu';

interface ClippyQuickMenuWrapperProps {
  children: ReactNode;
  appName: string;
  onRequestHelp: (appName: string) => void;
  onShutdown: () => void;
}

const ClippyHelpContext = createContext<((appName: string) => void) | null>(null);

export function useClippyHelp() {
  return useContext(ClippyHelpContext);
}

export default function ClippyQuickMenuWrapper({
  children,
  appName,
  onRequestHelp,
  onShutdown,
}: ClippyQuickMenuWrapperProps) {
  const handleHelp = () => {
    onRequestHelp(appName);
  };

  return (
    <ClippyHelpContext.Provider value={onRequestHelp}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
        <ClippyQuickMenu appName={appName} onHelp={handleHelp} onShutdown={onShutdown} />
      </div>
    </ClippyHelpContext.Provider>
  );
}
