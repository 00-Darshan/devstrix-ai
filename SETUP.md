# DevstriX AI - Setup & Configuration Guide

## Overview

DevstriX AI is a comprehensive multi-model AI chat application with advanced administrative capabilities. It allows administrators to configure multiple n8n webhooks connecting to different AI models for various use cases.

## Features

### Core Features
- Multi-model AI integration with dynamic webhook routing
- Advanced ChatGPT-inspired UI with dark/light themes
- Real-time conversation management
- Model selection per conversation
- Conversation pinning and search
- Export conversations (JSON/Text)
- Usage analytics and monitoring

### Admin Features (Admin Role Required)
- Webhook configuration panel (CRUD operations)
- AI model management
- Usage analytics dashboard
- User management
- Performance monitoring

## Database Schema

The application uses Supabase with the following tables:

1. **user_profiles** - User information and roles
2. **ai_models** - AI model definitions and configurations
3. **webhooks** - n8n webhook endpoints for each model
4. **conversations** - User chat conversations
5. **messages** - Individual messages in conversations
6. **usage_analytics** - Tracking and monitoring data

## Setup Instructions

### 1. Database Setup

The database migrations have been applied automatically. Your Supabase project includes:
- All required tables with RLS policies
- Indexes for optimal performance
- Security policies for admin and regular users

### 2. Making a User Admin

To grant admin access to a user:

```sql
-- Connect to your Supabase SQL Editor and run:
UPDATE user_profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_ID';
```

You can find your user ID in the Supabase Authentication dashboard.

### 3. Configuring AI Models

As an admin, you can add AI models:

1. Sign in to DevstriX AI
2. Click the Analytics icon in the header
3. Navigate to the "Models" tab
4. Click "Add Model"
5. Fill in:
   - **Name**: Display name (e.g., "GPT-4 Code Assistant")
   - **Description**: What this model does
   - **Use Case**: Select from dropdown (code, content, analysis, etc.)
   - **Icon**: Icon name from lucide-react
   - **Active**: Enable/disable the model

### 4. Configuring Webhooks

After creating models, configure their webhooks:

1. In Admin Dashboard, go to "Webhooks" tab
2. Click "Add Webhook"
3. Fill in:
   - **Name**: Webhook identifier
   - **Model**: Select the AI model
   - **URL**: Your n8n webhook URL
   - **API Key**: Optional authentication key
   - **Timeout**: Request timeout (default: 30s)
   - **Active**: Enable/disable

#### n8n Webhook Payload Format

Your n8n workflow should expect this payload:

```json
{
  "message": "User's message text",
  "conversation_id": "uuid",
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ],
  "settings": {
    "system_prompt": "You are a helpful assistant",
    "temperature": 0.7,
    "max_tokens": 2000
  }
}
```

Your n8n workflow should return:

```json
{
  "response": "AI generated response text"
}
```

Or alternatively:

```json
{
  "message": "AI generated response text"
}
```

## User Guide

### For Regular Users

1. **Starting a Conversation**
   - Click "New Conversation" button
   - Select an AI model (if multiple available)
   - Start chatting

2. **Managing Conversations**
   - Pin important conversations (pin icon)
   - Search conversations (search bar)
   - Rename conversations (edit icon)
   - Export conversations (download icon)
   - Delete conversations (trash icon)

3. **Switching Models**
   - Use the model selector at the top of chat
   - Different models are optimized for different tasks

### For Administrators

1. **Admin Dashboard Access**
   - Click the Analytics icon in header
   - View system statistics
   - Manage models and webhooks

2. **Monitoring Usage**
   - View total users, conversations, messages
   - Track token usage across models
   - Monitor average response times
   - Identify performance issues

3. **Model Management**
   - Create models for different use cases
   - Enable/disable models
   - Update model descriptions
   - Delete unused models

4. **Webhook Management**
   - Configure n8n endpoints
   - Test webhook connectivity
   - Update API keys and timeouts
   - Monitor webhook status

## Architecture

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- React Markdown for message rendering

### Backend
- Supabase for authentication and database
- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates

### Integration
- n8n webhooks for AI model connections
- Support for multiple AI providers
- Configurable timeouts and error handling

## Security

- All data protected by RLS policies
- Admin features restricted to admin role
- Webhook URLs and API keys stored securely
- User data isolated per account
- Analytics data access controlled

## Troubleshooting

### Webhook Not Responding
1. Check webhook is active in Admin Dashboard
2. Verify n8n workflow is running
3. Check timeout settings (increase if needed)
4. Verify webhook URL is accessible
5. Check n8n logs for errors

### Model Not Available
1. Verify model is marked as "Active"
2. Check webhook is configured and active
3. Ensure webhook URL is correct
4. Test webhook in n8n directly

### Permission Errors
1. Verify user has correct role in user_profiles
2. Check RLS policies are active
3. Ensure user is authenticated
4. Clear browser cache and re-login

## Best Practices

1. **Webhook Configuration**
   - Use meaningful names
   - Set appropriate timeouts (30-60s for most models)
   - Test webhooks before activating
   - Monitor webhook performance

2. **Model Organization**
   - Use clear, descriptive names
   - Assign appropriate use cases
   - Keep descriptions updated
   - Deactivate unused models

3. **User Management**
   - Grant admin access carefully
   - Regular users cannot access admin features
   - Monitor usage analytics regularly
   - Review and clean up old conversations

4. **Performance**
   - Monitor response times
   - Adjust timeouts as needed
   - Archive or delete old conversations
   - Keep active models to minimum needed

## Support

For issues or questions:
1. Check application logs in browser console
2. Review Supabase logs for database errors
3. Check n8n workflow execution logs
4. Verify webhook connectivity

## Updates and Maintenance

- Database migrations are handled automatically
- New features will be documented here
- Keep dependencies updated regularly
- Monitor security advisories

## Example n8n Workflows

### Basic AI Model Workflow

1. **Webhook Trigger** - Receive request
2. **Function Node** - Extract message and history
3. **HTTP Request** - Call AI API (OpenAI, Anthropic, etc.)
4. **Function Node** - Format response
5. **Respond to Webhook** - Return formatted response

### Advanced Workflow with RAG

1. **Webhook Trigger** - Receive request
2. **Vector Store** - Search relevant documents
3. **Function Node** - Build context with history
4. **HTTP Request** - Call AI with enhanced context
5. **Function Node** - Format response
6. **Respond to Webhook** - Return response

## License

All rights reserved.
