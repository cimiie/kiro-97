'use client';

import { useState } from 'react';
import styles from './CharacterMapApp.module.css';

export default function CharacterMapApp() {
  const [selectedChar, setSelectedChar] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string>('');

  const characters = [];
  for (let i = 33; i <= 255; i++) {
    characters.push(String.fromCharCode(i));
  }

  const handleCharClick = (char: string) => {
    setSelectedChar(char);
  };

  const handleSelect = () => {
    if (selectedChar) {
      setCopiedText(copiedText + selectedChar);
    }
  };

  const handleCopy = () => {
    if (copiedText) {
      navigator.clipboard.writeText(copiedText);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <label className={styles.label}>
          Font:
          <select className={styles.select}>
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Courier New</option>
            <option>Wingdings</option>
          </select>
        </label>
      </div>

      <div className={styles.charGrid}>
        {characters.map((char, index) => (
          <button
            key={index}
            className={`${styles.charButton} ${selectedChar === char ? styles.selected : ''}`}
            onClick={() => handleCharClick(char)}
          >
            {char}
          </button>
        ))}
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Character:</span>
          <div className={styles.selectedChar}>{selectedChar || ' '}</div>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Unicode:</span>
          <span className={styles.value}>
            {selectedChar ? `U+${selectedChar.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}` : ''}
          </span>
        </div>
      </div>

      <div className={styles.copySection}>
        <label className={styles.label}>
          Characters to copy:
          <input
            type="text"
            className={styles.copyInput}
            value={copiedText}
            onChange={(e) => setCopiedText(e.target.value)}
          />
        </label>
      </div>

      <div className={styles.buttons}>
        <button className={styles.button} onClick={handleSelect}>
          Select
        </button>
        <button className={styles.button} onClick={handleCopy}>
          Copy
        </button>
        <button className={styles.button} onClick={() => setCopiedText('')}>
          Clear
        </button>
      </div>
    </div>
  );
}
