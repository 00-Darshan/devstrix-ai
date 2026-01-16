import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { database } from '../lib/database';
import { aiModelService, analyticsService } from '../lib/adminService';
import { openRouterService } from '../lib/openRouterService';
import type { Conversation, Message, Settings, ChatState, AIModel } from '../types';

interface SendMessageOptions {
  conversationId?: string;
}

interface ChatContextType extends ChatState {
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  createConversation: () => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  setCurrentConversation: (id: string | null) => void;
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
  clearAllConversations: () => Promise<void>;
  exportConversation: (id: string, format: 'json' | 'text') => void;
  userId: string | null;
  availableModels: AIModel[];
  setSelectedModel: (model: AIModel | undefined) => void;
  togglePinConversation: (id: string) => Promise<void>;
  searchConversations: (query: string) => Conversation[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  systemPrompt: 'You are a helpful assistant.',
  temperature: 0.7,
  maxTokens: 2000
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | undefined>();
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('chat-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('conversation');
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        try {
          const data = await database.getConversations();
          setConversations(data);
          const models = await aiModelService.getActive();
          setAvailableModels(models);
          if (models.length > 0 && !selectedModel) {
            setSelectedModel(models[0]);
          }
        } catch (error) {
          console.error('Error loading conversations:', error);
        }
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    localStorage.setItem('chat-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (currentConversationId) {
      params.set('conversation', currentConversationId);
    } else {
      params.delete('conversation');
    }
    const query = params.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
  }, [currentConversationId]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const conversation = currentConversationId
      ? conversations.find(c => c.id === currentConversationId)
      : null;
    const title = conversation && conversation.title && conversation.title !== 'New Conversation'
      ? `${conversation.title} · DevstriX AI`
      : 'DevstriX AI';
    document.title = title;
  }, [currentConversationId, conversations]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await database.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await database.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  const createConversation = useCallback(async (): Promise<string> => {
    if (!userId) throw new Error('Not authenticated');

    const conversation = await database.createConversation(userId, selectedModel?.id);
    setConversations(prev => [conversation, ...prev]);
    setCurrentConversationId(conversation.id);
    setMessages([]);
    return conversation.id;
  }, [userId, selectedModel]);

  const deleteConversation = useCallback(async (id: string) => {
    await database.deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [currentConversationId]);

  const renameConversation = useCallback(async (id: string, title: string) => {
    await database.updateConversation(id, { title });
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  }, []);

  const setCurrentConversation = useCallback((id: string | null) => {
    setCurrentConversationId(id);
    if (id) {
      loadMessages(id);
    } else {
      setMessages([]);
    }
  }, [loadMessages]);

  useEffect(() => {
    if (!pendingConversationId) return;
    const exists = conversations.some(c => c.id === pendingConversationId);
    if (exists) {
      setCurrentConversation(pendingConversationId);
      setPendingConversationId(null);
    }
  }, [pendingConversationId, conversations, setCurrentConversation]);

  const sendMessage = useCallback(async (content: string, options?: SendMessageOptions) => {
    const targetConversationId = options?.conversationId ?? currentConversationId;
    if (!targetConversationId || !selectedModel || !userId) return;

    const startTime = Date.now();
    setIsLoading(true);

    try {
      const userMessage = await database.createMessage(targetConversationId, 'user', content, selectedModel.id);
      setMessages(prev => [...prev, userMessage]);

      const currentConv = conversations.find(c => c.id === targetConversationId);
      if (currentConv && currentConv.title === 'New Conversation') {
        const newTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await renameConversation(targetConversationId, newTitle);
      }

      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Use OpenRouter for all models
      const openRouterModel = selectedModel.openrouter_model || selectedModel.id;
      
      await openRouterService.sendMessage(
        openRouterModel,
        content,
        {
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          history: history as any,
          conversation_id: targetConversationId,
          model_id: selectedModel.id,
        }
      );

      // The edge function already stored the message and analytics
      // Reload messages to show the AI response
      await loadMessages(targetConversationId);
      await loadConversations();
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('Error sending message:', error);

      if (userId && selectedModel) {
        await analyticsService.logUsage({
          user_id: userId,
          model_id: selectedModel.id,
          conversation_id: targetConversationId,
          message_count: 1,
          tokens_used: 0,
          response_time_ms: responseTime,
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, messages, settings, conversations, renameConversation, loadConversations, selectedModel, userId]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const clearAllConversations = useCallback(async () => {
    for (const conv of conversations) {
      await database.deleteConversation(conv.id);
    }
    setConversations([]);
    setCurrentConversationId(null);
    setMessages([]);
  }, [conversations]);

  const togglePinConversation = useCallback(async (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    await database.updateConversation(id, { is_pinned: !conversation.is_pinned });
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, is_pinned: !c.is_pinned } : c
    ));
  }, [conversations]);

  const searchConversations = useCallback((query: string): Conversation[] => {
    if (!query.trim()) return conversations;
    const lowerQuery = query.toLowerCase();
    return conversations.filter(c =>
      c.title.toLowerCase().includes(lowerQuery)
    );
  }, [conversations]);

  const exportConversation = useCallback((id: string, format: 'json' | 'text') => {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    database.getMessages(id).then(msgs => {
      let content: string;
      let filename: string;

      if (format === 'json') {
        content = JSON.stringify({ conversation, messages: msgs }, null, 2);
        filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}.json`;
      } else {
        content = `${conversation.title}\n${new Date(conversation.created_at).toLocaleString()}\n\n`;
        content += msgs.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
        filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [conversations]);

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversationId,
      messages,
      isLoading,
      settings,
      userId,
      availableModels,
      selectedModel,
      setSelectedModel,
      loadConversations,
      loadMessages,
      createConversation,
      deleteConversation,
      renameConversation,
      setCurrentConversation,
      sendMessage,
      updateSettings,
      clearAllConversations,
      exportConversation,
      togglePinConversation,
      searchConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
