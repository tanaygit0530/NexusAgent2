# Gmail Integration with NexusAgent - Complete Setup Guide

## 🎯 Overview
This guide will help you connect Gmail to your NexusAgent IT Helpdesk system so users can raise tickets by sending emails.

---

## 📋 Prerequisites

✅ n8n is running (port 5678)
✅ NexusAgent backend is running (port 8000)
✅ Gmail account for receiving tickets
✅ Google Cloud Console access (for OAuth)

---

## 🔧 Step-by-Step Setup

### **Step 1: Access n8n Dashboard**

1. Open your browser: `http://localhost:5678`
2. You should see your n8n interface

---

### **Step 2: Configure Gmail Trigger Node**

#### **A. Click on "Gmail Trigger" node**

#### **B. Set up Gmail OAuth Credentials**

1. Click **"Create New Credential"**
2. Select **"Gmail OAuth2 API"**
3. You'll need to create Google Cloud credentials:

**Google Cloud Console Setup**:
1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable **Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `n8n Gmail Integration`
   - Authorized redirect URIs:
     ```
     http://localhost:5678/rest/oauth2-credential/callback
     ```
   - Click "Create"
   - Copy **Client ID** and **Client Secret**

5. Back in n8n:
   - Paste **Client ID**
   - Paste **Client Secret**
   - Click **"Connect my account"**
   - Authorize access to your Gmail account

#### **C. Configure Trigger Settings**

```
Trigger On: Message Received
Label Names: INBOX (or create a specific label like "IT-Support")
Simple: Yes (recommended for easier setup)
```

**Optional Filters**:
- Subject Contains: "Support" or "Help"
- From: Specific domain (e.g., @yourcompany.com)

---

### **Step 3: Configure Edit Fields Node**

This node extracts and formats email data for your backend.

**Click on "Edit Fields" node** and set:

```json
{
  "source": "Email",
  "sender": "={{ $json.from.address }}",
  "message": "={{ $json.textPlain || $json.textHtml }}",
  "subject": "={{ $json.subject }}"
}
```

**Field Mappings**:
- `source`: Always "Email"
- `sender`: Email address of sender
- `message`: Email body (text or HTML)
- `subject`: Email subject line

---

### **Step 4: Configure HTTP Request Node**

This sends the ticket to your NexusAgent backend.

**Settings**:
```
Method: POST
URL: http://127.0.0.1:8000/webhooks/email
Authentication: None
Send Body: Yes
Body Content Type: JSON
```

**JSON Body**:
```json
{
  "source": "Email",
  "sender": "={{ $json.sender }}",
  "message": "Subject: {{ $json.subject }}\n\n{{ $json.message }}"
}
```

**Headers** (Optional):
```
Content-Type: application/json
```

---

### **Step 5: Configure Reply Node**

This sends an auto-reply to the user.

**Click on "Reply to a message" node**:

```
Message: Thank you for contacting IT Support. Your ticket has been created and our team will respond shortly. Ticket ID: {{ $json.ticket_id }}

Reply To: Original message
```

**Note**: The `$json.ticket_id` comes from your backend response.

---

## 🧪 Testing the Integration

### **Test 1: Send Test Email**

1. Send an email to your configured Gmail account
2. Subject: "My laptop won't turn on"
3. Body: "I've tried everything but my laptop is not starting. Please help!"

### **Test 2: Check n8n Execution**

1. Go to n8n dashboard
2. Click "Executions" tab
3. You should see a new execution
4. Check each node for success ✅

### **Test 3: Verify Ticket Creation**

1. Open NexusAgent dashboard: `http://localhost:5173`
2. Go to "Tickets" tab
3. You should see the new ticket with:
   - Source: Email
   - Sender: sender@email.com
   - Summary: AI-generated summary
   - Status: Processing

---

## 📊 Your Current Backend Endpoint

Your backend already has an email endpoint ready!

**File**: `/backend/app/routers/webhooks.py`

