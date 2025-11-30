'use client';

import { useState, useRef, useCallback } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import styles from './KiroIDE.module.css';

interface FileTab {
  id: string;
  name: string;
  content: string;
  language: string;
  isModified: boolean;
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Kiro() {
  const { saveFile } = useFileSystem();
  const [files, setFiles] = useState<FileTab[]>([
    { id: '1', name: 'index.html', content: '', language: 'html', isModified: false }
  ]);
  const [activeFileId, setActiveFileId] = useState('1');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilename, setSaveFilename] = useState('');
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  const updateCursorPosition = useCallback(() => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    
    setCursorPosition({ line, col });
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeFile) return;
    
    setFiles(files.map(f => 
      f.id === activeFileId 
        ? { ...f, content: e.target.value, isModified: true }
        : f
    ));
    updateCursorPosition();
  };

  const handleNewFile = () => {
    const newId = Date.now().toString();
    const newFile: FileTab = {
      id: newId,
      name: 'index.html',
      content: '',
      language: 'html',
      isModified: false
    };
    setFiles([...files, newFile]);
    setActiveFileId(newId);
    setActiveMenu(null);
  };

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.ts,.jsx,.tsx,.html,.css,.json,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newId = Date.now().toString();
          const ext = file.name.split('.').pop() || 'txt';
          const langMap: Record<string, string> = {
            js: 'javascript', ts: 'typescript', jsx: 'javascript',
            tsx: 'typescript', html: 'html', css: 'css', json: 'json'
          };
          
          const newFile: FileTab = {
            id: newId,
            name: file.name,
            content: event.target?.result as string,
            language: langMap[ext] || 'text',
            isModified: false
          };
          setFiles([...files, newFile]);
          setActiveFileId(newId);
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setActiveMenu(null);
  };

  const handleSaveFile = () => {
    if (!activeFile) return;
    setSaveFilename(activeFile.name);
    setShowSaveDialog(true);
    setActiveMenu(null);
  };

  const confirmSave = () => {
    if (!activeFile || !saveFilename.trim()) return;
    
    // Save to virtual file system (My Documents)
    saveFile(saveFilename, activeFile.content);
    
    // Update file state
    setFiles(files.map(f => 
      f.id === activeFileId ? { ...f, name: saveFilename, isModified: false } : f
    ));
    
    setShowSaveDialog(false);
    setSaveFilename('');
  };

  const cancelSave = () => {
    setShowSaveDialog(false);
    setSaveFilename('');
  };

  const handleCloseFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file?.isModified) {
      const confirm = window.confirm(`Save changes to ${file.name}?`);
      if (confirm) return;
    }
    
    const newFiles = files.filter(f => f.id !== fileId);
    if (newFiles.length === 0) {
      handleNewFile();
      return;
    }
    
    setFiles(newFiles);
    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0].id);
    }
  };

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleAIAssist = async () => {
    if (!aiInput.trim() || !activeFile) return;
    
    const userMessage: AIMessage = { role: 'user', content: aiInput };
    setAiMessages([...aiMessages, userMessage]);
    const currentPrompt = aiInput;
    setAiInput('');
    setIsAIThinking(true);

    try {
      const response = await fetch('/api/code-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentPrompt,
          fileName: activeFile.name,
          language: activeFile.language,
          code: activeFile.content,
          cursorPosition: cursorPosition,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from Clippy');
      }

      const data = await response.json();
      
      // Extract code blocks from response
      const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
      const codeBlocks: string[] = [];
      let match;
      
      while ((match = codeBlockRegex.exec(data.content)) !== null) {
        codeBlocks.push(match[1]);
      }
      
      // If there are code blocks, insert them automatically and show summary
      if (codeBlocks.length > 0) {
        // Insert all code blocks at cursor position
        const allCode = codeBlocks.join('\n\n');
        insertAICode(allCode);
        
        // Extract summary (text before first code block or after last code block)
        const summaryMatch = data.content.split('```')[0].trim();
        const summary = summaryMatch || `Generated ${codeBlocks.length} code block${codeBlocks.length > 1 ? 's' : ''} and inserted into editor.`;
        
        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: summary
        };
        setAiMessages(prev => [...prev, assistantMessage]);
      } else {
        // No code blocks, show full response
        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: data.content
        };
        setAiMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}`
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleAIKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAIAssist();
    }
  };

  const insertAICode = (code: string) => {
    if (!activeFile || !editorRef.current) return;
    
    const textarea = editorRef.current;
    // Insert at the end of the file
    const newContent = activeFile.content + (activeFile.content ? '\n\n' : '') + code;
    
    setFiles(files.map(f => 
      f.id === activeFileId 
        ? { ...f, content: newContent, isModified: true }
        : f
    ));
    
    setTimeout(() => {
      textarea.focus();
      // Move cursor to end
      textarea.setSelectionRange(newContent.length, newContent.length);
      // Scroll to bottom
      textarea.scrollTop = textarea.scrollHeight;
    }, 0);
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
              <button className={styles.dropdownItem} onClick={handleNewFile}>
                New <span className={styles.shortcut}>Ctrl+N</span>
              </button>
              <button className={styles.dropdownItem} onClick={handleOpenFile}>
                Open... <span className={styles.shortcut}>Ctrl+O</span>
              </button>
              <button className={styles.dropdownItem} onClick={handleSaveFile}>
                Save <span className={styles.shortcut}>Ctrl+S</span>
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} onClick={() => handleCloseFile(activeFileId)}>
                Close
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
                Undo <span className={styles.shortcut}>Ctrl+Z</span>
              </button>
              <button className={styles.dropdownItem} onClick={() => document.execCommand('redo')}>
                Redo <span className={styles.shortcut}>Ctrl+Y</span>
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} onClick={() => document.execCommand('cut')}>
                Cut <span className={styles.shortcut}>Ctrl+X</span>
              </button>
              <button className={styles.dropdownItem} onClick={() => document.execCommand('copy')}>
                Copy <span className={styles.shortcut}>Ctrl+C</span>
              </button>
              <button className={styles.dropdownItem} onClick={() => document.execCommand('paste')}>
                Paste <span className={styles.shortcut}>Ctrl+V</span>
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
              <button className={styles.dropdownItem} onClick={() => setShowAIPanel(!showAIPanel)}>
                {showAIPanel ? '✓ ' : ''}Clippy Assistant
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
              <button className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
                About Kiro
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tabBar}>
        {files.map(file => (
          <div
            key={file.id}
            className={`${styles.tab} ${file.id === activeFileId ? styles.activeTab : ''}`}
            onClick={() => setActiveFileId(file.id)}
          >
            <span className={styles.tabName}>
              {file.name}{file.isModified ? ' •' : ''}
            </span>
            <button
              className={styles.tabClose}
              onClick={(e) => {
                e.stopPropagation();
                handleCloseFile(file.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.editorPanel}>
          <div className={styles.lineNumbers}>
            {activeFile?.content.split('\n').map((_, i) => (
              <div key={i} className={styles.lineNumber}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={editorRef}
            className={styles.editor}
            value={activeFile?.content || ''}
            onChange={handleContentChange}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            spellCheck={false}
            placeholder="Start coding..."
          />
        </div>

        {showAIPanel && (
          <div className={styles.aiPanel}>
            <div className={styles.aiHeader}>
              <span>📎 Clippy</span>
              <button 
                className={styles.aiClose}
                onClick={() => setShowAIPanel(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.aiMessages}>
              {aiMessages.length === 0 && (
                <div className={styles.aiWelcome}>
                  Hi! I&apos;m Clippy, your coding agent!
                  <ul>
                    <li>Generate code (auto-inserted)</li>
                    <li>Explain & analyze code</li>
                    <li>Find and fix bugs</li>
                    <li>Suggest improvements</li>
                  </ul>
                  <div style={{ marginTop: '8px', fontSize: '10px', color: '#808080' }}>
                    Code is automatically inserted at the end of your file.
                  </div>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} className={styles.aiMessage}>
                  <div className={styles.aiMessageRole}>
                    {msg.role === 'user' ? 'You' : 'Clippy'}
                  </div>
                  <div className={styles.aiMessageContent}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAIThinking && (
                <div className={styles.aiMessage}>
                  <div className={styles.aiMessageRole}>Clippy</div>
                  <div className={styles.aiMessageContent}>
                    <div className={styles.thinking}>Thinking...</div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.aiInputContainer}>
              <textarea
                ref={aiInputRef}
                className={styles.aiInput}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={handleAIKeyDown}
                placeholder="Tell Clippy what to code... (Enter to send, Shift+Enter for new line)"
                disabled={isAIThinking}
              />
              <button
                className={styles.aiSend}
                onClick={handleAIAssist}
                disabled={isAIThinking || !aiInput.trim()}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <span className={styles.statusItem}>
            {activeFile?.language.toUpperCase()}
          </span>
          <span className={styles.statusItem}>
            Ln {cursorPosition.line}, Col {cursorPosition.col}
          </span>
        </div>
        <div className={styles.statusRight}>
          <span className={styles.statusItem}>
            {activeFile?.isModified ? 'Modified' : 'Saved'}
          </span>
        </div>
      </div>

      {showSaveDialog && (
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
                    if (e.key === 'Escape') cancelSave();
                  }}
                  autoFocus
                />
              </div>
            </div>
            <div className={styles.dialogButtons}>
              <button className={styles.dialogButton} onClick={confirmSave}>
                Save
              </button>
              <button className={styles.dialogButton} onClick={cancelSave}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
