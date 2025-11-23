'use client';

import { useState, useEffect, useRef, MouseEvent } from 'react';
import styles from './StartMenu.module.css';

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
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add a small delay to prevent immediate closing when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleItemClick = (item: MenuItem, e: MouseEvent) => {
    e.stopPropagation();
    
    if (item.action) {
      item.action();
      onClose();
    }
  };

  const handleItemHover = (itemId: string) => {
    setHoveredItemId(itemId);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isHovered = hoveredItemId === item.id;

    return (
      <div
        key={item.id}
        className={styles.menuItemContainer}
        onMouseEnter={() => handleItemHover(item.id)}
      >
        <div
          className={`${styles.menuItem} ${isHovered ? styles.menuItemHovered : ''}`}
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
        {hasSubItems && isHovered && (
          <div className={styles.subMenu} style={{ left: '100%', top: 0 }}>
            {item.subItems!.map((subItem) => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={menuRef} className={styles.startMenu}>
      <div className={styles.menuHeader}>
        <span className={styles.menuHeaderText}>Windows 95</span>
      </div>
      <div className={styles.menuContent}>
        {menuItems.map((item) => renderMenuItem(item))}
      </div>
    </div>
  );
}
