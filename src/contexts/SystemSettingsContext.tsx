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
}

interface SystemSettingsContextType {
  settings: SystemSettings;
  updateWallpaper: (wallpaper: WallpaperOption) => void;
  updateColorDepth: (colorDepth: ColorDepth) => void;
  updateResolution: (resolution: Resolution) => void;
  updateTheme: (theme: Theme) => void;
  resetToDefaults: () => void;
}

const defaultSettings: SystemSettings = {
  wallpaper: 'teal',
  colorDepth: '16',
  resolution: '1024x768',
  theme: 'retro'
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
