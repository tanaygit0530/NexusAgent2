from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
import pandas as pd
import os
from datetime import datetime

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/export")
def export_tickets(db: Session = Depends(get_db)):
    tickets = db.query(models.Ticket).all()
    
    data = []
    for t in tickets:
        data.append({
            "Ticket ID": t.ticket_id,
            "Source": t.source,
            "Sender": t.sender,
            "Summary": t.summary,
            "Category": t.category,
            "Priority": t.priority,
            "Sentiment": t.sentiment,
            "Status": t.status,
            "Created At": t.created_at,
            "Message": t.original_message
        })
    
    df = pd.DataFrame(data)
    filename = f"tickets_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = f"/tmp/{filename}"
    
    df.to_excel(filepath, index=False)
    
    return FileResponse(
        filepath, 
        filename=filename, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
