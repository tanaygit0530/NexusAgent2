from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, models
from ..services.ticket_service import TicketService

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.get("/", response_model=List[schemas.TicketResponse])
def get_tickets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return TicketService.get_tickets(db, skip, limit)

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return TicketService.get_ticket_stats(db)

@router.get("/{ticket_id}", response_model=schemas.TicketResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.patch("/{ticket_id}/status")
def update_status(
    ticket_id: str,
    status: schemas.TicketStatus,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        return {"error": "Ticket not found"}
    
    ticket.status = status.value
    db.commit()
    db.refresh(ticket)
    return ticket
