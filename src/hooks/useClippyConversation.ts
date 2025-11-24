import { useState, useCallback } from 'react';
import { ChatMessage, QuickAction } from '@/types/clippy';

interface UseClippyConversationProps {
  maxResponseLength: number;
  onTokenUsage?: (tokens: number) => void;
  onContextChange?: (context: string) => void;
}

export function useClippyConversation({
  maxResponseLength,
  onTokenUsage,
  onContextChange,
}: UseClippyConversationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentContext, setCurrentContext] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  const generateQuickActionsForContext = useCallback((actionId: string): QuickAction[] => {
    const quickActionsMap: Record<string, QuickAction[]> = {
      'play-doom': [
        { id: 'doom-controls', label: 'Game Controls', icon: '🎮' },
        { id: 'doom-history', label: 'Doom History', icon: '📚' },
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
        { id: 'notepad-history', label: 'Notepad History', icon: '📚' },
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

    return quickActionsMap[actionId] || [];
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const apiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: currentContext,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
          })),
          maxTokens: maxResponseLength,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const response = await apiResponse.json();

      if (onTokenUsage) {
        onTokenUsage(response.tokensUsed);
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        quickActions: response.quickActions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}` 
          : 'Sorry, I encountered an unexpected error.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [currentContext, messages, maxResponseLength, onTokenUsage]);

  const generateContextualResponse = useCallback(async (actionId: string) => {
    setIsTyping(true);

    try {
      const contextMap: Record<string, { context: string; topic: string }> = {
        'play-doom': {
          context: 'The user just launched Doom, the legendary first-person shooter game from 1993.',
          topic: 'doom game launched ready to play controls tips id software classic fps',
        },
        'doom-controls': {
          context: 'The user wants to learn the controls for playing Doom.',
          topic: 'doom game controls keyboard mouse movement shooting weapons',
        },
        'doom-history': {
          context: 'The user wants to know about the history of Doom.',
          topic: 'doom history 1993 id software john carmack john romero revolutionary fps',
        },
        'doom-tips': {
          context: 'The user wants survival tips for playing Doom.',
          topic: 'doom gameplay tips strategy survival secrets tricks',
        },
        'browse-internet': {
          context: 'The user just opened Internet Explorer to browse the web.',
          topic: 'internet explorer opened ready to browse web navigation features',
        },
        'internet-tips': {
          context: 'The user wants tips for browsing with Internet Explorer.',
          topic: 'internet explorer browsing tips navigation shortcuts favorites',
        },
        'internet-history': {
          context: 'The user wants to know about the history of Internet Explorer.',
          topic: 'internet explorer history microsoft windows 95 web browser evolution',
        },
        'internet-features': {
          context: 'The user wants to learn about Internet Explorer features.',
          topic: 'internet explorer features favorites bookmarks navigation tools',
        },
        'launch-minesweeper': {
          context: 'The user just opened Minesweeper, a classic puzzle game from Windows 95.',
          topic: 'minesweeper game rules strategy tips history',
        },
        'how-to-play': {
          context: 'The user wants to learn how to play Minesweeper.',
          topic: 'minesweeper rules gameplay instructions beginner guide',
        },
        'minesweeper-tips': {
          context: 'The user wants advanced tips for playing Minesweeper.',
          topic: 'minesweeper strategy advanced techniques patterns',
        },
        'minesweeper-history': {
          context: 'The user wants to know about the history of Minesweeper.',
          topic: 'minesweeper history origin windows 95 facts trivia',
        },
        'launch-notepad': {
          context: 'The user just opened Notepad, the classic Windows 95 text editor.',
          topic: 'notepad text editor features shortcuts tips windows 95',
        },
        'notepad-shortcuts': {
          context: 'The user wants to learn keyboard shortcuts for Notepad.',
          topic: 'notepad keyboard shortcuts hotkeys commands quick access',
        },
        'notepad-tips': {
          context: 'The user wants tips and tricks for using Notepad effectively.',
          topic: 'notepad tips tricks productivity features hidden functions',
        },
        'notepad-history': {
          context: 'The user wants to know about the history of Notepad.',
          topic: 'notepad history origin windows evolution facts trivia',
        },
      };

      const actionContext = contextMap[actionId];
      if (!actionContext) return;

      setCurrentContext(actionContext.context);
      if (onContextChange) {
        onContextChange(actionContext.context);
      }

      const apiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: actionContext.topic,
          context: actionContext.context,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
          })),
          maxTokens: maxResponseLength,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const response = await apiResponse.json();

      if (onTokenUsage) {
        onTokenUsage(response.tokensUsed);
      }

      const quickActions = response.quickActions || generateQuickActionsForContext(actionId);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        quickActions,
        context: actionContext.context,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}` 
          : 'Sorry, I encountered an unexpected error.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, maxResponseLength, onTokenUsage, onContextChange, generateQuickActionsForContext]);

  const initializeWelcome = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Clippy, your intelligent assistant! What would you like to do?",
      timestamp: new Date(),
      quickActions: [
        { id: 'play-doom', label: 'Play Doom', icon: '🎮' },
        { id: 'browse-internet', label: 'Browse Internet', icon: '🌐' },
        { id: 'launch-minesweeper', label: 'Launch Minesweeper', icon: '💣' },
        { id: 'launch-notepad', label: 'Launch Notepad', icon: '📝' },
      ],
    };
    setMessages([welcomeMessage]);
  }, []);

  return {
    messages,
    isTyping,
    currentContext,
    sendMessage,
    generateContextualResponse,
    initializeWelcome,
  };
}
