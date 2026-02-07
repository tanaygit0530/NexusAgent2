from backend.app.database import SessionLocal
from backend.app.services.ticket_service import TicketService
import json

db = SessionLocal()
try:
    print("Testing get_tickets...")
    tickets = TicketService.get_tickets(db)
    print(f"Success! Found {len(tickets)} tickets.")
    
    print("Testing get_ticket_stats...")
    stats = TicketService.get_ticket_stats(db)
    print("Success!")
    print(json.dumps(stats, indent=2))
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
