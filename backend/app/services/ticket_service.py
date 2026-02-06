from sqlalchemy.orm import Session
from .. import models, schemas
import uuid
from datetime import datetime

class TicketService:
    @staticmethod
    def create_ticket(db: Session, ticket_data: schemas.TicketCreate, ai_data: dict, raw_output: str = None, validation_errors: str = None):
        ticket_id = f"TICK-{uuid.uuid4().hex[:8].upper()}"
        
        db_ticket = models.Ticket(
            ticket_id=ticket_id,
            source=ticket_data.source.value,
            sender=ticket_data.sender,
            original_message=ticket_data.message,
            summary=ai_data.get("summary", "No summary generated"),
            category=ai_data.get("category", "Uncategorized"),
            priority=ai_data.get("priority", "Medium"),
            department=ai_data.get("department", "Software"),
            sentiment=ai_data.get("sentiment", "Calm"),
            status=models.TicketStatus.PROCESSING, # Start at processing as AI has run
            ai_raw_output=raw_output,
            validation_errors=validation_errors
        )
        
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        return db_ticket

    @staticmethod
    def get_tickets(db: Session, skip: int = 0, limit: int = 100):
        return db.query(models.Ticket).order_by(models.Ticket.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_ticket_stats(db: Session):
        tickets = db.query(models.Ticket).all()
        
        by_priority = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
        by_source = {"WhatsApp": 0, "Email": 0, "Website": 0}
        by_status = {"Received": 0, "Processing": 0, "Under Review": 0, "Resolved": 0}
        
        for t in tickets:
            by_priority[t.priority] = by_priority.get(t.priority, 0) + 1
            by_source[t.source] = by_source.get(t.source, 0) + 1
            by_status[t.status] = by_status.get(t.status, 0) + 1
            
        # Volume over time (last 7 days - simplified for demo)
        # In a real app we'd group by date in SQL
        volume_over_time = [] 
        # For demo, just return some data if tickets exist
        
        return {
            "by_priority": by_priority,
            "by_source": by_source,
            "by_status": by_status,
            "volume_over_time": volume_over_time
        }
