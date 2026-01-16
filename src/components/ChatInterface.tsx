import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Send, Loader2, Mic, Paperclip, Sparkles, Command } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { MessageBubble } from './MessageBubble';
import { ModelSelector } from './ModelSelector';

export const ChatInterface: React.FC = () => {
  const {
    messages,
    isLoading,
    sendMessage,
    currentConversationId,
    selectedModel,
    availableModels,
    createConversation,
    setSelectedModel,
  } = useChat();

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
  }, [input]);

  const ensureConversation = useCallback(async () => {
    if (currentConversationId) {
      return currentConversationId;
    }
    if (!selectedModel) {
      setError('Select a model before starting a conversation.');
      return null;
    }
    try {
      return await createConversation();
    } catch (err) {
      setError('Unable to start a chat. Try again.');
      return null;
    }
  }, [currentConversationId, selectedModel, createConversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setError(null);
    const payload = input.trim();
    setInput('');
    try {
      const conversationId = await ensureConversation();
      if (!conversationId) return;
      await sendMessage(payload, { conversationId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const emptyState = useMemo(() => (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center animate-fade-in">
      <div className="max-w-xl space-y-8">
        <div className="space-y-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-bold text-[color:var(--text-primary)]">Good Morning</h2>
          <p className="text-base text-[color:var(--text-secondary)]">
            {availableModels.length === 0
              ? 'No models configured yet.'
              : 'How can I help you today?'}
          </p>
        </div>

        {availableModels.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Summarize text', icon: '📝' },
              { label: 'Debug code', icon: '🐛' },
              { label: 'Write email', icon: '✉️' },
              { label: 'Brainstorm', icon: '💡' }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => setInput(item.label)}
                className="card-base card-hover flex flex-col items-center gap-2 p-4 text-center hover:bg-gray-50/50 dark:hover:bg-neutral-800"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-medium text-[color:var(--text-primary)]">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  ), [availableModels.length]);

  const body = currentConversationId ? (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="message-shell ai">
              <div className="flex items-center gap-3 text-sm text-[color:var(--text-secondary)]">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  ) : emptyState;

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[color:var(--surface)]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {body}
      </div>

      {/* Input Area */}
      <div className="bg-[color:var(--surface)] px-4 pb-6 pt-2">
        <div className="mx-auto w-full max-w-3xl">
          {/* Error Message */}
          {(!selectedModel || error) && (
            <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {!selectedModel ? 'Please select a model first.' : error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative flex w-full items-end gap-2 rounded-2xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
            <button type="button" className="rounded-xl p-2.5 text-[color:var(--text-muted)] hover:bg-[color:var(--panel-accent)] hover:text-[color:var(--text-primary)] transition-colors">
              <Paperclip size={20} />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-base text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] focus:outline-none"
              rows={1}
            />

            <div className="flex items-center gap-1 pb-1">
              <button type="button" className="rounded-xl p-2 text-[color:var(--text-muted)] hover:bg-[color:var(--panel-accent)] hover:text-[color:var(--text-primary)] transition-colors">
                <Mic size={20} />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center rounded-xl bg-[color:var(--text-primary)] p-2 text-[color:var(--surface)] transition-all hover:opacity-90 disabled:opacity-30"
              >
                <Send size={18} strokeWidth={2.5} />
              </button>
            </div>
          </form>

          <div className="mt-2 text-center text-xs text-[color:var(--text-muted)]">
            AI can make mistakes. Please verify important information.
          </div>
        </div>
      </div>
    </main>
  );
};
