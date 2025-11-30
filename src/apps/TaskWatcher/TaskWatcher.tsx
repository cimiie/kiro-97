'use client';

import { useState, useEffect } from 'react';
import styles from './TaskWatcher.module.css';

export default function SystemMonitorApp() {
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(30).fill(0));
  const [memoryHistory, setMemoryHistory] = useState<number[]>(Array(30).fill(0));

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
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>CPU Usage</div>
          <div className={styles.sectionValue}>{currentCpu.toFixed(0)}%</div>
        </div>
        <div className={styles.chart}>
          <svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none">
            <polyline
              points={cpuHistory.map((val, i) => `${i * 10},${80 - (val * 0.8)}`).join(' ')}
              fill="none"
              stroke="#00ff00"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Memory Usage</div>
          <div className={styles.sectionValue}>{currentMemory.toFixed(0)}%</div>
        </div>
        <div className={styles.chart}>
          <svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none">
            <polyline
              points={memoryHistory.map((val, i) => `${i * 10},${80 - (val * 0.8)}`).join(' ')}
              fill="none"
              stroke="#ff0000"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div className={styles.statusBar}>
        <div className={styles.statusItem}>Processes: 24</div>
        <div className={styles.statusItem}>CPU: {currentCpu.toFixed(0)}%</div>
        <div className={styles.statusItem}>Mem: {currentMemory.toFixed(0)}%</div>
      </div>
    </div>
  );
}
