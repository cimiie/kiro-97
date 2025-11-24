'use client';

import { useState, useEffect, useRef, MouseEvent } from 'react';
import styles from './StartMenu.module.css';
import { JSX } from 'react/jsx-runtime';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  action?: () => void;
  subItems?: MenuItem[];
}

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

export default function StartMenu({ isOpen, onClose, menuItems }: StartMenuProps) {
  const [openSubMenuPath, setOpenSubMenuPath] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    // Reset submenu state when closed
    if (openSubMenuPath.length > 0) {
      setOpenSubMenuPath([]);
    }
    return null;
  }

  const handleItemClick = (item: MenuItem, e: MouseEvent) => {
    e.stopPropagation();
    
    if (item.action) {
      item.action();
      onClose();
    }
  };

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpenSubMenuPath([]);
    }, 200);
  };

  const handleItemEnter = (itemId: string, parentPath: string[]) => {
    clearCloseTimeout();
    setOpenSubMenuPath([...parentPath, itemId]);
  };

  const isItemOpen = (itemId: string, parentPath: string[]): boolean => {
    const fullPath = [...parentPath, itemId];
    if (fullPath.length > openSubMenuPath.length) return false;
    return fullPath.every((id, index) => openSubMenuPath[index] === id);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0, parentPath: string[] = []): JSX.Element => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = isItemOpen(item.id, parentPath);

    const itemClass = level === 0 ? styles.menuItem : styles.subMenuItem;
    const wrapperClass = level === 0 ? styles.menuItemWrapper : styles.subMenuItemWrapper;
    const activeClass = level === 0 ? styles.menuItemActive : styles.subMenuItemActive;

    return (
      <div
        key={item.id}
        className={wrapperClass}
        onMouseEnter={() => {
          clearCloseTimeout();
          if (hasSubItems) {
            handleItemEnter(item.id, parentPath);
          } else if (level === 0) {
            setOpenSubMenuPath([]);
          }
        }}
        onMouseLeave={() => {
          if (hasSubItems) {
            scheduleClose();
          }
        }}
      >
        <div
          className={`${itemClass} ${isOpen ? activeClass : ''}`}
          onClick={(e) => handleItemClick(item, e)}
        >
          {item.icon && (
            <span className={styles.menuIcon}>{item.icon}</span>
          )}
          <span className={styles.menuLabel}>{item.label}</span>
          {hasSubItems && (
            <span className={styles.menuArrow}>▶</span>
          )}
        </div>
        {hasSubItems && isOpen && (
          <div 
            className={level === 0 ? styles.subMenu : styles.nestedSubMenu}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClose}
          >
            {item.subItems!.map((subItem) => renderMenuItem(subItem, level + 1, [...parentPath, item.id]))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={menuRef} className={styles.startMenu}>
      <div className={styles.menuHeader}>
        <div className={styles.kiroLogoSmall}>
          <div className={styles.pane} style={{ background: '#FF6B35' }}></div>
          <div className={styles.pane} style={{ background: '#F7931E' }}></div>
          <div className={styles.pane} style={{ background: '#FDC830' }}></div>
          <div className={styles.pane} style={{ background: '#00D9FF' }}></div>
        </div>
        <span className={styles.menuHeaderText}>Kiro 97</span>
      </div>
      <div className={styles.menuContent}>
        {menuItems.map((item) => renderMenuItem(item))}
      </div>
    </div>
  );
}