**Endpoint**: `POST /webhooks/email`

**Expected Payload**:
```json
{
  "source": "Email",
  "sender": "user@example.com",
  "message": "Subject: Issue\n\nDescription of the problem"
}
```

**What it does**:
1. ✅ Receives email data
2. ✅ Calls AI service for triage
3. ✅ Creates ticket in database
4. ✅ Returns ticket details (including ticket_id)
5. ✅ Broadcasts via WebSocket for real-time updates

---

## 🎨 Enhanced n8n Workflow (Recommended)

For better functionality, consider adding these nodes:

### **Optional: Add Error Handling**

1. Add **"If" node** after HTTP Request
2. Check if ticket creation was successful
3. Send different replies based on success/failure

### **Optional: Add Attachment Support**

1. Add **"Extract Attachments" node**
2. Upload attachments to cloud storage
3. Include attachment URLs in ticket

### **Optional: Add Priority Detection**

1. Add **"Function" node** before HTTP Request
2. Detect urgent keywords (URGENT, CRITICAL, DOWN)
3. Add priority flag to payload

---

## 🔐 Security Best Practices

### **1. Use Environment Variables**

In n8n, store sensitive data as environment variables:
- Gmail credentials
- API keys
- Backend URLs

### **2. Restrict Email Sources**

Configure Gmail filter to only accept emails from:
- Your company domain
- Verified users
- Specific email addresses

### **3. Add Rate Limiting**

Prevent spam by:
- Limiting emails per sender per hour
- Using Gmail labels to filter
- Adding CAPTCHA for external users

---

## 🚀 Production Deployment

### **For Production Use**:

1. **Use a dedicated Gmail account**
   - Create: support@yourcompany.com
   - Don't use personal email

2. **Set up proper OAuth**
   - Use production OAuth credentials
   - Add your domain to authorized origins

3. **Configure email forwarding**
   - Forward support@yourcompany.com to Gmail
   - Or use Gmail as primary support email

4. **Monitor n8n executions**
   - Set up error notifications
   - Log all ticket creations
   - Track failed executions

---

## 🎯 Quick Start Checklist

- [ ] n8n is running on port 5678
- [ ] Backend is running on port 8000
- [ ] Gmail OAuth credentials created
- [ ] Gmail Trigger node configured
- [ ] Edit Fields node set up
- [ ] HTTP Request node pointing to backend
- [ ] Reply node configured
- [ ] Test email sent
- [ ] Ticket appears in dashboard
- [ ] Auto-reply received

---

## 🐛 Troubleshooting

### **Issue: Gmail Trigger not firing**

**Solution**:
- Check OAuth connection
- Verify Gmail API is enabled
- Check label/filter settings
- Test with manual execution first

### **Issue: HTTP Request fails**

**Solution**:
- Verify backend is running: `curl http://127.0.0.1:8000/`
- Check URL in HTTP Request node
- Verify JSON payload format
- Check backend logs for errors

### **Issue: No auto-reply sent**

**Solution**:
- Check Gmail OAuth permissions (needs send permission)
- Verify Reply node is connected
- Check execution logs in n8n

### **Issue: Ticket not appearing in dashboard**

**Solution**:
- Check backend logs
- Verify database connection
- Check WebSocket connection
- Refresh dashboard manually

---

## 📞 Support

If you encounter issues:
1. Check n8n execution logs
2. Check backend terminal logs
3. Verify all services are running
4. Test each node individually

---

## ✨ Next Steps

Once Gmail integration is working:

1. **Add more channels**:
   - WhatsApp (already configured)
   - Slack
   - Microsoft Teams

2. **Enhance AI processing**:
   - Better spam detection
   - Attachment analysis
   - Sentiment tracking

3. **Add notifications**:
   - Email admins on high-priority tickets
   - Send status updates to users
   - Escalation alerts

---

**Your Gmail integration is ready to go! Just follow the steps above.** 📧✨
