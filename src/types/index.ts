export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  model_id?: string;
  tokens_used?: number;
  response_time_ms?: number;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  model_id?: string;
  is_pinned?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  use_case: 'general' | 'code' | 'content' | 'analysis' | 'image' | 'other';
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  model_id: string;
  name: string;
  url: string;
  api_key?: string;
  headers?: Record<string, string>;
  is_active: boolean;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  role: 'user' | 'admin';
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface UsageAnalytics {
  id: string;
  user_id: string;
  model_id?: string;
  conversation_id?: string;
  message_count: number;
  tokens_used: number;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface Settings {
  apiUrl: string;
  apiKey: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface ChatRequest {
  message: string;
  conversation_id: string;
  model_id?: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  settings?: {
    system_prompt?: string;
    temperature?: number;
    max_tokens?: number;
  };
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  settings: Settings;
  selectedModel?: AIModel;
}

export interface AdminStats {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  activeModels: number;
  totalTokensUsed: number;
  avgResponseTime: number;
}
