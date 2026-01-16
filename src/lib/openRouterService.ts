/**
 * OpenRouter API integration service (Edge Function-based)
 * Securely calls OpenRouter API through Supabase Edge Functions
 * API keys are stored server-side as environment variables
 */

import { supabase } from './supabase';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export interface ChatResponse {
  content: string;
  tokens_used: number;
  response_time_ms: number;
  model: string;
}

class OpenRouterService {
  private edgeFunctionUrl: string;

  constructor() {
    // Use the Supabase URL from environment
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url) {
      throw new Error('VITE_SUPABASE_URL not configured');
    }
    this.edgeFunctionUrl = `${url}/functions/v1/openrouter`;
  }

  /**
   * Fetch available models from OpenRouter
   */
  async listModels(): Promise<OpenRouterModel[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'list-models',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch models');
      }

      const data: OpenRouterModelsResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      throw error;
    }
  }

  /**
   * Send a chat message through OpenRouter
   */
  async chat(
    model: string,
    messages: OpenRouterMessage[],
    options?: {
      temperature?: number;
      max_tokens?: number;
      conversation_id?: string;
      model_id?: string;
    }
  ): Promise<ChatResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // [DEBUG] Log the auth state to verify token presence
      console.log('[OpenRouter Debug] Chat Request Session:', {
        user: session?.user?.id,
        hasToken: !!session?.access_token
      });

      if (!session) {
        console.error('[OpenRouter Debug] No active session found for chat');
        throw new Error('Not authenticated');
      }

      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          model,
          messages,
          temperature: options?.temperature,
          max_tokens: options?.max_tokens,
          conversation_id: options?.conversation_id,
          model_id: options?.model_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending OpenRouter chat:', error);
      throw error;
    }
  }

  /**
   * Helper method to send a simple message and get a response
   */
  async sendMessage(
    model: string,
    message: string,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      history?: OpenRouterMessage[];
      conversation_id?: string;
      model_id?: string;
    }
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [];

    // Add system prompt if provided
    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    // Add conversation history if provided
    if (options?.history) {
      messages.push(...options.history);
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    const response = await this.chat(model, messages, {
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      conversation_id: options?.conversation_id,
      model_id: options?.model_id,
    });

    return response.content;
  }
}

export const openRouterService = new OpenRouterService();
