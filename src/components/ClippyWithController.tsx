'use client';

import { useState, useCallback, useRef } from 'react';
import ClippyAssistant from './ClippyAssistant';
import TokenController from './TokenController';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import MinesweeperApp from '@/apps/MinesweeperApp';
import NotepadApp from '@/apps/NotepadApp';
import DoomApp from '@/apps/DoomApp';
import MockBrowser from '@/apps/MockBrowser';

interface ClippyWithControllerProps {
  helpContext?: string | null;
  onHelpContextHandled?: () => void;
}

export default function ClippyWithController({ helpContext, onHelpContextHandled }: ClippyWithControllerProps) {
  const [maxResponseLength, setMaxResponseLength] = useState(1000);
  const [tokensUsed, setTokensUsed] = useState(0);
  const clippyRef = useRef<{ openChatWithContext: (context: string) => void } | null>(null);
  const { openWindow } = useWindowManager();

  const handleTokenUsage = useCallback((tokens: number) => {
    setTokensUsed((prev) => prev + tokens);
  }, []);

  const handleResetUsage = useCallback(() => {
    setTokensUsed(0);
  }, []);

  const handleTokenLimitChange = useCallback((_limit: number) => {
    // Token limit is managed by TokenController component
  }, []);

  const handleMaxResponseLengthChange = useCallback((length: number) => {
    setMaxResponseLength(length);
  }, []);





  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'play-doom':
        openWindow(<DoomApp onClose={() => {}} />, 'Doom');
        break;
      case 'browse-internet':
        openWindow(<MockBrowser />, 'Internet Explorer');
        break;
      case 'launch-minesweeper':
        openWindow(<MinesweeperApp />, 'Minesweeper');
        break;
      case 'launch-notepad':
        openWindow(<NotepadApp />, 'Notepad');
        break;
      default:
        console.log('Unknown quick action:', actionId);
    }
  }, [openWindow]);

  return (
    <>
      <TokenController
        onTokenLimitChange={handleTokenLimitChange}
        onMaxResponseLengthChange={handleMaxResponseLengthChange}
        tokensUsed={tokensUsed}
        onResetUsage={handleResetUsage}
      />
      <ClippyAssistant
        ref={clippyRef}
        maxResponseLength={maxResponseLength}
        onTokenUsage={handleTokenUsage}
        onQuickAction={handleQuickAction}
        helpContext={helpContext}
        onHelpContextHandled={onHelpContextHandled}
      />
    </>
  );
}
