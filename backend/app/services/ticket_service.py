from sqlalchemy.orm import Session
from .. import models, schemas
from .websocket_manager import manager
import uuid
import asyncio
from datetime import datetime

class TicketService:
    @staticmethod
    async def create_ticket(db: Session, ticket_data: schemas.TicketCreate, ai_data: dict, raw_output: str = None, validation_errors: str = None):
        ticket_id = f"TICK-{uuid.uuid4().hex[:8].upper()}"
        
        is_spam_bool = str(ai_data.get("is_spam", False)).lower() == "true"
        
        # Mandatory Overwrites for Spam
        if is_spam_bool:
            ai_data["status"] = "Cancelled"
            ai_data["priority"] = "None"
            ai_data["department"] = None
            ai_data["sentiment"] = None
            ai_data["is_active"] = False
            ai_data["spam_reason"] = ai_data.get("reason")
        else:
            ai_data["is_active"] = ai_data.get("is_active", True)
            ai_data["status"] = ai_data.get("final_status") or ai_data.get("status")

        db_ticket = models.Ticket(
            ticket_id=ticket_id,
            source=ticket_data.source.value,
            sender=ticket_data.sender,
            original_message=ticket_data.message,
            summary=ai_data.get("summary", "No summary generated"),
            category=ai_data.get("category", "Uncategorized"),
            priority=ai_data.get("priority", "Medium"),
            department=ai_data.get("department"),
            department_confidence=ai_data.get("department_confidence", 100),
            is_flagged=ai_data.get("is_flagged", "false"),
            reassigned_by=ai_data.get("reassigned_by"),
            is_duplicate=str(ai_data.get("is_duplicate", False)).lower(),
            parent_incident_id=ai_data.get("parent_incident_id"),
            ticket_role=ai_data.get("ticket_role", "Primary"),
            similarity_score=ai_data.get("similarity_score", 0),
            swarm_reason=ai_data.get("swarm_reason"),
            is_complete=str(ai_data.get("is_complete", True)).lower(),
            clarification_question=ai_data.get("clarification_question"),
            is_spam=str(ai_data.get("is_spam", False)).lower(),
            spam_reason=ai_data.get("spam_reason"),
            is_active=str(ai_data.get("is_active", True)).lower(),
            sentiment=ai_data.get("sentiment"),
            handoff_summary=ai_data.get("handoff_summary"),
            ai_attempts=ai_data.get("ai_attempts"),
            next_best_action=ai_data.get("next_best_action"),
            status=ai_data.get("status", models.TicketStatus.PROCESSING),
            ai_raw_output=raw_output,
            validation_errors=validation_errors
        )
        
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        
        # Real-time Broadcast
        event = {
            "event": "ticket_updated",
            "ticket_id": db_ticket.ticket_id,
            "changes": {
                "status": db_ticket.status,
                "is_spam": db_ticket.is_spam == "true",
                "is_active": db_ticket.is_active == "true",
                "priority": db_ticket.priority,
                "summary": db_ticket.summary
            }
        }
        await manager.broadcast(event)
        
        return db_ticket

    @staticmethod
    def get_tickets(db: Session, skip: int = 0, limit: int = 100):
        return db.query(models.Ticket).order_by(models.Ticket.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_active_incidents(db: Session):
        return db.query(models.Ticket).filter(
            models.Ticket.status.in_([models.TicketStatus.RECEIVED, models.TicketStatus.PROCESSING, models.TicketStatus.UNDER_REVIEW]),
            models.Ticket.ticket_role == "Primary"
        ).all()

    @staticmethod
    def get_ticket_stats(db: Session):
        tickets = db.query(models.Ticket).all()
        
        by_priority = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
        by_source = {"WhatsApp": 0, "Email": 0, "Website": 0}
        by_status = {"Received": 0, "Processing": 0, "Under Review": 0, "Resolved": 0, "Waiting": 0, "Spam": 0, "Cancelled": 0}
        
        for t in tickets:
            priority = t.priority or "None"
            source = t.source or "Website"
            status = t.status or "Received"
            
            by_priority[priority] = by_priority.get(priority, 0) + 1
            by_source[source] = by_source.get(source, 0) + 1
            
            # Count filtered spam separately in the status dict for the UI card
            if t.is_spam == "true":
                by_status["Spam"] = by_status.get("Spam", 0) + 1
            else:
                by_status[status] = by_status.get(status, 0) + 1
            
        volume_over_time = []  # Placeholder for future implementation
        
        return {
            "by_priority": by_priority,
            "by_source": by_source,
            "by_status": by_status,
            "volume_over_time": volume_over_time
        }
