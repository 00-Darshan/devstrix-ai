-- Add OpenRouter model field to ai_models table
ALTER TABLE ai_models
ADD COLUMN IF NOT EXISTS openrouter_model TEXT;

-- Add comment for documentation
COMMENT ON COLUMN ai_models.openrouter_model IS 'The OpenRouter model identifier (e.g., openai/gpt-4, anthropic/claude-3-opus)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_models_openrouter ON ai_models(openrouter_model);
