'use client';

import { useState } from 'react';
import styles from './RegistryEditor.module.css';

interface RegistryKey {
  name: string;
  children?: RegistryKey[];
  values?: RegistryValue[];
}

interface RegistryValue {
  name: string;
  type: string;
  data: string;
}

const MOCK_REGISTRY: RegistryKey = {
  name: 'My Computer',
  children: [
    {
      name: 'HKEY_CLASSES_ROOT',
      children: [
        {
          name: '.txt',
          values: [
            { name: '(Default)', type: 'REG_SZ', data: 'txtfile' }
          ]
        },
        {
          name: 'txtfile',
          children: [
            {
              name: 'shell',
              children: [
                {
                  name: 'open',
                  children: [
                    {
                      name: 'command',
                      values: [
                        { name: '(Default)', type: 'REG_SZ', data: 'C:\\WINDOWS\\NOTEPAD.EXE %1' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'HKEY_CURRENT_USER',
      children: [
        {
          name: 'Software',
          children: [
            {
              name: 'Microsoft',
              children: [
                {
                  name: 'Windows',
                  children: [
                    {
                      name: 'CurrentVersion',
                      children: [
                        {
                          name: 'Explorer',
                          values: [
                            { name: 'ShellState', type: 'REG_BINARY', data: '24 00 00 00 3F 28 00 00' }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'Control Panel',
          children: [
            {
              name: 'Desktop',
              values: [
                { name: 'Wallpaper', type: 'REG_SZ', data: 'C:\\WINDOWS\\Clouds.bmp' },
                { name: 'TileWallpaper', type: 'REG_SZ', data: '0' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'HKEY_LOCAL_MACHINE',
      children: [
        {
          name: 'SOFTWARE',
          children: [
            {
              name: 'Microsoft',
              children: [
                {
                  name: 'Windows',
                  children: [
                    {
                      name: 'CurrentVersion',
                      values: [
                        { name: 'ProgramFilesDir', type: 'REG_SZ', data: 'C:\\Program Files' },
                        { name: 'CommonFilesDir', type: 'REG_SZ', data: 'C:\\Program Files\\Common Files' }
                      ],
                      children: [
                        {
                          name: 'Uninstall',
                          children: [
                            {
                              name: 'Minesweeper',
                              values: [
                                { name: 'DisplayName', type: 'REG_SZ', data: 'Minesweeper' },
                                { name: 'UninstallString', type: 'REG_SZ', data: 'C:\\WINDOWS\\SYSTEM\\MINESWEEPER.EXE /uninstall' }
                              ]
                            },
                            {
                              name: 'Paint',
                              values: [
                                { name: 'DisplayName', type: 'REG_SZ', data: 'Paint' },
                                { name: 'UninstallString', type: 'REG_SZ', data: 'C:\\WINDOWS\\SYSTEM\\MSPAINT.EXE /uninstall' }
                              ]
                            },
                            {
                              name: 'Kiro',
                              values: [
                                { name: 'DisplayName', type: 'REG_SZ', data: 'Kiro Code Editor' },
                                { name: 'Publisher', type: 'REG_SZ', data: 'Kiro Software' },
                                { name: 'UninstallString', type: 'REG_SZ', data: 'C:\\Program Files\\Kiro\\uninstall.exe' }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'SYSTEM',
          children: [
            {
              name: 'CurrentControlSet',
              children: [
                {
                  name: 'Control',
                  children: [
                    {
                      name: 'ComputerName',
                      children: [
                        {
                          name: 'ComputerName',
                          values: [
                            { name: 'ComputerName', type: 'REG_SZ', data: 'WIN95-PC' }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default function RegistryEditorApp() {
  const [selectedKey, setSelectedKey] = useState<RegistryKey>(MOCK_REGISTRY);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['My Computer']));
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const getKeyPath = (key: RegistryKey, path: string[] = []): string => {
    return [...path, key.name].join('\\');
  };

  const toggleExpand = (keyPath: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(keyPath)) {
      newExpanded.delete(keyPath);
    } else {
      newExpanded.add(keyPath);
    }
    setExpandedKeys(newExpanded);
  };

  const renderTreeItem = (key: RegistryKey, path: string[] = [], level: number = 0) => {
    const keyPath = getKeyPath(key, path);
    const isExpanded = expandedKeys.has(keyPath);
    const hasChildren = key.children && key.children.length > 0;

    return (
      <div key={keyPath}>
        <div
          className={`${styles.treeItem} ${selectedKey === key ? styles.selected : ''}`}
          style={{ paddingLeft: `${level * 16 + 4}px` }}
          onClick={() => setSelectedKey(key)}
        >
          {hasChildren && (
            <span
              className={styles.treeExpander}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(keyPath);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {!hasChildren && <span className={styles.treeExpander}>&nbsp;</span>}
          <span className={styles.treeIcon}>📁</span>
          <span className={styles.treeName}>{key.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {key.children!.map(child => renderTreeItem(child, [...path, key.name], level + 1))}
          </div>
        )}
      </div>
    );
  };

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div className={styles.container}>
      <div className={styles.menuBar}>
        <div className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => toggleMenu('registry')}>
            Registry
          </button>
          {activeMenu === 'registry' && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} disabled>
                Import Registry File...
              </button>
              <button className={styles.dropdownItem} disabled>
                Export Registry File...
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} disabled>
                Connect Network Registry...
              </button>
              <button className={styles.dropdownItem} disabled>
                Disconnect Network Registry...
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} disabled>
                Print...
              </button>
            </div>
          )}
        </div>

        <div className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => toggleMenu('edit')}>
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} disabled>
                New ▶
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} disabled>
                Delete
              </button>
              <button className={styles.dropdownItem} disabled>
                Rename
              </button>
            </div>
          )}
        </div>

        <div className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => toggleMenu('view')}>
            View
          </button>
          {activeMenu === 'view' && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem}>
                ✓ Status Bar
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} disabled>
                Refresh
              </button>
            </div>
          )}
        </div>

        <div className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => toggleMenu('help')}>
            Help
          </button>
          {activeMenu === 'help' && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} disabled>
                Help Topics
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} disabled>
                About Registry Editor
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.treePane}>
          {renderTreeItem(MOCK_REGISTRY)}
        </div>

        <div className={styles.detailPane}>
          <div className={styles.detailHeader}>
            <div className={styles.detailColumn}>Name</div>
            <div className={styles.detailColumn}>Type</div>
            <div className={styles.detailColumn}>Data</div>
          </div>
          <div className={styles.detailContent}>
            {selectedKey.values && selectedKey.values.length > 0 ? (
              selectedKey.values.map((value, index) => (
                <div key={index} className={styles.detailRow}>
                  <div className={styles.detailCell}>{value.name}</div>
                  <div className={styles.detailCell}>{value.type}</div>
                  <div className={styles.detailCell}>{value.data}</div>
                </div>
              ))
            ) : (
              <div className={styles.emptyMessage}>(No values)</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.statusBar}>
        <div className={styles.statusItem}>My Computer</div>
      </div>
    </div>
  );
}
