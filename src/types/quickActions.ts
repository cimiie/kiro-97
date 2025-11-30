/**
 * Type-safe quick action IDs
 */
export type QuickActionId =
  | 'play-gloom'
  | 'gloom-controls'
  | 'gloom-history'
  | 'gloom-tips'
  | 'browse-web'
  | 'web-tips'
  | 'web-history'
  | 'web-features'
  | 'launch-bombsweeper'
  | 'how-to-play'
  | 'bombsweeper-tips'
  | 'bombsweeper-history'
  | 'launch-wordwrite'
  | 'wordwrite-shortcuts'
  | 'wordwrite-tips'
  | 'wordwrite-history';

/**
 * Map of app names to their launch action IDs
 */
export const APP_LAUNCH_ACTIONS = {
  'Gloom': 'play-gloom',
  'Web Finder': 'browse-web',
  'Bomb Sweeper': 'launch-bombsweeper',
  'WordWrite': 'launch-wordwrite',
} as const;

export type AppName = keyof typeof APP_LAUNCH_ACTIONS;
