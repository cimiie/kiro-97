'use client';

import { useEffect } from 'react';
import styles from './TokenController.module.css';

interface TokenControllerProps {
  tokensUsed: number;
  sessionLimit: number;
  inline?: boolean;
}

export default function TokenController({
  tokensUsed,
  sessionLimit,
  inline = false,
}: TokenControllerProps) {
  const usagePercentage = (tokensUsed / sessionLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isLimitExceeded = tokensUsed >= sessionLimit;

  // Save token usage to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('clippy_session_tokens', tokensUsed.toString());
    }
  }, [tokensUsed]);

  return (
    <div className={inline ? styles.tokenControllerInline : styles.tokenController}>
      <div
        className={`${styles.display} ${isNearLimit ? styles.warning : ''} ${
          isLimitExceeded ? styles.exceeded : ''
        }`}
        title={`Token Usage: ${tokensUsed.toLocaleString()} / ${sessionLimit.toLocaleString()}`}
      >
        <span className={styles.label}>Tokens:</span>
        <span className={styles.value}>
          {tokensUsed.toLocaleString()} / {sessionLimit.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
