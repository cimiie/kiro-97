'use client';

import { useState, useEffect } from 'react';
import styles from './TaskWatcher.module.css';

export default function SystemMonitorApp() {
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(50).fill(0));
  const [memoryHistory, setMemoryHistory] = useState<number[]>(Array(50).fill(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuHistory(prev => [...prev.slice(1), Math.random() * 100]);
      setMemoryHistory(prev => [...prev.slice(1), 40 + Math.random() * 30]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentCpu = cpuHistory[cpuHistory.length - 1];
  const currentMemory = memoryHistory[memoryHistory.length - 1];

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>CPU Usage</div>
        <div className={styles.chart}>
          <svg width="100%" height="100" viewBox="0 0 400 100" preserveAspectRatio="none">
            <polyline
              points={cpuHistory.map((val, i) => `${i * 8},${100 - val}`).join(' ')}
              fill="none"
              stroke="#00ff00"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className={styles.value}>{currentCpu.toFixed(1)}%</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Memory Usage</div>
        <div className={styles.chart}>
          <svg width="100%" height="100" viewBox="0 0 400 100" preserveAspectRatio="none">
            <polyline
              points={memoryHistory.map((val, i) => `${i * 8},${100 - val}`).join(' ')}
              fill="none"
              stroke="#ff0000"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className={styles.value}>{currentMemory.toFixed(1)}%</div>
      </div>

      <div className={styles.info}>
        <div className={styles.infoRow}>
          <span>Total Memory:</span>
          <span>64 MB</span>
        </div>
        <div className={styles.infoRow}>
          <span>Available Memory:</span>
          <span>{(64 * (100 - currentMemory) / 100).toFixed(1)} MB</span>
        </div>
        <div className={styles.infoRow}>
          <span>Processor:</span>
          <span>Intel Pentium 133 MHz</span>
        </div>
      </div>
    </div>
  );
}
