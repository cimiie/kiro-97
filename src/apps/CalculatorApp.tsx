'use client';

import { useState } from 'react';
import styles from './CalculatorApp.module.css';

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue !== null && operation && !newNumber) {
      handleEquals();
    } else {
      setPreviousValue(current);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const handleEquals = () => {
    if (previousValue === null || operation === null) return;
    
    const current = parseFloat(display);
    let result = 0;
    
    switch (operation) {
      case '+':
        result = previousValue + current;
        break;
      case '-':
        result = previousValue - current;
        break;
      case '*':
        result = previousValue * current;
        break;
      case '/':
        result = current !== 0 ? previousValue / current : 0;
        break;
    }
    
    setDisplay(result.toString());
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleClearEntry = () => {
    setDisplay('0');
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay((current / 100).toString());
  };

  const handleSquareRoot = () => {
    const current = parseFloat(display);
    setDisplay(Math.sqrt(current).toString());
  };

  const handleNegate = () => {
    const current = parseFloat(display);
    setDisplay((-current).toString());
  };

  return (
    <div className={styles.container}>
      <div className={styles.menuBar}>
        <div className={styles.menuItem}>
          <button className={styles.menuButton}>View</button>
        </div>
        <div className={styles.menuItem}>
          <button className={styles.menuButton}>Edit</button>
        </div>
        <div className={styles.menuItem}>
          <button className={styles.menuButton}>Help</button>
        </div>
      </div>

      <div className={styles.display}>{display}</div>

      <div className={styles.buttonGrid}>
        <button className={styles.button} onClick={handleBackspace}>Back</button>
        <button className={styles.button} onClick={handleClearEntry}>CE</button>
        <button className={styles.button} onClick={handleClear}>C</button>
        <button className={styles.button} onClick={handleNegate}>+/-</button>
        <button className={styles.button} onClick={handleSquareRoot}>√</button>

        <button className={styles.button} onClick={() => handleNumber('7')}>7</button>
        <button className={styles.button} onClick={() => handleNumber('8')}>8</button>
        <button className={styles.button} onClick={() => handleNumber('9')}>9</button>
        <button className={styles.button} onClick={() => handleOperation('/')}>/</button>
        <button className={styles.button} onClick={handlePercent}>%</button>

        <button className={styles.button} onClick={() => handleNumber('4')}>4</button>
        <button className={styles.button} onClick={() => handleNumber('5')}>5</button>
        <button className={styles.button} onClick={() => handleNumber('6')}>6</button>
        <button className={styles.button} onClick={() => handleOperation('*')}>*</button>
        <button className={styles.button}>1/x</button>

        <button className={styles.button} onClick={() => handleNumber('1')}>1</button>
        <button className={styles.button} onClick={() => handleNumber('2')}>2</button>
        <button className={styles.button} onClick={() => handleNumber('3')}>3</button>
        <button className={styles.button} onClick={() => handleOperation('-')}>-</button>
        <button className={`${styles.button} ${styles.buttonTall}`} onClick={handleEquals}>=</button>

        <button className={`${styles.button} ${styles.buttonWide}`} onClick={() => handleNumber('0')}>0</button>
        <button className={styles.button} onClick={handleDecimal}>.</button>
        <button className={styles.button} onClick={() => handleOperation('+')}>+</button>
      </div>
    </div>
  );
}
