# Troubleshooting Guide - DevstriX AI

## Issue: Unable to Send Messages or See Model Selector

This guide will help you diagnose and fix common issues with sending messages and model selection.

---

## Quick Diagnostic Checklist

Check these items in order:

### 1. Are AI Models Configured?

**Symptoms:**
- Header shows "No models configured" or "No models available"
- Can't send messages
- Model selector not visible

**Solution:**
1. Login as admin user (hemanth@securitysavvy.info)
2. Click the settings icon (⚙️) in the header (top right)
3. Go to "AI Models" section
4. Click "Add Model"
5. Fill in:
   - **Model Name**: e.g., "GPT-4"
   - **Use Case**: Select appropriate type (general/code/content/analysis)
   - **Description**: Brief description of the model
   - **Active**: Make sure it's checked
6. Click "Save Model"

**Verify:**
- Refresh the page
- You should now see the model name in the header
- Example: "Model: GPT-4"

---

### 2. Are Webhooks Configured?

**Symptoms:**
- Models appear in header
- Can send message, but get error: "No active webhook configured for this model"
- Message fails to send

**Solution:**
1. Open Settings (⚙️ icon as admin)
2. Go to "Webhooks" section
3. Click "Add Webhook"
4. Fill in:
   - **Webhook Name**: e.g., "GPT-4 Webhook"
   - **Select AI Model**: Choose the model you created (e.g., "GPT-4")
   - **Webhook URL**: Your n8n webhook URL
     - Example: `https://your-n8n-instance.com/webhook/gpt4`
     - **IMPORTANT**: This must be a valid, working URL
   - **Active**: Make sure it's checked
5. Click "Save Webhook"

**Verify:**
- You should see "Mapped to: [Model Name]" under the webhook
- Try sending a test message

---

### 3. Is There an Active Conversation?

**Symptoms:**
- Center of screen shows "What are you working on?"
- Message says "Click the 'New chat' button in the sidebar"
- No conversation is active

**Solution:**
1. Click the "New chat" button in the sidebar (top left)
   - OR -
2. Click the "Start New Chat" button in the center

**Verify:**
- Conversation list in sidebar should show a new entry
- Message input area should be enabled at the bottom

---

### 4. Webhook URL Issues

**Common Webhook Problems:**

#### Problem: Webhook times out
**Cause:** Webhook URL is unreachable or takes too long to respond

**Solutions:**
- Verify the URL is correct and accessible
- Test the URL in your browser or Postman
- Check if your n8n instance is running
- Increase timeout in webhook settings (default: 30 seconds)

#### Problem: Webhook returns error
**Cause:** Webhook expects different payload format

