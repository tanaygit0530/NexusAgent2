from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas
from ..services.ai_service import ai_service
from ..services.ticket_service import TicketService
import asyncio
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


# ---------------- WHATSAPP ----------------
@router.post("/whatsapp")
async def whatsapp_webhook(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    sender = payload.get("sender") or payload.get("from")
    message = payload.get("message") or payload.get("body")

    if not sender or not message:
        raise HTTPException(status_code=400, detail="Missing sender or message")

    ticket_data = schemas.TicketCreate(
        source=schemas.TicketSource.WHATSAPP,
        sender=sender,
        message=message
    )

    ai_result, raw_output, errors = await run_ai_safe(
        message, db
    )

    ticket = await TicketService.create_ticket(
        db, ticket_data, ai_result, raw_output, errors
    )

    return success_response(ticket, ai_result)


# ---------------- EMAIL ----------------
@router.post("/email")
async def email_webhook(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    sender = (
        payload.get("sender")
        or payload.get("from")
        or payload.get("email")
        or "Unknown Email Sender"
    )

    subject = payload.get("subject", "").strip()

    body = (
        payload.get("body")
        or payload.get("message")
        or payload.get("description")
        or "No email body provided"
    ).strip()

    full_message = f"Subject: {subject}\n\nBody: {body}"

    ticket_data = schemas.TicketCreate(
        source=schemas.TicketSource.EMAIL,
        sender=sender,
        message=full_message
    )

    ai_result, raw_output, errors = await run_ai_safe(
        full_message, db
    )

    ticket = await TicketService.create_ticket(
        db, ticket_data, ai_result, raw_output, errors
    )

    return success_response(ticket, ai_result)


# ---------------- INTAKE ----------------
@router.post("/intake")
async def intake_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    sender = payload.get("sender") or "Web User"
    message = payload.get("message")

    if not message or not message.strip():
        raise HTTPException(status_code=400, detail="Missing message")

    source_str = payload.get("source", "Website")

    try:
        source = schemas.TicketSource(source_str)
    except ValueError:
        source = schemas.TicketSource.WEBSITE

    ticket_data = schemas.TicketCreate(
        source=source,
        sender=sender,
        message=message
    )

    ai_result, raw_output, errors = await run_ai_safe(
        message, db
    )

    ticket = await TicketService.create_ticket(
        db, ticket_data, ai_result, raw_output, errors
    )

    return success_response(ticket, ai_result)


# =====================================================
# 🧠 SAFE AI WRAPPER (THE KEY PART)
# =====================================================
async def run_ai_safe(message: str, db: Session):
    try:
        active_incidents = TicketService.get_active_incidents(db)
        active_incidents_data = [
            {
                "ticket_id": t.ticket_id,
                "summary": t.summary,
                "status": t.status
            }
            for t in active_incidents
        ]

        ai_result, raw_output, errors = await asyncio.wait_for(
            ai_service.analyze_issue(message, active_incidents_data),
            timeout=10  # ⏱ HARD TIMEOUT
        )

        if not ai_result:
            raise ValueError("AI returned empty result")

        return ai_result, raw_output, errors

    except asyncio.TimeoutError:
        logger.error("AI service timeout")
    except Exception as e:
        logger.error(f"AI service error: {e}")

    # 🔁 FALLBACK (never block ticket creation)
    return (
        {
            "summary": "Manual Review Required",
            "category": "Uncategorized",
            "priority": "Medium",
            "sentiment": "Neutral"
        },
        None,
        ["AI failed or timed out"]
    )


# =====================================================
# 🎫 RESPONSE HELPER
# =====================================================
def success_response(ticket, ai_result):
    return {
        "status": "success",
        "ticket_id": ticket.ticket_id,
        "ai_analysis": ai_result,
        "acknowledgment_message": (
            f"Hello! We've received your request (ID: {ticket.ticket_id}). "
            f"Category: {ai_result['category']}, "
            f"Priority: {ai_result['priority']}. "
            "An agent will review it shortly."
        )
    }
