from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, models
from ..services.ai_service import ai_service
from ..services.ticket_service import TicketService
import logging

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/whatsapp")
async def whatsapp_webhook(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Endpoint for n8n WhatsApp webhook.
    Expected payload from n8n: { "sender": "...", "message": "..." }
    Also supports common WhatsApp API fields: { "from": "...", "body": "..." }
    """
    sender = payload.get("sender") or payload.get("from")
    message = payload.get("message") or payload.get("body")
    
    if not sender or not message:
        raise HTTPException(status_code=400, detail="Missing sender or message")
    
    ticket_data = schemas.TicketCreate(
        source=schemas.TicketSource.WHATSAPP,
        sender=sender,
        message=message
    )
    
    # Process with AI
    ai_result, raw_output, errors = await ai_service.analyze_issue(message)
    
    if not ai_result:
        ai_result = {
            "summary": "Manual Review Required - AI Failed",
            "category": "Uncategorized",
            "priority": "High",
            "sentiment": "Neutral"
        }
    
    ticket = TicketService.create_ticket(db, ticket_data, ai_result, raw_output, errors)
    
    return {
        "status": "success",
        "ticket_id": ticket.ticket_id,
        "ai_analysis": ai_result,
        "acknowledgment_message": f"Hello! We've received your request (ID: {ticket.ticket_id}). Our AI has categorized this as '{ai_result['category']}' with '{ai_result['priority']}' priority. An agent will review it shortly."
    }

@router.post("/email")
async def email_webhook(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Endpoint for n8n Email webhook.
    Expected payload from n8n: { "sender": "...", "subject": "...", "body": "..." }
    """
    sender = payload.get("sender") or payload.get("from")
    subject = payload.get("subject", "")
    body = payload.get("body", "") or payload.get("message")
    
    full_message = f"Subject: {subject}\n\nBody: {body}"
    
    ticket_data = schemas.TicketCreate(
        source=schemas.TicketSource.EMAIL,
        sender=sender,
        message=full_message
    )
    
    # Process with AI
    ai_result, raw_output, errors = await ai_service.analyze_issue(full_message)
    
    if not ai_result:
        ai_result = {
            "summary": "Manual Review Required - AI Failed",
            "category": "Uncategorized",
            "priority": "High",
            "sentiment": "Neutral"
        }
        
    ticket = TicketService.create_ticket(db, ticket_data, ai_result, raw_output, errors)
    
    return {
        "status": "success", 
        "ticket_id": ticket.ticket_id,
        "ai_analysis": ai_result,
        "acknowledgment_message": f"Support Ticket {ticket.ticket_id} created for: {subject}. Priority: {ai_result['priority']}. Thanks for reaching out!"
    }
@router.post("/intake")
async def intake_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Generic intake endpoint for User Portal / Direct Web Intake.
    """
    sender = payload.get("sender") or "Web User"
    message = payload.get("message")
    source_str = payload.get("source", "Website")
    
    try:
        source = schemas.TicketSource(source_str)
    except ValueError:
        source = schemas.TicketSource.WEBSITE

    if not message:
        raise HTTPException(status_code=400, detail="Missing message")
    
    ticket_data = schemas.TicketCreate(
        source=source,
        sender=sender,
        message=message
    )
    
    # Process with AI
    ai_result, raw_output, errors = await ai_service.analyze_issue(message)
    
    if not ai_result:
        ai_result = {
            "summary": "Manual Review Required - AI Failed",
            "category": "Uncategorized",
            "priority": "High",
            "sentiment": "Neutral"
        }
    
    ticket = TicketService.create_ticket(db, ticket_data, ai_result, raw_output, errors)
    
    return {
        "status": "success",
        "ticket_id": ticket.ticket_id,
        "ai_analysis": ai_result,
        "acknowledgment_message": f"Hello! We've received your request (ID: {ticket.ticket_id}). Our AI has categorized this as '{ai_result['category']}' with '{ai_result['priority']}' priority. An agent will review it shortly."
    }
