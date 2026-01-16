import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const { theme } = useTheme();

  const copyText = async (text?: string) => {
    await navigator.clipboard.writeText(text ?? message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className={`message-shell group ${isUser ? 'user' : 'ai'}`}>
      <header className="mb-1 flex items-center gap-3 text-xs text-[color:var(--text-muted)]">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold ${isUser
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
          }`}>
          {isUser ? 'You' : 'AI'}
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {!isUser && message.model_id && (
          <span className="rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase text-[color:var(--text-secondary)]">
            {message.model_id}
          </span>
        )}
        {!isUser && (
          <button
            onClick={() => copyText()}
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium hover:text-[color:var(--text-primary)]"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </header>

      {isUser ? (
        <div className="whitespace-pre-wrap">{message.content}</div>
      ) : (
        <div className="prose dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                if (!inline && match) {
                  return (
                    <div className="relative my-4 overflow-hidden rounded-xl border border-[color:var(--border)]">
                      <div className="flex items-center justify-between bg-[color:var(--panel-accent)] px-4 py-2 text-xs text-[color:var(--text-secondary)]">
                        <span>{match[1]}</span>
                        <button
                          onClick={() => copyText(String(children))}
                          className="hover:text-[color:var(--text-primary)]"
                        >
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={theme === 'dark' ? oneDark : oneLight}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: 0 }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code className="rounded bg-[color:var(--panel-accent)] px-1.5 py-0.5 text-[0.85em] font-medium text-[color:var(--text-primary)]" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      )}
    </article>
  );
};
