'use client';

import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types/clippy';
import styles from './ClippyAssistant.module.css';

import { QuickActionId } from '@/types/quickActions';

interface ClippyMessageProps {
  message: ChatMessage;
  onQuickAction: (actionId: QuickActionId) => void;
}

export default function ClippyMessage({
  message,
  onQuickAction,
}: ClippyMessageProps) {
  return (
    <div
      className={`${styles.message} ${
        message.role === 'user' ? styles.userMessage : styles.assistantMessage
      }`}
    >
      <div className={styles.messageContent}>
        {message.role === 'assistant' ? (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        ) : (
          message.content
        )}
      </div>
      {message.quickActions && message.quickActions.length > 0 && (
        <div className={styles.quickActionsInline}>
          {message.quickActions.map((action) => (
            <button
              key={action.id}
              className={styles.quickActionButton}
              onClick={() => onQuickAction(action.id)}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      )}
      <div className={styles.messageTime}>
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
}
