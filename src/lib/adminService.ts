import { supabase } from './supabase';
import { AIModel, Webhook, UsageAnalytics, AdminStats } from '../types';

export const aiModelService = {
  async getAll(): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<AIModel | null> {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(model: Omit<AIModel, 'id' | 'created_at' | 'updated_at'>): Promise<AIModel> {
    const { data, error } = await supabase
      .from('ai_models')
      .insert(model)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<AIModel>): Promise<AIModel> {
    const { data, error } = await supabase
      .from('ai_models')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ai_models')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const webhookService = {
  async getAll(): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByModelId(modelId: string): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('model_id', modelId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveByModelId(modelId: string): Promise<Webhook | null> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('model_id', modelId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(webhook: Omit<Webhook, 'id' | 'created_at' | 'updated_at'>): Promise<Webhook> {
    const { data, error } = await supabase
      .from('webhooks')
      .insert(webhook)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Webhook>): Promise<Webhook> {
    const { data, error } = await supabase
      .from('webhooks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async callWebhook(webhook: Webhook, payload: any): Promise<any> {
    console.log('🔗 Calling webhook:', webhook.name);
    console.log('📤 Webhook URL:', webhook.url);
    console.log('📦 Payload:', payload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(webhook.headers || {}),
    };

    if (webhook.auth_type === 'api_key' && webhook.api_key) {
      headers['Authorization'] = `Bearer ${webhook.api_key}`;
    }

    if (webhook.auth_type === 'basic' && webhook.basic_auth_username) {
      const password = webhook.basic_auth_password || '';
      const credentials = btoa(`${webhook.basic_auth_username}:${password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const controller = new AbortController();
    const timeoutSeconds = Math.max(5, Math.min(webhook.timeout_seconds || 60, 300));
    const timeoutMs = timeoutSeconds * 1000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const startTime = Date.now();
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const elapsed = Date.now() - startTime;

      console.log(`✅ Webhook responded in ${elapsed}ms`);
      console.log('📊 Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Webhook error response:', errorText);
        throw new Error(`Webhook failed with status ${response.status}: ${response.statusText}\n${errorText}`);
      }

      const responseData = await response.json();
      console.log('📥 Webhook response:', responseData);

      if (!responseData.response && !responseData.message && !responseData.output) {
        console.warn('⚠️ Webhook response missing expected fields');
        console.warn('📋 Expected one of: "response", "message", or "output"');
        console.warn('📋 Full response:', responseData);
        throw new Error('Webhook response is missing expected field. Received: ' + JSON.stringify(responseData));
      }

      return responseData;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error.name === 'AbortError') {
        console.error(`⏱️ Webhook timeout after ${timeoutMs}ms`);
        throw new Error(`Webhook timeout after ${timeoutSeconds} seconds. Your n8n workflow may be taking too long to respond.`);
      }

      console.error('❌ Webhook call failed:', error);
      throw error;
    }
  },
};

export const analyticsService = {
  async logUsage(analytics: Omit<UsageAnalytics, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('usage_analytics')
      .insert(analytics);

    if (error) throw error;
  },

  async getUserAnalytics(userId: string, limit: number = 100): Promise<UsageAnalytics[]> {
    const { data, error } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getAdminStats(): Promise<AdminStats> {
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true });

    const { data: conversations } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true });

    const { data: messages } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true });

    const { data: models } = await supabase
      .from('ai_models')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    const { data: analytics } = await supabase
      .from('usage_analytics')
      .select('tokens_used, response_time_ms');

    const totalTokens = analytics?.reduce((sum, a) => sum + a.tokens_used, 0) || 0;
    const avgResponseTime = analytics && analytics.length > 0
      ? Math.round(analytics.reduce((sum, a) => sum + a.response_time_ms, 0) / analytics.length)
      : 0;

    return {
      totalUsers: users?.length || 0,
      totalConversations: conversations?.length || 0,
      totalMessages: messages?.length || 0,
      activeModels: models?.length || 0,
      totalTokensUsed: totalTokens,
      avgResponseTime,
    };
  },

  async getModelUsageStats(days: number = 30): Promise<any[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const { data, error } = await supabase
      .from('usage_analytics')
      .select('model_id, tokens_used, response_time_ms, success, created_at')
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