**Expected Payload Format:**
```json
{
  "message": "User's message",
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

**Expected Response Format:**
```json
{
  "response": "AI generated response text here"
}
```

Or:
```json
{
  "message": "AI generated response text here"
}
```

#### Problem: CORS error in browser console
**Cause:** Webhook doesn't have proper CORS headers

**Solution (n8n):**
Add a "Set Response Headers" step in your workflow:
- `Access-Control-Allow-Origin`: `*`
- `Access-Control-Allow-Methods`: `POST, GET, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type`

---

## Step-by-Step Setup Guide

### Complete Setup Process:

#### Step 1: Login as Admin
```
Email: hemanth@securitysavvy.info
Password: [your admin password]
```

#### Step 2: Add AI Model
1. Click settings icon (⚙️) in header
2. Scroll to "AI Models" section
3. Click "Add Model"
4. Enter details:
   ```
   Name: GPT-4 Turbo
   Use Case: general
   Description: OpenAI's GPT-4 Turbo model
   ```
5. Click "Save Model"
6. Verify model appears in the list

#### Step 3: Add Webhook
1. Still in settings, scroll to "Webhooks" section
2. Click "Add Webhook"
3. Enter details:
   ```
   Name: GPT-4 Turbo Webhook
   Model: GPT-4 Turbo (select from dropdown)
   URL: https://your-n8n.com/webhook/gpt4
   ```
4. Click "Save Webhook"
5. Verify "Mapped to: GPT-4 Turbo" shows under webhook

#### Step 4: Test the Setup
1. Close settings
2. Check header shows: "Model: GPT-4 Turbo"
3. Click "New chat" in sidebar
4. Type a message: "Hello, can you hear me?"
5. Press Enter or click Send button
6. Wait for response (may take a few seconds)

---

## Debugging Tips

### Check Browser Console

Open browser developer tools (F12) and check Console tab for errors:

**Common Errors and Solutions:**

1. **"No active webhook configured for this model"**
   - Go to settings
   - Verify webhook is created
   - Verify webhook's "Select AI Model" dropdown has the correct model selected
   - Verify webhook is active (not grayed out)

2. **"Failed to fetch" or "Network error"**
   - Check webhook URL is correct
   - Verify n8n instance is running and accessible
   - Test URL in browser directly

3. **"TypeError: Cannot read property..."**
   - May indicate webhook returned unexpected format
   - Check webhook response includes `response` or `message` field

### Check Network Tab

In developer tools, go to Network tab:

1. Type a message and send
2. Look for a request to your webhook URL
3. Click on it to see:
   - **Request Payload**: What was sent to webhook
   - **Response**: What webhook returned
   - **Status Code**: Should be 200 for success

**Status Codes:**
- `200`: Success - webhook worked
- `404`: Webhook URL not found - check URL
- `500`: Internal server error - check webhook/n8n logs
- `CORS error`: Missing CORS headers - add CORS to webhook

---

## Visual Indicators

### Header Status Indicators:

**Good (Model Working):**
```
┌─────────────────────────────────────────┐
│ [Logo] DevstriX   [Model: GPT-4]   ☀️ ⚙️│
└─────────────────────────────────────────┘
```

**Warning (No Model Selected):**
```
┌──────────────────────────────────────────────┐
│ [Logo] DevstriX   [⚠️ No model selected]  ☀️ ⚙️│
└──────────────────────────────────────────────┘
```

**Error (Admin - No Models):**
```
┌────────────────────────────────────────────────────────────┐
│ [Logo] DevstriX   [⚠️ No models configured - Configure in settings]  ☀️ ⚙️│
└────────────────────────────────────────────────────────────┘
```

**Error (User - No Models):**
```
┌──────────────────────────────────────────────────────┐
│ [Logo] DevstriX   [⚠️ No models available - Contact admin]  ☀️ ⚙️│
└──────────────────────────────────────────────────────┘
```

---

## Database Verification

If issues persist, verify database directly:

### Check AI Models Table:
```sql
SELECT id, name, is_active
FROM ai_models
WHERE is_active = true;
```

Should return at least one row.

### Check Webhooks Table:
```sql
SELECT w.id, w.name, w.url, w.is_active, m.name as model_name
FROM webhooks w
JOIN ai_models m ON w.model_id = m.id
WHERE w.is_active = true;
```

Should return at least one row with a model_name.

### Check User Profile:
```sql
SELECT id, full_name, role
FROM user_profiles
WHERE id = auth.uid();
```

Verify your role is 'admin' if you need to access settings.

---

## Common Workflow Issues

### Issue: Created model but not showing in header

**Solutions:**
1. Refresh the page (F5)
2. Check model's `is_active` is true in settings
3. Check browser console for errors
4. Try logging out and back in

### Issue: Multiple models but can't switch

**Solutions:**
- Click the dropdown arrow (▼) next to model name in header
- If only one model, no dropdown appears (this is normal)

### Issue: Send button is grayed out

**Possible Causes:**
1. No text in message input - Type something
2. No conversation selected - Click "New chat"
3. Message is sending - Wait for spinner to stop
4. No model selected - Configure models as admin

---

## Testing Your Webhook Independently

Before testing in the app, verify your webhook works:

### Using curl:
```bash
curl -X POST https://your-n8n.com/webhook/gpt4 \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "conversation_id": "test-123",
    "history": [],
    "settings": {
      "system_prompt": "You are helpful",
      "temperature": 0.7,
      "max_tokens": 2000
    }
  }'
