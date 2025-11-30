'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface TokenContextValue {
  tokensUsed: number;
  sessionLimit: number;
  handleTokenUsage: (tokens: number) => void;
  resetTokens: () => void;
  isOverLimit: boolean;
  remainingTokens: number;
}

const TokenContext = createContext<TokenContextValue | undefined>(undefined);

const DEFAULT_SESSION_LIMIT = 10000;
const STORAGE_KEY = 'global_clippy_tokens';

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
  const stored = localStorage.getItem(`${STORAGE_KEY}_${sessionId}`);
  return stored ? parseInt(stored, 10) : 0;
}

interface TokenProviderProps {
  children: ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
  const [tokensUsed, setTokensUsed] = useState(() => getSessionTokenUsage());

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
        localStorage.setItem(`${STORAGE_KEY}_${sessionId}`, newTotal.toString());
      }
      
      return newTotal;
    });
  }, []);

  const resetTokens = useCallback(() => {
    setTokensUsed(0);
    if (typeof window !== 'undefined') {
      const sessionId = getSessionId();
      localStorage.removeItem(`${STORAGE_KEY}_${sessionId}`);
    }
  }, []);

  const isOverLimit = tokensUsed >= DEFAULT_SESSION_LIMIT;
  const remainingTokens = Math.max(0, DEFAULT_SESSION_LIMIT - tokensUsed);

  const value: TokenContextValue = {
    tokensUsed,
    sessionLimit: DEFAULT_SESSION_LIMIT,
    handleTokenUsage,
    resetTokens,
    isOverLimit,
    remainingTokens,
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokenContext must be used within a TokenProvider');
  }
  return context;
}
