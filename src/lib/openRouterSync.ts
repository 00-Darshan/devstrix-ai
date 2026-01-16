import { openRouterService } from '../lib/openRouterService';
import { aiModelService } from '../lib/adminService';

/**
 * Utility to fetch available models from OpenRouter and optionally sync them to database
 */

interface ModelSyncOptions {
  autoActivate?: boolean;
  filterByTag?: string[];
  maxModels?: number;
}

/**
 * Fetch all available models from OpenRouter
 */
export async function fetchOpenRouterModels() {
  try {
    const models = await openRouterService.listModels();
    console.log(`Fetched ${models.length} models from OpenRouter`);
    return models;
  } catch (error) {
    console.error('Failed to fetch OpenRouter models:', error);
    throw error;
  }
}

/**
 * Get recommended models for common use cases
 */
export function getRecommendedModels() {
  return [
    {
      id: 'openai/gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Most capable GPT-4 model for complex tasks',
      use_case: 'general' as const,
    },
    {
      id: 'openai/gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for everyday tasks',
      use_case: 'general' as const,
    },
    {
      id: 'anthropic/claude-3-opus',
      name: 'Claude 3 Opus',
      description: 'Most powerful Claude for deep analysis',
      use_case: 'analysis' as const,
    },
    {
      id: 'anthropic/claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      description: 'Balanced Claude model',
      use_case: 'general' as const,
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: 'Fastest Claude model',
      use_case: 'general' as const,
    },
    {
      id: 'google/gemini-pro',
      name: 'Gemini Pro',
      description: 'Google\'s advanced AI',
      use_case: 'general' as const,
    },
    {
      id: 'meta-llama/llama-3-70b-instruct',
      name: 'Llama 3 70B',
      description: 'Open source powerhouse',
      use_case: 'general' as const,
    },
    {
      id: 'mistralai/mistral-large',
      name: 'Mistral Large',
      description: 'European AI excellence',
      use_case: 'general' as const,
    },
  ];
}

/**
 * Sync recommended models to database
 */
export async function syncRecommendedModels(options: ModelSyncOptions = {}) {
  const { autoActivate = true } = options;
  const recommended = getRecommendedModels();
  
  console.log(`Syncing ${recommended.length} recommended models...`);
  
  for (const model of recommended) {
    try {
      const existing = await aiModelService.getAll();
      const found = existing.find(m => m.openrouter_model === model.id);
      
      if (found) {
        console.log(`Model ${model.name} already exists, skipping...`);
        continue;
      }
      
      await aiModelService.create({
        name: model.name,
        description: model.description,
        use_case: model.use_case,
        icon: 'sparkles',
        is_active: autoActivate,
        openrouter_model: model.id,
      });
      
      console.log(`✅ Added ${model.name}`);
    } catch (error) {
      console.error(`❌ Failed to add ${model.name}:`, error);
    }
  }
  
  console.log('Sync complete!');
}

/**
 * Map OpenRouter model to use case based on name/description
 */
function inferUseCase(modelId: string, description?: string): 'general' | 'code' | 'content' | 'analysis' | 'image' | 'other' {
  const lower = `${modelId} ${description || ''}`.toLowerCase();
  
  if (lower.includes('code') || lower.includes('codestral')) return 'code';
  if (lower.includes('vision') || lower.includes('image') || lower.includes('dall-e')) return 'image';
  if (lower.includes('analysis') || lower.includes('research')) return 'analysis';
  if (lower.includes('content') || lower.includes('writer')) return 'content';
  
  return 'general';
}

/**
 * Sync ALL available models from OpenRouter (use with caution - can be 100+ models)
 */
export async function syncAllOpenRouterModels(options: ModelSyncOptions = {}) {
  const { autoActivate = false, filterByTag = [], maxModels = 50 } = options;
  
  const allModels = await fetchOpenRouterModels();
  console.log(`Found ${allModels.length} total models from OpenRouter`);
  
  let modelsToSync = allModels;
  
  // Apply filters if specified
  if (filterByTag.length > 0) {
    // OpenRouter models don't have tags in the basic response, so we filter by model ID patterns
    modelsToSync = modelsToSync.filter(m => 
      filterByTag.some(tag => m.id.toLowerCase().includes(tag.toLowerCase()))
    );
    console.log(`Filtered to ${modelsToSync.length} models matching tags: ${filterByTag.join(', ')}`);
  }
  
  // Limit number of models
  if (maxModels && modelsToSync.length > maxModels) {
    modelsToSync = modelsToSync.slice(0, maxModels);
    console.log(`Limited to first ${maxModels} models`);
  }
  
  for (const model of modelsToSync) {
    try {
      const existing = await aiModelService.getAll();
      const found = existing.find(m => m.openrouter_model === model.id);
      
      if (found) {
        console.log(`Model ${model.name} already exists, skipping...`);
        continue;
      }
      
      await aiModelService.create({
        name: model.name,
        description: model.description || `${model.name} via OpenRouter`,
        use_case: inferUseCase(model.id, model.description),
        icon: 'cpu',
        is_active: autoActivate,
        openrouter_model: model.id,
      });
      
      console.log(`✅ Added ${model.name}`);
    } catch (error) {
      console.error(`❌ Failed to add ${model.name}:`, error);
    }
  }
  
  console.log('Sync complete!');
}
