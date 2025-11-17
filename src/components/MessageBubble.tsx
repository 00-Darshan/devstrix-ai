import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
          isUser ? 'bg-neutral-700 text-white' : 'bg-white text-black'
        }`}>
          {isUser ? 'Y' : 'AI'}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className={`group relative ${isUser ? 'text-white' : 'text-neutral-200'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none prose-pre:bg-black prose-pre:border prose-pre:border-neutral-800">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          background: '#000',
                          border: '1px solid #262626',
                          borderRadius: '8px',
                          padding: '16px',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-sm" {...props}>
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

          {!isUser && (
            <button
              onClick={copyToClipboard}
              className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-neutral-800"
              title="Copy message"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-neutral-400" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
