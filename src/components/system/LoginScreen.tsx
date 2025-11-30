'use client';

import { useState, useEffect } from 'react';
import styles from './LoginScreen.module.css';

interface LoginScreenProps {
  onLogin: () => void;
  onShutdown?: () => void;
}

export default function LoginScreen({ onLogin, onShutdown }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const targetUsername = 'kiro';
    const targetPassword = '••••••••'; // 8 characters
    let usernameIndex = 0;
    let passwordIndex = 0;

    // Type username first
    const usernameInterval = setInterval(() => {
      if (usernameIndex < targetUsername.length) {
        setUsername(targetUsername.slice(0, usernameIndex + 1));
        usernameIndex++;
      } else {
        clearInterval(usernameInterval);
        
        // Start typing password after username is complete
        setTimeout(() => {
          const passwordInterval = setInterval(() => {
            if (passwordIndex < targetPassword.length) {
              setPassword(targetPassword.slice(0, passwordIndex + 1));
              passwordIndex++;
            } else {
              clearInterval(passwordInterval);
              
              // Auto-login after password is complete
              setTimeout(() => {
                onLogin();
              }, 500);
            }
          }, 100);
        }, 300);
      }
    }, 150);

    return () => {
      clearInterval(usernameInterval);
    };
  }, [onLogin]);

  const handleShutdown = () => {
    if (onShutdown) {
      onShutdown();
    }
  };

  return (
    <div className={styles.loginScreen}>
      <div className={styles.background}>
        <div className={styles.clouds}></div>
      </div>
      
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <div className={styles.kiroLogo}>
            <div className={styles.pane} style={{ background: '#FF6B35' }}></div>
            <div className={styles.pane} style={{ background: '#F7931E' }}></div>
            <div className={styles.pane} style={{ background: '#FDC830' }}></div>
            <div className={styles.pane} style={{ background: '#00D9FF' }}></div>
          </div>
          <div className={styles.welcomeText}>
            Welcome to Kiro 97
          </div>
        </div>

        <div className={styles.form}>
          <div className={styles.instruction}>
            Type a user name and password to log on to Kiro.
          </div>

          <div className={styles.field}>
            <label htmlFor="username">User name:</label>
            <input
              id="username"
              type="text"
              value={username}
              className={styles.input}
              readOnly
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              className={styles.input}
              readOnly
            />
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.button}>
              Log In
            </button>
            <button type="button" className={styles.button} onClick={handleShutdown}>
              Shut Down
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
