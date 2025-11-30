'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ClippyAssistant from './ClippyAssistant';
import TokenController from '../dev/TokenController';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import MinesweeperApp from '@/apps/BombSweeper/BombSweeper';
import NotepadApp from '@/apps/WordWrite/WordWrite';
import DoomApp from '@/apps/Gloom/Gloom';
import MockBrowser from '@/apps/WebFinder/WebFinder';

interface ClippyWithControllerProps {
  helpContext?: string | null;
  onHelpContextHandled?: () => void;
  onShutdown?: () => void;
}

const SESSION_TOKEN_LIMIT = 10000; // 10k tokens per session
const MAX_RESPONSE_LENGTH = 1000; // Fixed max response length

// Get session ID or create new one
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('clippy_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('clippy_session_id', sessionId);
  }
  return sessionId;
}

// Load token usage for current session
function getSessionTokenUsage(): number {
  if (typeof window === 'undefined') return 0;
  
  const sessionId = getSessionId();
  const stored = localStorage.getItem(`clippy_tokens_${sessionId}`);
  return stored ? parseInt(stored, 10) : 0;
}

export default function ClippyWithController({ helpContext, onHelpContextHandled, onShutdown }: ClippyWithControllerProps) {
  const [tokensUsed, setTokensUsed] = useState(getSessionTokenUsage);
  const clippyRef = useRef<{ openChatWithContext: (context: string) => void } | null>(null);
  const { openWindow } = useWindowManager();

  // Initialize session on mount
  useEffect(() => {
    getSessionId();
  }, []);

  const handleTokenUsage = useCallback((tokens: number) => {
    setTokensUsed((prev) => {
      const newTotal = prev + tokens;
      
      // Save to localStorage with session ID
      if (typeof window !== 'undefined') {
        const sessionId = getSessionId();
        localStorage.setItem(`clippy_tokens_${sessionId}`, newTotal.toString());
      }
      
      return newTotal;
    });
  }, []);





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
        sessionLimit={SESSION_TOKEN_LIMIT}
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
