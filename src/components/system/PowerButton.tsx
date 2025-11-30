'use client';

import styles from './PowerButton.module.css';

interface PowerButtonProps {
  onPowerOn: () => void;
}

export default function PowerButton({ onPowerOn }: PowerButtonProps) {
  return (
    <div className={styles.powerScreen}>
      <button 
        className={styles.powerButton}
        onClick={onPowerOn}
        aria-label="Power On"
      >
        <div className={styles.powerIcon}>
          <div className={styles.powerSymbol}></div>
        </div>
      </button>

      <div className={styles.instruction}>
        Press power button to start
      </div>
    </div>
  );
}
