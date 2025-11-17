# Quick Setup Guide - Get Started in 5 Minutes

## Prerequisites
- Admin account credentials (hemanth@securitysavvy.info)
- A working n8n webhook URL
- This application running

---

## Step 1: Login as Admin (30 seconds)

1. Open the application
2. Enter credentials:
   - Email: `hemanth@securitysavvy.info`
   - Password: Your admin password
3. Click "Sign In"

---

## Step 2: Add an AI Model (1 minute)

1. Click the **⚙️ Settings** icon in the top-right corner of the header
2. In the settings panel, find the **"🤖 AI Models"** section
3. Click the **"Add Model"** button
4. Fill in the form:
   ```
   Model Name: GPT-4
   Use Case: general (select from dropdown)
   Description: OpenAI GPT-4 model for general conversations
   ```
5. Click **"Save Model"**
6. You should see "GPT-4" appear in the models list

**What to expect:**
- The model will appear in the list below
- You can edit or delete it later

---

## Step 3: Add a Webhook (2 minutes)

1. Still in the settings panel, scroll down to **"🔗 Webhooks"** section
2. Click the **"Add Webhook"** button
3. Fill in the form:
   ```
   Webhook Name: GPT-4 Webhook
   Select AI Model: GPT-4 (select from dropdown)
   Webhook URL: https://your-n8n-instance.com/webhook/gpt4
   ```

   **IMPORTANT**: Replace `your-n8n-instance.com/webhook/gpt4` with your actual webhook URL

4. Click **"Save Webhook"**
5. Verify you see: **"Mapped to: GPT-4"** under the webhook

**What to expect:**
- The webhook appears in the list
- It shows which model it's connected to
- You can test it shortly

---

## Step 4: Close Settings and Verify (30 seconds)

1. Click the **✕** button to close the settings panel
2. Look at the header - you should see:
   ```
   [Logo] DevstriX    Model: GPT-4    ☀️ ⚙️
   ```

**If you see:**
- ✅ **"Model: GPT-4"** → Success! Continue to Step 5
- ⚠️ **"No models configured"** → Go back to Step 2
- ⚠️ **"No model selected"** → Refresh the page (F5)

---

## Step 5: Create Your First Chat (1 minute)

1. Click the **"New chat"** button in the sidebar (top-left)
   - OR -
   Click the **"Start New Chat"** button in the center of the screen

2. You should see:
   - A new conversation appears in the sidebar
   - The message input box is enabled at the bottom
   - The conversation area is ready

---

## Step 6: Send Your First Message (30 seconds)

1. Type a test message in the input box:
   ```
   Hello! Can you introduce yourself?
   ```

2. Press **Enter** or click the **white Send button** ➤

3. Wait for the response (usually 2-5 seconds)

**What to expect:**
- Your message appears immediately
- Loading spinner shows while waiting
- AI response appears after a few seconds
- Both messages are saved in the conversation

---

## Troubleshooting

### ❌ Error: "No active webhook configured for this model"

**Problem**: Webhook isn't connected to the model

**Fix**:
1. Go to Settings → Webhooks
2. Edit your webhook
3. Make sure "Select AI Model" dropdown shows "GPT-4"
4. Save webhook
5. Try again

---

### ❌ Error: "Failed to send message" or "Network error"

**Problem**: Webhook URL is incorrect or unreachable

**Fix**:
1. Verify your webhook URL is correct
2. Test the URL in your browser
3. Make sure your n8n instance is running
4. Check if the URL is accessible from your network

---

### ❌ Can't see Settings icon

**Problem**: You're not logged in as admin

**Fix**:
1. Log out
2. Log in with admin credentials: hemanth@securitysavvy.info
3. Settings icon should appear in top-right

---

### ⚠️ Model shows but messages don't work

**Problem**: Webhook might not be configured correctly

**Fix**:
1. Check webhook URL is correct
2. Test webhook independently (see TROUBLESHOOTING.md)
3. Verify webhook returns JSON with "response" field
4. Check browser console (F12) for specific errors

---

## Verification Checklist

After completing all steps, verify:

- [ ] Logged in as admin
- [ ] Settings icon visible in header
- [ ] At least one AI model created and visible in settings
- [ ] At least one webhook created and mapped to model
- [ ] Header shows "Model: [Your Model Name]"
- [ ] Can create new conversation
- [ ] Can send message
- [ ] Receive response from AI
- [ ] Messages persist after page refresh

---

## Example: Your First Conversation

Once everything is set up, here's what a typical conversation looks like:

```
You: Hello! Can you introduce yourself?

AI: Hello! I'm an AI assistant powered by GPT-4. I'm here to help
    you with questions, tasks, and conversations. I can assist with:
    - Answering questions
    - Writing and editing text
    - Problem-solving
    - And much more!

    How can I help you today?

You: Great! Can you write a haiku about coding?

AI: Code flows like a stream,
    Bugs hide in silent shadows,
    Debug light reveals.
```

---

## Next Steps

Now that you have a working setup:

1. **Add More Models** (Optional)
   - Create different models for different use cases
   - Example: "GPT-4 Code" for programming help
   - Example: "GPT-4 Writer" for content creation

2. **Add More Webhooks** (Optional)
   - Connect different webhooks to different models
   - Use different n8n workflows for different purposes

3. **Create Users** (If you have a team)
   - Go to Settings → User Management
   - Add team members
   - They can use the app without admin privileges

4. **Switch Between Models**
   - If you have multiple models, click the ▼ next to the model name
   - Each conversation can use a different model

---

## Common Questions

### Q: Can regular users (non-admins) use the chat?
**A:** Yes! Once you've configured models and webhooks as admin, regular users can:
- Create conversations
- Send messages
- Use all chat features
- They just can't access settings

### Q: How do I add more users?
**A:**
1. Settings → User Management
2. Click "Add New User"
3. Enter name, email, password
4. Click "Create User"

### Q: Can I have multiple models active at once?
**A:** Yes! You can have as many models as you want. Users can switch between them.

### Q: What if my webhook URL changes?
**A:**
1. Go to Settings → Webhooks
2. Edit the webhook
3. Update the URL
4. Save

### Q: How do I test if my webhook is working?
**A:** See the "Testing Your Webhook Independently" section in TROUBLESHOOTING.md

---

## Summary

**Total Setup Time**: ~5 minutes

**What You Created**:
- ✅ 1 AI Model
- ✅ 1 Webhook (mapped to model)
- ✅ Working chat system

**You Can Now**:
- Send messages
- Get AI responses
- Create multiple conversations
- Switch between models (if multiple)
- Add more users

---

## Need Help?

If something isn't working:
1. Check the **TROUBLESHOOTING.md** file for detailed solutions
2. Verify all steps in this guide were completed
3. Check browser console (F12) for error messages
4. Verify your webhook URL is accessible

**Most Common Issue**: Webhook URL is incorrect or inaccessible
**Quick Fix**: Double-check your n8n webhook URL

---

## Success!

If you can send a message and get a response, congratulations! 🎉

Your DevstriX AI chat system is now fully operational.

Enjoy using your AI-powered chat platform!
