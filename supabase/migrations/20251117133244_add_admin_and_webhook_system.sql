/*
  # Add Admin and Multi-Model Webhook System

  ## 1. New Tables
  
  ### user_profiles
  - `id` (uuid, primary key) - References auth.users
  - `role` (text) - User role: 'user' or 'admin'
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last profile update
  
  ### ai_models
  - `id` (uuid, primary key) - Unique model identifier
  - `name` (text) - Model display name (e.g., "GPT-4 Code Assistant")
  - `description` (text) - Model capabilities description
  - `use_case` (text) - Primary use case (e.g., "code", "content", "analysis")
  - `icon` (text) - Icon name for UI
  - `is_active` (boolean) - Whether model is available
  - `created_at` (timestamptz) - Model creation time
  - `updated_at` (timestamptz) - Last update time
  
  ### webhooks
  - `id` (uuid, primary key) - Unique webhook identifier
  - `model_id` (uuid, foreign key) - References ai_models
  - `name` (text) - Webhook display name
  - `url` (text) - n8n webhook URL
  - `api_key` (text) - Optional API key for webhook
  - `headers` (jsonb) - Additional headers for requests
  - `is_active` (boolean) - Whether webhook is enabled
  - `timeout_seconds` (integer) - Request timeout
  - `created_at` (timestamptz) - Webhook creation time
  - `updated_at` (timestamptz) - Last update time
  
  ### usage_analytics
  - `id` (uuid, primary key) - Unique analytics record
  - `user_id` (uuid, foreign key) - References auth.users
  - `model_id` (uuid, foreign key) - References ai_models
  - `conversation_id` (uuid, foreign key) - References conversations
  - `message_count` (integer) - Number of messages
  - `tokens_used` (integer) - Estimated tokens used
  - `response_time_ms` (integer) - Response time in milliseconds
  - `success` (boolean) - Whether request succeeded
  - `error_message` (text) - Error message if failed
  - `created_at` (timestamptz) - Analytics timestamp

  ## 2. Table Modifications
  
  ### conversations
  - Add `model_id` (uuid, foreign key) - Track which model was used
  - Add `is_pinned` (boolean) - Allow pinning conversations
  
  ### messages
  - Add `model_id` (uuid, foreign key) - Track which model generated response
  - Add `tokens_used` (integer) - Track token usage per message
  - Add `response_time_ms` (integer) - Track response time

  ## 3. Security
  - Enable RLS on all new tables
  - Admin-only policies for webhooks and models management
  - User policies for viewing available models
  - Analytics viewable by admins and own user data

  ## 4. Indexes
  - Index on user_profiles.role for admin queries
  - Index on webhooks.model_id for lookup
  - Index on usage_analytics.user_id and created_at for analytics
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create ai_models table
CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  use_case text NOT NULL CHECK (use_case IN ('general', 'code', 'content', 'analysis', 'image', 'other')),
  icon text NOT NULL DEFAULT 'bot',
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES ai_models(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  api_key text DEFAULT '',
  headers jsonb DEFAULT '{}'::jsonb NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  timeout_seconds integer DEFAULT 30 NOT NULL CHECK (timeout_seconds > 0 AND timeout_seconds <= 300),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create usage_analytics table
CREATE TABLE IF NOT EXISTS usage_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model_id uuid REFERENCES ai_models(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  message_count integer DEFAULT 1 NOT NULL,
  tokens_used integer DEFAULT 0 NOT NULL,
  response_time_ms integer DEFAULT 0 NOT NULL,
  success boolean DEFAULT true NOT NULL,
  error_message text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Modify conversations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'model_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN model_id uuid REFERENCES ai_models(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE conversations ADD COLUMN is_pinned boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Modify messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'model_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN model_id uuid REFERENCES ai_models(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'tokens_used'
  ) THEN
    ALTER TABLE messages ADD COLUMN tokens_used integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'response_time_ms'
  ) THEN
    ALTER TABLE messages ADD COLUMN response_time_ms integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_webhooks_model_id ON webhooks(model_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_created_at ON usage_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_model_id ON conversations(model_id);
CREATE INDEX IF NOT EXISTS idx_messages_model_id ON messages(model_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- AI Models Policies
CREATE POLICY "Everyone can view active models"
  ON ai_models FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage all models"
  ON ai_models FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Webhooks Policies (Admin only)
CREATE POLICY "Admins can view all webhooks"
  ON webhooks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert webhooks"
  ON webhooks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update webhooks"
  ON webhooks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete webhooks"
  ON webhooks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Usage Analytics Policies
CREATE POLICY "Users can view own analytics"
  ON usage_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
  ON usage_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert analytics"
  ON usage_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);