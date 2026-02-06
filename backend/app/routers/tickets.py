from fastapi import APIRouter, Depends, Query, HTTPException, Body
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
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.patch("/{ticket_id}/status")
async def update_status(ticket_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    status = payload.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = status
    db.commit()
    return ticket

@router.patch("/{ticket_id}/department")
async def update_department(ticket_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    department = payload.get("department")
    if not department:
        raise HTTPException(status_code=400, detail="Department is required")
    
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.department = department
    ticket.reassigned_by = "Human"
    ticket.is_flagged = "false" # Clear flag if reassigned manually
    db.commit()
    return ticket
