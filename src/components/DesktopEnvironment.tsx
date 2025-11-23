'use client';

import { useState, MouseEvent, ReactNode } from 'react';
import styles from './DesktopEnvironment.module.css';

interface DesktopEnvironmentProps {
  children?: ReactNode;
  onDesktopClick?: () => void;
}

export default function DesktopEnvironment({ 
  children, 
  onDesktopClick 
}: DesktopEnvironmentProps) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // Only trigger if clicking directly on the desktop, not on children
    if (e.target === e.currentTarget) {
      onDesktopClick?.();
    }
  };

  return (
    <div 
      className={styles.desktop}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
