import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader2, Mic, Paperclip, ChevronDown } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { MessageBubble } from './MessageBubble';

export const ChatInterface: React.FC = () => {
  const { messages, isLoading, sendMessage, currentConversationId, selectedModel, availableModels, createConversation, setSelectedModel } = useChat();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentConversationId) return;

    const message = input.trim();
    setInput('');
    setError(null);

    try {
      await sendMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  if (!currentConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-950">
        <div className="text-center max-w-2xl px-6">
          <h1 className="text-4xl font-semibold text-white mb-4">What are you working on?</h1>
          <p className="text-neutral-400 text-lg mb-6">
            {availableModels.length === 0
              ? 'No AI models available. Please ask an admin to add models in settings.'
              : 'Click the "New chat" button in the sidebar to get started'}
          </p>
          {availableModels.length > 0 && (
            <button
              onClick={createConversation}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors font-medium"
            >
              Start New Chat
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Typing indicator while waiting for AI response */}
          {isLoading && (
            <div className="flex gap-4 mb-6 animate-fadeIn">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm bg-white text-black">
                  AI
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 text-neutral-400">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-sm text-neutral-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-neutral-800 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {!selectedModel && (
            <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-400">⚠️ No AI model selected. Please ask an admin to configure models and webhooks.</p>
            </div>
          )}
          {error && (
            <div className="mb-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Model Selector Dropdown */}
          {availableModels.length > 1 && selectedModel && (
            <div className="mb-3 relative">
              <button
                type="button"
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
              >
                <span className="text-xs text-neutral-400">Using:</span>
                <span className="text-sm font-medium text-white">{selectedModel.name}</span>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
              </button>

              {showModelSelector && (
                <div className="absolute bottom-full mb-2 w-full bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl overflow-hidden z-10">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelSelector(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left hover:bg-neutral-700 transition-colors ${
                        selectedModel.id === model.id ? 'bg-neutral-700' : ''
                      }`}
                    >
                      <div className="font-medium text-white text-sm">{model.name}</div>
                      <div className="text-xs text-neutral-400">{model.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2 bg-neutral-900 rounded-2xl border border-neutral-700 focus-within:border-neutral-600 p-2">
              <button
                type="button"
                className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-800"
              >
                <Paperclip size={20} />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask anything"
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-neutral-500 focus:outline-none resize-none max-h-[200px] py-2 text-[15px]"
              />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-800"
                >
                  <Mic size={20} />
                </button>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-white text-black rounded-lg hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </form>

          <p className="text-xs text-neutral-500 text-center mt-3">
            DevstriX AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};
