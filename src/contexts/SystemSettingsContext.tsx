'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type WallpaperOption = 'none' | 'clouds' | 'kiro-logo' | 'teal';
export type ColorDepth = '16' | '256';
export type Resolution = '800x600' | '1024x768';
export type Theme = 'retro' | 'kiro';
export interface SystemSettings {
  wallpaper: WallpaperOption;
  colorDepth: ColorDepth;
  resolution: Resolution;
  theme: Theme;
  mouseTrail: boolean;
  mouseTrailLength: number;
  cursorSize: number; // 50-400 (percentage)
}

interface SystemSettingsContextType {
  settings: SystemSettings;
  updateWallpaper: (wallpaper: WallpaperOption) => void;
  updateColorDepth: (colorDepth: ColorDepth) => void;
  updateResolution: (resolution: Resolution) => void;
  updateTheme: (theme: Theme) => void;
  updateMouseTrail: (enabled: boolean) => void;
  updateMouseTrailLength: (length: number) => void;
  updateCursorSize: (size: number) => void;
  resetToDefaults: () => void;
}

const defaultSettings: SystemSettings = {
  wallpaper: 'teal',
  colorDepth: '16',
  resolution: '1024x768',
  theme: 'retro',
  mouseTrail: false,
  mouseTrailLength: 7,
  cursorSize: 100
};

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  // Apply settings to document body
  useEffect(() => {
    const body = document.body;
    
    // Apply wallpaper
    body.setAttribute('data-wallpaper', settings.wallpaper);
    
    // Apply color depth (affects pixelation)
    body.setAttribute('data-color-depth', settings.colorDepth);
    
    // Apply resolution (affects pixelation level)
    body.setAttribute('data-resolution', settings.resolution);
    
    // Apply theme
    body.setAttribute('data-theme', settings.theme);
  }, [settings]);

  // Apply cursor size scaling
  useEffect(() => {
    const scale = settings.cursorSize / 100;
    const baseSize = 16;
    const scaledSize = Math.round(baseSize * scale);
    const scaledHeight = Math.round(scaledSize * 1.4);
    
    // Create scaled cursor SVG - same arrow for all states
    const cursorSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${scaledSize}" height="${scaledHeight}" viewBox="0 0 12 16"><path fill="white" stroke="black" stroke-width="1" d="M0,0 L0,11 L3,8 L5,13 L7,12 L5,7 L9,7 Z"/></svg>`;
    
    // Create style element for ALL cursor states
    let styleEl = document.getElementById('cursor-size-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'cursor-size-style';
      document.head.appendChild(styleEl);
    }
    
    // Apply the same arrow cursor everywhere - override all cursor types
    styleEl.textContent = `
      *, *::before, *::after {
        cursor: url('${cursorSvg}') 0 0, auto !important;
      }
    `;
  }, [settings.cursorSize]);

  // Mouse trail effect - shows cursor images that fade out and snap back
  useEffect(() => {
    if (!settings.mouseTrail) return;

    interface Trail {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
    }

    const trails: Trail[] = [];
    const maxTrails = settings.mouseTrailLength;
    const baseSize = 16;
    const scaledSize = Math.round(baseSize * (settings.cursorSize / 100));
    let currentMouseX = 0;
    let currentMouseY = 0;
    let animationFrame: number;
    let lastMoveTime = Date.now();

    // Initialize trails at current position
    for (let i = 0; i < maxTrails; i++) {
      trails.push({ x: 0, y: 0, targetX: 0, targetY: 0 });
    }

    // Create canvas for drawing cursor trails
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const handleMouseMove = (e: MouseEvent) => {
      currentMouseX = e.clientX;
      currentMouseY = e.clientY;
      lastMoveTime = Date.now();
    };

    const drawCursor = (x: number, y: number, size: number, opacity: number) => {
      if (!ctx) return;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      
      const scale = size / baseSize;
      
      // Draw Windows cursor shape with proper scaling
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 16 * scale);
      ctx.lineTo(x + 4 * scale, y + 12 * scale);
      ctx.lineTo(x + 7 * scale, y + 19 * scale);
      ctx.lineTo(x + 9 * scale, y + 18 * scale);
      ctx.lineTo(x + 6 * scale, y + 11 * scale);
      ctx.lineTo(x + 12 * scale, y + 11 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
    };

    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const timeSinceMove = Date.now() - lastMoveTime;
      const isMoving = timeSinceMove < 100;
      
      // Update trail positions - each trail follows the one in front
      for (let i = maxTrails - 1; i >= 0; i--) {
        if (i === 0) {
          // First trail follows mouse with delay
          trails[i].targetX = currentMouseX;
          trails[i].targetY = currentMouseY;
        } else {
          // Other trails follow the previous trail
          trails[i].targetX = trails[i - 1].x;
          trails[i].targetY = trails[i - 1].y;
        }
        
        // Smoothly move toward target (snap back when not moving)
        const speed = isMoving ? 0.3 : 0.5;
        trails[i].x += (trails[i].targetX - trails[i].x) * speed;
        trails[i].y += (trails[i].targetY - trails[i].y) * speed;
        
        // Calculate opacity - fade out for older trails
        const opacity = isMoving ? (1 - (i / maxTrails)) * 0.6 : 0;
        
        if (opacity > 0.05) {
          drawCursor(trails[i].x, trails[i].y, scaledSize, opacity);
        }
      }
      
      animationFrame = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    };
  }, [settings.mouseTrail, settings.mouseTrailLength, settings.cursorSize]);

  const updateWallpaper = (wallpaper: WallpaperOption) => {
    setSettings(prev => ({ ...prev, wallpaper }));
  };

  const updateColorDepth = (colorDepth: ColorDepth) => {
    setSettings(prev => ({ ...prev, colorDepth }));
  };

  const updateResolution = (resolution: Resolution) => {
    setSettings(prev => ({ ...prev, resolution }));
  };

  const updateTheme = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const updateMouseTrail = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, mouseTrail: enabled }));
  };

  const updateMouseTrailLength = (length: number) => {
    setSettings(prev => ({ ...prev, mouseTrailLength: length }));
  };

  const updateCursorSize = (size: number) => {
    setSettings(prev => ({ ...prev, cursorSize: size }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <SystemSettingsContext.Provider 
      value={{ 
        settings, 
        updateWallpaper, 
        updateColorDepth, 
        updateResolution, 
        updateTheme,
        updateMouseTrail,
        updateMouseTrailLength,
        updateCursorSize,
        resetToDefaults 
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within SystemSettingsProvider');
  }
  return context;
}
