'use client';

import { useState, useEffect } from 'react';
import styles from './DiskDefragmenterApp.module.css';

export default function DiskDefragmenterApp() {
  const [isDefragging, setIsDefragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Ready to defragment');
  const [diskMap, setDiskMap] = useState<number[]>(() => 
    Array(200).fill(0).map(() => Math.floor(Math.random() * 4))
  );

  useEffect(() => {
    if (!isDefragging || progress >= 100) return;

    const timer = setTimeout(() => {
      const newProgress = Math.min(progress + 1, 100);
      setProgress(newProgress);
      
      if (newProgress < 30) {
        setStatus('Analyzing disk...');
      } else if (newProgress < 70) {
        setStatus('Defragmenting...');
        // Simulate defragmentation
        setDiskMap(prevMap => {
          const newMap = [...prevMap];
          const emptyIndex = newMap.findIndex(v => v === 0);
          const fragIndex = newMap.findIndex((v, i) => i > emptyIndex && v !== 0);
          if (emptyIndex !== -1 && fragIndex !== -1) {
            newMap[emptyIndex] = newMap[fragIndex];
            newMap[fragIndex] = 0;
          }
          return newMap;
        });
      } else if (newProgress < 100) {
        setStatus('Optimizing...');
      } else {
        setStatus('Defragmentation complete');
        setIsDefragging(false);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isDefragging, progress]);

  const handleStart = () => {
    setIsDefragging(true);
    setProgress(0);
    setStatus('Starting...');
  };

  const handleStop = () => {
    setIsDefragging(false);
    setStatus('Defragmentation stopped');
  };

  const getBlockColor = (value: number) => {
    switch (value) {
      case 0: return '#ffffff'; // Free space
      case 1: return '#0000ff'; // Used space
      case 2: return '#ff0000'; // Fragmented
      case 3: return '#00ff00'; // System files
      default: return '#808080';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.driveInfo}>
          <div className={styles.driveIcon}>💾</div>
          <div>
            <div className={styles.driveName}>Drive C:</div>
            <div className={styles.driveDetails}>Total: 2.00 GB | Free: 512 MB</div>
          </div>
        </div>
      </div>

      <div className={styles.diskMap}>
        <div className={styles.mapLabel}>Disk Map:</div>
        <div className={styles.mapGrid}>
          {diskMap.map((value, index) => (
            <div
              key={index}
              className={styles.mapBlock}
              style={{ backgroundColor: getBlockColor(value) }}
            />
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ background: '#ffffff', border: '1px solid #000' }} />
          <span>Free space</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ background: '#0000ff' }} />
          <span>Used space</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ background: '#ff0000' }} />
          <span>Fragmented</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ background: '#00ff00' }} />
          <span>System files</span>
        </div>
      </div>

      <div className={styles.status}>
        <div className={styles.statusText}>{status}</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.progressText}>{progress}% Complete</div>
      </div>

      <div className={styles.buttons}>
        <button 
          className={styles.button} 
          onClick={handleStart}
          disabled={isDefragging}
        >
          Start
        </button>
        <button 
          className={styles.button} 
          onClick={handleStop}
          disabled={!isDefragging}
        >
          Stop
        </button>
      </div>
    </div>
  );
}
