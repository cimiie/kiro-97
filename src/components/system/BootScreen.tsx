'use client';

import { useEffect, useState } from 'react';
import styles from './BootScreen.module.css';

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Update progress bar every 50ms for smooth animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2; // 2% every 50ms = 100% in 2.5 seconds
      });
    }, 50);

    // Complete boot after 5 seconds
    const bootTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(bootTimer);
    };
  }, [onComplete]);

  return (
    <div className={styles.bootScreen}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <div className={styles.kiroLogo}>
            <div className={styles.pane} style={{ background: '#FF6B35' }}></div>
            <div className={styles.pane} style={{ background: '#F7931E' }}></div>
            <div className={styles.pane} style={{ background: '#FDC830' }}></div>
            <div className={styles.pane} style={{ background: '#00D9FF' }}></div>
          </div>
        </div>
        <div className={styles.title}>Kiro 97</div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
