# Debugging Stuck Messages - Diagnostic Guide

## Your Current Issue

Based on your screenshot, you sent "Hello" but the AI response never appeared. The message is stuck/loading indefinitely.

---

## Immediate Actions to Debug

### Step 1: Open Browser Console (CRITICAL)

1. Press **F12** (or right-click → Inspect)
2. Click the **Console** tab
3. Look for messages that start with these emojis:
   - 🔗 = Webhook being called
   - 📤 = Webhook URL
   - 📦 = Data being sent
   - ✅ = Webhook succeeded
   - ❌ = Webhook failed
   - ⏱️ = Webhook timeout

### Step 2: Read the Console Messages

The console will tell you EXACTLY what's happening. Look for:

#### Scenario A: Timeout Message
```
⏱️ Webhook timeout after 30000ms
```
**Problem**: Your webhook is taking too long (over 30 seconds)

**Solutions**:
1. Check if your n8n workflow is actually running
2. Verify the n8n URL is correct
3. Increase timeout in Settings → Webhooks → Edit → Change timeout to 60 or 120 seconds

---

#### Scenario B: Network Error
```
❌ Webhook call failed: Failed to fetch
```
**Problem**: Can't reach your webhook URL

**Solutions**:
1. Verify your n8n instance is running
2. Check the webhook URL is accessible (try opening it in a browser)
3. Check for CORS issues (see below)
4. Verify your network/firewall isn't blocking the request

---

#### Scenario C: Missing Response Field
```
⚠️ Webhook response missing expected fields
📋 Expected one of: "response", "message", or "output"
📋 Full response: { "data": "..." }
```
**Problem**: Your n8n workflow is responding, but not in the expected format

**Solution**: Update your n8n workflow to return ONE of these formats:

**Option 1 (Recommended):**
```json
{
  "response": "Your AI response text here"
}
```

**Option 2:**
```json
{
  "message": "Your AI response text here"
}
```

**Option 3:**
```json
{
  "output": "Your AI response text here"
}
```

---

#### Scenario D: Webhook Error Status
```
❌ Webhook failed with status 500: Internal Server Error
```
**Problem**: Your n8n workflow has an error

**Solutions**:
1. Open n8n and check the execution log
2. Look for errors in your workflow nodes
3. Test your workflow manually in n8n first

---

### Step 3: Check Network Tab

1. In Developer Tools, click **Network** tab
2. Clear it (click 🚫 icon)
3. Send another message
4. Look for the request to your webhook URL

Click on it and check:
- **Status**: Should be 200 (green)
- **Response**: What your webhook returned
- **Timing**: How long it took

---

## Common Causes and Fixes

### 1. n8n Workflow Not Active

**Symptoms**:
- 404 Not Found error
- "Failed to fetch"

**Fix**:
1. Open your n8n instance
2. Find your workflow
3. Click **"Active"** toggle to enable it
4. The toggle should be green/on

---

### 2. Wrong Webhook URL

**Symptoms**:
- 404 Not Found
- CORS error
- Connection refused

**Fix**:
1. Copy the CORRECT webhook URL from n8n:
   - Click on your Webhook node
   - Copy the "Test URL" or "Production URL"
2. Go to Settings → Webhooks → Edit your webhook
3. Paste the correct URL
4. Save

**Example URLs**:
- ❌ Wrong: `https://n8n.example.com/webhook`
- ✅ Right: `https://n8n.example.com/webhook/abc123xyz`

---

### 3. Webhook Response Format Wrong

Your n8n workflow MUST return JSON in this format:

```json
{
  "response": "Hello! I'm your AI assistant."
}
```

**How to fix in n8n**:

1. Add a **"Respond to Webhook"** node at the end
2. Set it to return JSON
3. Use this expression:
```
{
  "response": "{{ $json.output }}"
}
```

Where `$json.output` is the AI response from your previous node.

---

### 4. CORS Issues

**Symptoms**:
- Console shows: "CORS policy blocked"
- Message stuck but no other errors

**Fix in n8n**:

1. In your webhook node, go to **Options**
2. Add **Response Headers**:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, GET, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```

OR use a **Set Response Headers** node after your Webhook node.

---

### 5. Webhook Taking Too Long

**Symptoms**:
- Timeout after 30 seconds
- Console shows: ⏱️ Webhook timeout

**Fix**:

**Option A: Increase Timeout**
1. Settings → Webhooks → Edit webhook
2. Change timeout to 60 or 120 seconds
3. Save

**Option B: Speed Up Workflow**
1. Check what's slow in your n8n workflow
2. Optimize or cache responses
3. Use faster AI APIs

---

## Testing Your Webhook Independently

Before testing in the app, make sure your webhook works:

### Test with curl:

```bash
curl -X POST https://your-n8n.com/webhook/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "conversation_id": "test",
    "history": [],
    "settings": {
      "system_prompt": "You are helpful",
      "temperature": 0.7,
      "max_tokens": 2000
    }
  }'
