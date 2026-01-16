import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  action: 'list-models' | 'chat'
  model?: string
  messages?: ChatMessage[]
  temperature?: number
  max_tokens?: number
  conversation_id?: string
  model_id?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Extract token to verify explicitly
    const token = authHeader.replace('Bearer ', '')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Explicitly verify user with token
    // This fixes the "Auth session missing" error by bypassing the implicit session check
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error('Auth Error:', userError?.message || 'No user found')
      return new Response(JSON.stringify({
        error: `Unauthorized: ${userError?.message || 'User not found'}`,
        debug: {
          step: 'getUser(token)',
          hasAuthHeader: !!authHeader
        }
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get OpenRouter API key from environment
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterApiKey) {
      console.error('Configuration Error: OPENROUTER_API_KEY is missing')
      throw new Error('OpenRouter API key not configured on server')
    }

    const requestData: ChatRequest = await req.json()
    const { action } = requestData

    // Handle list-models action
    if (action === 'list-models') {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter List Models Error:', errorText)
        throw new Error(`OpenRouter API error: ${errorText}`)
      }

      const data = await response.json()

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Handle chat action
    if (action === 'chat') {
      const { model, messages, temperature, max_tokens, conversation_id, model_id } = requestData

      if (!model || !messages) {
        throw new Error('Missing required parameters: model and messages')
      }

      const siteUrl = Deno.env.get('OPENROUTER_SITE_URL') || ''
      const siteName = Deno.env.get('OPENROUTER_SITE_NAME') || 'DevstriX AI'

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      }

      if (siteUrl) {
        headers['HTTP-Referer'] = siteUrl
      }
      if (siteName) {
        headers['X-Title'] = siteName
      }

      const startTime = Date.now()

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages,
          temperature: temperature ?? 0.7,
          max_tokens: max_tokens ?? 2000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter Chat Error:', errorText)
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime

      const assistantContent = data.choices[0]?.message?.content || ''
      const tokensUsed = data.usage?.total_tokens || 0

      // Store the message in database if conversation_id provided
      if (conversation_id && model_id) {
        await supabaseClient.from('messages').insert({
          conversation_id,
          role: 'assistant',
          content: assistantContent,
          model_id,
          tokens_used: tokensUsed,
          response_time_ms: responseTime,
        })

        // Log analytics
        await supabaseClient.from('usage_analytics').insert({
          user_id: user.id,
          model_id,
          conversation_id,
          message_count: 1,
          tokens_used: tokensUsed,
          response_time_ms: responseTime,
          success: true,
        })
      }

      return new Response(JSON.stringify({
        content: assistantContent,
        tokens_used: tokensUsed,
        response_time_ms: responseTime,
        model: data.model,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
