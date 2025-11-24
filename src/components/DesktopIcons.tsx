'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DesktopIcon from './DesktopIcon';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import styles from './DesktopIcons.module.css';

// Dynamic imports to avoid SSR issues
const MinesweeperApp = dynamic(() => import('@/apps/MinesweeperApp'), { ssr: false });
const MockBrowser = dynamic(() => import('@/apps/MockBrowser'), { ssr: false });
const NotepadApp = dynamic(() => import('@/apps/NotepadApp'), { ssr: false });
const DoomApp = dynamic(() => import('@/apps/DoomApp'), { ssr: false });
const MyComputer = dynamic(() => import('@/apps/MyComputer'), { ssr: false });
const Kiro = dynamic(() => import('@/apps/Kiro'), { ssr: false });
const Paint = dynamic(() => import('@/apps/Paint'), { ssr: false });
const CalculatorApp = dynamic(() => import('@/apps/CalculatorApp'), { ssr: false });

interface IconData {
  id: string;
  label: string;
  iconImage: string;
  action: () => void;
}

export default function DesktopIcons() {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const { openWindow } = useWindowManager();

  const handleLaunchApp = (appId: string) => {
    // Handle apps that might be launched from My Computer
    const appMap: Record<string, () => void> = {
      'calculator': () => openWindow(<CalculatorApp />, 'Calculator'),
      'paint': () => openWindow(<Paint />, 'Paint'),
      'notepad': () => openWindow(<NotepadApp />, 'Notepad'),
      'internet-explorer': () => openWindow(<MockBrowser />, 'Internet Explorer'),
      'minesweeper': () => openWindow(<MinesweeperApp />, 'Minesweeper'),
      'doom': () => openWindow(<DoomApp onClose={() => {}} />, 'DOOM'),
      'kiro': () => openWindow(<Kiro />, 'Kiro'),
    };
    
    const action = appMap[appId];
    if (action) {
      action();
    } else {
      // Fallback to icon action
      const icon = icons.find((i) => i.id === appId);
      if (icon) {
        icon.action();
      }
    }
  };

  const icons: IconData[] = [
    {
      id: 'my-computer',
      label: 'My Computer',
      iconImage: '💻',
      action: () => {
        openWindow(
          <MyComputer onLaunchApp={handleLaunchApp} />,
          'My Computer'
        );
      },
    },
    {
      id: 'my-documents',
      label: 'My Documents',
      iconImage: '📄',
      action: () => {
        openWindow(
          <MyComputer onLaunchApp={handleLaunchApp} initialPath="C:\\My Documents" />,
          'My Documents'
        );
      },
    },
    {
      id: 'recycle-bin',
      label: 'Recycle Bin',
      iconImage: '🗑️',
      action: () => {
        openWindow(
          <div style={{ padding: '20px' }}>
            <h2>Recycle Bin</h2>
            <p>Deleted files would appear here.</p>
          </div>,
          'Recycle Bin'
        );
      },
    },
    {
      id: 'notepad',
      label: 'Notepad',
      iconImage: '📝',
      action: () => {
        openWindow(<NotepadApp />, 'Notepad');
      },
    },
    {
      id: 'internet-explorer',
      label: 'Internet Explorer',
      iconImage: '🌐',
      action: () => {
        openWindow(<MockBrowser />, 'Internet Explorer');
      },
    },
    {
      id: 'minesweeper',
      label: 'Minesweeper',
      iconImage: '💣',
      action: () => {
        openWindow(<MinesweeperApp />, 'Minesweeper');
      },
    },
    {
      id: 'doom',
      label: 'DOOM',
      iconImage: '👹',
      action: () => {
        openWindow(<DoomApp onClose={() => {}} />, 'DOOM');
      },
    },
    {
      id: 'kiro',
      label: 'Kiro',
      iconImage: '💻',
      action: () => {
        openWindow(<Kiro />, 'Kiro');
      },
    },
    {
      id: 'paint',
      label: 'Paint',
      iconImage: '🎨',
      action: () => {
        openWindow(<Paint />, 'Paint');
      },
    },
  ];

  const handleIconSelect = (iconId: string) => {
    setSelectedIconId(iconId);
  };

  const handleIconDoubleClick = (icon: IconData) => {
    icon.action();
  };

  return (
    <>
      <div className={styles.iconGrid} onClick={(e) => e.stopPropagation()}>
        {icons.map((icon, index) => (
          <DesktopIcon
            key={icon.id}
            id={icon.id}
            label={icon.label}
            iconImage={icon.iconImage}
            isSelected={selectedIconId === icon.id}
            onSelect={() => handleIconSelect(icon.id)}
            onDoubleClick={() => handleIconDoubleClick(icon)}
            gridPosition={{
              row: index + 1,
              col: 1,
            }}
          />
        ))}
      </div>
    </>
  );
}
