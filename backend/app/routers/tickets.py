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
    
    # Auto-set resolved_at when ticket is resolved
    if status == "Resolved":
        from datetime import datetime
        ticket.resolved_at = datetime.utcnow()
    
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

# Admin Workspace Endpoints

@router.patch("/{ticket_id}/assign")
async def assign_ticket(ticket_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    """Assign a ticket to an admin"""
    admin_name = payload.get("admin_name")
    if not admin_name:
        raise HTTPException(status_code=400, detail="Admin name is required")
    
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    from datetime import datetime
    ticket.assigned_to = admin_name
    ticket.assigned_at = datetime.utcnow()
    ticket.status = "Processing"
    db.commit()
    return ticket

@router.patch("/{ticket_id}/notes")
async def save_notes(ticket_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    """Save internal notes for a ticket"""
    notes = payload.get("notes")
    if notes is None:
        raise HTTPException(status_code=400, detail="Notes field is required")
    
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.internal_notes = notes
    db.commit()
    return {"status": "success", "message": "Notes saved successfully", "ticket_id": ticket.ticket_id}

@router.get("/workspace/currently-solving", response_model=List[schemas.TicketResponse])
def get_currently_solving(admin_name: str = Query(...), db: Session = Depends(get_db)):
    """Get tickets currently being worked on by an admin"""
    tickets = db.query(models.Ticket).filter(
        models.Ticket.assigned_to == admin_name,
        models.Ticket.status.in_(["Processing", "Under Review", "Waiting"])
    ).order_by(models.Ticket.assigned_at.desc()).all()
    return tickets

@router.get("/workspace/solved-history", response_model=List[schemas.TicketResponse])
def get_solved_history(admin_name: str = Query(...), db: Session = Depends(get_db)):
    """Get resolved tickets by an admin"""
    tickets = db.query(models.Ticket).filter(
        models.Ticket.assigned_to == admin_name,
        models.Ticket.status == "Resolved"
    ).order_by(models.Ticket.resolved_at.desc()).all()
    return tickets

@router.get("/workspace/performance")
def get_performance(admin_name: str = Query(...), db: Session = Depends(get_db)):
    """Get performance metrics for an admin"""
    from sqlalchemy import func
    from datetime import datetime
    
    # Total tickets solved
    total_solved = db.query(func.count(models.Ticket.id)).filter(
        models.Ticket.assigned_to == admin_name,
        models.Ticket.status == "Resolved"
    ).scalar()
    
    # Currently solving
    currently_solving = db.query(func.count(models.Ticket.id)).filter(
        models.Ticket.assigned_to == admin_name,
        models.Ticket.status.in_(["Processing", "Under Review", "Waiting"])
    ).scalar()
    
    # Get resolved tickets for avg calculation
    resolved_tickets = db.query(models.Ticket).filter(
        models.Ticket.assigned_to == admin_name,
        models.Ticket.status == "Resolved",
        models.Ticket.assigned_at.isnot(None),
        models.Ticket.resolved_at.isnot(None)
    ).all()
    
    # Calculate average resolution time
    if resolved_tickets:
        total_seconds = sum([
            (t.resolved_at - t.assigned_at).total_seconds() 
            for t in resolved_tickets
        ])
        avg_resolution_seconds = total_seconds / len(resolved_tickets)
        avg_resolution_hours = round(avg_resolution_seconds / 3600, 2)
    else:
        avg_resolution_hours = 0
    
    # High priority tickets handled
    high_priority_count = db.query(func.count(models.Ticket.id)).filter(
        models.Ticket.assigned_to == admin_name,
        models.Ticket.status == "Resolved",
        models.Ticket.priority.in_(["High", "Critical"])
    ).scalar()
    
    # SLA success rate (assuming 24 hours SLA)
    sla_limit_seconds = 24 * 3600
    sla_met = sum([
        1 for t in resolved_tickets 
        if (t.resolved_at - t.assigned_at).total_seconds() <= sla_limit_seconds
    ])
    sla_success_rate = round((sla_met / len(resolved_tickets) * 100), 1) if resolved_tickets else 0
    
    return {
        "admin_name": admin_name,
        "total_solved": total_solved,
        "currently_solving": currently_solving,
        "avg_resolution_hours": avg_resolution_hours,
        "high_priority_handled": high_priority_count,
        "sla_success_rate": sla_success_rate
    }
