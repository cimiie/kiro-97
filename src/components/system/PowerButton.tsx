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
          <div className={styles.scaryFace}></div>
          <div className={styles.scaryMouth}></div>
        </div>
      </button>

      <div className={styles.instruction}>
        Click to awaken the machine...
      </div>
    </div>
  );
}
