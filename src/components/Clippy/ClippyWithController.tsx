'use client';

import { useCallback, useRef } from 'react';
import ClippyAssistant from './ClippyAssistant';
import TokenController from '../dev/TokenController';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import { useTokenContext } from '@/contexts/TokenContext';
import MinesweeperApp from '@/apps/BombSweeper/BombSweeper';
import NotepadApp from '@/apps/WordWrite/WordWrite';
import DoomApp from '@/apps/Gloom/Gloom';
import MockBrowser from '@/apps/WebFinder/WebFinder';

interface ClippyWithControllerProps {
  helpContext?: string | null;
  onHelpContextHandled?: () => void;
  onShutdown?: () => void;
}

const MAX_RESPONSE_LENGTH = 1000; // Fixed max response length

export default function ClippyWithController({
  helpContext,
  onHelpContextHandled,
  onShutdown,
}: ClippyWithControllerProps) {
  const clippyRef = useRef<{ openChatWithContext: (context: string) => void } | null>(null);
  const { openWindow } = useWindowManager();

  // Use global token context
  const { tokensUsed, sessionLimit, handleTokenUsage } = useTokenContext();





  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'play-gloom':
        openWindow(<DoomApp onClose={() => {}} />, 'Gloom');
        break;
      case 'browse-web':
        openWindow(<MockBrowser />, 'Web Finder');
        break;
      case 'launch-bombsweeper':
        openWindow(<MinesweeperApp />, 'Bomb Sweeper');
        break;
      case 'launch-wordwrite':
        openWindow(<NotepadApp />, 'WordWrite');
        break;
      default:
        console.log('Unknown quick action:', actionId);
    }
  }, [openWindow]);

  return (
    <>
      <TokenController
        tokensUsed={tokensUsed}
        sessionLimit={sessionLimit}
      />
      <ClippyAssistant
        ref={clippyRef}
        maxResponseLength={MAX_RESPONSE_LENGTH}
        onTokenUsage={handleTokenUsage}
        onQuickAction={handleQuickAction}
        helpContext={helpContext}
        onHelpContextHandled={onHelpContextHandled}
        onShutdown={onShutdown}
        sessionTokensUsed={tokensUsed}
      />
    </>
  );
}