```

**Expected Response:**
```json
{
  "response": "Hello! How can I help you today?"
}
```

### Using Postman:
1. Create new POST request
2. URL: Your webhook URL
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "message": "Test message",
  "conversation_id": "test-123",
  "history": [],
  "settings": {
    "system_prompt": "You are helpful",
    "temperature": 0.7,
    "max_tokens": 2000
  }
}
```
5. Send
6. Verify you get a response with "response" field

---

## Still Having Issues?

### Gather This Information:

1. **Browser Console Logs**
   - Press F12
   - Copy any errors in red

2. **Network Request Details**
   - In Network tab, find the failed request
   - Copy Request URL, Status, and Response

3. **Your Configuration**
   - Number of models configured
   - Number of webhooks configured
   - Webhook URL (without sensitive parts)
   - Your role (admin/user)

4. **What You're Trying to Do**
   - Step-by-step description
   - What you expect to happen
   - What actually happens

### Quick Fixes to Try:

1. **Hard Refresh**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Clear Cache**: Browser settings → Clear cache
3. **Logout/Login**: Sign out and sign back in
4. **Different Browser**: Try Chrome, Firefox, or Edge
5. **Check Database**: Verify models and webhooks exist in database

---

## Success Checklist

When everything is working correctly, you should see:

- ✅ Header shows: "Model: [Your Model Name]"
- ✅ Can click "New chat" and create conversation
- ✅ Can type message in input box
- ✅ Send button is white (not grayed out)
- ✅ Message appears immediately after sending
- ✅ AI response appears after a few seconds
- ✅ No errors in browser console
- ✅ Messages are saved (persist after refresh)

---

## Example: Complete Working Setup

### Database State:
```
ai_models:
  - id: abc-123
  - name: GPT-4
  - is_active: true
  - use_case: general

webhooks:
  - id: def-456
  - name: GPT-4 Webhook
  - model_id: abc-123
  - url: https://n8n.example.com/webhook/gpt4
  - is_active: true
```

### Visual State:
- Header: "Model: GPT-4"
- Sidebar: Shows conversations list
- Chat area: Input box ready for messages

### Expected Behavior:
1. Type: "Hello"
2. Press Enter
3. See: "Hello" message appear (user bubble)
4. Wait: 2-5 seconds
5. See: AI response appear (assistant bubble)
6. Success! System is working

---

## Advanced: Webhook Debugging

If webhook is being called but not returning expected data:

### Add Logging to Webhook Response:

Your webhook should return:
```json
{
  "response": "Your AI response here",
  "debug": {
    "received_message": "...",
    "model_used": "...",
    "tokens": 123
  }
}
```

The app will use the `response` field and ignore `debug`.

### Check Webhook Logs:

In n8n:
1. Go to executions
2. Find recent execution
3. Check each node's input/output
4. Verify final output has `response` field

---

## Contact Admin

If you're a regular user and see:
- "No models available - Contact admin"
- "No active webhook configured for this model"

Contact your system administrator to:
1. Configure AI models
2. Set up webhooks
3. Verify your account permissions

**Admin Email**: Check your organization's admin contact

---

## Summary

Most issues come from:
1. **No models configured** → Admin needs to add models
2. **No webhooks configured** → Admin needs to add webhooks
3. **Webhook not mapped to model** → Check model selection in webhook form
4. **Webhook URL incorrect** → Verify URL is accessible
5. **No conversation created** → Click "New chat" button

Follow the Step-by-Step Setup Guide above for a complete setup.
