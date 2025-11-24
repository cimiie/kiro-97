'use client';

import { useState } from 'react';
import styles from './SoundRecorderApp.module.css';

export default function SoundRecorderApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position] = useState(0);
  const [length] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.display}>
        <div className={styles.waveform}>
          <div className={styles.waveformLine} />
        </div>
        <div className={styles.info}>
          <div>Position: {position.toFixed(2)}s</div>
          <div>Length: {length.toFixed(2)}s</div>
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.controlButton} title="Seek to Start">
          ⏮
        </button>
        <button 
          className={styles.controlButton} 
          onClick={() => setIsPlaying(!isPlaying)}
          title="Play"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className={styles.controlButton} title="Stop">
          ⏹
        </button>
        <button 
          className={styles.controlButton}
          onClick={() => setIsRecording(!isRecording)}
          title="Record"
          style={{ color: isRecording ? '#ff0000' : 'inherit' }}
        >
          ⏺
        </button>
        <button className={styles.controlButton} title="Seek to End">
          ⏭
        </button>
      </div>

      <div className={styles.slider}>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={position}
          className={styles.sliderInput}
        />
      </div>
    </div>
  );
}
