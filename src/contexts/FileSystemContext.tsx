'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface VirtualFile {
  name: string;
  content: string;
  path: string;
  type: 'file';
  icon: string;
  modified: Date;
}

interface FileSystemContextType {
  files: VirtualFile[];
  saveFile: (filename: string, content: string, folder?: string) => void;
  getFile: (path: string) => VirtualFile | undefined;
  deleteFile: (path: string) => void;
  listFiles: (folder?: string) => VirtualFile[];
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<VirtualFile[]>([]);

  const getFileIcon = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    // Only support file types actually used by apps:
    // - WordWrite: .txt files
    // - Kiro IDE: .js, .ts, .jsx, .tsx, .html, .css, .json
    // - Draw: .png images
    const iconMap: Record<string, string> = {
      'txt': '📝',      // WordWrite
      'html': '🌐',     // Kiro IDE
      'js': '📜',       // Kiro IDE
      'ts': '📜',       // Kiro IDE
      'jsx': '📜',      // Kiro IDE
      'tsx': '📜',      // Kiro IDE
      'css': '🎨',      // Kiro IDE
      'json': '📋',     // Kiro IDE
      'png': '🖼️',      // Draw app
    };
    return iconMap[ext] || '📄';
  };

  const saveFile = (filename: string, content: string, folder: string = 'C:\\My Documents') => {
    const path = `${folder}\\${filename}`;
    const icon = getFileIcon(filename);

    setFiles(prev => {
      const existing = prev.findIndex(f => f.path === path);
      const newFile: VirtualFile = {
        name: filename,
        content,
        path,
        type: 'file',
        icon,
        modified: new Date()
      };

      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = newFile;
        return updated;
      }
      return [...prev, newFile];
    });
  };

  const getFile = (path: string) => {
    return files.find(f => f.path === path);
  };

  const deleteFile = (path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path));
  };

  const listFiles = (folder: string = 'C:\\My Documents') => {
    return files.filter(f => f.path.startsWith(folder));
  };

  return (
    <FileSystemContext.Provider value={{ files, saveFile, getFile, deleteFile, listFiles }}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within FileSystemProvider');
  }
  return context;
}
