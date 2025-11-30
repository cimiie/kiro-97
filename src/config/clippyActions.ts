/**
 * Clippy Quick Actions and Context Configuration
 * 
 * This file contains the mapping of action IDs to their contexts and quick actions
 * for the Clippy assistant's contextual help system.
 */

import { QuickAction } from '@/types/clippy';

export interface ActionContext {
  context: string;
  topic: string;
}

/**
 * Map of action IDs to their context and topic information
 */
export const ACTION_CONTEXT_MAP: Record<string, ActionContext> = {
  'play-gloom': {
    context: 'The user just launched Gloom, a classic first-person shooter game.',
    topic: 'gloom game launched ready to play controls tips classic fps',
  },
  'gloom-controls': {
    context: 'The user wants to learn the controls for playing Gloom.',
    topic: 'gloom game controls keyboard mouse movement shooting weapons',
  },
  'gloom-history': {
    context: 'The user wants to know about the history of Gloom.',
    topic: 'gloom history classic fps game revolutionary shooter',
  },
  'gloom-tips': {
    context: 'The user wants survival tips for playing Gloom.',
    topic: 'gloom gameplay tips strategy survival secrets tricks',
  },
  'browse-web': {
    context: 'The user just opened Web Finder to browse the web.',
    topic: 'web finder opened ready to browse web navigation features',
  },
  'web-tips': {
    context: 'The user wants tips for browsing with Web Finder.',
    topic: 'web finder browsing tips navigation shortcuts favorites',
  },
  'web-history': {
    context: 'The user wants to know about the history of Web Finder.',
    topic: 'web finder history web browser evolution internet browsing',
  },
  'web-features': {
    context: 'The user wants to learn about Web Finder features.',
    topic: 'web finder features favorites bookmarks navigation tools',
  },
  'launch-bombsweeper': {
    context: 'The user just opened Bomb Sweeper, a classic puzzle game.',
    topic: 'bomb sweeper game rules strategy tips history',
  },
  'how-to-play': {
    context: 'The user wants to learn how to play Bomb Sweeper.',
    topic: 'bomb sweeper rules gameplay instructions beginner guide',
  },
  'bombsweeper-tips': {
    context: 'The user wants advanced tips for playing Bomb Sweeper.',
    topic: 'bomb sweeper strategy advanced techniques patterns',
  },
  'bombsweeper-history': {
    context: 'The user wants to know about the history of Bomb Sweeper.',
    topic: 'bomb sweeper history origin classic puzzle game facts trivia',
  },
  'launch-wordwrite': {
    context: 'The user just opened WordWrite, a simple text editor.',
    topic: 'wordwrite text editor features shortcuts tips',
  },
  'wordwrite-shortcuts': {
    context: 'The user wants to learn keyboard shortcuts for WordWrite.',
    topic: 'wordwrite keyboard shortcuts hotkeys commands quick access',
  },
  'wordwrite-tips': {
    context: 'The user wants tips and tricks for using WordWrite effectively.',
    topic: 'wordwrite tips tricks productivity features hidden functions',
  },
  'wordwrite-history': {
    context: 'The user wants to know about the history of WordWrite.',
    topic: 'wordwrite history origin windows evolution facts trivia',
  },
};

/**
 * Map of action IDs to their available quick actions
 */
export const QUICK_ACTIONS_MAP: Record<string, QuickAction[]> = {
  'play-doom': [
    { id: 'doom-controls', label: 'Game Controls', icon: '🎮' },
    { id: 'doom-history', label: 'Gloom History', icon: '📚' },
    { id: 'doom-tips', label: 'Survival Tips', icon: '💡' },
  ],
  'doom-controls': [
    { id: 'doom-tips', label: 'Survival Tips', icon: '💡' },
    { id: 'doom-history', label: 'History', icon: '📚' },
  ],
  'doom-history': [
    { id: 'doom-controls', label: 'Controls', icon: '🎮' },
    { id: 'doom-tips', label: 'Tips', icon: '💡' },
  ],
  'doom-tips': [
    { id: 'doom-controls', label: 'Controls', icon: '🎮' },
    { id: 'doom-history', label: 'History', icon: '📚' },
  ],
  'browse-internet': [
    { id: 'internet-tips', label: 'Browsing Tips', icon: '💡' },
    { id: 'internet-history', label: 'IE History', icon: '📚' },
    { id: 'internet-features', label: 'Cool Features', icon: '✨' },
  ],
  'internet-tips': [
    { id: 'internet-features', label: 'Features', icon: '✨' },
    { id: 'internet-history', label: 'History', icon: '📚' },
  ],
  'internet-history': [
    { id: 'internet-tips', label: 'Tips', icon: '💡' },
    { id: 'internet-features', label: 'Features', icon: '✨' },
  ],
  'internet-features': [
    { id: 'internet-tips', label: 'Tips', icon: '💡' },
    { id: 'internet-history', label: 'History', icon: '📚' },
  ],
  'launch-minesweeper': [
    { id: 'how-to-play', label: 'How to Play', icon: '❓' },
    { id: 'minesweeper-tips', label: 'Strategy Tips', icon: '💡' },
    { id: 'minesweeper-history', label: 'Cool Facts', icon: '📚' },
  ],
  'how-to-play': [
    { id: 'minesweeper-tips', label: 'Advanced Tips', icon: '💡' },
    { id: 'minesweeper-history', label: 'History', icon: '📚' },
  ],
  'minesweeper-tips': [
    { id: 'how-to-play', label: 'Basic Rules', icon: '❓' },
    { id: 'minesweeper-history', label: 'Cool Facts', icon: '📚' },
  ],
  'minesweeper-history': [
    { id: 'how-to-play', label: 'How to Play', icon: '❓' },
    { id: 'minesweeper-tips', label: 'Strategy Tips', icon: '💡' },
  ],
  'launch-notepad': [
    { id: 'notepad-shortcuts', label: 'Keyboard Shortcuts', icon: '⌨️' },
    { id: 'notepad-tips', label: 'Tips & Tricks', icon: '💡' },
    { id: 'notepad-history', label: 'TextEdit History', icon: '📚' },
  ],
  'notepad-shortcuts': [
    { id: 'notepad-tips', label: 'Tips & Tricks', icon: '💡' },
    { id: 'notepad-history', label: 'History', icon: '📚' },
  ],
  'notepad-tips': [
    { id: 'notepad-shortcuts', label: 'Shortcuts', icon: '⌨️' },
    { id: 'notepad-history', label: 'History', icon: '📚' },
  ],
  'notepad-history': [
    { id: 'notepad-shortcuts', label: 'Shortcuts', icon: '⌨️' },
    { id: 'notepad-tips', label: 'Tips & Tricks', icon: '💡' },
  ],
};

/**
 * Get quick actions for a given action ID
 */
export function getQuickActionsForContext(actionId: string): QuickAction[] {
  return QUICK_ACTIONS_MAP[actionId] || [];
}

/**
 * Get context information for a given action ID
 */
export function getActionContext(actionId: string): ActionContext | undefined {
  return ACTION_CONTEXT_MAP[actionId];
}
