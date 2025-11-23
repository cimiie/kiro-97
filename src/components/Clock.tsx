'use client';

import { useState, useEffect } from 'react';
import styles from './Clock.module.css';

export default function Clock() {
  const [time, setTime] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Initialize time immediately
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setShowTooltip(!showTooltip);
  };

  const getFullDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  return (
    <div className={styles.clockContainer}>
      <button 
        className={styles.clock}
        onClick={handleClick}
        aria-label="System clock"
      >
        {time}
      </button>
      {showTooltip && (
        <div className={styles.tooltip}>
          {getFullDateTime()}
        </div>
      )}
    </div>
  );
}
