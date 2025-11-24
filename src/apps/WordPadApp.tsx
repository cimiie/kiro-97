'use client';

import { useState, useRef } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import styles from './WordPadApp.module.css';

export default function WordPadApp() {
  const { saveFile } = useFileSystem();
  const [content, setContent] = useState('');
  const [filename, setFilename] = useState('Document');
  const [isModified, setIsModified] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [dialog, setDialog] = useState<'none' | 'save'>('none');
  const [saveFilename, setSaveFilename] = useState('');
  const [fontSize, setFontSize] = useState('12');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsModified(true);
    }
  };

  const handleNew = () => {
    if (isModified && !window.confirm('Do you want to save changes?')) {
      return;
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setContent('');
    setFilename('Document');
    setIsModified(false);
    setActiveMenu(null);
  };

  const handleSave = () => {
    setSaveFilename(filename.endsWith('.rtf') ? filename : `${filename}.rtf`);
    setDialog('save');
    setActiveMenu(null);
  };

  const confirmSave = () => {
    if (!saveFilename.trim()) return;
    saveFile(saveFilename, content);
    setFilename(saveFilename);
    setIsModified(false);
    setDialog('none');
    setSaveFilename('');
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div className={styles.container}>
      <div className={styles.menuBar}>
        <div className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => toggleMenu('file')}>
            File
          </button>
          {activeMenu === 'file' && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={handleNew}>
                New
              </button>
              <button className={styles.dropdownItem} onClick={handleSave}>
                Save
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} onClick={() => window.print()}>
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
              <button className={styles.dropdownItem} onClick={() => document.execCommand('undo')}>
                Undo
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} onClick={() => document.execCommand('cut')}>
                Cut
              </button>
              <button className={styles.dropdownItem} onClick={() => document.execCommand('copy')}>
                Copy
              </button>
              <button className={styles.dropdownItem} onClick={() => document.execCommand('paste')}>
                Paste
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} onClick={() => document.execCommand('selectAll')}>
                Select All
              </button>
            </div>
          )}
        </div>

        <div className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => toggleMenu('format')}>
            Format
          </button>
          {activeMenu === 'format' && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={() => handleFormat('bold')}>
                Bold
              </button>
              <button className={styles.dropdownItem} onClick={() => handleFormat('italic')}>
                Italic
              </button>
              <button className={styles.dropdownItem} onClick={() => handleFormat('underline')}>
                Underline
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.toolbar}>
        <select 
          className={styles.toolbarSelect}
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value);
            handleFormat('fontSize', e.target.value);
          }}
        >
          <option value="1">8</option>
          <option value="2">10</option>
          <option value="3">12</option>
          <option value="4">14</option>
          <option value="5">18</option>
          <option value="6">24</option>
          <option value="7">36</option>
        </select>

        <button 
          className={`${styles.toolbarButton} ${isBold ? styles.active : ''}`}
          onClick={() => {
            setIsBold(!isBold);
            handleFormat('bold');
          }}
        >
          <strong>B</strong>
        </button>
        <button 
          className={`${styles.toolbarButton} ${isItalic ? styles.active : ''}`}
          onClick={() => {
            setIsItalic(!isItalic);
            handleFormat('italic');
          }}
        >
          <em>I</em>
        </button>
        <button 
          className={`${styles.toolbarButton} ${isUnderline ? styles.active : ''}`}
          onClick={() => {
            setIsUnderline(!isUnderline);
            handleFormat('underline');
          }}
        >
          <u>U</u>
        </button>

        <div className={styles.toolbarSeparator} />

        <button className={styles.toolbarButton} onClick={() => handleFormat('justifyLeft')}>
          ≡
        </button>
        <button className={styles.toolbarButton} onClick={() => handleFormat('justifyCenter')}>
          ≡
        </button>
        <button className={styles.toolbarButton} onClick={() => handleFormat('justifyRight')}>
          ≡
        </button>
      </div>

      <div 
        ref={editorRef}
        className={styles.editor}
        contentEditable
        onInput={handleContentChange}
        suppressContentEditableWarning
      />

      {dialog === 'save' && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogTitle}>Save As</div>
            <div className={styles.dialogContent}>
              <div className={styles.dialogField}>
                <label>Save in:</label>
                <div className={styles.dialogFolder}>📁 My Documents</div>
              </div>
              <div className={styles.dialogField}>
                <label>File name:</label>
                <input
                  type="text"
                  className={styles.dialogInput}
                  value={saveFilename}
                  onChange={(e) => setSaveFilename(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmSave();
                    if (e.key === 'Escape') setDialog('none');
                  }}
                  autoFocus
                />
              </div>
            </div>
            <div className={styles.dialogButtons}>
              <button className={styles.dialogButton} onClick={confirmSave}>
                Save
              </button>
              <button className={styles.dialogButton} onClick={() => setDialog('none')}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
