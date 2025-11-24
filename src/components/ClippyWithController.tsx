'use client';

import { useState, useCallback } from 'react';
import ClippyAssistant from './ClippyAssistant';
import TokenController from './TokenController';

export default function ClippyWithController() {
  const [maxResponseLength, setMaxResponseLength] = useState(1000);
  const [tokensUsed, setTokensUsed] = useState(0);

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

  return (
    <>
      <TokenController
        onTokenLimitChange={handleTokenLimitChange}
        onMaxResponseLengthChange={handleMaxResponseLengthChange}
        tokensUsed={tokensUsed}
        onResetUsage={handleResetUsage}
      />
      <ClippyAssistant
        maxResponseLength={maxResponseLength}
        onTokenUsage={handleTokenUsage}
      />
    </>
  );
}