```

**Expected Response**:
```json
{
  "response": "Hello! How can I help you?"
}
```

**If you get an error**: Fix your n8n workflow first before testing in the app.

---

## Step-by-Step Diagnostic Process

Follow these steps IN ORDER:

### 1. Verify Webhook URL is Correct ✅
- [ ] Copy URL from n8n
- [ ] Paste in Settings → Webhooks
- [ ] Save
- [ ] Try again

### 2. Test Webhook in Browser ✅
- [ ] Open your webhook URL in browser
- [ ] Should show n8n page or accept POST requests
- [ ] If you get 404: URL is wrong

### 3. Check n8n Workflow Status ✅
- [ ] Open n8n
- [ ] Find your workflow
- [ ] Verify it's **Active** (toggle is ON/green)
- [ ] Manually execute it to test

### 4. Check n8n Response Format ✅
- [ ] Execute workflow manually
- [ ] Check the final output
- [ ] Must have `"response": "text here"`
- [ ] Fix if missing

### 5. Test with Curl ✅
- [ ] Copy the curl command above
- [ ] Replace URL with yours
- [ ] Run it in terminal
- [ ] Should get valid JSON response

### 6. Check Browser Console ✅
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Send a message
- [ ] Read the emoji logs
- [ ] Follow the specific error solution

### 7. Check Network Tab ✅
- [ ] DevTools → Network tab
- [ ] Send message
- [ ] Click on webhook request
- [ ] Check Status and Response
- [ ] Verify response has `"response"` field

---

## What You Should See (When Working)

### In Browser Console:
```
🔗 Calling webhook: Azure-AI
📤 Webhook URL: https://your-n8n.com/webhook/abc123
📦 Payload: {message: "Hello", conversation_id: "...", ...}
✅ Webhook responded in 1234ms
📊 Status: 200 OK
📥 Webhook response: {response: "Hello! How can I help?"}
```

### In Chat Interface:
```
Y: Hello

AI: Hello! How can I help you today?
```

### In Network Tab:
- Status: **200** (green)
- Response: `{"response": "Hello! ..."}`
- Time: Under 5 seconds usually

---

## Emergency Checklist

If nothing works, verify ALL of these:

- [ ] n8n instance is running and accessible
- [ ] n8n workflow is **Active** (not paused)
- [ ] Webhook URL in Settings matches n8n URL EXACTLY
- [ ] Webhook is mapped to the correct AI Model
- [ ] n8n workflow returns `{"response": "text"}`
- [ ] No CORS errors in browser console
- [ ] Webhook timeout is reasonable (30-60 seconds)
- [ ] You created a conversation first (clicked "New chat")
- [ ] You selected a model (shows in header)
- [ ] Browser console shows webhook is being called

---

## Quick Test n8n Workflow

Here's a MINIMAL working n8n workflow to test:

### Nodes:
1. **Webhook** (Trigger)
   - Method: POST
   - Path: /test-chat

2. **Set** (Process)
   - Name: response
   - Value: `Hello! I received: {{ $json.body.message }}`

3. **Respond to Webhook** (Output)
   - Response Mode: Last Node
   - Format: JSON
   - Body:
     ```json
     {
       "response": "{{ $node['Set'].json.response }}"
     }
     ```

**Test this workflow first**. If it works, then add your AI logic.

---

## Still Stuck?

### Collect This Information:

1. **Full Browser Console Log**
   - All red errors
   - All emoji logs (🔗 📤 ❌ etc.)

2. **Network Request Details**
   - Request URL
   - Request Payload
   - Response Status
   - Response Body

3. **Your Configuration**
   - Webhook URL (hide sensitive parts)
   - Webhook timeout setting
   - Model name
   - Is n8n workflow active?

4. **What Happens**
   - Message gets stuck
   - How long does it wait?
   - Any error messages appear?

---

## Expected Behavior

When everything works correctly:

1. Type message → Press Enter
2. Your message appears immediately (gray bubble with "Y")
3. Loading indicator appears ("AI Thinking...")
4. After 2-10 seconds, AI response appears (white bubble with "AI")
5. Conversation is saved

**If loading indicator never disappears**: Check console for exact error.

---

## Next Steps

1. **Open Browser Console NOW** (F12)
2. **Send a test message**
3. **Read the emoji logs**
4. **Find your scenario above**
5. **Apply the fix**
6. **Test again**

The console logs will tell you EXACTLY what's wrong!
