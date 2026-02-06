---
description: how to run the NexusAgent project locally
---

1. Start the Backend:
// turbo
```bash
cd backend && uvicorn app.main:app --reload
```

2. Start the Frontend:
// turbo
```bash
cd frontend && npm run dev
```

3. (Optional) Run a test message:
```bash
python scripts/test_webhooks.py --type whatsapp --sender "+12345678" --message "Help! My screen is flickering."
```
