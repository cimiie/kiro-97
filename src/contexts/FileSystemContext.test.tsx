import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FileSystemProvider, useFileSystem } from './FileSystemContext';

describe('FileSystemContext', () => {
  it('starts with empty file list', () => {
    const { result } = renderHook(() => useFileSystem(), {
      wrapper: FileSystemProvider,
    });

    expect(result.current.files).toHaveLength(0);
  });

  it('saves a file to My Documents', () => {
    const { result } = renderHook(() => useFileSystem(), {
      wrapper: FileSystemProvider,
    });

    act(() => {
      result.current.saveFile('test.txt', 'Hello World');
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].name).toBe('test.txt');
    expect(result.current.files[0].content).toBe('Hello World');
    expect(result.current.files[0].path).toBe('C:\\My Documents\\test.txt');
  });

  it('retrieves a saved file', () => {
    const { result } = renderHook(() => useFileSystem(), {
      wrapper: FileSystemProvider,
    });

    act(() => {
      result.current.saveFile('test.txt', 'Content');
    });

    const file = result.current.getFile('C:\\My Documents\\test.txt');
    expect(file).toBeDefined();
    expect(file?.content).toBe('Content');
  });

  it('deletes a file', () => {
    const { result } = renderHook(() => useFileSystem(), {
      wrapper: FileSystemProvider,
    });

    act(() => {
      result.current.saveFile('test.txt', 'Content');
    });

    expect(result.current.files).toHaveLength(1);

    act(() => {
      result.current.deleteFile('C:\\My Documents\\test.txt');
    });

    expect(result.current.files).toHaveLength(0);
  });

  it('lists files in a folder', () => {
    const { result } = renderHook(() => useFileSystem(), {
      wrapper: FileSystemProvider,
    });

    act(() => {
      result.current.saveFile('file1.txt', 'Content 1');
      result.current.saveFile('file2.txt', 'Content 2');
      result.current.saveFile('file3.txt', 'Content 3');
    });

    const files = result.current.listFiles('C:\\My Documents');
    expect(files).toHaveLength(3);
  });

  it('updates existing file when saving with same name', () => {
    const { result } = renderHook(() => useFileSystem(), {
      wrapper: FileSystemProvider,
    });

    act(() => {
      result.current.saveFile('test.txt', 'Original content');
    });

    expect(result.current.files).toHaveLength(1);

    act(() => {
      result.current.saveFile('test.txt', 'Updated content');
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].content).toBe('Updated content');
  });

  it('assigns correct icon based on file extension', () => {
    const { result } = renderHook(() => useFileSystem(), {
      wrapper: FileSystemProvider,
    });

    act(() => {
      result.current.saveFile('doc.txt', 'Text');
      result.current.saveFile('page.html', 'HTML');
      result.current.saveFile('script.js', 'JS');
      result.current.saveFile('style.css', 'CSS');
    });

    expect(result.current.files[0].icon).toBe('📝');
    expect(result.current.files[1].icon).toBe('🌐');
    expect(result.current.files[2].icon).toBe('📜');
    expect(result.current.files[3].icon).toBe('🎨');
  });

  it('saves file to custom folder', () => {
    const { result } = renderHook(() => useFileSystem(), {
      wrapper: FileSystemProvider,
    });

    act(() => {
      result.current.saveFile('test.txt', 'Content', 'C:\\Custom');
    });

    expect(result.current.files[0].path).toBe('C:\\Custom\\test.txt');
  });
});
