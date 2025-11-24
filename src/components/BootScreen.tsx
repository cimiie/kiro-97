'use client';

import { useEffect, useState } from 'react';
import styles from './BootScreen.module.css';

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animate loading dots
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Complete boot after 5 seconds
    const bootTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(bootTimer);
    };
  }, [onComplete]);

  return (
    <div className={styles.bootScreen}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <div className={styles.windowsLogo}>
            <div className={styles.pane} style={{ background: '#ff0000' }}></div>
            <div className={styles.pane} style={{ background: '#00ff00' }}></div>
            <div className={styles.pane} style={{ background: '#0000ff' }}></div>
            <div className={styles.pane} style={{ background: '#ffff00' }}></div>
          </div>
        </div>
        <div className={styles.title}>Windows 95</div>
        <div className={styles.loading}>
          Starting Windows{dots}
        </div>
      </div>
    </div>
  );
}
