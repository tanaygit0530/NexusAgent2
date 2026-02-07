# Gmail n8n Workflow - Quick Configuration

## 🎯 n8n Workflow Nodes Configuration

### **Node 1: Gmail Trigger**
```
Type: Gmail Trigger
Trigger On: Message Received
Label: INBOX
Polling Interval: 1 minute
```

**OAuth Setup**:
1. Create credentials in Google Cloud Console
2. Enable Gmail API
3. Add redirect URI: `http://localhost:5678/rest/oauth2-credential/callback`
4. Connect account in n8n

---

### **Node 2: Edit Fields**
```javascript
{
  "source": "Email",
  "sender": "={{ $json.from.address }}",
  "message": "={{ $json.textPlain || $json.textHtml }}",
  "subject": "={{ $json.subject }}"
}
```

---

### **Node 3: HTTP Request**
```
Method: POST
URL: http://127.0.0.1:8000/webhooks/email
Body Type: JSON
```

**Body**:
```json
{
  "source": "Email",
  "sender": "={{ $json.sender }}",
  "message": "Subject: {{ $json.subject }}\n\n{{ $json.message }}"
}
```

---

### **Node 4: Reply to Message**
```
Message: Thank you for contacting IT Support. Your ticket has been created (ID: {{ $json.ticket_id }}). Our team will respond shortly.

Reply To: Original Message
```

---

## 🚀 Quick Start

1. **Open n8n**: http://localhost:5678
2. **Import workflow** or create manually
3. **Configure Gmail OAuth** (see full guide)
4. **Test** by sending email
5. **Verify** ticket in dashboard

---

## ✅ Testing Checklist

- [ ] Send test email
- [ ] Check n8n execution (green checkmarks)
- [ ] Verify ticket in dashboard (http://localhost:5173)
- [ ] Confirm auto-reply received
- [ ] Check AI triage worked (priority, category, etc.)

---

## 🔗 Important URLs

- **n8n Dashboard**: http://localhost:5678
- **NexusAgent Dashboard**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **Email Webhook**: http://127.0.0.1:8000/webhooks/email
- **Google Cloud Console**: https://console.cloud.google.com/

---

## 🐛 Quick Troubleshooting

**Gmail not triggering?**
→ Check OAuth connection, verify Gmail API enabled

**HTTP Request failing?**
→ Verify backend is running: `curl http://127.0.0.1:8000/`

**No ticket in dashboard?**
→ Check backend logs, refresh dashboard

**No auto-reply?**
→ Check Gmail send permissions in OAuth

---

**Status**: ✅ Ready to configure
