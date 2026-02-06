# NexusAgent – AI-Driven IT Support Automation

NexusAgent is a production-grade IT support platform that automates ticket creation from WhatsApp and Email using Agentic AI (Gemini Pro) and n8n.

## 🚀 Key Features
- **Real-Time Ingestion**: Webhook-based integration for WhatsApp and Email.
- **AI Extraction**: Automatic extraction of summary, category, priority, and sentiment.
- **Guardrails**: Strict JSON Schema validation and AI output verification.
- **Admin Dashboard**: Premium React dashboard with live updates and analytics.
- **Data Export**: One-click Excel export for audit and reporting.

## 🛠 Tech Stack
- **Backend**: FastAPI, SQLAlchemy, Google Gemini Pro.
- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons.
- **Automation**: n8n (WhatsApp Business API & Gmail).

## 📂 Project Structure
- `/backend`: FastAPI application and database.
- `/frontend`: React dashboard.
- `/scripts`: Tools for testing webhooks and simulations.

## 🔗 n8n Integration (WhatsApp & Email)

NexusAgent is designed to work seamlessly with n8n. We have provided workflow templates in the `/n8n_workflows` folder.

### Configuration Steps:
1. **Import Workflows**: Open n8n and import the `.json` files from the `n8n_workflows/` directory.
2. **Setup Webhook**: 
   - Ensure the **HTTP Request** node in n8n points to your local NexusAgent instance: `http://localhost:8000/webhooks/whatsapp` (or `/email`).
   - If n8n is running on a different machine/cloud, use a tool like `ngrok` or `localtunnel` to expose your local port 8001.
3. **Payload Mapping**:
   - **WhatsApp**: Map `from` (sender) and `body` (message) to the JSON body.
   - **Email**: Map `from`, `subject`, and `text` (body).
4. **Auto-Reply**: 
   - The backend returns an `acknowledgment_message` in the response. 
   - Use this field in your n8n **WhatsApp Send** or **Gmail Send** node to instantly reply to the user.

## 🛡 Guardrail & AI Logic
- **AI Service**: Located in `backend/app/services/ai_service.py`. It uses `gemini-1.5-flash` with a fallback mechanism for demo modes.
- **Async Processing**: All AI calls are asynchronous to ensure the webhook responds instantly to n8n without blocking.
- **Fail-Safe**: If AI extraction fails, the system automatically tags the ticket as "Manual Review Required" but still creates the record in the database.
# NexusAgent2
