'use client';

import { useState, useEffect } from 'react';
import styles from './TokenController.module.css';

interface TokenControllerProps {
  onTokenLimitChange: (limit: number) => void;
  onMaxResponseLengthChange: (length: number) => void;
  tokensUsed: number;
  onResetUsage: () => void;
}

const DEFAULT_TOKEN_LIMIT = 10000;
const DEFAULT_MAX_RESPONSE_LENGTH = 1000;
const DEFAULT_WARNING_THRESHOLD = 0.8; // 80%

// Load initial values from localStorage
function getInitialTokenLimit(): number {
  if (typeof window === 'undefined') return DEFAULT_TOKEN_LIMIT;
  const saved = localStorage.getItem('clippy_token_limit');
  return saved ? parseInt(saved, 10) : DEFAULT_TOKEN_LIMIT;
}

function getInitialMaxResponseLength(): number {
  if (typeof window === 'undefined') return DEFAULT_MAX_RESPONSE_LENGTH;
  const saved = localStorage.getItem('clippy_max_response_length');
  return saved ? parseInt(saved, 10) : DEFAULT_MAX_RESPONSE_LENGTH;
}

export default function TokenController({
  onTokenLimitChange,
  onMaxResponseLengthChange,
  tokensUsed,
  onResetUsage,
}: TokenControllerProps) {
  const [tokenLimit, setTokenLimit] = useState(getInitialTokenLimit);
  const [maxResponseLength, setMaxResponseLength] = useState(getInitialMaxResponseLength);
  const [warningThreshold] = useState(DEFAULT_WARNING_THRESHOLD);
  const [isOpen, setIsOpen] = useState(false);

  // Notify parent of initial values on mount
  useEffect(() => {
    onTokenLimitChange(tokenLimit);
    onMaxResponseLengthChange(maxResponseLength);
  }, [onTokenLimitChange, onMaxResponseLengthChange, tokenLimit, maxResponseLength]);

  const handleTokenLimitChange = (value: number) => {
    setTokenLimit(value);
    localStorage.setItem('clippy_token_limit', value.toString());
    onTokenLimitChange(value);
  };

  const handleMaxResponseLengthChange = (value: number) => {
    setMaxResponseLength(value);
    localStorage.setItem('clippy_max_response_length', value.toString());
    onMaxResponseLengthChange(value);
  };

  const handleReset = () => {
    onResetUsage();
  };

  const usagePercentage = (tokensUsed / tokenLimit) * 100;
  const isNearLimit = usagePercentage >= warningThreshold * 100;
  const isLimitExceeded = tokensUsed >= tokenLimit;

  return (
    <div className={styles.tokenController}>
      <button
        className={`${styles.toggleButton} ${isNearLimit ? styles.warning : ''} ${
          isLimitExceeded ? styles.exceeded : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title="Token Usage Settings"
      >
        <span className={styles.tokenIcon}>⚙️</span>
        <span className={styles.tokenText}>
          {tokensUsed} / {tokenLimit}
        </span>
      </button>

      {isOpen && (
        <div className={styles.settingsPanel}>
          <div className={styles.titleBar}>
            <span className={styles.title}>Token Controller</span>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className={styles.content}>
            {/* Usage Statistics */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Usage Statistics</h3>
              
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Tokens Used:</span>
                <span className={styles.statValue}>{tokensUsed.toLocaleString()}</span>
              </div>

              <div className={styles.statRow}>
                <span className={styles.statLabel}>Token Limit:</span>
                <span className={styles.statValue}>{tokenLimit.toLocaleString()}</span>
              </div>

              <div className={styles.statRow}>
                <span className={styles.statLabel}>Remaining:</span>
                <span className={styles.statValue}>
                  {Math.max(0, tokenLimit - tokensUsed).toLocaleString()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className={styles.progressBarContainer}>
                <div
                  className={`${styles.progressBar} ${
                    isLimitExceeded ? styles.exceeded : isNearLimit ? styles.warning : ''
                  }`}
                  style={{ width: `${Math.min(100, usagePercentage)}%` }}
                />
              </div>

              {/* Warning Messages */}
              {isLimitExceeded && (
                <div className={styles.alert}>
                  ⚠️ Token limit exceeded! New requests are blocked.
                </div>
              )}

              {isNearLimit && !isLimitExceeded && (
                <div className={styles.warning}>
                  ⚠️ Warning: Approaching token limit ({usagePercentage.toFixed(0)}%)
                </div>
              )}

              <button className={styles.resetButton} onClick={handleReset}>
                Reset Usage
              </button>
            </div>

            {/* Token Limit Setting */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Token Limit</h3>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  className={styles.input}
                  value={tokenLimit}
                  onChange={(e) => handleTokenLimitChange(parseInt(e.target.value, 10) || 0)}
                  min="100"
                  max="100000"
                  step="100"
                />
                <span className={styles.inputLabel}>tokens</span>
              </div>
              <div className={styles.hint}>
                Maximum total tokens allowed for all requests
              </div>
            </div>

            {/* Max Response Length Setting */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Max Response Length</h3>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  className={styles.input}
                  value={maxResponseLength}
                  onChange={(e) =>
                    handleMaxResponseLengthChange(parseInt(e.target.value, 10) || 0)
                  }
                  min="50"
                  max="4000"
                  step="50"
                />
                <span className={styles.inputLabel}>tokens</span>
              </div>
              <div className={styles.hint}>
                Maximum tokens per individual response
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
