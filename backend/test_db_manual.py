from app.database import SessionLocal, engine, Base
from app import models, schemas
from app.services.ticket_service import TicketService

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

ticket_data = schemas.TicketCreate(
    source=schemas.TicketSource.WHATSAPP,
    sender="+11111111",
    message="Test message manual"
)

ai_data = {
    "summary": "Manual Test",
    "category": "Other",
    "priority": "Low",
    "sentiment": "Neutral"
}

try:
    ticket = TicketService.create_ticket(db, ticket_data, ai_data)
    print(f"Successfully created ticket: {ticket.ticket_id}")
finally:
    db.close()
