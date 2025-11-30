import { useState, useCallback, useEffect } from 'react';

interface UseTokenControllerOptions {
  sessionLimit?: number;
  storageKey?: string;
}

interface UseTokenControllerReturn {
  tokensUsed: number;
  sessionLimit: number;
  handleTokenUsage: (tokens: number) => void;
  resetTokens: () => void;
  isOverLimit: boolean;
  remainingTokens: number;
}

const DEFAULT_SESSION_LIMIT = 10000;

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
function getSessionTokenUsage(storageKey: string): number {
  if (typeof window === 'undefined') return 0;
  
  const sessionId = getSessionId();
  const stored = localStorage.getItem(`${storageKey}_${sessionId}`);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Hook for managing token usage tracking with session-based persistence
 * 
 * @param options - Configuration options
 * @param options.sessionLimit - Maximum tokens allowed per session (default: 10000)
 * @param options.storageKey - Key prefix for localStorage (default: 'clippy_tokens')
 * 
 * @returns Token controller state and methods
 */
export function useTokenController({
  sessionLimit = DEFAULT_SESSION_LIMIT,
  storageKey = 'clippy_tokens',
}: UseTokenControllerOptions = {}): UseTokenControllerReturn {
  const [tokensUsed, setTokensUsed] = useState(() => getSessionTokenUsage(storageKey));

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
        localStorage.setItem(`${storageKey}_${sessionId}`, newTotal.toString());
      }
      
      return newTotal;
    });
  }, [storageKey]);

  const resetTokens = useCallback(() => {
    setTokensUsed(0);
    if (typeof window !== 'undefined') {
      const sessionId = getSessionId();
      localStorage.removeItem(`${storageKey}_${sessionId}`);
    }
  }, [storageKey]);

  const isOverLimit = tokensUsed >= sessionLimit;
  const remainingTokens = Math.max(0, sessionLimit - tokensUsed);

  return {
    tokensUsed,
    sessionLimit,
    handleTokenUsage,
    resetTokens,
    isOverLimit,
    remainingTokens,
  };
}
